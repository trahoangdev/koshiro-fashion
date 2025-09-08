import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productNameEn?: string;
  productNameJa?: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  costPrice: number;
  sellingPrice: number;
  location: string;
  supplier: string;
  lastRestocked?: Date;
  lastSold?: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  category: string;
  size?: string;
  color?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productNameEn: {
    type: String,
    trim: true
  },
  productNameJa: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maxStock: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },
  reservedStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  availableStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  lastRestocked: {
    type: Date
  },
  lastSold: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for checking if stock is low
inventorySchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minStock && this.currentStock > 0;
});

// Virtual for checking if out of stock
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.currentStock === 0;
});

// Pre-save middleware to update available stock and status
inventorySchema.pre('save', function(next) {
  // Update available stock
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  
  // Update status based on stock levels
  if (this.currentStock === 0) {
    this.status = 'out_of_stock';
  } else if (this.currentStock <= this.minStock) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  
  next();
});

// Index for efficient queries
inventorySchema.index({ status: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ location: 1 });

export default mongoose.model<IInventory>('Inventory', inventorySchema);
