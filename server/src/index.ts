import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';
import activityRoutes from './routes/activity';
import notificationRoutes from './routes/notifications';
import settingsRoutes from './routes/settings';
import paymentMethodRoutes from './routes/paymentMethods';
import promotionRoutes from './routes/promotions';
import inventoryRoutes from './routes/inventory';
import adminShippingRoutes from './routes/adminShipping';
import adminPaymentsRoutes from './routes/adminPayments';
import flashSaleRoutes from './routes/flashSale';
import roleRoutes from './routes/roles';
import permissionRoutes from './routes/permissions';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Koshiro Fashion API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      admin: '/api/admin',
      roles: '/api/roles',
      permissions: '/api/permissions'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin/shipping', adminShippingRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

// Error handling middleware
interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Starting Koshiro Fashion API Server...');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Start listening
    server = app.listen(PORT, () => {
      console.log('\n🚀 ===========================================');
      console.log('   KOSHIRO FASHION API SERVER STARTED');
      console.log('🚀 ===========================================');
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(`💾 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log('🚀 ===========================================\n');
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('💡 Try using a different port or kill the process using this port');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('💡 Check your database connection and environment variables');
    process.exit(1);
  }
};

// Handle graceful shutdown
let server: ReturnType<typeof app.listen> | null = null;

const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      console.log('👋 Koshiro Fashion API Server stopped');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('💡 Server will be terminated');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('💡 Server will be terminated');
  process.exit(1);
});

// Start the server
startServer();
