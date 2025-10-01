import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import Role, { IRole } from '../models/Role';
import Permission, { IPermission } from '../models/Permission';

// Default permissions
const defaultPermissions = [
  // Product Management
  { name: 'Create Products', nameEn: 'Create Products', nameJa: '商品作成', resource: 'products', action: 'create', category: 'products' },
  { name: 'View Products', nameEn: 'View Products', nameJa: '商品表示', resource: 'products', action: 'read', category: 'products' },
  { name: 'Update Products', nameEn: 'Update Products', nameJa: '商品更新', resource: 'products', action: 'update', category: 'products' },
  { name: 'Delete Products', nameEn: 'Delete Products', nameJa: '商品削除', resource: 'products', action: 'delete', category: 'products' },
  { name: 'Manage Products', nameEn: 'Manage Products', nameJa: '商品管理', resource: 'products', action: 'manage', category: 'products' },
  { name: 'Export Products', nameEn: 'Export Products', nameJa: '商品エクスポート', resource: 'products', action: 'export', category: 'products' },
  { name: 'Import Products', nameEn: 'Import Products', nameJa: '商品インポート', resource: 'products', action: 'import', category: 'products' },

  // Category Management
  { name: 'Create Categories', nameEn: 'Create Categories', nameJa: 'カテゴリ作成', resource: 'categories', action: 'create', category: 'categories' },
  { name: 'View Categories', nameEn: 'View Categories', nameJa: 'カテゴリ表示', resource: 'categories', action: 'read', category: 'categories' },
  { name: 'Update Categories', nameEn: 'Update Categories', nameJa: 'カテゴリ更新', resource: 'categories', action: 'update', category: 'categories' },
  { name: 'Delete Categories', nameEn: 'Delete Categories', nameJa: 'カテゴリ削除', resource: 'categories', action: 'delete', category: 'categories' },
  { name: 'Manage Categories', nameEn: 'Manage Categories', nameJa: 'カテゴリ管理', resource: 'categories', action: 'manage', category: 'categories' },

  // User Management
  { name: 'Create Users', nameEn: 'Create Users', nameJa: 'ユーザー作成', resource: 'users', action: 'create', category: 'users' },
  { name: 'View Users', nameEn: 'View Users', nameJa: 'ユーザー表示', resource: 'users', action: 'read', category: 'users' },
  { name: 'Update Users', nameEn: 'Update Users', nameJa: 'ユーザー更新', resource: 'users', action: 'update', category: 'users' },
  { name: 'Delete Users', nameEn: 'Delete Users', nameJa: 'ユーザー削除', resource: 'users', action: 'delete', category: 'users' },
  { name: 'Manage Users', nameEn: 'Manage Users', nameJa: 'ユーザー管理', resource: 'users', action: 'manage', category: 'users' },

  // Order Management
  { name: 'Create Orders', nameEn: 'Create Orders', nameJa: '注文作成', resource: 'orders', action: 'create', category: 'orders' },
  { name: 'View Orders', nameEn: 'View Orders', nameJa: '注文表示', resource: 'orders', action: 'read', category: 'orders' },
  { name: 'Update Orders', nameEn: 'Update Orders', nameJa: '注文更新', resource: 'orders', action: 'update', category: 'orders' },
  { name: 'Delete Orders', nameEn: 'Delete Orders', nameJa: '注文削除', resource: 'orders', action: 'delete', category: 'orders' },
  { name: 'Manage Orders', nameEn: 'Manage Orders', nameJa: '注文管理', resource: 'orders', action: 'manage', category: 'orders' },
  { name: 'Export Orders', nameEn: 'Export Orders', nameJa: '注文エクスポート', resource: 'orders', action: 'export', category: 'orders' },

  // Role Management
  { name: 'Create Roles', nameEn: 'Create Roles', nameJa: 'ロール作成', resource: 'roles', action: 'create', category: 'roles' },
  { name: 'View Roles', nameEn: 'View Roles', nameJa: 'ロール表示', resource: 'roles', action: 'read', category: 'roles' },
  { name: 'Update Roles', nameEn: 'Update Roles', nameJa: 'ロール更新', resource: 'roles', action: 'update', category: 'roles' },
  { name: 'Delete Roles', nameEn: 'Delete Roles', nameJa: 'ロール削除', resource: 'roles', action: 'delete', category: 'roles' },
  { name: 'Manage Roles', nameEn: 'Manage Roles', nameJa: 'ロール管理', resource: 'roles', action: 'manage', category: 'roles' },

  // Permission Management
  { name: 'Create Permissions', nameEn: 'Create Permissions', nameJa: '権限作成', resource: 'permissions', action: 'create', category: 'permissions' },
  { name: 'View Permissions', nameEn: 'View Permissions', nameJa: '権限表示', resource: 'permissions', action: 'read', category: 'permissions' },
  { name: 'Update Permissions', nameEn: 'Update Permissions', nameJa: '権限更新', resource: 'permissions', action: 'update', category: 'permissions' },
  { name: 'Delete Permissions', nameEn: 'Delete Permissions', nameJa: '権限削除', resource: 'permissions', action: 'delete', category: 'permissions' },
  { name: 'Manage Permissions', nameEn: 'Manage Permissions', nameJa: '権限管理', resource: 'permissions', action: 'manage', category: 'permissions' },

  // Analytics & Reports
  { name: 'View Analytics', nameEn: 'View Analytics', nameJa: '分析表示', resource: 'analytics', action: 'read', category: 'analytics' },
  { name: 'Export Reports', nameEn: 'Export Reports', nameJa: 'レポートエクスポート', resource: 'reports', action: 'export', category: 'analytics' },
  { name: 'Manage Reports', nameEn: 'Manage Reports', nameJa: 'レポート管理', resource: 'reports', action: 'manage', category: 'analytics' },

  // Settings
  { name: 'View Settings', nameEn: 'View Settings', nameJa: '設定表示', resource: 'settings', action: 'read', category: 'settings' },
  { name: 'Update Settings', nameEn: 'Update Settings', nameJa: '設定更新', resource: 'settings', action: 'update', category: 'settings' },
  { name: 'Manage Settings', nameEn: 'Manage Settings', nameJa: '設定管理', resource: 'settings', action: 'manage', category: 'settings' },

  // Notifications
  { name: 'View Notifications', nameEn: 'View Notifications', nameJa: '通知表示', resource: 'notifications', action: 'read', category: 'notifications' },
  { name: 'Manage Notifications', nameEn: 'Manage Notifications', nameJa: '通知管理', resource: 'notifications', action: 'manage', category: 'notifications' },

  // Inventory
  { name: 'View Inventory', nameEn: 'View Inventory', nameJa: '在庫表示', resource: 'inventory', action: 'read', category: 'inventory' },
  { name: 'Update Inventory', nameEn: 'Update Inventory', nameJa: '在庫更新', resource: 'inventory', action: 'update', category: 'inventory' },
  { name: 'Manage Inventory', nameEn: 'Manage Inventory', nameJa: '在庫管理', resource: 'inventory', action: 'manage', category: 'inventory' },

  // Promotions
  { name: 'Create Promotions', nameEn: 'Create Promotions', nameJa: 'プロモーション作成', resource: 'promotions', action: 'create', category: 'promotions' },
  { name: 'View Promotions', nameEn: 'View Promotions', nameJa: 'プロモーション表示', resource: 'promotions', action: 'read', category: 'promotions' },
  { name: 'Update Promotions', nameEn: 'Update Promotions', nameJa: 'プロモーション更新', resource: 'promotions', action: 'update', category: 'promotions' },
  { name: 'Delete Promotions', nameEn: 'Delete Promotions', nameJa: 'プロモーション削除', resource: 'promotions', action: 'delete', category: 'promotions' },
  { name: 'Manage Promotions', nameEn: 'Manage Promotions', nameJa: 'プロモーション管理', resource: 'promotions', action: 'manage', category: 'promotions' }
];

