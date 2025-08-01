import { useState, useEffect } from "react";
import { ArrowLeft, Search, Ban, CheckCircle, UserCheck, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock users data
const mockUsers = [
  {
    id: "USR001",
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "+84 123 456 789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    status: "active",
    joinDate: "2024-01-15T10:30:00Z",
    lastActive: "2024-01-20T14:30:00Z",
    totalOrders: 5,
    totalSpent: 2150000
  },
  {
    id: "USR002",
    name: "Trần Thị Bình",
    email: "tran.thi.binh@email.com",
    phone: "+84 987 654 321",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    status: "active",
    joinDate: "2024-01-10T09:15:00Z",
    lastActive: "2024-01-19T16:45:00Z",
    totalOrders: 3,
    totalSpent: 1340000
  },
  {
    id: "USR003",
    name: "Lê Văn Cường",
    email: "le.van.cuong@email.com",
    phone: "+84 555 123 456",
    address: "789 Đường DEF, Quận 7, TP.HCM",
    status: "blocked",
    joinDate: "2024-01-05T11:20:00Z",
    lastActive: "2024-01-18T10:15:00Z",
    totalOrders: 1,
    totalSpent: 750000
  },
  {
    id: "USR004",
    name: "Phạm Thị Dung",
    email: "pham.thi.dung@email.com",
    phone: "+84 777 888 999",
    address: "321 Đường GHI, Quận 5, TP.HCM",
    status: "active",
    joinDate: "2023-12-20T13:45:00Z",
    lastActive: "2024-01-21T08:30:00Z",
    totalOrders: 8,
    totalSpent: 4250000
  },
  {
    id: "USR005",
    name: "Hoàng Văn Em",
    email: "hoang.van.em@email.com",
    phone: "+84 111 222 333",
    address: "654 Đường JKL, Quận 2, TP.HCM",
    status: "inactive",
    joinDate: "2023-11-15T15:30:00Z",
    lastActive: "2023-12-25T12:00:00Z",
    totalOrders: 0,
    totalSpent: 0
  }
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [language, setLanguage] = useState("vi");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [navigate]);

  const translations = {
    en: {
      title: "User Management",
      subtitle: "View and manage user accounts",
      filters: "Filters",
      searchPlaceholder: "Search by name, email...",
      allStatuses: "All statuses",
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
      userList: "User List",
      userDetails: "User Details",
      customerInfo: "Customer Information",
      accountInfo: "Account Information",
      orderStats: "Order Statistics",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      status: "Status",
      joinDate: "Join Date",
      lastActive: "Last Active",
      totalOrders: "Total Orders",
      totalSpent: "Total Spent",
      viewDetails: "View Details",
      changeStatus: "Change Status",
      blockUser: "Block User",
      unblockUser: "Unblock User",
      activateUser: "Activate User",
      deactivateUser: "Deactivate User",
      userBlocked: "User blocked successfully",
      userUnblocked: "User unblocked successfully",
      userActivated: "User activated successfully",
      userDeactivated: "User deactivated successfully",
      noUsersFound: "No users found matching the filters",
      orders: "orders",
      never: "Never"
    },
    vi: {
      title: "Quản lý người dùng",
      subtitle: "Xem và quản lý tài khoản người dùng",
      filters: "Bộ lọc",
      searchPlaceholder: "Tìm kiếm theo tên, email...",
      allStatuses: "Tất cả trạng thái",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      blocked: "Đã chặn",
      userList: "Danh sách người dùng",
      userDetails: "Chi tiết người dùng",
      customerInfo: "Thông tin khách hàng",
      accountInfo: "Thông tin tài khoản",
      orderStats: "Thống kê đơn hàng",
      name: "Họ tên",
      email: "Email",
      phone: "Số điện thoại",
      address: "Địa chỉ",
      status: "Trạng thái",
      joinDate: "Ngày tham gia",
      lastActive: "Hoạt động cuối",
      totalOrders: "Tổng đơn hàng",
      totalSpent: "Tổng chi tiêu",
      viewDetails: "Xem chi tiết",
      changeStatus: "Thay đổi trạng thái",
      blockUser: "Chặn người dùng",
      unblockUser: "Bỏ chặn người dùng",
      activateUser: "Kích hoạt",
      deactivateUser: "Vô hiệu hóa",
      userBlocked: "Đã chặn người dùng thành công",
      userUnblocked: "Đã bỏ chặn người dùng thành công",
      userActivated: "Đã kích hoạt người dùng thành công",
      userDeactivated: "Đã vô hiệu hóa người dùng thành công",
      noUsersFound: "Không tìm thấy người dùng nào phù hợp với bộ lọc",
      orders: "đơn hàng",
      never: "Chưa từng"
    },
    ja: {
      title: "ユーザー管理",
      subtitle: "ユーザーアカウントの表示と管理",
      filters: "フィルター",
      searchPlaceholder: "名前、メールで検索...",
      allStatuses: "すべてのステータス",
      active: "アクティブ",
      inactive: "非アクティブ",
      blocked: "ブロック済み",
      userList: "ユーザーリスト",
      userDetails: "ユーザー詳細",
      customerInfo: "顧客情報",
      accountInfo: "アカウント情報",
      orderStats: "注文統計",
      name: "名前",
      email: "メール",
      phone: "電話番号",
      address: "住所",
      status: "ステータス",
      joinDate: "参加日",
      lastActive: "最終アクティブ",
      totalOrders: "総注文数",
      totalSpent: "総支出",
      viewDetails: "詳細を見る",
      changeStatus: "ステータス変更",
      blockUser: "ユーザーをブロック",
      unblockUser: "ユーザーのブロック解除",
      activateUser: "ユーザーを有効化",
      deactivateUser: "ユーザーを無効化",
      userBlocked: "ユーザーのブロックが完了しました",
      userUnblocked: "ユーザーのブロック解除が完了しました",
      userActivated: "ユーザーの有効化が完了しました",
      userDeactivated: "ユーザーの無効化が完了しました",
      noUsersFound: "フィルターに一致するユーザーが見つかりません",
      orders: "注文",
      never: "なし"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    
    const statusMessages = {
      blocked: t.userBlocked,
      active: t.userActivated,
      inactive: t.userDeactivated
    };

    toast({
      title: statusMessages[newStatus as keyof typeof statusMessages] || "Status updated",
      description: `User ${userId} status changed to ${newStatus}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : 'vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t.active, variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      inactive: { label: t.inactive, variant: "secondary" as const, icon: UserCheck, color: "text-gray-600" },
      blocked: { label: t.blocked, variant: "destructive" as const, icon: Ban, color: "text-red-600" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const statusOptions = [
    { value: "all", label: t.allStatuses },
    { value: "active", label: t.active },
    { value: "inactive", label: t.inactive },
    { value: "blocked", label: t.blocked },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>{t.filters}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder={t.allStatuses} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>{t.userList} ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            {getStatusBadge(user.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{user.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold text-primary">
                            {formatCurrency(user.totalSpent)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.totalOrders} {t.orders}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.joinDate}: {formatDate(user.joinDate)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            {t.viewDetails}
                          </Button>

                          <Select 
                            value={user.status} 
                            onValueChange={(value) => handleStatusChange(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">{t.active}</SelectItem>
                              <SelectItem value="inactive">{t.inactive}</SelectItem>
                              <SelectItem value="blocked">{t.blocked}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  {t.noUsersFound}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t.userDetails}: {selectedUser.name}
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">{t.customerInfo}</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">{t.email}:</span> {selectedUser.email}</div>
                    <div><span className="text-muted-foreground">{t.phone}:</span> {selectedUser.phone}</div>
                    <div><span className="text-muted-foreground">{t.address}:</span> {selectedUser.address}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">{t.accountInfo}</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">{t.status}:</span> {getStatusBadge(selectedUser.status)}</div>
                    <div><span className="text-muted-foreground">{t.joinDate}:</span> {formatDate(selectedUser.joinDate)}</div>
                    <div><span className="text-muted-foreground">{t.lastActive}:</span> {selectedUser.lastActive ? formatDate(selectedUser.lastActive) : t.never}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">{t.orderStats}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{selectedUser.totalOrders}</div>
                      <div className="text-sm text-muted-foreground">{t.totalOrders}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(selectedUser.totalSpent)}</div>
                      <div className="text-sm text-muted-foreground">{t.totalSpent}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}