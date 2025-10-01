import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import Role, { IRole } from '../models/Role';
import Permission from '../models/Permission';
import { User } from '../models/User';

// Types for better type safety
interface RoleResponse {
  success: boolean;
  message?: string;
  role?: IRole;
  roles?: (IRole & { userCount?: number; permissions?: any[] })[];
  error?: unknown;
}

/**
 * Get all roles with optional filtering
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with roles array
 */
export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { isActive, isSystem, level } = req.query;

    const filter: Record<string, unknown> = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (isSystem !== undefined) {
      filter.isSystem = isSystem === 'true';
    }

    if (level) {
      filter.level = parseInt(level as string);
    }

    const roles = await Role.find(filter)
      .populate('permissions', 'name nameEn nameJa resource action category')
      .sort({ level: -1, name: 1 })
      .lean();

    // Calculate user count for each role
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id });
        return {
          ...role,
          userCount
        };
      })
    );

    res.json({ 
      success: true,
      roles: rolesWithCount 
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Get a single role by ID
 * @param req - Express request object with role ID in params
 * @param res - Express response object
 * @returns JSON response with role data
 */
export const getRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }
    
    const role = await Role.findById(id)
      .populate('permissions', 'name nameEn nameJa resource action category description')
      .lean();
    
    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }

    // Get user count for this role
    const userCount = await User.countDocuments({ role: role._id });

    res.json({ 
      success: true,
      role: {
        ...role,
        userCount
      }
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Create a new role
 * @param req - Express request object with role data in body
 * @param res - Express response object
 * @returns JSON response with created role data
 */
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      nameJa,
      description,
      descriptionEn,
      descriptionJa,
      permissions,
      isActive,
      level
    } = req.body;

    // Validate required fields
    if (!name || !level) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and level are required' 
      });
    }

    // Validate level range
    if (level < 1 || level > 100) {
      return res.status(400).json({ 
        success: false,
        message: 'Level must be between 1 and 100' 
      });
    }

    // Validate permissions if provided
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions },
        isActive: true
      });
      
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({ 
          success: false,
          message: 'One or more permissions are invalid or inactive' 
        });
      }
    }

    const role = new Role({
      name: name.trim(),
      nameEn: nameEn?.trim(),
      nameJa: nameJa?.trim(),
      description: description?.trim(),
      descriptionEn: descriptionEn?.trim(),
      descriptionJa: descriptionJa?.trim(),
      permissions: permissions || [],
      isActive: isActive !== undefined ? isActive : true,
      isSystem: false, // User-created roles are not system roles
      level: parseInt(level)
    });

    await role.save();
    await role.populate('permissions', 'name nameEn nameJa resource action category');

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Update an existing role
 * @param req - Express request object with role ID in params and update data in body
 * @param res - Express response object
 * @returns JSON response with updated role data
 */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }

    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }

    // Prevent modification of system roles
    if (existingRole.isSystem && (updateData.name || updateData.level || updateData.isSystem === false)) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot modify system role properties' 
      });
    }

    // Validate level if being updated
    if (updateData.level !== undefined) {
      if (updateData.level < 1 || updateData.level > 100) {
        return res.status(400).json({ 
          success: false,
          message: 'Level must be between 1 and 100' 
        });
      }
    }

    // Validate permissions if being updated
    if (updateData.permissions !== undefined) {
      if (updateData.permissions.length > 0) {
        const validPermissions = await Permission.find({
          _id: { $in: updateData.permissions },
          isActive: true
        });
        
        if (validPermissions.length !== updateData.permissions.length) {
          return res.status(400).json({ 
            success: false,
            message: 'One or more permissions are invalid or inactive' 
          });
        }
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
    if (updateData.permissions !== undefined) cleanedUpdateData.permissions = updateData.permissions;
    if (updateData.isActive !== undefined) cleanedUpdateData.isActive = updateData.isActive;
    if (updateData.level !== undefined) cleanedUpdateData.level = parseInt(updateData.level);

    const role = await Role.findByIdAndUpdate(
      id,
      cleanedUpdateData,
      { new: true, runValidators: true }
    ).populate('permissions', 'name nameEn nameJa resource action category');

    res.json({
      success: true,
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Delete a role
 * @param req - Express request object with role ID in params
 * @param res - Express response object
 * @returns JSON response with deletion confirmation
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete system role' 
      });
    }

    // Check if role has users
    const userCount = await User.countDocuments({ role: id });
    if (userCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete role with ${userCount} users. Please reassign users first.` 
      });
    }
    
    await Role.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: 'Role deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Get role statistics
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with role statistics
 */
export const getRoleStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    const totalRoles = await Role.countDocuments();
    const activeRoles = await Role.countDocuments({ isActive: true });
    const systemRoles = await Role.countDocuments({ isSystem: true });
    const userRoles = await Role.countDocuments({ isSystem: false });

    // Get role distribution
    const roleDistribution = await Role.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'role',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          userCount: { $size: '$users' },
          level: 1,
          isActive: 1
        }
      },
      {
        $sort: { userCount: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalRoles,
        active: activeRoles,
        system: systemRoles,
        userCreated: userRoles,
        distribution: roleDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching role stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * Clone a role
 * @param req - Express request object with role ID in params
 * @param res - Express response object
 * @returns JSON response with cloned role data
 */
export const cloneRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameEn, nameJa, level } = req.body;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role ID format' 
      });
    }

    // Validate required fields
    if (!name || !level) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and level are required' 
      });
    }

    // Get original role
    const originalRole = await Role.findById(id);
    if (!originalRole) {
      return res.status(404).json({ 
        success: false,
        message: 'Original role not found' 
      });
    }

    // Create cloned role
    const clonedRole = new Role({
      name: name.trim(),
      nameEn: nameEn?.trim() || originalRole.nameEn,
      nameJa: nameJa?.trim() || originalRole.nameJa,
      description: originalRole.description,
      descriptionEn: originalRole.descriptionEn,
      descriptionJa: originalRole.descriptionJa,
      permissions: originalRole.permissions,
      isActive: true,
      isSystem: false,
      level: parseInt(level)
    });

    await clonedRole.save();
    await clonedRole.populate('permissions', 'name nameEn nameJa resource action category');

    res.status(201).json({
      success: true,
      message: 'Role cloned successfully',
      role: clonedRole
    });
  } catch (error) {
    console.error('Error cloning role:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});
