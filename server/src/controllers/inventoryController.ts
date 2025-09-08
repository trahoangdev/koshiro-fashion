import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';

const Inventory = require('../models/Inventory').default;
const StockMovement = require('../models/StockMovement').default;
const Product = require('../models/Product').default;

// Get all inventory items with pagination and filtering
export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    category,
    location,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter object
  const filter: any = {};

  if (search) {
    filter.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { productNameEn: { $regex: search, $options: 'i' } },
      { productNameJa: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (location) {
    filter.location = location;
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const [inventory, total] = await Promise.all([
    Inventory.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('productId', 'name nameEn nameJa images')
      .lean(),
    Inventory.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: inventory,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Get single inventory item
export const getInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const inventory = await Inventory.findById(id)
    .populate('productId', 'name nameEn nameJa images')
    .lean();

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  res.json({
    success: true,
    data: inventory
  });
});

// Create new inventory item
export const createInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const inventoryData = req.body;

  // Check if SKU already exists
  const existingSku = await Inventory.findOne({ sku: inventoryData.sku });
  if (existingSku) {
    return res.status(400).json({
      success: false,
      message: 'SKU already exists'
    });
  }

  // Verify product exists
  const product = await Product.findById(inventoryData.productId);
  if (!product) {
    return res.status(400).json({
      success: false,
      message: 'Product not found'
    });
  }

  const inventory = new Inventory(inventoryData);
  await inventory.save();

  res.status(201).json({
    success: true,
    data: inventory
  });
});

// Update inventory item
export const updateInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if SKU is being changed and if it already exists
  if (updateData.sku) {
    const existingSku = await Inventory.findOne({ 
      sku: updateData.sku, 
      _id: { $ne: id } 
    });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
  }

  const inventory = await Inventory.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('productId', 'name nameEn nameJa images');

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  res.json({
    success: true,
    data: inventory
  });
});

// Delete inventory item
export const deleteInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const inventory = await Inventory.findByIdAndDelete(id);

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  // Delete related stock movements
  await StockMovement.deleteMany({ inventoryId: id });

  res.json({
    success: true,
    message: 'Inventory item deleted successfully'
  });
});

// Adjust stock
export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, reason, reference, notes } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  const inventory = await Inventory.findById(id);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  const oldStock = inventory.currentStock;
  const newStock = oldStock + quantity;

  if (newStock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock for adjustment'
    });
  }

  // Update inventory
  inventory.currentStock = newStock;
  inventory.availableStock = Math.max(0, newStock - inventory.reservedStock);
  
  // Update status
  if (newStock === 0) {
    inventory.status = 'out_of_stock';
  } else if (newStock <= inventory.minStock) {
    inventory.status = 'low_stock';
  } else {
    inventory.status = 'in_stock';
  }

  await inventory.save();

  // Create stock movement record
  const movement = new StockMovement({
    productId: inventory.productId,
    inventoryId: inventory._id,
    type: quantity > 0 ? 'in' : 'out',
    quantity: Math.abs(quantity),
    reason,
    reference,
    userId,
    userName: (req as any).user?.name || 'System',
    location: inventory.location,
    notes
  });

  await movement.save();

  res.json({
    success: true,
    data: inventory,
    movement: movement
  });
});

// Get stock movements
export const getStockMovements = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    productId,
    type,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter object
  const filter: any = {};

  if (productId) {
    filter.productId = productId;
  }

  if (type) {
    filter.type = type;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate as string);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate as string);
    }
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('productId', 'name nameEn nameJa')
      .populate('inventoryId', 'sku location')
      .lean(),
    StockMovement.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: movements,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Get inventory statistics
export const getInventoryStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalItems,
    lowStockItems,
    outOfStockItems,
    totalValue,
    categoryStats,
    statusStats
  ] = await Promise.all([
    Inventory.countDocuments(),
    Inventory.countDocuments({ status: 'low_stock' }),
    Inventory.countDocuments({ status: 'out_of_stock' }),
    Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
        }
      }
    ]),
    Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
        }
      },
      { $sort: { count: -1 } }
    ]),
    Inventory.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue: totalValue[0]?.totalValue || 0,
      categoryStats,
      statusStats
    }
  });
});

// Bulk update inventory
export const bulkUpdateInventory = asyncHandler(async (req: Request, res: Response) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Updates array is required'
    });
  }

  const results = [];
  const errors = [];

  for (const update of updates) {
    try {
      const { id, ...updateData } = update;
      const inventory = await Inventory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (inventory) {
        results.push(inventory);
      } else {
        errors.push({ id, error: 'Inventory item not found' });
      }
    } catch (error) {
      errors.push({ id: update.id, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  res.json({
    success: true,
    data: {
      updated: results,
      errors
    }
  });
});