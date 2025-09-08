import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';

// Import Promotion model
const Promotion = require('../models/Promotion').default;
const { IPromotion } = require('../models/Promotion');

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
export const getPromotions = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, isActive, type, search } = req.query;
  
  const query: any = {};
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (type) {
    query.type = type;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const promotions = await Promotion.find(query)
    .populate('applicableProducts', 'name price')
    .populate('applicableCategories', 'name')
    .populate('applicableUsers', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Promotion.countDocuments(query);

  res.json({
    success: true,
    data: promotions,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
});

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Public
export const getPromotion = asyncHandler(async (req: Request, res: Response) => {
  const promotion = await Promotion.findById(req.params.id)
    .populate('applicableProducts', 'name price')
    .populate('applicableCategories', 'name')
    .populate('applicableUsers', 'name email');

  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }

  res.json({
    success: true,
    data: promotion
  });
});

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    name,
    nameEn,
    nameJa,
    description,
    descriptionEn,
    descriptionJa,
    type,
    value,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    startDate,
    endDate,
    applicableProducts,
    applicableCategories,
    applicableUsers
  } = req.body;

  // Check if code already exists
  const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
  if (existingPromotion) {
    return res.status(400).json({
      success: false,
      message: 'Promotion code already exists'
    });
  }

  const promotion = await Promotion.create({
    code: code.toUpperCase(),
    name,
    nameEn,
    nameJa,
    description,
    descriptionEn,
    descriptionJa,
    type,
    value,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount,
    usageLimit,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    applicableProducts,
    applicableCategories,
    applicableUsers
  });

  await promotion.populate([
    { path: 'applicableProducts', select: 'name price' },
    { path: 'applicableCategories', select: 'name' },
    { path: 'applicableUsers', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    data: promotion
  });
});

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = asyncHandler(async (req: Request, res: Response) => {
  const {
    code,
    name,
    nameEn,
    nameJa,
    description,
    descriptionEn,
    descriptionJa,
    type,
    value,
    minOrderAmount,
    maxDiscountAmount,
    usageLimit,
    isActive,
    startDate,
    endDate,
    applicableProducts,
    applicableCategories,
    applicableUsers
  } = req.body;

  // Check if code already exists (excluding current promotion)
  if (code) {
    const existingPromotion = await Promotion.findOne({ 
      code: code.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    if (existingPromotion) {
      return res.status(400).json({
        success: false,
        message: 'Promotion code already exists'
      });
    }
  }

  const updateData: any = {};
  if (code) updateData.code = code.toUpperCase();
  if (name) updateData.name = name;
  if (nameEn !== undefined) updateData.nameEn = nameEn;
  if (nameJa !== undefined) updateData.nameJa = nameJa;
  if (description) updateData.description = description;
  if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
  if (descriptionJa !== undefined) updateData.descriptionJa = descriptionJa;
  if (type) updateData.type = type;
  if (value !== undefined) updateData.value = value;
  if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
  if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
  if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (startDate) updateData.startDate = new Date(startDate);
  if (endDate) updateData.endDate = new Date(endDate);
  if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts;
  if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories;
  if (applicableUsers !== undefined) updateData.applicableUsers = applicableUsers;

  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'applicableProducts', select: 'name price' },
    { path: 'applicableCategories', select: 'name' },
    { path: 'applicableUsers', select: 'name email' }
  ]);

  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }

  res.json({
    success: true,
    data: promotion
  });
});

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = asyncHandler(async (req: Request, res: Response) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);

  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }

  res.json({
    success: true,
    message: 'Promotion deleted successfully'
  });
});

// @desc    Toggle promotion status
// @route   PATCH /api/promotions/:id/toggle
// @access  Private/Admin
export const togglePromotionStatus = asyncHandler(async (req: Request, res: Response) => {
  const promotion = await Promotion.findById(req.params.id);

  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found'
    });
  }

  promotion.isActive = !promotion.isActive;
  await promotion.save();

  res.json({
    success: true,
    data: promotion
  });
});

// @desc    Get promotion statistics
// @route   GET /api/promotions/stats
// @access  Private/Admin
export const getPromotionStats = asyncHandler(async (req: Request, res: Response) => {
  const totalPromotions = await Promotion.countDocuments();
  const activePromotions = await Promotion.countDocuments({ isActive: true });
  const expiredPromotions = await Promotion.countDocuments({
    endDate: { $lt: new Date() }
  });
  const totalUsage = await Promotion.aggregate([
    { $group: { _id: null, total: { $sum: '$usedCount' } } }
  ]);

  res.json({
    success: true,
    data: {
      total: totalPromotions,
      active: activePromotions,
      expired: expiredPromotions,
      totalUsage: totalUsage[0]?.total || 0
    }
  });
});

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Public
export const validatePromotionCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, userId, orderAmount } = req.body;

  const promotion = await Promotion.findOne({ 
    code: code.toUpperCase(),
    isActive: true
  }).populate('applicableProducts', 'name price')
    .populate('applicableCategories', 'name')
    .populate('applicableUsers', 'name email');

  if (!promotion) {
    return res.status(400).json({
      success: false,
      message: 'Invalid promotion code'
    });
  }

  // Check if promotion is valid (check dates and usage)
  const now = new Date();
  if (!promotion.isActive || 
      promotion.startDate > now || 
      promotion.endDate < now ||
      (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit)) {
    return res.status(400).json({
      success: false,
      message: 'Promotion is not valid or has expired'
    });
  }

  // Check minimum order amount
  if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount is ${promotion.minOrderAmount}`
    });
  }

  // Check user eligibility
  if (promotion.applicableUsers && promotion.applicableUsers.length > 0) {
    const isUserEligible = promotion.applicableUsers.some(
      (user: any) => user._id.toString() === userId
    );
    if (!isUserEligible) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for this promotion'
      });
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (promotion.type === 'percentage') {
    discountAmount = (orderAmount * promotion.value) / 100;
    if (promotion.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
    }
  } else if (promotion.type === 'fixed') {
    discountAmount = Math.min(promotion.value, orderAmount);
  } else if (promotion.type === 'free_shipping') {
    discountAmount = 0; // Free shipping logic would be handled elsewhere
  }

  res.json({
    success: true,
    data: {
      promotion,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.max(0, orderAmount - discountAmount)
    }
  });
});