import React, { useState, useEffect } from 'react';
import { Users, Package, TrendingUp, AlertTriangle, ShoppingBag, Bell, CheckCircle, XCircle, DollarSign, BarChart2, Mail } from 'lucide-react';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import UserManagement from '../../components/admin/UserManagement';
import OrderManagement from '../../components/admin/OrderManagement';
import ProductManagement from '../../components/admin/ProductManagement';
import ContactManagement from '../../components/admin/ContactManagement';
import NotificationCenter from '../../components/admin/NotificationCenter';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import SellerApplicationManagement from '../../components/admin/SellerApplicationManagement';
import SellerApplicationTest from '../../components/admin/SellerApplicationTest';
import { useNotifications } from '../../hooks/useNotifications';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  pricing: {
    total: number;
  };
  status: string;
  createdAt: string;
}

interface NewUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

interface Notification {
  id: string;
  type: 'new_user' | 'new_order' | 'new_seller';
  message: string;
  timestamp: string;
  read: boolean;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'orders' | 'analytics' | 'contacts' | 'seller-applications'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [newUsers, setNewUsers] = useState<NewUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifications, unreadCount } = useNotifications();

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Check if backend is running by making a health check
      try {
        await api.get('/health');
      } catch (healthError) {
        throw new Error('Backend server is not running. Please start the server on port 3000.');
      }

      const [statsResponse, ordersResponse, usersResponse] = await Promise.all([
        api.get('/admin/dashboard/stats').catch(() => ({ data: { stats: stats, recentOrders: [] } })),
        api.get('/orders?limit=5').catch(() => ({ data: { orders: [] } })),
        api.get('/admin/users?limit=5&sort=createdAt').catch(() => ({ data: { users: [] } }))
      ]);

      if (statsResponse.data.stats) {
        setStats(statsResponse.data.stats);
      }
      
      setRecentOrders(statsResponse.data.recentOrders || ordersResponse.data.orders || []);
      setNewUsers(usersResponse.data.users || []);
      

      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      
      if (error.message.includes('Backend server is not running')) {
        toast.error('Backend server is not running. Please start the server with: npm run server:dev');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };



  const handleUserStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive });
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error('Failed to update user status');
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { 
        status,
        message: `Order status updated to ${status} by admin`
      });
      toast.success('Order status updated successfully');
      fetchDashboardData();
    } catch (error: any) {
      toast.error('Failed to update order status');
    }
  };





  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>To start the backend server:</p>
            <code className="block bg-gray-100 p-2 rounded">npm run server:dev</code>
            <p>Make sure MongoDB is running and the server starts on port 3000</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart2 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'seller-applications', label: 'Seller Applications', icon: Users },
              { id: 'contacts', label: 'Messages', icon: Mail },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={20} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-xl font-semibold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-xl font-semibold">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Active Sellers</p>
                    <p className="text-xl font-semibold">{stats.totalSellers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-semibold">৳{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                    {stats.pendingOrders > 0 && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                        {stats.pendingOrders} pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                      <p className="text-gray-500 text-center">No recent orders</p>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.customer?.name || 'Customer'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">৳{order.pricing?.total || 0}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order._id, 'confirmed')}
                                  className="text-green-600 hover:text-green-800"
                                  title="Confirm Order"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* New Users */}
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {newUsers.length === 0 ? (
                      <p className="text-gray-500 text-center">No recent users</p>
                    ) : (
                      newUsers.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users size={20} className="text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-800">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              user.role === 'seller' ? 'bg-purple-100 text-purple-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                            <div className="flex gap-1">
                              {user.isActive ? (
                                <button
                                  onClick={() => handleUserStatusChange(user._id, false)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Deactivate User"
                                >
                                  <XCircle size={16} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserStatusChange(user._id, true)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Activate User"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">System Status</h2>
              <div className="space-y-4">
                {stats.pendingOrders > 0 && (
                  <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">Pending Orders</p>
                      <p className="text-sm text-yellow-700">
                        {stats.pendingOrders} orders are waiting for confirmation
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="ml-auto text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      View Orders
                    </button>
                  </div>
                )}
                
                {unreadCount > 0 && (
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">New Notifications</p>
                      <p className="text-sm text-blue-700">
                        {unreadCount} new notifications require your attention
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowNotifications(true)}
                      className="ml-auto text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                )}
                
                {stats.pendingOrders === 0 && unreadCount === 0 && (
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">All Systems Normal</p>
                      <p className="text-sm text-green-700">
                        No pending actions required
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'seller-applications' && (
          <div className="space-y-6">
            <SellerApplicationTest />
            <SellerApplicationManagement />
          </div>
        )}
        {activeTab === 'contacts' && <ContactManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* Notification Center */}
        <NotificationCenter 
          show={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;