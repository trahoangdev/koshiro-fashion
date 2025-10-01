import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  categoryId: mongoose.Types.ObjectId;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  isNew: boolean;
  isLimitedEdition: boolean;
  isBestSeller: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameEn: {
    type: String,
    trim: true
  },
  nameJa: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  descriptionEn: {
    type: String,
    trim: true
  },
  descriptionJa: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    type: String,
    trim: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  colors: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isLimitedEdition: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Indexes for better performance
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isLimitedEdition: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ tags: 1 });

// Search indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ nameEn: 1 });
productSchema.index({ nameJa: 1 });
productSchema.index({ description: 1 });
productSchema.index({ descriptionEn: 1 });
productSchema.index({ descriptionJa: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema); 