import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  resource: string; // e.g., 'products', 'categories', 'users'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  conditions?: string; // Optional conditions for the permission
  isActive: boolean;
  isSystem: boolean; // System permissions cannot be deleted
  category: string; // Group permissions by category
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    trim: true,
    maxlength: [100, 'Permission name cannot exceed 100 characters']
  },
  nameEn: {
    type: String,
    trim: true,
    maxlength: [100, 'English permission name cannot exceed 100 characters']
  },
  nameJa: {
    type: String,
    trim: true,
    maxlength: [100, 'Japanese permission name cannot exceed 100 characters']
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
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true,
    lowercase: true,
    maxlength: [50, 'Resource name cannot exceed 50 characters']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    lowercase: true,
    enum: {
      values: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
      message: 'Action must be one of: create, read, update, delete, manage, export, import'
    }
  },
  conditions: {
    type: String,
    trim: true,
    maxlength: [200, 'Conditions cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Compound index for unique resource-action combination
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });
permissionSchema.index({ name: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ isSystem: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ resource: 1 });

// Pre-save middleware to ensure unique permission names and resource-action combinations
permissionSchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isModified('resource') || this.isModified('action')) {
    // Check for duplicate name
    const existingByName = await Permission.findOne({ 
      name: this.name, 
      _id: { $ne: this._id } 
    });
    if (existingByName) {
      const error = new Error('Permission name already exists');
      return next(error);
    }

    // Check for duplicate resource-action combination
    const existingByResourceAction = await Permission.findOne({ 
      resource: this.resource,
      action: this.action,
      _id: { $ne: this._id } 
    });
    if (existingByResourceAction) {
      const error = new Error(`Permission for ${this.resource}:${this.action} already exists`);
      return next(error);
    }
  }
  next();
});

// Virtual for role count
permissionSchema.virtual('roleCount', {
  ref: 'Role',
  localField: '_id',
  foreignField: 'permissions',
  count: true
});

// Ensure virtual fields are serialized
permissionSchema.set('toJSON', { virtuals: true });
permissionSchema.set('toObject', { virtuals: true });

const Permission = mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;
