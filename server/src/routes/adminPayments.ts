import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { 
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  processRefund,
  getRefunds,
  updateRefundStatus,
  getPaymentStats
} from '../controllers/paymentController';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Payment Methods
router.get('/methods', getPaymentMethods);
router.post('/methods', createPaymentMethod);
router.put('/methods/:id', updatePaymentMethod);
router.delete('/methods/:id', deletePaymentMethod);

// Transactions
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransaction);
router.put('/transactions/:id/status', updateTransactionStatus);

// Refunds
router.get('/refunds', getRefunds);
router.post('/transactions/:id/refund', processRefund);
router.put('/refunds/:id/status', updateRefundStatus);

// Statistics
router.get('/stats', getPaymentStats);

export default router;
