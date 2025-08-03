import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';

interface User {
  _id: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer?: {
    name: string;
  };
  createdAt: string;
}

interface Notification {
  id: string;
  type: 'new_user' | 'new_order' | 'new_seller' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: User | Order;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Load read notifications from localStorage on mount
  useEffect(() => {
    const savedReadNotifications = localStorage.getItem('readNotifications');
    if (savedReadNotifications) {
      try {
        const parsed = JSON.parse(savedReadNotifications);
        setReadNotifications(new Set(parsed));
      } catch (error) {
        console.error('Error parsing saved read notifications:', error);
      }
    }
  }, []);

  // Clean up old read notifications (older than 7 days)
  const cleanupOldNotifications = () => {
    const newReadNotifications = new Set<string>();
    
    readNotifications.forEach(notificationId => {
      // Extract timestamp from notification ID if possible
      // For now, we'll keep all read notifications for simplicity
      newReadNotifications.add(notificationId);
    });
    
    setReadNotifications(newReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
  };

  const fetchNotifications = async () => {
    try {
      // In a real implementation, this would fetch from your notifications API
      // For now, we'll simulate with recent activity data
      const [usersResponse, ordersResponse] = await Promise.all([
        api.get('/admin/users?limit=10&sort=createdAt'),
        api.get('/admin/orders?limit=10&sort=createdAt')
      ]);

      const newNotifications: Notification[] = [];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Process new users
      usersResponse.data.users?.forEach((user: User) => {
        if (new Date(user.createdAt) > yesterday) {
          newNotifications.push({
            id: `user_${user._id}`,
            type: user.role === 'seller' ? 'new_seller' : 'new_user',
            title: `New ${user.role} Registration`,
            message: `${user.name} has registered as a ${user.role}`,
            timestamp: user.createdAt,
            read: readNotifications.has(`user_${user._id}`),
            data: user
          });
        }
      });

      // Process new orders
      ordersResponse.data.orders?.forEach((order: Order) => {
        if (new Date(order.createdAt) > yesterday) {
          newNotifications.push({
            id: `order_${order._id}`,
            type: 'new_order',
            title: 'New Order Received',
            message: `Order ${order.orderNumber} from ${order.customer?.name || 'Customer'}`,
            timestamp: order.createdAt,
            read: readNotifications.has(`order_${order._id}`),
            data: order
          });
        }
      });

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    // Add to read notifications set
    const newReadNotifications = new Set(readNotifications);
    newReadNotifications.add(notificationId);
    setReadNotifications(newReadNotifications);

    // Save to localStorage
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));

    // Update notification read status
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    // Mark all notifications as read
    const allNotificationIds = notifications.map(n => n.id);
    const newReadNotifications = new Set([...readNotifications, ...allNotificationIds]);
    setReadNotifications(newReadNotifications);

    // Save to localStorage
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));

    // Update all notifications as read
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Update unread count whenever notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    
    // Clean up old notifications once per day
    const cleanupInterval = setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [readNotifications]); // Re-fetch when read status changes

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};