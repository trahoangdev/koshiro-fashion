import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { isActive, parentId } = req.query;

    const filter: any = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (parentId) {
      filter.parentId = parentId;
    }

    const categories = await Category.find(filter)
      .sort({ name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single category by ID
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category by slug error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      slug,
      image,
      isActive,
      parentId
    } = req.body;

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = new Category({
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      slug,
      image,
      isActive: isActive !== undefined ? isActive : true,
      parentId
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if slug is being updated and if it already exists
    if (updateData.slug) {
      const existingCategory = await Category.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    // Validate parent category if being updated
    if (updateData.parentId) {
      const parentCategory = await Category.findById(updateData.parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
      // Prevent circular reference
      if (updateData.parentId === id) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${productCount} products. Please move or delete products first.` 
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentId: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${subcategoryCount} subcategories. Please delete subcategories first.` 
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get category tree (hierarchical)
export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    // Build tree structure
    const buildTree = (parentId: string | null = null): any[] => {
      return categories
        .filter(cat => cat.parentId?.toString() === parentId)
        .map((cat: any) => ({
          ...cat.toObject(),
          children: buildTree(cat._id.toString())
        }));
    };

    const categoryTree = buildTree();

    res.json({ categories: categoryTree });
  } catch (error) {
    console.error('Get category tree error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get category with products
export const getCategoryWithProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ 
      categoryId: id, 
      isActive: true 
    })
      .populate('categoryId', 'name nameEn nameJa slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments({ 
      categoryId: id, 
      isActive: true 
    });

    res.json({
      category,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get category with products error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 
