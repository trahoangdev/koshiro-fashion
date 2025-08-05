import express from 'express';
import { authenticateToken, requireCustomer } from '../middleware/auth';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist 
} from '../controllers/wishlistController';

const router = express.Router();

// All routes require authentication and customer role
router.use(authenticateToken);
router.use(requireCustomer);

// Get user's wishlist
router.get('/', getWishlist);

// Add product to wishlist
router.post('/', addToWishlist);

// Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// Clear wishlist
router.delete('/', clearWishlist);

export default router; 