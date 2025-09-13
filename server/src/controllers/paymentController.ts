import { Request, Response } from 'express';
import { AdminPaymentMethod, Transaction, Refund } from '../models/Payment';

// Get all payment methods
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const methods = await AdminPaymentMethod.find({}).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new payment method
export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const method = new AdminPaymentMethod(req.body);
    await method.save();
    res.status(201).json(method);
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update payment method
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const method = await AdminPaymentMethod.findByIdAndUpdate(id, req.body, { new: true });
    if (!method) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.json(method);
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const method = await AdminPaymentMethod.findByIdAndDelete(id);
    if (!method) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all transactions with pagination and filters
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      method, 
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (method && method !== 'all') {
      query.paymentMethod = method;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo as string);
      }
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const transactions = await Transaction.find(query)
      .sort(sort)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('orderId', 'orderNumber customerName customerEmail');

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single transaction
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate('orderId');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update transaction status
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const updateData: any = { 
      status, 
      notes,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updateData.processedAt = new Date();
    } else if (status === 'failed') {
      updateData.failedAt = new Date();
    }
    
    const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Process refund
export const processRefund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed transactions can be refunded' });
    }

    if (amount > transaction.amount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed transaction amount' });
    }

    const refund = new Refund({
      transactionId: id,
      orderId: transaction.orderId,
      amount,
      reason,
      status: 'pending',
      requestedBy: (req as any).user?.id || 'admin',
      createdAt: new Date()
    });

    await refund.save();

    // Update transaction status
    const refundAmount = (transaction.refundAmount || 0) + amount;
    const newStatus = refundAmount >= transaction.amount ? 'refunded' : 'partially_refunded';
    
    await Transaction.findByIdAndUpdate(id, {
      refundAmount,
      status: newStatus,
      updatedAt: new Date()
    });

    res.status(201).json(refund);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get refunds
export const getRefunds = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const refunds = await Refund.find(query)
      .sort(sort)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('transactionId', 'transactionId orderNumber amount')
      .populate('orderId', 'orderNumber customerName');

    const total = await Refund.countDocuments(query);

    res.json({
      refunds,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update refund status
export const updateRefundStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateData: any = { 
      status,
      approvedBy: (req as any).user?.id || 'admin'
    };

    if (status === 'approved' || status === 'processed') {
      updateData.processedAt = new Date();
    }
    
    const refund = await Refund.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    res.json(refund);
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get payment statistics
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const total = await Transaction.countDocuments();
    const completed = await Transaction.countDocuments({ status: 'completed' });
    const failed = await Transaction.countDocuments({ status: 'failed' });
    const pending = await Transaction.countDocuments({ status: 'pending' });
    const refunded = await Transaction.countDocuments({ status: 'refunded' });
    
    const totalAmount = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const refundStats = await Refund.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    res.json({
      total,
      completed,
      failed,
      pending,
      refunded,
      totalAmount: totalAmount[0]?.total || 0,
      refundStats
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};