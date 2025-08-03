import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Package, DollarSign, Calendar } from 'lucide-react';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface AnalyticsData {
  salesAnalytics: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    revenue: number;
    orders: number;
  }>;
  userAnalytics: Array<{
    _id: {
      year: number;
      month: number;
    };
    users: number;
  }>;
  productAnalytics: Array<{
    _id: string;
    count: number;
    avgPrice: number;
  }>;
  orderAnalytics: Array<{
    _id: {
      year: number;
      month: number;
    };
    orders: number;
    revenue: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <BarChart2 size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalRevenue = analytics.salesAnalytics.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = analytics.salesAnalytics.reduce((sum, item) => sum + item.orders, 0);
  const totalUsers = analytics.userAnalytics.reduce((sum, item) => sum + item.users, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Analytics Overview</h2>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <Package size={32} className="text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">New Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users size={32} className="text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
              </div>
              <TrendingUp size={32} className="text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
        <div className="space-y-4">
          {analytics.salesAnalytics.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">
                {formatDate(new Date(item._id.year, item._id.month - 1, item._id.day))}
              </div>
              <div className="flex-1 ml-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((item.revenue / Math.max(...analytics.salesAnalytics.map(s => s.revenue))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-right text-sm font-medium text-gray-800">
                {formatCurrency(item.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Categories</h3>
        <div className="space-y-4">
          {analytics.productAnalytics.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 capitalize">{category._id}</h4>
                <p className="text-sm text-gray-600">{category.count} products</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">{formatCurrency(category.avgPrice)}</p>
                <p className="text-sm text-gray-600">avg price</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Orders by Month</h4>
            <div className="space-y-2">
              {analytics.orderAnalytics.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {getMonthName(item._id.month)} {item._id.year}
                  </span>
                  <span className="font-medium">{item.orders} orders</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Revenue by Month</h4>
            <div className="space-y-2">
              {analytics.orderAnalytics.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {getMonthName(item._id.month)} {item._id.year}
                  </span>
                  <span className="font-medium">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 