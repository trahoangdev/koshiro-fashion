import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'credit_card' | 'debit_card' | 'paypal';
  name: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  brand?: string;
  paypalEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  last4: {
    type: String,
    trim: true
  },
  expiryMonth: {
    type: String,
    trim: true
  },
  expiryYear: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  brand: {
    type: String,
    trim: true
  },
  paypalEmail: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('PaymentMethod').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema); 