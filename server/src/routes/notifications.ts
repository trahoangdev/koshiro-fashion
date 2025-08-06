import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats
} from '../controllers/notificationController';

const router = express.Router();

// All notification routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Notifications management
router.get('/', getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/mark-all-read', markAllNotificationsAsRead);
router.delete('/:notificationId', deleteNotification);
router.get('/stats', getNotificationStats);

export default router; 