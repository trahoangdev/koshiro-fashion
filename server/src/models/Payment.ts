import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
  provider: string;
  isActive: boolean;
  processingFee: number;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
  icon?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  gatewayResponse?: any;
  gatewayTransactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  processedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefund extends Document {
  transactionId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedBy: string;
  approvedBy?: string;
  processedAt?: Date;
  createdAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>({
  name: { type: String, required: true },
  nameEn: String,
  nameJa: String,
  type: { 
    type: String, 
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cod', 'crypto'], 
    required: true 
  },
  provider: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  processingFee: { type: Number, required: true, min: 0 },
  minAmount: { type: Number, min: 0 },
  maxAmount: { type: Number, min: 0 },
  supportedCurrencies: [{ type: String }],
  icon: String,
  description: { type: String, required: true },
  descriptionEn: String,
  descriptionJa: String
}, {
  timestamps: true
});

const transactionSchema = new Schema<ITransaction>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  paymentMethod: { type: String, required: true },
  paymentProvider: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'VND' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  gatewayResponse: Schema.Types.Mixed,
  gatewayTransactionId: String,
  refundAmount: { type: Number, min: 0, default: 0 },
  refundReason: String,
  processedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  notes: String
}, {
  timestamps: true
});

const refundSchema = new Schema<IRefund>({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  requestedBy: { type: String, required: true },
  approvedBy: String,
  processedAt: Date
}, {
  timestamps: true
});

export const AdminPaymentMethod = mongoose.model<IPaymentMethod>('AdminPaymentMethod', paymentMethodSchema);
export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export const Refund = mongoose.model<IRefund>('Refund', refundSchema);
