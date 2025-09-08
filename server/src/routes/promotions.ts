import express from 'express';
import {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  getPromotionStats,
  validatePromotionCode
} from '../controllers/promotionController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getPromotions);
router.get('/:id', getPromotion);
router.post('/validate', validatePromotionCode);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, createPromotion);
router.put('/:id', authenticateToken, requireAdmin, updatePromotion);
router.delete('/:id', authenticateToken, requireAdmin, deletePromotion);
router.patch('/:id/toggle', authenticateToken, requireAdmin, togglePromotionStatus);
router.get('/stats/overview', authenticateToken, requireAdmin, getPromotionStats);

export default router;