import express from 'express';
import {
  getReviews,
  createReview,
  markReviewHelpful,
  getReviewStats
} from '../controllers/reviewController';
import { authenticateToken, requireCustomer } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/stats', getReviewStats);

// Protected routes
router.post('/', authenticateToken, requireCustomer, createReview);
router.post('/:reviewId/helpful', markReviewHelpful);

export default router; 