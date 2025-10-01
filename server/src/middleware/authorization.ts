import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import Role, { IRole } from '../models/Role';
import Permission, { IPermission } from '../models/Permission';

// Extend Request interface to include user with role
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions?: string[];
  };
}

// Type definitions for better type safety
interface PopulatedUser extends Omit<IUser, 'role'> {
  role: IRole;
}

interface PermissionCheck {
  resource: string;
  action: string;
}

// Cache for user permissions to improve performance
const userPermissionCache = new Map<string, { permissions: string[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get user permissions with caching
 * @param userId - User ID
 * @returns Array of permission strings
 */
async function getUserPermissionsWithCache(userId: string): Promise<string[]> {
  const cached = userPermissionCache.get(userId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.permissions;
  }
  
  try {
    const user = await User.findById(userId)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      }) as PopulatedUser | null;
    
    if (!user || !user.role) {
      return [];
    }
    
    const permissions = (user.role.permissions as unknown as IPermission[])
      .filter((permission: IPermission) => permission.isActive)
      .map((permission: IPermission) => `${permission.resource}:${permission.action}`);
    
    // Cache the result
    userPermissionCache.set(userId, { permissions, timestamp: now });
    
    return permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Clear user permission cache
 * @param userId - User ID (optional, clears all if not provided)
 */
export function clearUserPermissionCache(userId?: string): void {
  if (userId) {
    userPermissionCache.delete(userId);
  } else {
    userPermissionCache.clear();
  }
}

/**
 * Check if user has specific permission
 * @param resource - Resource name (e.g., 'products', 'categories')
 * @param action - Action name (e.g., 'create', 'read', 'update', 'delete')
 * @returns Middleware function
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate input parameters
      if (!resource || !action) {
        return res.status(400).json({
          success: false,
          message: 'Resource and action parameters are required'
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user with role and permissions
      const user = await User.findById(req.user.id)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            model: 'Permission'
          }
        }) as PopulatedUser | null;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user role exists and is active
      if (!user.role || !user.role.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User role is inactive'
        });
      }

      // Check if user has the required permission
      const hasPermission = (user.role.permissions as unknown as IPermission[]).some((permission: IPermission) => 
        permission.resource.toLowerCase() === resource.toLowerCase() && 
        permission.action.toLowerCase() === action.toLowerCase() &&
        permission.isActive
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${resource}:${action}`,
          required: `${resource}:${action}`
        });
      }

      // Add user permissions to request for potential use in controllers
      req.user.permissions = (user.role.permissions as unknown as IPermission[])
        .filter((p: IPermission) => p.isActive)
        .map((p: IPermission) => `${p.resource}:${p.action}`);

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param permissions - Array of permission objects with resource and action
 * @returns Middleware function
 */
export const requireAnyPermission = (permissions: PermissionCheck[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate input parameters
      if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Permissions array is required and must not be empty'
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user with role and permissions
      const user = await User.findById(req.user.id)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            model: 'Permission'
          }
        }) as PopulatedUser | null;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user role exists and is active
      if (!user.role || !user.role.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User role is inactive'
        });
      }

      // Check if user has any of the required permissions
      const hasAnyPermission = permissions.some(requiredPerm => 
        (user.role.permissions as unknown as IPermission[]).some((permission: IPermission) => 
          permission.resource.toLowerCase() === requiredPerm.resource.toLowerCase() && 
          permission.action.toLowerCase() === requiredPerm.action.toLowerCase() &&
          permission.isActive
        )
      );

      if (!hasAnyPermission) {
        const requiredPerms = permissions.map(p => `${p.resource}:${p.action}`).join(', ');
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required one of: ${requiredPerms}`,
          required: requiredPerms
        });
      }

      // Add user permissions to request for potential use in controllers
      req.user.permissions = (user.role.permissions as unknown as IPermission[])
        .filter((p: IPermission) => p.isActive)
        .map((p: IPermission) => `${p.resource}:${p.action}`);

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  };
};

/**
 * Check if user has all of the specified permissions
 * @param permissions - Array of permission objects with resource and action
 * @returns Middleware function
 */
export const requireAllPermissions = (permissions: PermissionCheck[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate input parameters
      if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Permissions array is required and must not be empty'
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user with role and permissions
      const user = await User.findById(req.user.id)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            model: 'Permission'
          }
        }) as PopulatedUser | null;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user role exists and is active
      if (!user.role || !user.role.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User role is inactive'
        });
      }

      // Check if user has all of the required permissions
      const hasAllPermissions = permissions.every(requiredPerm => 
        (user.role.permissions as unknown as IPermission[]).some((permission: IPermission) => 
          permission.resource.toLowerCase() === requiredPerm.resource.toLowerCase() && 
          permission.action.toLowerCase() === requiredPerm.action.toLowerCase() &&
          permission.isActive
        )
      );

      if (!hasAllPermissions) {
        const requiredPerms = permissions.map(p => `${p.resource}:${p.action}`).join(', ');
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required all of: ${requiredPerms}`,
          required: requiredPerms
        });
      }

      // Add user permissions to request for potential use in controllers
      req.user.permissions = (user.role.permissions as unknown as IPermission[])
        .filter((p: IPermission) => p.isActive)
        .map((p: IPermission) => `${p.resource}:${p.action}`);

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  };
};

/**
 * Check if user has minimum role level
 * @param minLevel - Minimum role level required
 * @returns Middleware function
 */
