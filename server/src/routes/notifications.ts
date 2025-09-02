import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  bulkMarkAsRead,
  bulkDelete,
  getNotificationStats
} from '../controllers/notificationController';

const router = express.Router();

// All notification routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Notifications management
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.get('/:notificationId', getNotificationById);
router.post('/', createNotification);
router.put('/:notificationId', updateNotification);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/bulk/read', bulkMarkAsRead);
router.put('/bulk/delete', bulkDelete);
router.put('/all/read', markAllNotificationsAsRead);
router.delete('/:notificationId', deleteNotification);

export default router; 