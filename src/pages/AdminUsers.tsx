import { useState, useEffect } from "react";
import { 
  Search,
  Filter,
  Eye,
  User,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function AdminUsers() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  const translations = {
    vi: {
      title: "Quản lý Người dùng",
      subtitle: "Quản lý tất cả người dùng",
      searchPlaceholder: "Tìm kiếm người dùng...",
      filterByRole: "Lọc theo vai trò",
      allRoles: "Tất cả vai trò",
      name: "Tên",
      email: "Email",
      phone: "Số điện thoại",
      role: "Vai trò",
      status: "Trạng thái",
      date: "Ngày tạo",
      actions: "Thao tác",
      view: "Xem chi tiết",
      admin: "Quản trị viên",
      customer: "Khách hàng",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      noUsers: "Không tìm thấy người dùng nào",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách người dùng"
    },
    en: {
      title: "User Management",
      subtitle: "Manage all users",
      searchPlaceholder: "Search users...",
      filterByRole: "Filter by role",
      allRoles: "All roles",
      name: "Name",
      email: "Email",
      phone: "Phone",
      role: "Role",
      status: "Status",
      date: "Date",
      actions: "Actions",
      view: "View Details",
      admin: "Admin",
      customer: "Customer",
      active: "Active",
      inactive: "Inactive",
      noUsers: "No users found",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load user list"
    },
    ja: {
      title: "ユーザー管理",
      subtitle: "すべてのユーザーを管理",
      searchPlaceholder: "ユーザーを検索...",
      filterByRole: "役割で絞り込み",
      allRoles: "すべての役割",
      name: "名前",
      email: "メール",
      phone: "電話番号",
      role: "役割",
      status: "ステータス",
      date: "日付",
      actions: "操作",
      view: "詳細を見る",
      admin: "管理者",
      customer: "顧客",
      active: "アクティブ",
      inactive: "非アクティブ",
      noUsers: "ユーザーが見つかりません",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "ユーザーリストを読み込めませんでした"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;



  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading admin users data...');
        
        const usersResponse = await api.getAdminUsers({ page: 1, limit: 50 });
        console.log('Users response:', usersResponse);
        
        const usersData = usersResponse.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
        
      } catch (error) {
        console.error('Error loading admin users data:', error);
        toast({
          title: t.errorLoading,
          description: t.errorLoadingDesc,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast, t.errorLoading, t.errorLoadingDesc]);

  // Filter users
  useEffect(() => {
    let filtered = users;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by role
    if (selectedRole && selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: "default" as const, label: t.admin },
      customer: { variant: "secondary" as const, label: t.customer }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { variant: "secondary" as const, label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: t.active },
      inactive: { variant: "secondary" as const, label: t.inactive }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{t.loading}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.filterByRole} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allRoles}</SelectItem>
              <SelectItem value="admin">{t.admin}</SelectItem>
              <SelectItem value="customer">{t.customer}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Grid */}
        <div className="grid gap-6">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.noUsers}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.phone || 'No phone'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="mb-2">
                          {getRoleBadge(user.role)}
                        </div>
                        <div>
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement user details view
                            console.log('View user details:', user._id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}