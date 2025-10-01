import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import Permission, { IPermission } from '../models/Permission';
import Role from '../models/Role';

// Types for better type safety
interface PermissionResponse {
  success: boolean;
  message?: string;
  permission?: IPermission;
  permissions?: (IPermission & { roleCount?: number })[];
  error?: unknown;
}

/**
 * Get all permissions with optional filtering
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with permissions array
 */
export const getPermissions = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { isActive, isSystem, category, resource, action } = req.query;

    const filter: Record<string, unknown> = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (isSystem !== undefined) {
      filter.isSystem = isSystem === 'true';
    }

    if (category) {
      filter.category = category;
    }

    if (resource) {
      filter.resource = resource;
    }

    if (action) {
      filter.action = action;
    }

    const permissions = await Permission.find(filter)
      .sort({ category: 1, resource: 1, action: 1 })
      .lean();

    // Calculate role count for each permission
    const permissionsWithCount = await Promise.all(
      permissions.map(async (permission) => {
        const roleCount = await Role.countDocuments({ permissions: permission._id });
        return {
          ...permission,
          roleCount
        };
      })
    );

    res.json({ 
      success: true,
      permissions: permissionsWithCount 
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Get a single permission by ID
 * @param req - Express request object with permission ID in params
 * @param res - Express response object
 * @returns JSON response with permission data
 */
export const getPermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid permission ID format' 
      });
    }
    
    const permission = await Permission.findById(id).lean();
    
    if (!permission) {
      return res.status(404).json({ 
        success: false,
        message: 'Permission not found' 
      });
    }

    // Get role count for this permission
    const roleCount = await Role.countDocuments({ permissions: permission._id });

    res.json({ 
      success: true,
      permission: {
        ...permission,
        roleCount
      }
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Create a new permission
 * @param req - Express request object with permission data in body
 * @param res - Express response object
 * @returns JSON response with created permission data
 */
export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      resource,
      action,
      conditions,
      isActive,
      category
    } = req.body;

    // Validate required fields
    if (!name || !resource || !action || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, resource, action, and category are required' 
      });
    }

    // Validate action enum
    const validActions = ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'];
    if (!validActions.includes(action.toLowerCase())) {
      return res.status(400).json({ 
        success: false,
        message: `Action must be one of: ${validActions.join(', ')}` 
      });
    }

    const permission = new Permission({
      name: name.trim(),
      nameEn: nameEn?.trim(),
      nameJa: nameJa?.trim(),
      description: description?.trim(),
      descriptionEn: descriptionEn?.trim(),
      descriptionJa: descriptionJa?.trim(),
      resource: resource.trim().toLowerCase(),
      action: action.trim().toLowerCase(),
      conditions: conditions?.trim(),
      isActive: isActive !== undefined ? isActive : true,
      isSystem: false, // User-created permissions are not system permissions
      category: category.trim().toLowerCase()
    });

    await permission.save();

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      permission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Update an existing permission
 * @param req - Express request object with permission ID in params and update data in body
 * @param res - Express response object
 * @returns JSON response with updated permission data
 */
