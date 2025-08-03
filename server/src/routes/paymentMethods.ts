import express from 'express';
import { authenticateToken, requireCustomer } from '../middleware/auth';
import { 
  getPaymentMethods, 
  addPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  setDefaultPaymentMethod 
} from '../controllers/paymentMethodController';

const router = express.Router();

// All routes require authentication and customer role
router.use(authenticateToken);
router.use(requireCustomer);

// Get user's payment methods
router.get('/', getPaymentMethods);

// Add new payment method
router.post('/', addPaymentMethod);

// Update payment method
router.put('/:id', updatePaymentMethod);

// Delete payment method
router.delete('/:id', deletePaymentMethod);

// Set default payment method
router.put('/:id/default', setDefaultPaymentMethod);

export default router; 