export const requireRoleLevel = (minLevel: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate input parameters
      if (typeof minLevel !== 'number' || minLevel < 0 || minLevel > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role level. Must be a number between 0 and 100'
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user with role
      const user = await User.findById(req.user.id).populate('role') as PopulatedUser | null;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user role exists and is active
      if (!user.role || !user.role.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User role is inactive'
        });
      }

      // Check role level
      const userRoleLevel = user.role.level || 0;
      if (userRoleLevel < minLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient role level. Required: ${minLevel}, Current: ${userRoleLevel}`,
          required: minLevel,
          current: userRoleLevel
        });
      }

      next();
    } catch (error) {
      console.error('Role level check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' })
      });
    }
  };
};

/**
 * Check if user is admin (role level >= 90)
 * @returns Middleware function
 */
export const requireAdmin = requireRoleLevel(90);

/**
 * Check if user is super admin (role level >= 95)
 * @returns Middleware function
 */
export const requireSuperAdmin = requireRoleLevel(95);

/**
 * Check if user can manage roles (has role management permissions)
 * @returns Middleware function
 */
export const requireRoleManagement = requirePermission('roles', 'manage');

/**
 * Check if user can manage permissions (has permission management permissions)
 * @returns Middleware function
 */
export const requirePermissionManagement = requirePermission('permissions', 'manage');

/**
 * Check if user can manage users (has user management permissions)
 * @returns Middleware function
 */
export const requireUserManagement = requirePermission('users', 'manage');

/**
 * Check if user can manage products (has product management permissions)
 * @returns Middleware function
 */
export const requireProductManagement = requirePermission('products', 'manage');

/**
 * Check if user can manage categories (has category management permissions)
 * @returns Middleware function
 */
export const requireCategoryManagement = requirePermission('categories', 'manage');

/**
 * Check if user can manage orders (has order management permissions)
 * @returns Middleware function
 */
export const requireOrderManagement = requirePermission('orders', 'manage');

/**
 * Utility function to check if user has permission (for use in controllers)
 * @param user - User object with populated role
 * @param resource - Resource name
 * @param action - Action name
 * @returns boolean
 */
export const hasPermission = (user: PopulatedUser | null, resource: string, action: string): boolean => {
  if (!user || !user.role || !user.role.permissions || !Array.isArray(user.role.permissions)) {
    return false;
  }

  return (user.role.permissions as unknown as IPermission[]).some((permission: IPermission) => 
    permission.resource.toLowerCase() === resource.toLowerCase() && 
    permission.action.toLowerCase() === action.toLowerCase() &&
    permission.isActive
  );
};

/**
 * Utility function to get user permissions (for use in controllers)
 * @param user - User object with populated role
 * @returns Array of permission strings in format "resource:action"
 */
export const getUserPermissions = (user: PopulatedUser | null): string[] => {
  if (!user || !user.role || !user.role.permissions || !Array.isArray(user.role.permissions)) {
    return [];
  }

  return (user.role.permissions as unknown as IPermission[])
    .filter((permission: IPermission) => permission.isActive)
    .map((permission: IPermission) => `${permission.resource}:${permission.action}`);
};

/**
 * Utility function to check if user has any of the specified permissions
 * @param user - User object with populated role
 * @param permissions - Array of permission objects
 * @returns boolean
 */
export const hasAnyPermission = (user: PopulatedUser | null, permissions: PermissionCheck[]): boolean => {
  if (!user || !user.role || !user.role.permissions || !Array.isArray(user.role.permissions)) {
    return false;
  }

  return permissions.some(requiredPerm => 
    (user.role.permissions as unknown as IPermission[]).some((permission: IPermission) => 
      permission.resource.toLowerCase() === requiredPerm.resource.toLowerCase() && 
      permission.action.toLowerCase() === requiredPerm.action.toLowerCase() &&
      permission.isActive
    )
  );
};

/**
 * Utility function to check if user has all of the specified permissions
 * @param user - User object with populated role
 * @param permissions - Array of permission objects
 * @returns boolean
 */
export const hasAllPermissions = (user: PopulatedUser | null, permissions: PermissionCheck[]): boolean => {
  if (!user || !user.role || !user.role.permissions || !Array.isArray(user.role.permissions)) {
    return false;
  }

  return permissions.every(requiredPerm => 
    (user.role.permissions as unknown as IPermission[]).some((permission: IPermission) => 
      permission.resource.toLowerCase() === requiredPerm.resource.toLowerCase() && 
      permission.action.toLowerCase() === requiredPerm.action.toLowerCase() &&
      permission.isActive
    )
  );
};

/**
 * Utility function to get user role level
 * @param user - User object with populated role
 * @returns number (0 if no role or inactive)
 */
export const getUserRoleLevel = (user: PopulatedUser | null): number => {
  if (!user || !user.role || !user.role.isActive) {
    return 0;
  }
  return user.role.level || 0;
};

/**
 * Utility function to check if user is admin (level >= 90)
 * @param user - User object with populated role
 * @returns boolean
 */
export const isAdmin = (user: PopulatedUser | null): boolean => {
  return getUserRoleLevel(user) >= 90;
};

/**
 * Utility function to check if user is super admin (level >= 95)
 * @param user - User object with populated role
 * @returns boolean
 */
export const isSuperAdmin = (user: PopulatedUser | null): boolean => {
  return getUserRoleLevel(user) >= 95;
};
