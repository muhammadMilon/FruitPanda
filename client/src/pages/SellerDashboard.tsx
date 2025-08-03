import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, DollarSign, BarChart2, ShoppingBag, Truck, AlertTriangle, Plus, Edit, Trash2, Eye, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      nameBn: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  nameBn: string;
  stock: number;
  price: number;
  sales: number;
  image: string;
  status: string;
  category: string;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  averageRating: number;
  monthlyRevenue: number;
  pendingOrders: number;
}

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    averageRating: 0,
    monthlyRevenue: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching dashboard stats with token:', !!token);
      
      const response = await axios.get('http://localhost:3000/api/seller/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Dashboard stats response:', response.data);
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load dashboard statistics');
    }
  };

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching recent orders with token:', !!token);
      
      const response = await axios.get('http://localhost:3000/api/seller/orders/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Recent orders response:', response.data);
      setRecentOrders(response.data.orders);
    } catch (error: any) {
      console.error('Error fetching recent orders:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load recent orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch seller products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching products with token:', !!token);
      
      const response = await axios.get('http://localhost:3000/api/seller/products?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Products response:', response.data);
      setProducts(response.data.products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/seller/orders/${orderId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Order status updated successfully');
      fetchRecentOrders();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Product deleted successfully');
      fetchProducts();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentOrders(),
        fetchProducts()
      ]);
      setLoading(false);
    };

    initializeDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
          <Link 
            to="/seller/products/add"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add New Product
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'overview'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'orders'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'products'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'analytics'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">৳{stats.totalSales.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingBag className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Package className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TrendingUp className="text-yellow-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">৳{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                <Link 
                  to="/seller/orders"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                  <p className="text-sm text-gray-500">Orders will appear here once customers start placing them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">
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
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ৳{order.total.toFixed(2)}
                        </div>
                        <div className="flex space-x-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Top Products</h2>
                <Link 
                  to="/seller/products"
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No products yet</p>
                  <p className="text-sm text-gray-500">Add your first product to get started</p>
                  <Link 
                    to="/seller/products/add"
                    className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Product
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 6).map((product) => (
                    <div key={product._id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.nameBn}</p>
                          <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-medium text-green-600">৳{product.price}</span>
                        <div className="flex space-x-1">
                          <Link
                            to={`/seller/products/${product._id}/edit`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">All Orders</h2>
            {/* Orders content will be implemented here */}
            <div className="text-center py-8">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Orders management coming soon</p>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Products</h2>
              <Link 
                to="/seller/products/add"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Product
              </Link>
            </div>
            {/* Products content will be implemented here */}
            <div className="text-center py-8">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Products management coming soon</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics</h2>
            {/* Analytics content will be implemented here */}
            <div className="text-center py-8">
              <BarChart2 size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Analytics dashboard coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;