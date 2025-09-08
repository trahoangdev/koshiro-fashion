import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  code: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  applicableUsers?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>({
  code: {
    type: String,
    required: [true, 'Promotion code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
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
    required: [true, 'Promotion description is required'],
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
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Promotion type is required']
  },
  value: {
    type: Number,
    required: [true, 'Promotion value is required'],
    min: [0, 'Promotion value must be positive']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount must be positive']
  },
  maxDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount must be positive']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Virtual for checking if promotion is valid
promotionSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Index for better query performance
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ type: 1 });

// Pre-save middleware to validate dates
promotionSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Pre-save middleware to validate usage limit
promotionSchema.pre('save', function(next) {
  if (this.usageLimit && this.usedCount > this.usageLimit) {
    return next(new Error('Used count cannot exceed usage limit'));
  }
  next();
});

// Pre-save middleware to validate value based on type
promotionSchema.pre('save', function(next) {
  if (this.type === 'percentage' && (this.value < 0 || this.value > 100)) {
    return next(new Error('Percentage value must be between 0 and 100'));
  }
  if (this.type === 'fixed' && this.value < 0) {
    return next(new Error('Fixed value must be positive'));
  }
  if (this.type === 'free_shipping' && this.value !== 0) {
    return next(new Error('Free shipping value must be 0'));
  }
  next();
});

export default mongoose.model<IPromotion>('Promotion', promotionSchema);