// Default roles
const defaultRoles = [
  {
    name: 'Super Admin',
    nameEn: 'Super Admin',
    nameJa: 'スーパー管理者',
    description: 'Full system access with all permissions',
    descriptionEn: 'Full system access with all permissions',
    descriptionJa: 'すべての権限を持つ完全なシステムアクセス',
    level: 100,
    isSystem: true,
    isActive: true
  },
  {
    name: 'Admin',
    nameEn: 'Admin',
    nameJa: '管理者',
    description: 'Administrative access to most system features',
    descriptionEn: 'Administrative access to most system features',
    descriptionJa: 'ほとんどのシステム機能への管理アクセス',
    level: 90,
    isSystem: true,
    isActive: true
  },
  {
    name: 'Manager',
    nameEn: 'Manager',
    nameJa: 'マネージャー',
    description: 'Management access to products, orders, and users',
    descriptionEn: 'Management access to products, orders, and users',
    descriptionJa: '商品、注文、ユーザーへの管理アクセス',
    level: 80,
    isSystem: true,
    isActive: true
  },
  {
    name: 'Editor',
    nameEn: 'Editor',
    nameJa: '編集者',
    description: 'Can create and edit products and categories',
    descriptionEn: 'Can create and edit products and categories',
    descriptionJa: '商品とカテゴリの作成・編集が可能',
    level: 70,
    isSystem: true,
    isActive: true
  },
  {
    name: 'Viewer',
    nameEn: 'Viewer',
    nameJa: '閲覧者',
    description: 'Read-only access to system data',
    descriptionEn: 'Read-only access to system data',
    descriptionJa: 'システムデータへの読み取り専用アクセス',
    level: 60,
    isSystem: true,
    isActive: true
  },
  {
    name: 'Customer',
    nameEn: 'Customer',
    nameJa: '顧客',
    description: 'Standard customer access',
    descriptionEn: 'Standard customer access',
    descriptionJa: '標準的な顧客アクセス',
    level: 10,
    isSystem: true,
    isActive: true
  }
];

