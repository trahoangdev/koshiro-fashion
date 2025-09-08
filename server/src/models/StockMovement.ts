import mongoose, { Document, Schema } from 'mongoose';

export interface IStockMovement extends Document {
  productId: mongoose.Types.ObjectId;
  inventoryId: mongoose.Types.ObjectId;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'unreserved' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  location?: string;
  notes?: string;
  createdAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  inventoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'reserved', 'unreserved', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for efficient queries
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ createdAt: -1 });

export default mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
