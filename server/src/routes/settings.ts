import express from 'express';
import {
  getSettings,
  updateSettings
} from '../controllers/settingsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Admin routes (protected)
router.get('/', authenticateToken, requireAdmin, getSettings);
router.put('/', authenticateToken, requireAdmin, updateSettings);

export default router; 