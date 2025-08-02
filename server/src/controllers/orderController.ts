import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

// Get all orders (admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      orderNumber,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (orderNumber) {
      filter.orderNumber = { $regex: orderNumber, $options: 'i' };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ userId })
      .populate('items.productId', 'name nameEn nameJa images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments({ userId });

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single order
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;
    
    const filter: any = { _id: id };
    
    // If not admin, only allow access to own orders
    if (userRole !== 'admin') {
      filter.userId = userId;
    }
    
    const order = await Order.findOne(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.nameEn || product.name,
        nameVi: product.name,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    });

    await order.save();

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        totalOrders: 1,
        totalSpent: totalAmount
      }
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const filter: any = { _id: id };
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be cancelled' 
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Update user statistics
    await User.findByIdAndUpdate(order.userId, {
      $inc: { 
        totalOrders: -1,
        totalSpent: -order.totalAmount
      }
    });

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get order statistics (admin)
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 