const seedRolesAndPermissions = async () => {
  try {
    console.log('🌱 Starting roles and permissions seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await Role.deleteMany({});
    await Permission.deleteMany({});
    
    // Drop indexes to avoid conflicts
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.collection('permissions').dropIndexes();
        await mongoose.connection.db.collection('roles').dropIndexes();
        console.log('🗑️  Dropped existing indexes');
      }
    } catch (error) {
      console.log('ℹ️  No indexes to drop or error dropping indexes:', error);
    }

    // Create permissions
    console.log('📝 Creating permissions...');
    const createdPermissions: IPermission[] = [];
    
    for (const permData of defaultPermissions) {
      const existingPermission = await Permission.findOne({
        resource: permData.resource,
        action: permData.action
      });

      if (!existingPermission) {
        const permission = new Permission({
          ...permData,
          isSystem: true,
          isActive: true
        });
        await permission.save();
        createdPermissions.push(permission);
        console.log(`✅ Created permission: ${permData.name}`);
      } else {
        createdPermissions.push(existingPermission);
        console.log(`⏭️  Permission already exists: ${permData.name}`);
      }
    }

    console.log(`📊 Created ${createdPermissions.length} permissions`);

    // Create roles
    console.log('👥 Creating roles...');
    const createdRoles = [];

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });

      if (!existingRole) {
        // Assign permissions based on role level
        let rolePermissions: mongoose.Types.ObjectId[] = [];
        
        if (roleData.level >= 100) {
          // Super Admin - all permissions
          rolePermissions = createdPermissions.map(p => p._id as mongoose.Types.ObjectId);
        } else if (roleData.level >= 90) {
          // Admin - most permissions except super admin specific ones
          rolePermissions = createdPermissions
            .filter(p => !['roles:delete', 'permissions:delete'].includes(`${p.resource}:${p.action}`))
            .map(p => p._id as mongoose.Types.ObjectId);
        } else if (roleData.level >= 80) {
          // Manager - product, order, user management
          rolePermissions = createdPermissions
            .filter(p => ['products', 'orders', 'users', 'categories', 'inventory', 'analytics', 'reports'].includes(p.category))
            .map(p => p._id as mongoose.Types.ObjectId);
        } else if (roleData.level >= 70) {
          // Editor - product and category management
          rolePermissions = createdPermissions
            .filter(p => ['products', 'categories'].includes(p.category))
            .map(p => p._id as mongoose.Types.ObjectId);
        } else if (roleData.level >= 60) {
          // Viewer - read-only access
          rolePermissions = createdPermissions
            .filter(p => p.action === 'read')
            .map(p => p._id as mongoose.Types.ObjectId);
        } else {
          // Customer - no admin permissions
          rolePermissions = [];
        }

        const role = new Role({
          ...roleData,
          permissions: rolePermissions
        });
        
        await role.save();
        createdRoles.push(role);
        console.log(`✅ Created role: ${roleData.name} (Level ${roleData.level})`);
      } else {
        createdRoles.push(existingRole);
        console.log(`⏭️  Role already exists: ${roleData.name}`);
      }
    }

    console.log(`👥 Created ${createdRoles.length} roles`);

    // Summary
    console.log('\n📋 Seeding Summary:');
    console.log(`✅ Permissions: ${createdPermissions.length}`);
    console.log(`✅ Roles: ${createdRoles.length}`);
    
    console.log('\n🎉 Roles and permissions seeding completed successfully!');
    
    // Display role hierarchy
    console.log('\n🏗️  Role Hierarchy:');
    createdRoles
      .sort((a, b) => b.level - a.level)
      .forEach(role => {
        console.log(`   ${role.level.toString().padStart(3)} - ${role.name} (${role.permissions.length} permissions)`);
      });

  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding function
if (require.main === module) {
  seedRolesAndPermissions()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedRolesAndPermissions;
