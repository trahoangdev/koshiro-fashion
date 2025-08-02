import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Get all products with pagination and filters
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.categoryId = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    // Build search query
    if (search) {
      filter.$text = { $search: search as string };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('categoryId', 'name nameEn nameJa slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single product by ID
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('categoryId', 'name nameEn nameJa slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      price,
      originalPrice,
      categoryId,
      images,
      sizes,
      colors,
      stock,
      isActive,
      isFeatured,
      tags
    } = req.body;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const product = new Product({
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      price,
      originalPrice,
      categoryId,
      images: images || [],
      sizes: sizes || [],
      colors: colors || [],
      stock: stock || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      tags: tags || []
    });

    await product.save();

    // Update category product count
    await Category.findByIdAndUpdate(categoryId, {
      $inc: { productCount: 1 }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If category is being updated, validate it exists
    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

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
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update category product count
    await Category.findByIdAndUpdate(product.categoryId, {
      $inc: { productCount: -1 }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit as string);

    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .populate('categoryId', 'name nameEn nameJa slug')
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const products = await Product.find({
      $text: { $search: q as string },
      isActive: true
    })
      .populate('categoryId', 'name nameEn nameJa slug')
      .limit(parseInt(limit as string))
      .sort({ score: { $meta: 'textScore' } });

    res.json({ products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 