import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getActivityLogs,
  clearActivityLogs,
  getActivityStats
} from '../controllers/activityController';

const router = express.Router();

// All activity routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Activity logs management
router.get('/logs', getActivityLogs);
router.delete('/logs', clearActivityLogs);
router.get('/stats', getActivityStats);

export default router; 