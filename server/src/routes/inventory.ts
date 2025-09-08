import express from 'express';
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  getStockMovements,
  getInventoryStats,
  bulkUpdateInventory
} from '../controllers/inventoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getInventory);
router.get('/stats', getInventoryStats);
router.get('/movements', getStockMovements);

// Protected routes (require authentication)
router.get('/:id', authenticateToken, getInventoryItem);
router.post('/:id/adjust', authenticateToken, adjustStock);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createInventoryItem);
router.put('/:id', authenticateToken, requireAdmin, updateInventoryItem);
router.delete('/:id', authenticateToken, requireAdmin, deleteInventoryItem);
router.post('/bulk-update', authenticateToken, requireAdmin, bulkUpdateInventory);

export default router;