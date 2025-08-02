import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryWithProducts
} from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategory);
router.get('/:id/products', getCategoryWithProducts);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router; 