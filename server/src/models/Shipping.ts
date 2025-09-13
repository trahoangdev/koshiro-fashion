import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingMethod extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  type: 'standard' | 'express' | 'overnight' | 'pickup';
  cost: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
  isActive: boolean;
  supportedRegions: string[];
  weightLimit?: number;
  dimensionsLimit?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipment extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  trackingNumber: string;
  shippingMethod: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  carrier: string;
  carrierTrackingUrl?: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  notes?: string;
  weight?: number;
  dimensions?: string;
  shippingCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITrackingEvent extends Document {
  shipmentId: mongoose.Types.ObjectId;
  status: string;
  location: string;
  description: string;
  timestamp: Date;
  carrier?: string;
}

const shippingMethodSchema = new Schema<IShippingMethod>({
  name: { type: String, required: true },
  nameEn: String,
  nameJa: String,
  description: { type: String, required: true },
  descriptionEn: String,
  descriptionJa: String,
  type: { 
    type: String, 
    enum: ['standard', 'express', 'overnight', 'pickup'], 
    required: true 
  },
  cost: { type: Number, required: true, min: 0 },
  freeShippingThreshold: { type: Number, min: 0 },
  estimatedDays: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
  supportedRegions: [{ type: String }],
  weightLimit: { type: Number, min: 0 },
  dimensionsLimit: String
}, {
  timestamps: true
});

const shipmentSchema = new Schema<IShipment>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: { type: String, required: true },
  trackingNumber: { type: String, required: true, unique: true },
  shippingMethod: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true }
  },
  carrier: { type: String, required: true },
  carrierTrackingUrl: String,
  estimatedDelivery: { type: Date, required: true },
  actualDelivery: Date,
  notes: String,
  weight: { type: Number, min: 0 },
  dimensions: String,
  shippingCost: { type: Number, required: true, min: 0 }
}, {
  timestamps: true
});

const trackingEventSchema = new Schema<ITrackingEvent>({
  shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  carrier: String
});

export const ShippingMethod = mongoose.model<IShippingMethod>('ShippingMethod', shippingMethodSchema);
export const Shipment = mongoose.model<IShipment>('Shipment', shipmentSchema);
export const TrackingEvent = mongoose.model<ITrackingEvent>('TrackingEvent', trackingEventSchema);
