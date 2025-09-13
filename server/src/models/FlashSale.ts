import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashSale extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  maxQuantity?: number;
  soldQuantity: number;
  applicableProducts: mongoose.Types.ObjectId[];
  applicableCategories: mongoose.Types.ObjectId[];
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  image?: string;
  bannerColor?: string;
  textColor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const flashSaleSchema = new Schema<IFlashSale>({
  name: { type: String, required: true },
  nameEn: String,
  nameJa: String,
  description: { type: String, required: true },
  descriptionEn: String,
  descriptionJa: String,
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    required: true 
  },
  discountValue: { type: Number, required: true, min: 0 },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  maxQuantity: { type: Number, min: 0 },
  soldQuantity: { type: Number, default: 0, min: 0 },
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  minOrderAmount: { type: Number, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  usageLimit: { type: Number, min: 0 },
  usedCount: { type: Number, default: 0, min: 0 },
  image: String,
  bannerColor: String,
  textColor: String
}, {
  timestamps: true
});

export default mongoose.model<IFlashSale>('FlashSale', flashSaleSchema);
