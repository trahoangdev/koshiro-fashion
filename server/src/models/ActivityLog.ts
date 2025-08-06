import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  category: 'system' | 'user' | 'order' | 'product' | 'category' | 'auth';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  action: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['system', 'user', 'order', 'product', 'category', 'auth'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ category: 1, timestamp: -1 });
ActivityLogSchema.index({ severity: 1, timestamp: -1 });
ActivityLogSchema.index({ userId: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema); 