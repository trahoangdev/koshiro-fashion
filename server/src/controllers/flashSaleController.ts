import { Request, Response } from 'express';
import FlashSale from '../models/FlashSale';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

// Get all active flash sales
export const getActiveFlashSales = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const flashSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      flashSales
    });
  } catch (error) {
    console.error('Error fetching active flash sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sales'
    });
  }
};

// Get all flash sales (for admin)
export const getAllFlashSales = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const flashSales = await FlashSale.find()
      .populate('applicableProducts', 'name nameEn nameJa price salePrice images')
      .populate('applicableCategories', 'name nameEn nameJa')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FlashSale.countDocuments();

    res.json({
      success: true,
      flashSales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sales'
    });
  }
};

// Get flash sale by ID
export const getFlashSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findById(id)
      .populate('applicableProducts', 'name nameEn nameJa price salePrice images colors sizes stock')
      .populate('applicableCategories', 'name nameEn nameJa');

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }

    res.json({
      success: true,
      flashSale
    });
  } catch (error) {
    console.error('Error fetching flash sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sale'
    });
  }
};

// Get products for a specific flash sale
export const getFlashSaleProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const flashSale = await FlashSale.findById(id);
    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }

    const now = new Date();
    if (now < flashSale.startTime || now > flashSale.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Flash sale is not active'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {
      isActive: true,
      stock: { $gt: 0 }
    };

    // Filter by applicable products or categories
    if (flashSale.applicableProducts.length > 0) {
      query._id = { $in: flashSale.applicableProducts };
    } else if (flashSale.applicableCategories.length > 0) {
      query.categoryId = { $in: flashSale.applicableCategories };
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name nameEn nameJa')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    // Apply flash sale discount to products
    const discountedProducts = products.map(product => {
      let finalPrice = product.salePrice || product.price;
      
      if (flashSale.discountType === 'percentage') {
        const discountAmount = (product.price * flashSale.discountValue) / 100;
        finalPrice = product.price - discountAmount;
        
        // Apply max discount limit if specified
        if (flashSale.maxDiscountAmount && discountAmount > flashSale.maxDiscountAmount) {
          finalPrice = product.price - flashSale.maxDiscountAmount;
        }
      } else if (flashSale.discountType === 'fixed') {
        finalPrice = Math.max(0, product.price - flashSale.discountValue);
      }

      return {
        ...product.toObject(),
        flashSalePrice: finalPrice,
        flashSaleDiscount: flashSale.discountValue,
        flashSaleDiscountType: flashSale.discountType
      };
    });

    res.json({
      success: true,
      products: discountedProducts,
      flashSale: {
        id: flashSale._id,
        name: flashSale.name,
        nameEn: flashSale.nameEn,
        nameJa: flashSale.nameJa,
        discountType: flashSale.discountType,
        discountValue: flashSale.discountValue,
        startTime: flashSale.startTime,
        endTime: flashSale.endTime,
        maxQuantity: flashSale.maxQuantity,
        soldQuantity: flashSale.soldQuantity
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching flash sale products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sale products'
    });
  }
};

// Create flash sale (admin only)
export const createFlashSale = async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      discountType,
      discountValue,
      startTime,
      endTime,
      maxQuantity,
      applicableProducts,
      applicableCategories,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      image,
      bannerColor,
      textColor
    } = req.body;

    const flashSale = new FlashSale({
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      discountType,
      discountValue,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isActive: true,
      maxQuantity,
      soldQuantity: 0,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || 0,
      usageLimit: usageLimit || 0,
      usedCount: 0,
      image,
      bannerColor,
      textColor
    });

    await flashSale.save();

    res.status(201).json({
      success: true,
      message: 'Flash sale created successfully',
      flashSale
    });
  } catch (error) {
    console.error('Error creating flash sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create flash sale'
    });
  }
};

// Update flash sale (admin only)
export const updateFlashSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    const flashSale = await FlashSale.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }

    res.json({
      success: true,
      message: 'Flash sale updated successfully',
      flashSale
    });
  } catch (error) {
    console.error('Error updating flash sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update flash sale'
    });
  }
};

// Delete flash sale (admin only)
export const deleteFlashSale = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByIdAndDelete(id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found'
      });
    }

    res.json({
      success: true,
      message: 'Flash sale deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting flash sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete flash sale'
    });
  }
};

// Get current active flash sale
export const getCurrentFlashSale = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const flashSale = await FlashSale.findOne({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).populate('applicableProducts', 'name nameEn nameJa price salePrice images colors sizes stock');

    if (!flashSale) {
      return res.json({
        success: true,
        flashSale: null,
        message: 'No active flash sale at the moment'
      });
    }

    // Get next upcoming flash sale
    const nextFlashSale = await FlashSale.findOne({
      isActive: true,
      startTime: { $gt: now }
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      flashSale,
      nextFlashSale
    });
  } catch (error) {
    console.error('Error fetching current flash sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current flash sale'
    });
  }
};
