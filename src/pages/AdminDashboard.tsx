import { useState, useEffect } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LogOut,
  Globe,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock data
const mockStats = {
  totalOrders: 145,
  totalProducts: 23,
  totalUsers: 1247,
  totalRevenue: 85420000, // VND
  ordersTrend: +12.5,
  productsTrend: +3.2,
  usersTrend: +8.1,
  revenueTrend: +15.3,
};

const mockRecentOrders = [
  { id: "ORD001", customer: "Nguyễn Văn A", total: 1250000, status: "processing" },
  { id: "ORD002", customer: "Trần Thị B", total: 890000, status: "completed" },
  { id: "ORD003", customer: "Lê Văn C", total: 2100000, status: "pending" },
  { id: "ORD004", customer: "Phạm Thị D", total: 750000, status: "completed" },
  { id: "ORD005", customer: "Hoàng Văn E", total: 1800000, status: "processing" },
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("vi");

  const translations = {
    en: {
      title: "KOSHIRO Admin",
      subtitle: "Administration Dashboard",
      logout: "Logout",
      totalOrders: "Total Orders",
      products: "Products",
      users: "Users",
      revenue: "Revenue",
      fromLastMonth: "from last month",
      revenueChart: "Revenue Chart",
      productStats: "Product Statistics",
      recentOrders: "Recent Orders",
      chartPlaceholder: "[Chart will be displayed here]",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      manageProducts: "Manage Products",
      manageCategories: "Manage Categories",
      manageOrders: "Manage Orders",
      manageUsers: "Manage Users",
      logoutSuccess: "Logout successful",
      seeYouSoon: "See you soon!"
    },
    vi: {
      title: "KOSHIRO Admin",
      subtitle: "Bảng điều khiển quản trị",
      logout: "Đăng xuất",
      totalOrders: "Tổng đơn hàng",
      products: "Sản phẩm",
      users: "Người dùng",
      revenue: "Doanh thu",
      fromLastMonth: "từ tháng trước",
      revenueChart: "Biểu đồ doanh thu",
      productStats: "Thống kê sản phẩm",
      recentOrders: "Đơn hàng gần đây",
      chartPlaceholder: "[Biểu đồ sẽ được hiển thị ở đây]",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      manageProducts: "Quản lý sản phẩm",
      manageCategories: "Quản lý danh mục",
      manageOrders: "Quản lý đơn hàng",
      manageUsers: "Quản lý người dùng",
      logoutSuccess: "Đăng xuất thành công",
      seeYouSoon: "Hẹn gặp lại!"
    },
    ja: {
      title: "KOSHIRO Admin",
      subtitle: "管理ダッシュボード",
      logout: "ログアウト",
      totalOrders: "総注文数",
      products: "商品",
      users: "ユーザー",
      revenue: "売上",
      fromLastMonth: "先月から",
      revenueChart: "売上グラフ",
      productStats: "商品統計",
      recentOrders: "最近の注文",
      chartPlaceholder: "[グラフはここに表示されます]",
      pending: "保留中",
      processing: "処理中",
      completed: "完了",
      manageProducts: "商品管理",
      manageCategories: "カテゴリ管理",
      manageOrders: "注文管理",
      manageUsers: "ユーザー管理",
      logoutSuccess: "ログアウト成功",
      seeYouSoon: "また会いましょう！"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

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

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("adminLanguage", lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminLanguage");
    toast({
      title: t.logoutSuccess,
      description: t.seeYouSoon,
    });
    navigate("/admin/login");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t.pending, class: "bg-yellow-100 text-yellow-800" },
      processing: { label: t.processing, class: "bg-blue-100 text-blue-800" },
      completed: { label: t.completed, class: "bg-green-100 text-green-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('vi')}>
                  Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('ja')}>
                  日本語
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{mockStats.ordersTrend}% {t.fromLastMonth}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.products}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalProducts}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{mockStats.productsTrend}% {t.fromLastMonth}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.users}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{mockStats.usersTrend}% {t.fromLastMonth}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.revenue}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockStats.totalRevenue)}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{mockStats.revenueTrend}% {t.fromLastMonth}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {t.revenueChart}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t.chartPlaceholder}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  {t.productStats}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t.chartPlaceholder}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>{t.recentOrders}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{formatCurrency(order.total)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate("/admin/products")}
            >
              <Package className="h-6 w-6 mb-2" />
              {t.manageProducts}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate("/admin/categories")}
            >
              <Tag className="h-6 w-6 mb-2" />
              {t.manageCategories}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate("/admin/orders")}
            >
              <ShoppingCart className="h-6 w-6 mb-2" />
              {t.manageOrders}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => navigate("/admin/users")}
            >
              <Users className="h-6 w-6 mb-2" />
              {t.manageUsers}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}