import express from 'express';
import { authenticateToken, requireCustomer } from '../middleware/auth';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController';

const router = express.Router();

// All routes require authentication and customer role
router.use(authenticateToken);
router.use(requireCustomer);

// Get user's cart
router.get('/', getCart);

// Add product to cart
router.post('/', addToCart);

// Update cart item quantity
router.put('/:productId', updateCartItem);

// Remove product from cart
router.delete('/:productId', removeFromCart);

// Clear cart
router.delete('/', clearCart);

export default router; 