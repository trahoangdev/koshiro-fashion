import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: 'order' | 'user' | 'product' | 'system' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  title: string;
  message: string;
  timestamp: string;
  sender?: string;
  relatedId?: string;
  actionUrl?: string;
  icon?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Load real notifications data from API
      const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
        api.getAdminOrders({ page: 1, limit: 50 }),
        api.getAdminUsers({ page: 1, limit: 50 }),
        api.getAdminProducts({ page: 1, limit: 50 })
      ]);

      // Transform real data into notifications
      const realNotifications: Notification[] = [];

      // Order notifications
      if (ordersResponse.data) {
        ordersResponse.data.forEach((order: any) => {
          // New order notification
          realNotifications.push({
            id: `order-${order._id}`,
            type: 'order',
            priority: 'high',
            status: 'unread',
            title: 'New Order Received',
            message: `Order #${order.orderNumber} has been placed by ${order.userId?.name || 'Customer'}`,
            timestamp: order.createdAt,
            sender: 'System',
            relatedId: order.orderNumber,
            actionUrl: `/admin/orders/${order._id}`
          });

          // Order status change notifications
          if (order.status === 'pending') {
            realNotifications.push({
              id: `order-pending-${order._id}`,
              type: 'order',
              priority: 'medium',
              status: 'unread',
              title: 'Order Pending Review',
              message: `Order #${order.orderNumber} is pending review and processing`,
              timestamp: order.updatedAt || order.createdAt,
              sender: 'Order System',
              relatedId: order.orderNumber
            });
          }

          if (order.status === 'processing') {
            realNotifications.push({
              id: `order-processing-${order._id}`,
              type: 'order',
              priority: 'medium',
              status: 'read',
              title: 'Order Processing',
              message: `Order #${order.orderNumber} is being processed`,
              timestamp: order.updatedAt || order.createdAt,
              sender: 'Order System',
              relatedId: order.orderNumber
            });
          }
        });
      }

      // User notifications
      if (usersResponse.data) {
        usersResponse.data.forEach((user: any) => {
          const userCreated = new Date(user.createdAt);
          const now = new Date();
          const diffInHours = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60);

          // New user registration (within last 24 hours)
          if (diffInHours < 24) {
            realNotifications.push({
              id: `user-${user._id}`,
              type: 'user',
              priority: 'medium',
              status: 'unread',
              title: 'New User Registration',
              message: `User ${user.email} has completed registration`,
              timestamp: user.createdAt,
              sender: 'System',
              relatedId: user._id
            });
          }
        });
      }

      // Product notifications
      if (productsResponse.data) {
        productsResponse.data.forEach((product: any) => {
          // Low stock alerts
          if (product.stock <= 10 && product.stock > 0) {
            realNotifications.push({
              id: `product-lowstock-${product._id}`,
              type: 'product',
              priority: 'medium',
              status: 'unread',
              title: 'Low Stock Alert',
              message: `Product '${product.name}' is running low on stock (${product.stock} remaining)`,
              timestamp: new Date().toISOString(),
              sender: 'Inventory System',
              relatedId: product._id
            });
          }

          // Out of stock alerts
          if (product.stock === 0) {
            realNotifications.push({
              id: `product-outofstock-${product._id}`,
              type: 'product',
              priority: 'high',
              status: 'unread',
              title: 'Out of Stock Alert',
              message: `Product '${product.name}' is out of stock`,
              timestamp: new Date().toISOString(),
              sender: 'Inventory System',
              relatedId: product._id
            });
          }
        });
      }

      // System notifications (based on real data)
      if (realNotifications.length > 0) {
        realNotifications.push({
          id: 'system-performance',
          type: 'system',
          priority: 'low',
          status: 'read',
          title: 'System Performance',
          message: `System is running smoothly with ${realNotifications.length} active notifications`,
          timestamp: new Date().toISOString(),
          sender: 'System Monitor'
        });
      }

      setNotifications(realNotifications);
      updateUnreadCount(realNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => n.status === 'unread').length;
    setUnreadCount(count);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'read' as const }
          : notification
      );
      updateUnreadCount(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, status: 'read' as const }));
      updateUnreadCount(updated);
      return updated;
    });
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'archived' as const }
          : notification
      );
      updateUnreadCount(updated);
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id);
      updateUnreadCount(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Set up real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    clearAll,
    refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
