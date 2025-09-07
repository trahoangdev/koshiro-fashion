import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { ActivityLog } from '../models/ActivityLog';

// Get activity logs with filtering
export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 50, category, severity, startDate, endDate } = req.query;
    
    const query: any = {};
    
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'name email');

    const total = await ActivityLog.countDocuments(query);

    res.json({
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });});
// Clear activity logs
export const clearActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const { days } = req.body;
    
    let dateFilter = {};
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - Number(days));
      dateFilter = { timestamp: { $lt: cutoffDate } };
    }

    const result = await ActivityLog.deleteMany(dateFilter);

    res.json({ 
      message: `Cleared ${result.deletedCount} activity logs`,
      deletedCount: result.deletedCount
    });});
// Create activity log (utility function for other controllers)
export const createActivityLog = async (data: {
  userId?: string;
  action: string;
  category: 'system' | 'user' | 'order' | 'product' | 'category' | 'auth';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    await ActivityLog.create({
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

// Get activity log statistics
export const getActivityStats = asyncHandler(async (req: Request, res: Response) => {
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

    const stats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            category: '$category',
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLogs = await ActivityLog.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const categoryStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const severityStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      period: { startDate, endDate },
      totalLogs,
      categoryStats,
      severityStats,
      detailedStats: stats
    });
  } catch (error) {
    console.error('Error getting activity stats:', error);
    res.status(500).json({ message: 'Error getting activity statistics' });
  }
});