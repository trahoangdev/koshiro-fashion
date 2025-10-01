import express from 'express';
import {
  getActiveFlashSales,
  getAllFlashSales,
  getFlashSaleById,
  getFlashSaleProducts,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  getCurrentFlashSale
} from '../controllers/flashSaleController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/active', getActiveFlashSales);
router.get('/current', getCurrentFlashSale);
router.get('/:id', getFlashSaleById);
router.get('/:id/products', getFlashSaleProducts);

// Admin routes
router.get('/', authenticateToken, authorizeRoles(['admin']), getAllFlashSales);
router.post('/', authenticateToken, authorizeRoles(['admin']), createFlashSale);
router.put('/:id', authenticateToken, authorizeRoles(['admin']), updateFlashSale);
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), deleteFlashSale);

export default router;
