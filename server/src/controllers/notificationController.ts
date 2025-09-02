import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

// Get notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query: any = {};
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndUpdate(notificationId, { read: true });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany({}, { read: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, category, actionUrl, expiresAt } = req.body;

    // Validate required fields
    if (!title || !message || !type || !category) {
      return res.status(400).json({ 
        message: 'Title, message, type, and category are required' 
      });
    }

    // Validate enum values
    const validTypes = ['info', 'success', 'warning', 'error'];
    const validCategories = ['system', 'order', 'product', 'user', 'marketing'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid type. Must be one of: info, success, warning, error' 
      });
    }
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: 'Invalid category. Must be one of: system, order, product, user, marketing' 
      });
    }

    const notification = await Notification.create({
      userId: userId || undefined,
      title,
      message,
      type,
      category,
      actionUrl: actionUrl || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      read: false
    });

    res.status(201).json({
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update notification
export const updateNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { title, message, type, category, actionUrl, expiresAt, read } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (actionUrl !== undefined) updateData.actionUrl = actionUrl;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (read !== undefined) updateData.read = read;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single notification
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ data: notification });
  } catch (error) {
    console.error('Error getting notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk operations
export const bulkMarkAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'notificationIds array is required' });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
      { read: true }
    );

    res.json({
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk marking notifications as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkDelete = async (req: Request, res: Response) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'notificationIds array is required' });
    }

    const result = await Notification.deleteMany({ _id: { $in: notificationIds } });

    res.json({
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create notification (utility function for other controllers)
export const createNotificationUtil = async (data: {
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'order' | 'product' | 'user' | 'marketing';
  actionUrl?: string;
  expiresAt?: Date;
}) => {
  try {
    await Notification.create({
      ...data,
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    const totalNotifications = await Notification.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const unreadNotifications = await Notification.countDocuments({
      read: false,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const categoryStats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          unread: { $sum: { $cond: ['$read', 0, 1] } }
        }
      }
    ]);

    const typeStats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: { $sum: { $cond: ['$read', 0, 1] } }
        }
      }
    ]);

    res.json({
      period: { startDate, endDate },
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
      categoryStats,
      typeStats
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 