export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid permission ID format' 
      });
    }

    // Check if permission exists
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      return res.status(404).json({ 
        success: false,
        message: 'Permission not found' 
      });
    }

    // Prevent modification of system permissions
    if (existingPermission.isSystem && (updateData.resource || updateData.action || updateData.isSystem === false)) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot modify system permission properties' 
      });
    }

    // Validate action if being updated
    if (updateData.action) {
      const validActions = ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'];
      if (!validActions.includes(updateData.action.toLowerCase())) {
        return res.status(400).json({ 
          success: false,
          message: `Action must be one of: ${validActions.join(', ')}` 
        });
      }
    }

    // Clean and prepare update data
    const cleanedUpdateData: Record<string, unknown> = {};
    if (updateData.name) cleanedUpdateData.name = updateData.name.trim();
    if (updateData.nameEn) cleanedUpdateData.nameEn = updateData.nameEn.trim();
    if (updateData.nameJa) cleanedUpdateData.nameJa = updateData.nameJa.trim();
    if (updateData.description) cleanedUpdateData.description = updateData.description.trim();
    if (updateData.descriptionEn) cleanedUpdateData.descriptionEn = updateData.descriptionEn.trim();
    if (updateData.descriptionJa) cleanedUpdateData.descriptionJa = updateData.descriptionJa.trim();
    if (updateData.resource) cleanedUpdateData.resource = updateData.resource.trim().toLowerCase();
    if (updateData.action) cleanedUpdateData.action = updateData.action.trim().toLowerCase();
    if (updateData.conditions) cleanedUpdateData.conditions = updateData.conditions.trim();
    if (updateData.category) cleanedUpdateData.category = updateData.category.trim().toLowerCase();
    if (updateData.isActive !== undefined) cleanedUpdateData.isActive = updateData.isActive;

    const permission = await Permission.findByIdAndUpdate(
      id,
      cleanedUpdateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Permission updated successfully',
      permission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Delete a permission
 * @param req - Express request object with permission ID in params
 * @param res - Express response object
 * @returns JSON response with deletion confirmation
 */
export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid permission ID format' 
      });
    }

    // Check if permission exists
    const permission = await Permission.findById(id);
    if (!permission) {
      return res.status(404).json({ 
        success: false,
        message: 'Permission not found' 
      });
    }

    // Prevent deletion of system permissions
    if (permission.isSystem) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete system permission' 
      });
    }

    // Check if permission is used by any roles
    const roleCount = await Role.countDocuments({ permissions: id });
    if (roleCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete permission used by ${roleCount} roles. Please remove from roles first.` 
      });
    }
    
    await Permission.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: 'Permission deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Get permission statistics
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with permission statistics
 */
export const getPermissionStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const totalPermissions = await Permission.countDocuments();
    const activePermissions = await Permission.countDocuments({ isActive: true });
    const systemPermissions = await Permission.countDocuments({ isSystem: true });
    const userPermissions = await Permission.countDocuments({ isSystem: false });

    // Get category distribution
    const categoryDistribution = await Permission.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get resource distribution
    const resourceDistribution = await Permission.aggregate([
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 },
          actions: { $addToSet: '$action' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalPermissions,
        active: activePermissions,
        system: systemPermissions,
        userCreated: userPermissions,
        categoryDistribution,
        resourceDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching permission stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Get permissions by category
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with permissions grouped by category
 */
export const getPermissionsByCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const permissions = await Permission.find(filter)
      .sort({ category: 1, resource: 1, action: 1 })
      .lean();

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, IPermission[]>);

    res.json({
      success: true,
      permissions: groupedPermissions
    });
  } catch (error) {
    console.error('Error fetching permissions by category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Bulk create permissions
 * @param req - Express request object with permissions array in body
 * @param res - Express response object
 * @returns JSON response with created permissions
 */
export const bulkCreatePermissions = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Permissions array is required' 
      });
    }

    const validActions = ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'];
    const createdPermissions = [];
    const errors = [];

    for (let i = 0; i < permissions.length; i++) {
      const perm = permissions[i];
      
      try {
        // Validate required fields
        if (!perm.name || !perm.resource || !perm.action || !perm.category) {
          errors.push(`Permission ${i + 1}: Name, resource, action, and category are required`);
          continue;
        }

        // Validate action
        if (!validActions.includes(perm.action.toLowerCase())) {
          errors.push(`Permission ${i + 1}: Invalid action. Must be one of: ${validActions.join(', ')}`);
          continue;
        }

        const permission = new Permission({
          name: perm.name.trim(),
          nameEn: perm.nameEn?.trim(),
          nameJa: perm.nameJa?.trim(),
          description: perm.description?.trim(),
          descriptionEn: perm.descriptionEn?.trim(),
          descriptionJa: perm.descriptionJa?.trim(),
          resource: perm.resource.trim().toLowerCase(),
          action: perm.action.trim().toLowerCase(),
          conditions: perm.conditions?.trim(),
          isActive: perm.isActive !== undefined ? perm.isActive : true,
          isSystem: false,
          category: perm.category.trim().toLowerCase()
        });

        await permission.save();
        createdPermissions.push(permission);
      } catch (error) {
        errors.push(`Permission ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdPermissions.length} permissions`,
      permissions: createdPermissions,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error bulk creating permissions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
