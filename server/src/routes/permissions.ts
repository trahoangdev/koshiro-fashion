import express from 'express';
import {
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionStats,
  getPermissionsByCategory,
  bulkCreatePermissions
} from '../controllers/permissionController';
import { authenticateToken } from '../middleware/auth';
import { requirePermissionManagement } from '../middleware/authorization';

const router = express.Router();

// Public routes (if needed)
// router.get('/', getPermissions);

// Protected routes - require authentication
router.use(authenticateToken);

// Get all permissions
router.get('/', getPermissions);

// Get permissions by category
router.get('/by-category', getPermissionsByCategory);

// Get permission statistics
router.get('/stats', getPermissionStats);

// Get single permission by ID
router.get('/:id', getPermission);

// Admin routes - require permission management permissions
router.post('/', requirePermissionManagement, createPermission);
router.post('/bulk', requirePermissionManagement, bulkCreatePermissions);
router.put('/:id', requirePermissionManagement, updatePermission);
router.delete('/:id', requirePermissionManagement, deletePermission);

export default router;
