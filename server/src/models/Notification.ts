import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'order' | 'product' | 'user' | 'marketing';
  read: boolean;
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // null for system-wide notifications
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['system', 'order', 'product', 'user', 'marketing'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ category: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema); 