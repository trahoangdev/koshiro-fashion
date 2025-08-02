import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  parentId?: mongoose.Types.ObjectId;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
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
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentId: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema); 