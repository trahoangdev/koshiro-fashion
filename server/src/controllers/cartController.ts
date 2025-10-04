import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';

// Type for populated product in cart
interface PopulatedProduct {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  [key: string]: unknown;
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { id: string } }).user.id;
    
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      match: { isActive: true }
    });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Filter out inactive products and transform data for frontend
    const activeItems = cart.items
      .filter(item => item.productId)
      .map(item => {
        const product = item.productId as unknown as PopulatedProduct;
        return {
          productId: item.productId._id || item.productId,
          product: product,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        };
      });

    const total = activeItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      items: activeItems,
      total
    });});
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { id: string } }).user.id;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      if (size) cart.items[existingItemIndex].size = size;
      if (color) cart.items[existingItemIndex].color = color;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        size,
        color
      });
    }

    await cart.save();

    res.status(201).json({ message: 'Product added to cart successfully' });});
export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { id: string } }).user.id;
    const { productId } = req.params;
    const { quantity, size, color } = req.body;

    if (quantity !== undefined && quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Check stock if updating quantity
    if (quantity !== undefined) {
      const product = await Product.findById(productId);
      if (!product || product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    if (size !== undefined) {
      cart.items[itemIndex].size = size;
    }

    if (color !== undefined) {
      cart.items[itemIndex].color = color;
    }

    await cart.save();

    res.json({ message: 'Cart item updated successfully' });});
export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { id: string } }).user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({ message: 'Product removed from cart successfully' });});
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { id: string } }).user.id;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // If cart doesn't exist, create empty one and return success
      cart = new Cart({ userId, items: [] });
      await cart.save();
      return res.json({ message: 'Cart cleared successfully' });
    }

    // Clear all items from cart
    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });});