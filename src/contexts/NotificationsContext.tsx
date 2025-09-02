import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, Notification } from '@/lib/api';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => void;
  createNotification: (data: {
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
  }) => Promise<void>;
  updateNotification: (id: string, data: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
    read?: boolean;
  }) => Promise<void>;
  bulkMarkAsRead: (ids: string[]) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
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
      
      // Load notifications from API
      const response = await api.getNotifications({ 
        page: 1, 
        limit: 100 
      });

      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      // For now, we'll just mark as read since we don't have archive functionality in backend
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      // Delete all notifications
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length > 0) {
        await api.bulkDelete(unreadIds);
      }
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const createNotification = async (data: {
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    try {
      const response = await api.createNotification(data);
      setNotifications(prev => [response.data, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const updateNotification = async (id: string, data: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
    read?: boolean;
  }) => {
    try {
      const response = await api.updateNotification(id, data);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id ? response.data : notification
        )
      );
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  };

  const bulkMarkAsRead = async (ids: string[]) => {
    try {
      await api.bulkMarkAsRead(ids);
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification._id) 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('Error bulk marking notifications as read:', error);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    try {
      await api.bulkDelete(ids);
      setNotifications(prev => prev.filter(notification => !ids.includes(notification._id)));
      setUnreadCount(prev => Math.max(0, prev - ids.filter(id => 
        notifications.find(n => n._id === id && !n.read)
      ).length));
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
    }
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
    refreshNotifications,
    createNotification,
    updateNotification,
    bulkMarkAsRead,
    bulkDelete
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
