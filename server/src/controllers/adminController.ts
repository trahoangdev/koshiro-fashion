import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Category from '../models/Category';

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
    res.status(500).json({ message: 'Error getting admin stats' });
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
    const filter: any = {};
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
    res.status(500).json({ message: 'Error getting admin orders' });
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
    const filter: any = {};
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
    res.status(500).json({ message: 'Error getting admin products' });
  }
};

// Get admin categories
export const getAdminCategories = async (req: Request, res: Response) => {
  try {
    const isActive = req.query.isActive as string;
    
    // Build filter
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Get categories
    const categories = await Category.find(filter)
      .populate('parentId', 'name nameEn nameJa')
      .sort({ createdAt: -1 });
    
    res.json({
      categories
    });
  } catch (error) {
    console.error('Error getting admin categories:', error);
    res.status(500).json({ message: 'Error getting admin categories' });
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
    const filter: any = {};
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
      isActive: user.status === 'active',
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
    res.status(500).json({ message: 'Error getting admin users' });
  }
};

// Product CRUD operations
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const product = new Product(productData);
    await product.save();
    
    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name nameEn nameJa slug');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name nameEn nameJa slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
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
    res.status(500).json({ message: 'Error creating category' });
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
    res.status(500).json({ message: 'Error updating category' });
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
    res.status(500).json({ message: 'Error deleting category' });
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
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
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
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
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
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Order status update
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
}; 