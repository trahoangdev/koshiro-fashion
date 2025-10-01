import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Helper function to update badge statuses based on creation date and tags
const updateBadgeStatuses = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Update isNew status based on creation date
    await Product.updateMany(
      { 
        createdAt: { $lt: thirtyDaysAgo },
        isNew: true 
      },
      { isNew: false }
    );
    
    await Product.updateMany(
      { 
        createdAt: { $gte: thirtyDaysAgo },
        isNew: false 
      },
      { isNew: true }
    );
    
    // Update isLimitedEdition based on tags
    await Product.updateMany(
      { 
        tags: { 
          $in: [
            /limited/i, /giới hạn/i, /限定/i, /limited edition/i, 
            /phiên bản giới hạn/i, /限定版/i
          ] 
        },
        isLimitedEdition: false 
      },
      { isLimitedEdition: true }
    );
    
    await Product.updateMany(
      { 
        tags: { 
          $nin: [
            /limited/i, /giới hạn/i, /限定/i, /limited edition/i, 
            /phiên bản giới hạn/i, /限定版/i
          ] 
        },
        isLimitedEdition: true 
      },
      { isLimitedEdition: false }
    );
    
    // Update isBestSeller based on tags
    await Product.updateMany(
      { 
        tags: { 
          $in: [
            /bestseller/i, /bán chạy/i, /ベストセラー/i, /best seller/i,
            /top seller/i, /bán nhiều/i, /人気/i
          ] 
        },
        isBestSeller: false 
      },
      { isBestSeller: true }
    );
    
    await Product.updateMany(
      { 
        tags: { 
          $nin: [
            /bestseller/i, /bán chạy/i, /ベストセラー/i, /best seller/i,
            /top seller/i, /bán nhiều/i, /人気/i
          ] 
        },
        isBestSeller: true 
      },
      { isBestSeller: false }
    );
  } catch (error) {
    console.error('Error updating badge statuses:', error);
  }
};

// Get all products with pagination and filters
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Update badge statuses before fetching products
    await updateBadgeStatuses();
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      isActive,
      isFeatured,
      isNew,
      isLimitedEdition,
      isBestSeller,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: Record<string, unknown> = {};
    
    if (category) {
      filter.categoryId = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }
    
    if (isNew !== undefined) {
      filter.isNew = isNew === 'true';
    }
    
    if (isLimitedEdition !== undefined) {
      filter.isLimitedEdition = isLimitedEdition === 'true';
    }
    
    if (isBestSeller !== undefined) {
      filter.isBestSeller = isBestSeller === 'true';
    }
    
    if (minPrice || maxPrice) {
      filter.price = {} as Record<string, number>;
      if (minPrice) (filter.price as Record<string, number>).$gte = parseFloat(minPrice as string);
      if (maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(maxPrice as string);
    }

    // Build search query - improved search logic
    if (search && search.toString().trim()) {
      const searchTerm = search.toString().trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      filter.$or = [
        { name: searchRegex },
        { nameEn: searchRegex },
        { nameJa: searchRegex },
        { description: searchRegex },
        { descriptionEn: searchRegex },
        { descriptionJa: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
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
    return res.status(500).json({ message: 'Internal server error' });
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
    return res.status(500).json({ message: 'Internal server error' });
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

    // Auto-detect badge statuses from tags
    const productTags = tags || [];
    const isLimitedEdition = productTags.some((tag: string) => 
      /limited|giới hạn|限定|limited edition|phiên bản giới hạn|限定版/i.test(tag)
    );
    const isBestSeller = productTags.some((tag: string) => 
      /bestseller|bán chạy|ベストセラー|best seller|top seller|bán nhiều|人気/i.test(tag)
    );

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
      isNew: true, // Automatically set new products as new
      isLimitedEdition,
      isBestSeller,
      tags: productTags
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
    return res.status(500).json({ message: 'Internal server error' });
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

    // Auto-detect badge statuses from tags if tags are being updated
    if (updateData.tags) {
      const productTags = updateData.tags;
      updateData.isLimitedEdition = productTags.some((tag: string) => 
        /limited|giới hạn|限定|limited edition|phiên bản giới hạn|限定版/i.test(tag)
      );
      updateData.isBestSeller = productTags.some((tag: string) => 
        /bestseller|bán chạy|ベストセラー|best seller|top seller|bán nhiều|人気/i.test(tag)
      );
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
    return res.status(500).json({ message: 'Internal server error' });
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
    return res.status(500).json({ message: 'Internal server error' });
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
    return res.status(500).json({ message: 'Internal server error' });
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
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 
