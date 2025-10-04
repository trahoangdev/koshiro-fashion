import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryWithProducts,
  uploadCategoryImagesController,
  deleteCategoryImageController
} from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadCategoryImages, handleUploadError } from '../middleware/upload';

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

// Category image upload routes
router.post('/:id/upload-images', 
  authenticateToken, 
  requireAdmin, 
  uploadCategoryImages.array('images', 5),
  handleUploadError,
  uploadCategoryImagesController
);

router.delete('/:id/images/:publicId', 
  authenticateToken, 
  requireAdmin, 
  deleteCategoryImageController
);

export default router; 