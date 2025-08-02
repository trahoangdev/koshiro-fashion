import express from 'express';
import {
  getOrders,
  getUserOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/orderController';
import { authenticateToken, requireAdmin, requireCustomer } from '../middleware/auth';

const router = express.Router();

// Customer routes (protected)
router.get('/my-orders', authenticateToken, requireCustomer, getUserOrders);
router.get('/my-orders/:id', authenticateToken, requireCustomer, getOrder);
router.post('/', authenticateToken, requireCustomer, createOrder);
router.put('/:id/cancel', authenticateToken, requireCustomer, cancelOrder);

// Admin routes (protected)
router.get('/', authenticateToken, requireAdmin, getOrders);
router.get('/stats', authenticateToken, requireAdmin, getOrderStats);
router.get('/:id', authenticateToken, requireAdmin, getOrder);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router; 