import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
  uploadProductImages,
  deleteProductImages
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadProductImages as uploadMiddleware, handleUploadError } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, uploadMiddleware.array('images', 10), handleUploadError, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

// Image management routes
router.post('/upload-images', authenticateToken, requireAdmin, uploadMiddleware.array('images', 10), handleUploadError, uploadProductImages);
router.delete('/delete-images', authenticateToken, requireAdmin, deleteProductImages);

export default router; 