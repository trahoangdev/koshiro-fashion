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
  updateOrderStatus,
  getRevenueData,
  getProductStats,
  getUserById,
  bulkUpdateUserStatus,
  getOrderDetails,
  bulkUpdateOrderStatus,
  printOrder,
  sendOrderEmail,
  getAnalyticsData,
  generateReport
} from '../controllers/adminController';
import { cancelOrder } from '../controllers/orderController';
import { exportData, importData } from '../controllers/exportImportController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);
router.get('/revenue-data', getRevenueData);
router.get('/product-stats', getProductStats);

// Orders management
router.get('/orders', getAdminOrders);
router.get('/orders/:orderId', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/cancel', cancelOrder);
router.put('/orders/bulk-status', bulkUpdateOrderStatus);
router.get('/orders/:orderId/print', printOrder);
router.post('/orders/:orderId/email', sendOrderEmail);

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
router.get('/users/:userId', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/bulk-status', bulkUpdateUserStatus);
router.delete('/users/:id', deleteUser);

// Analytics and Reports
router.get('/analytics', getAnalyticsData);
router.post('/reports', generateReport);

// Export/Import
router.post('/export', exportData);
router.post('/import', importData);

export default router; 