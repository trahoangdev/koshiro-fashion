import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  permissions: string[]; // Array of permission IDs
  isActive: boolean;
  isSystem: boolean; // System roles cannot be deleted
  level: number; // Role hierarchy level (higher number = more permissions)
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    maxlength: [100, 'Role name cannot exceed 100 characters']
  },
  nameEn: {
    type: String,
    trim: true,
    maxlength: [100, 'English role name cannot exceed 100 characters']
  },
  nameJa: {
    type: String,
    trim: true,
    maxlength: [100, 'Japanese role name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  descriptionEn: {
    type: String,
    trim: true,
    maxlength: [500, 'English description cannot exceed 500 characters']
  },
  descriptionJa: {
    type: String,
    trim: true,
    maxlength: [500, 'Japanese description cannot exceed 500 characters']
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    required: true,
    min: [1, 'Role level must be at least 1'],
    max: [100, 'Role level cannot exceed 100']
  }
}, {
  timestamps: true
});

// Indexes for better performance
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isSystem: 1 });
roleSchema.index({ level: 1 });
roleSchema.index({ permissions: 1 });

// Pre-save middleware to ensure unique role names
roleSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingRole = await Role.findOne({ 
      name: this.name, 
      _id: { $ne: this._id } 
    });
    if (existingRole) {
      const error = new Error('Role name already exists');
      return next(error);
    }
  }
  next();
});

// Virtual for user count
roleSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'role',
  count: true
});

// Ensure virtual fields are serialized
roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
