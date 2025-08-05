import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  websiteName: string;
  websiteDescription: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  enableDarkMode: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  websiteName: {
    type: String,
    required: true,
    default: 'Koshiro Japan Style Fashion'
  },
  websiteDescription: {
    type: String,
    required: true,
    default: 'Thời trang Nhật Bản truyền thống và hiện đại'
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'contact@koshiro-fashion.com'
  },
  contactPhone: {
    type: String,
    required: true,
    default: '+84 123 456 789'
  },
  primaryColor: {
    type: String,
    required: true,
    default: '#3b82f6'
  },
  enableDarkMode: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  debugMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema); 