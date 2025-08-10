import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getReviewStats
} from '../controllers/reviewController';
import { authenticateToken, requireCustomer, requireAdmin, requireCustomerOrAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/stats', getReviewStats);

// Protected routes
router.post('/', authenticateToken, requireCustomerOrAdmin, createReview);
router.put('/:reviewId', authenticateToken, requireAdmin, updateReview);
router.delete('/:reviewId', authenticateToken, requireAdmin, deleteReview);
router.post('/:reviewId/helpful', markReviewHelpful);

export default router; 