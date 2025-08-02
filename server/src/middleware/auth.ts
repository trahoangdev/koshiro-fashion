import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'koshiro-fashion-secret-key-2024';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth middleware - Headers:', req.headers);
  console.log('Auth middleware - Auth header:', authHeader);
  console.log('Auth middleware - Token:', token ? `${token.substring(0, 20)}...` : 'No token');

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Auth middleware - Decoded token:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.log('Auth middleware - Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

export const requireCustomer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Customer access required' });
  }

  next();
}; 