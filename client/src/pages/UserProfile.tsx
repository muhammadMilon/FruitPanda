import React, { useEffect, useState } from 'react';
import { User, Package, CreditCard, Settings, LogOut, Save, Star, Truck, CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    nameBn: string;
    image: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    area: string;
    phone: string;
  };
  timeline: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
}



interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
  };
  joinDate?: string;
  orders?: number;
  points?: number;
}

interface PaymentMethod {
  _id: string;
  type: 'bkash' | 'nagad' | 'credit_card' | 'debit_card';
  name: string;
  number: string;
  isDefault: boolean;
  isActive: boolean;
  addedAt: string;
}



const UserProfile: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'payment' | 'settings'>('profile');
  const [user, setUser] = useState<UserData>({});
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
    };
  }>({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: ''
  });



  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    type: 'bkash' as 'bkash' | 'nagad' | 'credit_card' | 'debit_card',
    name: '',
    number: '',
    isDefault: false
  });
  const [showCardNumber, setShowCardNumber] = useState<{[key: string]: boolean}>({});

  // Fetch real orders from backend
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view your orders');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Orders fetched successfully:', response.data);
      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view your orders');
      } else if (error.response?.status === 404) {
        toast.error('No orders found');
        setOrders([]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to load order history');
      }
    } finally {
      setOrdersLoading(false);
    }
  };



  // Fetch payment methods from backend
  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/payment-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setPaymentMethods(response.data.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  // Add new payment method
  const handleAddPaymentMethod = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/users/payment-methods', paymentForm, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Payment method added successfully');
      setShowAddPaymentModal(false);
      resetPaymentForm();
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to add payment method');
    }
  };

  // Update payment method
  const handleUpdatePaymentMethod = async () => {
    if (!editingPaymentMethod) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/api/users/payment-methods/${editingPaymentMethod._id}`, paymentForm, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Payment method updated successfully');
      setEditingPaymentMethod(null);
      resetPaymentForm();
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment method');
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/users/payment-methods/${methodId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Payment method deleted successfully');
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payment method');
    }
  };

  // Set default payment method
  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/users/payment-methods/${methodId}/default`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Default payment method updated');
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      toast.error(error.response?.data?.message || 'Failed to set default payment method');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: 'bkash',
      name: '',
      number: '',
      isDefault: false
    });
  };

  const openAddPaymentModal = () => {
    resetPaymentForm();
    setShowAddPaymentModal(true);
  };

  const openEditPaymentModal = (method: PaymentMethod) => {
    setPaymentForm({
      type: method.type,
      name: method.name,
      number: method.number,
      isDefault: method.isDefault
    });
    setEditingPaymentMethod(method);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch(type) {
      case 'bkash':
        return <CreditCard className="text-pink-600" />;
      case 'nagad':
        return <CreditCard className="text-orange-600" />;
      case 'credit_card':
        return <CreditCard className="text-blue-600" />;
      case 'debit_card':
        return <CreditCard className="text-green-600" />;
      default:
        return <CreditCard className="text-gray-600" />;
    }
  };

  const getPaymentMethodName = (type: string) => {
    switch(type) {
      case 'bkash':
        return 'bKash';
      case 'nagad':
        return 'Nagad';
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      default:
        return type;
    }
  };

  const maskCardNumber = (number: string, type: string) => {
    if (type === 'credit_card' || type === 'debit_card') {
      return `**** **** **** ${number.slice(-4)}`;
    }
    return number;
  };

  useEffect(() => {
    fetchOrders();
    fetchPaymentMethods();
    
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'processing':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleRateOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedOrder) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/products/${selectedOrder.items[0].product._id}/reviews`, {
        rating: ratingForm.rating,
        comment: ratingForm.comment,
        orderId: selectedOrder._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setSelectedOrder(null);
      setRatingForm({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };



  const downloadReceipt = async (orderNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/receipts/download/order/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download receipt. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/users/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Set active tab from URL parameter
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'orders', 'payment', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as 'profile' | 'orders' | 'payment' | 'settings');
    }

    // Fetch user data from API
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const userData = response.data.user;
        setUser(userData);
        
        // Initialize form data with user data
        setFormData({
          name: userData.name || authUser?.name || '',
          phone: userData.phone || '',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || ''
          }
        });
        
        console.log('User data fetched:', userData);
      } catch (error: unknown) {
        console.error('Error fetching user data:', error);
        setMessage({ type: 'error', text: 'Failed to load user data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [searchParams]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch payment methods when payment tab is active
  useEffect(() => {
    if (activeTab === 'payment') {
      fetchPaymentMethods();
    }
  }, [activeTab]);






  console.log('User Data:', user);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <User size={40} className="text-green-600" />
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-800">{user.name || authUser?.name || 'User'}</h1>
                <p className="text-gray-600">{user.email || authUser?.email || ''}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span className="mr-4">Member since {user.joinDate}</span>
                  <span className="mr-4">{user.orders} Orders</span>
                  <span>{user.points} Points</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center px-4 py-3 ${
                      activeTab === 'profile'
                        ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User size={20} className="mr-3" />
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center px-4 py-3 ${
                      activeTab === 'orders'
                        ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Package size={20} className="mr-3" />
                    Order History
                    {ordersLoading && activeTab === 'orders' && (
                      <div className="ml-auto w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex items-center px-4 py-3 ${
                      activeTab === 'payment'
                        ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard size={20} className="mr-3" />
                    Payment Methods
                    {paymentMethodsLoading && activeTab === 'payment' && (
                      <div className="ml-auto w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center px-4 py-3 ${
                      activeTab === 'settings'
                        ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Settings size={20} className="mr-3" />
                    Account Settings
                  </button>
                  <button
                    className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={20} className="mr-3" />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                    
                    {isLoading && (
                      <div className="mb-4 p-3 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                        Loading profile information...
                      </div>
                    )}
                    
                    {/* Message display */}
                    {message && (
                      <div className={`mb-4 p-3 rounded-lg ${
                        message.type === 'success' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {message.text}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email || authUser?.email || ''}
                          className="w-full px-3 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                          disabled
                          placeholder="Email (cannot be changed)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Police Station
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => handleInputChange('address.street', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your police station"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your district"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Area
                        </label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter your area"
                        />
                      </div>

                    </div>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Order History</h2>
                      <button
                        onClick={fetchOrders}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Refresh
                      </button>
                    </div>
                    {ordersLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package size={64} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No orders found</p>
                        <p className="text-sm text-gray-500 mb-4">Start shopping to see your order history here</p>
                        <button
                          onClick={() => window.location.href = '/shop'}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order._id} className="border rounded-lg p-6 bg-white shadow-sm">
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(order.status)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="relative">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                          <img 
                                            src={item.product?.image || '/placeholder-product.jpg'} 
                                            alt={item.product?.name || 'Product'}
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                              e.currentTarget.nextElementSibling.style.display = 'flex';
                                            }}
                                            loading="lazy"
                                          />
                                          {/* Fallback icon when image fails */}
                                          <div className="hidden w-full h-full items-center justify-center text-gray-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                        </div>
                                        {/* Fruit Panda Logo Overlay - Better positioned */}
                                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                          <img 
                                            src="/logo.png" 
                                            alt="Fruit Panda" 
                                            className="w-4 h-4 object-contain"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-medium">{item.product?.name || 'Product'}</p>
                                        <p className="text-sm text-gray-600">{item.product?.nameBn || ''}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">৳{item.price?.toFixed(2) || '0.00'} × {item.quantity || 0}</p>
                                      <p className="text-sm text-gray-600">৳{item.subtotal?.toFixed(2) || '0.00'}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <p>No items found for this order</p>
                                </div>
                              )}
                            </div>

                            {/* Shipping Address */}
                            {order.shippingAddress && (
                              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-800 mb-2">Shipping Address</h4>
                                <div className="text-sm text-gray-600">
                                  <p><strong>{order.shippingAddress.fullName}</strong></p>
                                  <p>{order.shippingAddress.address}</p>
                                  <p>{order.shippingAddress.city}, {order.shippingAddress.area}</p>
                                  <p>Phone: {order.shippingAddress.phone}</p>
                                </div>
                              </div>
                            )}

                            {/* Order Timeline */}
                            {order.timeline && order.timeline.length > 0 && (
                              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2">Order Timeline</h4>
                                <div className="space-y-2">
                                  {order.timeline.slice(-3).map((event, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                      <span className="text-blue-700">{event.message}</span>
                                      <span className="text-blue-500 ml-auto">
                                        {new Date(event.timestamp).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Order Summary */}
                            <div className="border-t pt-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-600">Subtotal:</span>
                                <span>৳{order.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                              </div>
                              {(order.pricing?.deliveryFee || 0) > 0 && (
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-gray-600">Delivery Fee:</span>
                                  <span>৳{order.pricing.deliveryFee.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-lg">Total:</span>
                                <span className="font-bold text-lg">৳{order.pricing?.total?.toFixed(2) || '0.00'}</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => downloadReceipt(order.orderNumber)}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                  >
                                    Download Receipt
                                  </button>
                                  {order.status === 'delivered' && (
                                    <button
                                      onClick={() => handleRateOrder(order)}
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                    >
                                      <Star size={14} className="mr-1" />
                                      Rate Order
                                    </button>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Payment: {order.payment?.method?.toUpperCase() || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Payment Methods</h2>
                    {paymentMethodsLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading payment methods...</p>
                      </div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No payment methods added yet.</p>
                        <p className="text-sm text-gray-500">Add a new payment method to get started.</p>
                        <button
                          onClick={openAddPaymentModal}
                          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Plus size={16} className="mr-2" /> Add New Method
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div key={method._id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                {getPaymentMethodIcon(method.type)}
                              </div>
                              <div>
                                <h3 className="font-medium">{method.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {getPaymentMethodName(method.type)}: {maskCardNumber(method.number, method.type)}
                                </p>
                                {method.isDefault && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Default</span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditPaymentModal(method)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePaymentMethod(method._id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                <Trash2 size={16} />
                              </button>
                              {!method.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultPaymentMethod(method._id)}
                                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                                >
                                  Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}



                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Email Notifications</h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox text-green-600" defaultChecked />
                            <span className="ml-2">Order updates</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox text-green-600" defaultChecked />
                            <span className="ml-2">Special offers and promotions</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox text-green-600" />
                            <span className="ml-2">Newsletter</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Privacy</h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox text-green-600" defaultChecked />
                            <span className="ml-2">Show my profile to other users</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Account Actions</h3>
                        <div className="space-y-2">
                          <button className="text-red-600 hover:text-red-700">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Rate Your Order</h3>
            <p className="text-gray-600 mb-4">Order #{selectedOrder.orderNumber}</p>
            
            {/* Rating Stars */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingForm(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl ${ratingForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
              <textarea
                value={ratingForm.comment}
                onChange={(e) => setRatingForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedOrder(null);
                  setRatingForm({ rating: 5, comment: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Payment Method</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method Type
                </label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, type: e.target.value as 'bkash' | 'nagad' | 'credit_card' | 'debit_card' }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method Name (e.g., "My BKash")
                </label>
                <input
                  type="text"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter method name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card/Account Number
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    type={showCardNumber[paymentForm.type] ? 'text' : 'password'}
                    value={paymentForm.number}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border-none focus:outline-none"
                    placeholder="Enter card/account number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(prev => ({ ...prev, [paymentForm.type]: !prev[paymentForm.type] }))}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    {showCardNumber[paymentForm.type] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={paymentForm.isDefault}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="form-checkbox text-green-600"
                />
                <span className="ml-2 text-sm text-gray-700">Set as default payment method</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Payment Method</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method Type
                </label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, type: e.target.value as 'bkash' | 'nagad' | 'credit_card' | 'debit_card' }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method Name (e.g., "My BKash")
                </label>
                <input
                  type="text"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter method name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card/Account Number
                </label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                  <input
                    type={showCardNumber[paymentForm.type] ? 'text' : 'password'}
                    value={paymentForm.number}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border-none focus:outline-none"
                    placeholder="Enter card/account number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(prev => ({ ...prev, [paymentForm.type]: !prev[paymentForm.type] }))}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    {showCardNumber[paymentForm.type] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={paymentForm.isDefault}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="form-checkbox text-green-600"
                />
                <span className="ml-2 text-sm text-gray-700">Set as default payment method</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingPaymentMethod(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePaymentMethod}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;