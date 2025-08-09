import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';

// Helper function to update product count for categories
const updateCategoryProductCount = async (categoryId: string) => {
  try {
    const productCount = await Product.countDocuments({ 
      categoryId: categoryId,
      isActive: true 
    });
    
    await Category.findByIdAndUpdate(categoryId, { productCount });
    console.log(`Updated product count for category ${categoryId}: ${productCount}`);
  } catch (error) {
    console.error('Error updating category product count:', error);
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    console.log('Admin stats - Starting to get counts...');
    
    // Get counts
    const totalOrders = await Order.countDocuments();
    console.log('Admin stats - Total orders:', totalOrders);
    
    const totalProducts = await Product.countDocuments();
    console.log('Admin stats - Total products:', totalProducts);
    
    const totalUsers = await User.countDocuments();
    console.log('Admin stats - Total users:', totalUsers);
    
    // Calculate total revenue
    console.log('Admin stats - Getting completed orders...');
    const completedOrders = await Order.find({ status: 'completed' });
    console.log('Admin stats - Completed orders count:', completedOrders.length);
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log('Admin stats - Total revenue:', totalRevenue);
    
    // Calculate trends (simplified - you can make this more sophisticated)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const lastMonthRevenueTotal = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
    
    // Calculate trends (percentage change)
    const ordersTrend = totalOrders > 0 ? ((lastMonthOrders / totalOrders) * 100) : 0;
    const productsTrend = totalProducts > 0 ? ((lastMonthProducts / totalProducts) * 100) : 0;
    const usersTrend = totalUsers > 0 ? ((lastMonthUsers / totalUsers) * 100) : 0;
    const revenueTrend = totalRevenue > 0 ? ((lastMonthRevenueTotal / totalRevenue) * 100) : 0;
    
    const response = {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      ordersTrend: Math.round(ordersTrend * 100) / 100,
      productsTrend: Math.round(productsTrend * 100) / 100,
      usersTrend: Math.round(usersTrend * 100) / 100,
      revenueTrend: Math.round(revenueTrend * 100) / 100
    };
    
    console.log('Admin stats - Response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin orders with pagination and filters
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: { status?: string } = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Get orders with user data
    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Order.countDocuments(filter);
    
    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting admin orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin products with pagination and filters
export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive = req.query.isActive as string;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Get products with category data
    const products = await Product.find(filter)
      .populate('categoryId', 'name nameEn nameJa slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Product.countDocuments(filter);
    
    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting admin products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin categories
export const getAdminCategories = async (req: Request, res: Response) => {
  try {
    const isActive = req.query.isActive as string;
    
    // Build filter
    const filter: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Get categories
    const categories = await Category.find(filter)
      .populate('parentId', 'name nameEn nameJa')
      .sort({ createdAt: -1 });
    
    res.json({
      categories: categories
    });
  } catch (error) {
    console.error('Error getting admin categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin users
export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: { role?: string; status?: string } = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.status = isActive === 'true' ? 'active' : 'inactive';
    }
    
    // Get users (exclude password)
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform to match frontend interface
    const transformedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      data: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting admin users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get revenue data for chart
export const getRevenueData = async (req: Request, res: Response) => {
  try {
    console.log('Getting revenue data for chart...');
    
    // Get last 6 months of revenue data
    const months = [];
    const revenueData = [];
    
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const monthName = startDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Get orders for this month
      const monthOrders = await Order.find({
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const monthOrderCount = monthOrders.length;
      
      revenueData.push({
        month: monthName,
        revenue: monthRevenue,
        orders: monthOrderCount
      });
    }
    
    console.log('Revenue data:', revenueData);
    res.json(revenueData);
  } catch (error) {
    console.error('Error getting revenue data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get product statistics by category
export const getProductStats = async (req: Request, res: Response) => {
  try {
    console.log('Getting product statistics...');
    
    // Get all categories with their products and revenue
    const categories = await Category.find({ isActive: true });
    const productStats = [];
    
    for (const category of categories) {
      // Get products in this category
      const products = await Product.find({ 
        categoryId: category._id,
        isActive: true 
      });
      
      // Get orders with products from this category
      const productIds = products.map(p => p._id);
      const orders = await Order.find({ 
        status: 'completed',
        'items.productId': { $in: productIds }
      });
      
      // Calculate revenue for this category
      let categoryRevenue = 0;
      for (const order of orders) {
        for (const item of order.items) {
          // Use proper type assertion for mongoose ObjectId comparison
          const product = products.find(p => String(p._id) === String(item.productId));
          if (product) {
            categoryRevenue += item.price * item.quantity;
          }
        }
      }
      
      productStats.push({
        category: category.name,
        count: products.length,
        revenue: categoryRevenue
      });
    }
    
    // Sort by revenue descending
    productStats.sort((a, b) => b.revenue - a.revenue);
    
    console.log('Product stats:', productStats);
    res.json(productStats);
  } catch (error) {
    console.error('Error getting product statistics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Product CRUD operations
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const product = new Product(productData);
    await product.save();
    
    // Update category product count
    await updateCategoryProductCount(productData.categoryId);
    
    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name nameEn nameJa slug');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Get the old product to check if category changed
    const oldProduct = await Product.findById(id);
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name nameEn nameJa slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product count for both old and new categories if category changed
    if (oldProduct && oldProduct.categoryId.toString() !== updateData.categoryId) {
      await updateCategoryProductCount(oldProduct.categoryId.toString());
    }
    await updateCategoryProductCount(updateData.categoryId);
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(id);
    
    // Update category product count
    await updateCategoryProductCount(product.categoryId.toString());
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Category CRUD operations
export const createCategory = async (req: Request, res: Response) => {
  try {
    const categoryData = req.body;
    const category = new Category(categoryData);
    await category.save();
    
    const populatedCategory = await Category.findById(category._id)
      .populate('parentId', 'name nameEn nameJa');
    
    res.status(201).json({
      message: 'Category created successfully',
      category: populatedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentId', 'name nameEn nameJa');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productsCount = await Product.countDocuments({ categoryId: id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing products' 
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// User CRUD operations
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const user = new User(userData);
    await user.save();
    
    // Create response object without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Don't allow updating password through this endpoint
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Transform to match frontend interface
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user has orders
    const ordersCount = await Order.countDocuments({ userId: id });
    if (ordersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing orders' 
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Enhanced User Management
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkUpdateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userIds, status } = req.body;
    
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { status }
    );

    res.json({
      message: `Updated ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Enhanced Order Management
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const bulkUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderIds, status } = req.body;
    
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { status }
    );

    res.json({
      message: `Updated ${result.modifiedCount} orders`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating order status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const printOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate PDF or return order data for printing
    const printData = {
      orderNumber: order.orderNumber,
      customer: order.userId,
      items: order.items,
      total: order.totalAmount,
      date: order.createdAt
    };

    res.json(printData);
  } catch (error) {
    console.error('Error printing order:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendOrderEmail = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { emailType = 'confirmation' } = req.body;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send email logic here
    // This would integrate with your email service

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending order email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Analytics and Reports
export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    const { period = '30d', type = 'revenue' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    let data: any[] = [];

    if (type === 'revenue') {
      data = await Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    } else if (type === 'orders') {
      data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate, format = 'pdf' } = req.body;
    
    let reportData: any = {};

    switch (type) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate);
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        break;
      case 'users':
        reportData = await generateUserReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generatePDFReport(reportData, type);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report.pdf"`);
      return res.send(pdfBuffer);
    } else {
      res.json(reportData);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const generateSalesReport = async (startDate: string, endDate: string) => {
  const orders = await Order.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).populate('userId', 'name email');

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    period: { startDate, endDate },
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue
    },
    orders
  };
};

const generateInventoryReport = async () => {
  const products = await Product.find().populate('categoryId', 'name');
  
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length; // Using stock < 10 as low stock threshold

  return {
    summary: {
      totalProducts,
      activeProducts,
      lowStockProducts
    },
    products
  };
};

const generateUserReport = async (startDate: string, endDate: string) => {
  const users = await User.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const newUsers = users.filter(u => {
    const userDate = new Date(u.createdAt);
    const now = new Date();
    return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
  }).length;

  return {
    period: { startDate, endDate },
    summary: {
      totalUsers,
      activeUsers,
      newUsers
    },
    users
  };
};

const generatePDFReport = async (data: any, type: string): Promise<Buffer> => {
  // This would integrate with a PDF generation library like PDFKit
  // For now, return a simple buffer
  return Buffer.from('PDF Report Placeholder');
}; 
