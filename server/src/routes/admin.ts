import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getAdminStats,
  getAdminOrders,
  getAdminProducts,
  getAdminCategories,
  getAdminUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createUser,
  updateUser,
  deleteUser,
  updateOrderStatus
} from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

// Orders management
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Products management
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories management
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Users management
router.get('/users', getAdminUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router; 