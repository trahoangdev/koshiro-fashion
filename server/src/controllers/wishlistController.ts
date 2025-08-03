import { Request, Response } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    
    const wishlistItems = await Wishlist.find({ userId })
      .populate({
        path: 'productId',
        model: 'Product',
        match: { isActive: true }
      })
      .sort({ createdAt: -1 });

    // Filter out products that are no longer active
    const activeProducts = wishlistItems
      .filter(item => item.productId)
      .map(item => item.productId);

    res.json(activeProducts);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const wishlistItem = new Wishlist({
      userId,
      productId
    });

    await wishlistItem.save();

    res.status(201).json({ message: 'Product added to wishlist successfully' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({ userId, productId });
    
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    res.json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user: { userId: string } }).user.userId;

    await Wishlist.deleteMany({ userId });

    res.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 