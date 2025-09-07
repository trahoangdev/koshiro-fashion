import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  Settings,
  Eye,
  Copy,
  UserCheck,
  UserX,
  Key,
  Lock,
  Unlock,
  Crown,
  User,
  UserPlus,
  UserMinus,
  Download,
  Upload,
  RefreshCw,
  Loader2
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Permission {
  id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  category: string;
  resource: string;
  action: string;
}

interface Role {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function AdminRolesPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Role & Permission Management",
      subtitle: "Manage user roles, permissions, and access control",
      createRole: "Create Role",
      search: "Search roles...",
      roleName: "Role Name",
      description: "Description",
      permissions: "Permissions",
      users: "Users",
      status: "Status",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      system: "System",
      custom: "Custom",
      noRoles: "No roles found",
      totalRoles: "Total Roles",
      activeRoles: "Active Roles",
      totalUsers: "Total Users",
      systemRoles: "System Roles",
      assignUsers: "Assign Users",
      managePermissions: "Manage Permissions",
      copyRole: "Copy Role",
      deleteRole: "Delete Role",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      selectUsers: "Select Users",
      assign: "Assign",
      unassign: "Unassign",
      permissionCategories: {
        dashboard: "Dashboard",
        products: "Products",
        orders: "Orders",
        users: "Users",
        analytics: "Analytics",
        settings: "Settings",
        inventory: "Inventory",
        shipping: "Shipping",
        payments: "Payments",
        promotions: "Promotions"
      }
    },
    vi: {
      title: "Quản lý Vai trò & Phân quyền",
      subtitle: "Quản lý vai trò người dùng, quyền hạn và kiểm soát truy cập",
      createRole: "Tạo Vai trò",
      search: "Tìm kiếm vai trò...",
      roleName: "Tên vai trò",
      description: "Mô tả",
      permissions: "Quyền hạn",
      users: "Người dùng",
      status: "Trạng thái",
      actions: "Thao tác",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      system: "Hệ thống",
      custom: "Tùy chỉnh",
      noRoles: "Không tìm thấy vai trò",
      totalRoles: "Tổng vai trò",
      activeRoles: "Vai trò hoạt động",
      totalUsers: "Tổng người dùng",
      systemRoles: "Vai trò hệ thống",
      assignUsers: "Gán Người dùng",
      managePermissions: "Quản lý Quyền hạn",
      copyRole: "Sao chép Vai trò",
      deleteRole: "Xóa Vai trò",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      save: "Lưu",
      cancel: "Hủy",
      selectUsers: "Chọn Người dùng",
      assign: "Gán",
      unassign: "Bỏ gán",
      permissionCategories: {
        dashboard: "Bảng điều khiển",
        products: "Sản phẩm",
        orders: "Đơn hàng",
        users: "Người dùng",
        analytics: "Phân tích",
        settings: "Cài đặt",
        inventory: "Tồn kho",
        shipping: "Vận chuyển",
        payments: "Thanh toán",
        promotions: "Khuyến mãi"
      }
    },
    ja: {
      title: "ロール・権限管理",
      subtitle: "ユーザーロール、権限、アクセス制御の管理",
      createRole: "ロール作成",
      search: "ロール検索...",
      roleName: "ロール名",
      description: "説明",
      permissions: "権限",
      users: "ユーザー",
      status: "ステータス",
      actions: "アクション",
      active: "アクティブ",
      inactive: "非アクティブ",
      system: "システム",
      custom: "カスタム",
      noRoles: "ロールが見つかりません",
      totalRoles: "総ロール数",
      activeRoles: "アクティブロール",
      totalUsers: "総ユーザー数",
      systemRoles: "システムロール",
      assignUsers: "ユーザー割り当て",
      managePermissions: "権限管理",
      copyRole: "ロールコピー",
      deleteRole: "ロール削除",
      edit: "編集",
      delete: "削除",
      save: "保存",
      cancel: "キャンセル",
      selectUsers: "ユーザー選択",
      assign: "割り当て",
      unassign: "割り当て解除",
      permissionCategories: {
        dashboard: "ダッシュボード",
        products: "商品",
        orders: "注文",
        users: "ユーザー",
        analytics: "分析",
        settings: "設定",
        inventory: "在庫",
        shipping: "配送",
        payments: "支払い",
        promotions: "プロモーション"
      }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Mock data for demonstration
  useEffect(() => {
    const mockPermissions: Permission[] = [
      // Dashboard permissions
      { id: "dashboard.view", name: "Xem bảng điều khiển", nameEn: "View Dashboard", nameJa: "ダッシュボード表示", description: "Xem thống kê tổng quan", descriptionEn: "View overview statistics", descriptionJa: "概要統計の表示", category: "dashboard", resource: "dashboard", action: "view" },
      
      // Product permissions
      { id: "products.view", name: "Xem sản phẩm", nameEn: "View Products", nameJa: "商品表示", description: "Xem danh sách sản phẩm", descriptionEn: "View product list", descriptionJa: "商品一覧の表示", category: "products", resource: "products", action: "view" },
      { id: "products.create", name: "Tạo sản phẩm", nameEn: "Create Products", nameJa: "商品作成", description: "Tạo sản phẩm mới", descriptionEn: "Create new products", descriptionJa: "新商品の作成", category: "products", resource: "products", action: "create" },
      { id: "products.edit", name: "Chỉnh sửa sản phẩm", nameEn: "Edit Products", nameJa: "商品編集", description: "Chỉnh sửa sản phẩm", descriptionEn: "Edit products", descriptionJa: "商品の編集", category: "products", resource: "products", action: "edit" },
      { id: "products.delete", name: "Xóa sản phẩm", nameEn: "Delete Products", nameJa: "商品削除", description: "Xóa sản phẩm", descriptionEn: "Delete products", descriptionJa: "商品の削除", category: "products", resource: "products", action: "delete" },
      
      // Order permissions
      { id: "orders.view", name: "Xem đơn hàng", nameEn: "View Orders", nameJa: "注文表示", description: "Xem danh sách đơn hàng", descriptionEn: "View order list", descriptionJa: "注文一覧の表示", category: "orders", resource: "orders", action: "view" },
      { id: "orders.edit", name: "Chỉnh sửa đơn hàng", nameEn: "Edit Orders", nameJa: "注文編集", description: "Chỉnh sửa đơn hàng", descriptionEn: "Edit orders", descriptionJa: "注文の編集", category: "orders", resource: "orders", action: "edit" },
      { id: "orders.cancel", name: "Hủy đơn hàng", nameEn: "Cancel Orders", nameJa: "注文キャンセル", description: "Hủy đơn hàng", descriptionEn: "Cancel orders", descriptionJa: "注文のキャンセル", category: "orders", resource: "orders", action: "cancel" },
      
      // User permissions
      { id: "users.view", name: "Xem người dùng", nameEn: "View Users", nameJa: "ユーザー表示", description: "Xem danh sách người dùng", descriptionEn: "View user list", descriptionJa: "ユーザー一覧の表示", category: "users", resource: "users", action: "view" },
      { id: "users.create", name: "Tạo người dùng", nameEn: "Create Users", nameJa: "ユーザー作成", description: "Tạo người dùng mới", descriptionEn: "Create new users", descriptionJa: "新ユーザーの作成", category: "users", resource: "users", action: "create" },
      { id: "users.edit", name: "Chỉnh sửa người dùng", nameEn: "Edit Users", nameJa: "ユーザー編集", description: "Chỉnh sửa người dùng", descriptionEn: "Edit users", descriptionJa: "ユーザーの編集", category: "users", resource: "users", action: "edit" },
      { id: "users.delete", name: "Xóa người dùng", nameEn: "Delete Users", nameJa: "ユーザー削除", description: "Xóa người dùng", descriptionEn: "Delete users", descriptionJa: "ユーザーの削除", category: "users", resource: "users", action: "delete" },
      
      // Analytics permissions
      { id: "analytics.view", name: "Xem phân tích", nameEn: "View Analytics", nameJa: "分析表示", description: "Xem báo cáo phân tích", descriptionEn: "View analytics reports", descriptionJa: "分析レポートの表示", category: "analytics", resource: "analytics", action: "view" },
      { id: "analytics.export", name: "Xuất báo cáo", nameEn: "Export Reports", nameJa: "レポートエクスポート", description: "Xuất báo cáo phân tích", descriptionEn: "Export analytics reports", descriptionJa: "分析レポートのエクスポート", category: "analytics", resource: "analytics", action: "export" },
      
      // Settings permissions
      { id: "settings.view", name: "Xem cài đặt", nameEn: "View Settings", nameJa: "設定表示", description: "Xem cài đặt hệ thống", descriptionEn: "View system settings", descriptionJa: "システム設定の表示", category: "settings", resource: "settings", action: "view" },
      { id: "settings.edit", name: "Chỉnh sửa cài đặt", nameEn: "Edit Settings", nameJa: "設定編集", description: "Chỉnh sửa cài đặt hệ thống", descriptionEn: "Edit system settings", descriptionJa: "システム設定の編集", category: "settings", resource: "settings", action: "edit" }
    ];

    const mockRoles: Role[] = [
      {
        _id: "1",
        name: "Quản trị viên",
        nameEn: "Administrator",
        nameJa: "管理者",
        description: "Toàn quyền truy cập hệ thống",
        descriptionEn: "Full system access",
        descriptionJa: "システム全体へのアクセス",
        permissions: mockPermissions.map(p => p.id),
        isSystem: true,
        isActive: true,
        userCount: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "2",
        name: "Quản lý sản phẩm",
        nameEn: "Product Manager",
        nameJa: "商品管理者",
        description: "Quản lý sản phẩm và danh mục",
        descriptionEn: "Manage products and categories",
        descriptionJa: "商品とカテゴリの管理",
        permissions: [
          "dashboard.view",
          "products.view",
          "products.create",
          "products.edit",
          "products.delete",
          "orders.view",
          "analytics.view"
        ],
        isSystem: false,
        isActive: true,
        userCount: 3,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "3",
        name: "Nhân viên bán hàng",
        nameEn: "Sales Staff",
        nameJa: "営業スタッフ",
        description: "Xử lý đơn hàng và khách hàng",
        descriptionEn: "Handle orders and customers",
        descriptionJa: "注文と顧客の処理",
        permissions: [
          "dashboard.view",
          "orders.view",
          "orders.edit",
          "orders.cancel",
          "users.view",
          "analytics.view"
        ],
        isSystem: false,
        isActive: true,
        userCount: 5,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "4",
        name: "Xem báo cáo",
        nameEn: "Report Viewer",
        nameJa: "レポート閲覧者",
        description: "Chỉ xem báo cáo và thống kê",
        descriptionEn: "View reports and statistics only",
        descriptionJa: "レポートと統計の閲覧のみ",
        permissions: [
          "dashboard.view",
          "analytics.view",
          "analytics.export"
        ],
        isSystem: false,
        isActive: false,
        userCount: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ];

    const mockUsers: User[] = [
      {
        _id: "1",
        name: "Admin User",
        email: "admin@koshiro.com",
        role: "Quản trị viên",
        isActive: true,
        lastLogin: "2024-01-22T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "2",
        name: "Product Manager",
        email: "product@koshiro.com",
        role: "Quản lý sản phẩm",
        isActive: true,
        lastLogin: "2024-01-21T15:45:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "3",
        name: "Sales Staff 1",
        email: "sales1@koshiro.com",
        role: "Nhân viên bán hàng",
        isActive: true,
        lastLogin: "2024-01-22T09:15:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      }
    ];

    setPermissions(mockPermissions);
    setRoles(mockRoles);
    setFilteredRoles(mockRoles);
    setUsers(mockUsers);
    setIsLoading(false);
  }, []);

  // Filter roles
  useEffect(() => {
    let filtered = roles;

    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.nameEn && role.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (role.nameJa && role.nameJa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(role => 
        filterStatus === "active" ? role.isActive : !role.isActive
      );
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm, filterStatus]);

  const getRoleName = (role: Role) => {
    switch (language) {
      case 'vi': return role.name;
      case 'ja': return role.nameJa || role.name;
      default: return role.nameEn || role.name;
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (language) {
      case 'vi': return role.description;
      case 'ja': return role.descriptionJa || role.description;
      default: return role.descriptionEn || role.description;
    }
  };

  const getPermissionName = (permission: Permission) => {
    switch (language) {
      case 'vi': return permission.name;
      case 'ja': return permission.nameJa || permission.name;
      default: return permission.nameEn || permission.name;
    }
  };

  const getStatusBadge = (role: Role) => {
    if (role.isSystem) {
      return <Badge variant="default" className="bg-purple-500"><Crown className="h-3 w-3 mr-1" />{t.system}</Badge>;
    }
    return role.isActive ? 
      <Badge variant="default" className="bg-green-500"><UserCheck className="h-3 w-3 mr-1" />{t.active}</Badge> :
      <Badge variant="secondary"><UserX className="h-3 w-3 mr-1" />{t.inactive}</Badge>;
  };

  const getPermissionsByCategory = (permissionIds: string[]) => {
    const rolePermissions = permissions.filter(p => permissionIds.includes(p.id));
    const grouped = rolePermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    return grouped;
  };

  const handleCreateRole = () => {
    setIsCreateRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsEditRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleAssignUsers = (role: Role) => {
    setSelectedRole(role);
    setIsAssignUserDialogOpen(true);
  };

  const handleCopyRole = (role: Role) => {
    const newRole = {
      ...role,
      _id: Date.now().toString(),
      name: `${role.name} (Copy)`,
      nameEn: `${role.nameEn || role.name} (Copy)`,
      nameJa: `${role.nameJa || role.name} (Copy)`,
      isSystem: false,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRoles(prev => [...prev, newRole]);
    toast({
      title: "Role Copied",
      description: `Role "${getRoleName(role)}" has been copied.`,
    });
  };

  const stats = {
    total: roles.length,
    active: roles.filter(r => r.isActive).length,
    system: roles.filter(r => r.isSystem).length,
    totalUsers: users.length
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createRole}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalRoles}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.activeRoles}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.systemRoles}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.system}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalUsers}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="inactive">{t.inactive}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noRoles}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.roleName}</TableHead>
                  <TableHead>{t.description}</TableHead>
                  <TableHead>{t.permissions}</TableHead>
                  <TableHead>{t.users}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getRoleName(role)}</div>
                        {role.isSystem && (
                          <Badge variant="outline" className="mt-1">
                            {t.system}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getRoleDescription(role)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(getPermissionsByCategory(role.permissions)).slice(0, 3).map(([category, perms]) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {t.permissionCategories[category as keyof typeof t.permissionCategories] || category}: {perms.length}
                          </Badge>
                        ))}
                        {Object.keys(getPermissionsByCategory(role.permissions)).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(getPermissionsByCategory(role.permissions)).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{role.userCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(role)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignUsers(role)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t.assignUsers}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyRole(role)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t.copyRole}
                          </DropdownMenuItem>
                          {!role.isSystem && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRole(role)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t.delete}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteRole}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete && getRoleName(roleToDelete)}"? 
              This action cannot be undone and will affect all users assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (roleToDelete) {
                  setRoles(prev => prev.filter(r => r._id !== roleToDelete._id));
                  setFilteredRoles(prev => prev.filter(r => r._id !== roleToDelete._id));
                  toast({
                    title: "Role deleted",
                    description: `Role "${getRoleName(roleToDelete)}" has been deleted.`,
                  });
                }
                setIsDeleteDialogOpen(false);
                setRoleToDelete(null);
              }}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Users Dialog */}
      <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.assignUsers}</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium">{getRoleName(selectedRole)}</h3>
                <p className="text-sm text-muted-foreground">
                  {getRoleDescription(selectedRole)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.selectUsers}</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={user._id}
                        checked={user.role === selectedRole.name}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Assign user to role
                            setUsers(prev => prev.map(u => 
                              u._id === user._id ? { ...u, role: selectedRole.name } : u
                            ));
                          } else {
                            // Unassign user from role
                            setUsers(prev => prev.map(u => 
                              u._id === user._id ? { ...u, role: "No Role" } : u
                            ));
                          }
                        }}
                      />
                      <label 
                        htmlFor={user._id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {user.name} ({user.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAssignUserDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Users Assigned",
                    description: `Users have been assigned to role "${getRoleName(selectedRole)}".`,
                  });
                  setIsAssignUserDialogOpen(false);
                }}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
