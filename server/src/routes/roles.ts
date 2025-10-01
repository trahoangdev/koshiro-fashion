import express from 'express';
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRoleStats,
  cloneRole
} from '../controllers/roleController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes (if needed)
// router.get('/', getRoles);

// Protected routes - require authentication
router.use(authenticateToken);

// Get all roles
router.get('/', getRoles);

// Get role statistics
router.get('/stats', getRoleStats);

// Get single role by ID
router.get('/:id', getRole);

// Admin routes - require admin role
router.post('/', requireAdmin, createRole);
router.put('/:id', requireAdmin, updateRole);
router.delete('/:id', requireAdmin, deleteRole);
router.post('/:id/clone', requireAdmin, cloneRole);

export default router;
