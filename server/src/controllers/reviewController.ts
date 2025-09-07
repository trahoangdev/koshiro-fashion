import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { Product } from '../models/Product';

// Get reviews with pagination and filters
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const {
      page = 1,
      limit = 10,
      productId,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: Record<string, any> = {};
    
    if (productId) {
      filter.productId = productId;
    }
    
    if (rating) {
      filter.rating = parseInt(rating as string);
    }

    // Build sort object
    const sort: Record<string, any> = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('userId', 'name email')
      .populate('productId', 'name nameEn nameJa')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(filter);

    res.json({
      reviews,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });});
// Create new review
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = (req as any).user;
    const { userId: targetUserId, productId, rating, title, comment } = req.body;
    
    // If admin is creating review, they can specify userId, otherwise use current user's ID
    const userId = targetUserId || currentUser.userId;

    // Validate required fields
    if (!rating || !title || !comment) {
      return res.status(400).json({ message: 'Rating, title, and comment are required' });
    }

    // productId is optional for admin-created reviews

    // Validate userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate productId if provided
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({ userId, productId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }
    }

    // Create new review
    const review = new Review({
      userId,
      productId,
      rating,
      title,
      comment,
      verified: false,
      helpful: 0
    });

    await review.save();

    // Populate user and product info
    await review.populate('userId', 'name email');
    if (productId) {
      await review.populate('productId', 'name nameEn nameJa');
    }

    res.status(201).json({
      message: 'Review created successfully',
      review
    });});
// Mark review as helpful
export const markReviewHelpful = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Increment helpful count
    review.helpful += 1;
    await review.save();

    res.json({
      message: 'Review marked as helpful',
      helpful: review.helpful
    });});
// Update review
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
    const { userId, productId, rating, title, comment, verified } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate userId if provided
    if (userId !== undefined) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      review.userId = userId;
    }

    // Validate productId if provided
    if (productId !== undefined) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      review.productId = productId;
    }

    // Check for duplicate review if both userId and productId are being updated
    if (userId !== undefined && productId !== undefined) {
      const existingReview = await Review.findOne({ 
        userId: userId || review.userId, 
        productId: productId || review.productId,
        _id: { $ne: reviewId } // Exclude current review
      });
      if (existingReview) {
        return res.status(400).json({ message: 'User has already reviewed this product' });
      }
    }

    // Update other fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (verified !== undefined) review.verified = verified;

    await review.save();

    // Populate user and product info
    await review.populate('userId', 'name email');
    await review.populate('productId', 'name nameEn nameJa');

    res.json({
      message: 'Review updated successfully',
      review
    });});
// Delete review
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      message: 'Review deleted successfully'
    });});
// Get review statistics
export const getReviewStats = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.query;

    const filter: Record<string, any> = {};
    if (productId) {
      filter.productId = productId;
    }

    const totalReviews = await Review.countDocuments(filter);
    const avgRating = await Review.aggregate([
      { $match: filter },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      totalReviews,
      averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
      ratingDistribution
    });});