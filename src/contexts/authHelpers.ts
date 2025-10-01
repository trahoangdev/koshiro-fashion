import { User as ApiUser } from '@/lib/api';

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  email: string;
  name: string;
  role: string | {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    level: number;
    isActive: boolean;
  };
  phone?: string;
  address?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  isActive?: boolean;
  totalOrders?: number;
  orderCount?: number;
  totalSpent?: number;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions
export const normalizeUser = (apiUser: ApiUser): User => {
  return {
    _id: apiUser._id,
    id: apiUser._id, // For backward compatibility
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    phone: apiUser.phone,
    address: apiUser.address,
    avatar: undefined, // Not available in API User interface
    status: apiUser.status,
    isActive: apiUser.isActive,
    totalOrders: apiUser.totalOrders,
    orderCount: apiUser.orderCount,
    totalSpent: apiUser.totalSpent,
    lastActive: apiUser.lastActive,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
};

export const getUserRoleName = (user: User | null): string => {
  if (!user) return '';
  if (typeof user.role === 'string') {
    return user.role;
  }
  return user.role?.name || '';
};

export const isAdminUser = (user: User | null): boolean => {
  const roleName = getUserRoleName(user);
  return roleName === 'Admin' || roleName === 'Super Admin';
};

// useAuth will be exported from AuthContext.tsx
