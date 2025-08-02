import express from 'express';
import { register, login, adminLogin, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router; 