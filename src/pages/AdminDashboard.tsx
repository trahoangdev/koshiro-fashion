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
  Tag,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductStats {
  category: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  ordersTrend: number;
  productsTrend: number;
  usersTrend: number;
  revenueTrend: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  activeUsers: number;
  averageOrderValue: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    ordersTrend: 0,
    productsTrend: 0,
    usersTrend: 0,
    revenueTrend: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    lowStockProducts: 0,
    activeUsers: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US');
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading admin dashboard data...');
        
        // Load admin stats
        const statsResponse = await api.getAdminStats();
        console.log('Admin stats loaded:', statsResponse);
        setStats({
          ...statsResponse,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          lowStockProducts: 0,
          activeUsers: 0,
          averageOrderValue: 0
        });
        
        // Load recent orders
        const ordersResponse = await api.getAdminOrders({ page: 1, limit: 10 });
        console.log('Recent orders loaded:', ordersResponse);
        
        // Transform Order data to RecentOrder format
        const transformedOrders: RecentOrder[] = ordersResponse.data.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.userId?.name || 'Unknown Customer',
          customerEmail: order.userId?.email || '',
          total: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.length
        }));
        
        setRecentOrders(transformedOrders);
        
        // Load revenue data
        const revenueResponse = await api.getRevenueData();
        setRevenueData(revenueResponse.map(item => ({
          ...item,
          customers: 0
        })));
        
        // Load product stats
        const productStatsResponse = await api.getProductStats();
        setProductStats(productStatsResponse.map(item => ({
          ...item,
          percentage: 0
        })));
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Error Loading Data",
          description: language === 'vi' ? "Không thể tải dữ liệu bảng điều khiển" :
                       language === 'ja' ? "ダッシュボードデータを読み込めませんでした" :
                       "Unable to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [toast, language, timeRange]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: language === 'vi' ? 'Chờ xử lý' : language === 'ja' ? '処理待ち' : 'Pending', variant: 'secondary' as const },
      processing: { label: language === 'vi' ? 'Đang xử lý' : language === 'ja' ? '処理中' : 'Processing', variant: 'default' as const },
      completed: { label: language === 'vi' ? 'Hoàn thành' : language === 'ja' ? '完了' : 'Completed', variant: 'default' as const },
      cancelled: { label: language === 'vi' ? 'Đã hủy' : language === 'ja' ? 'キャンセル' : 'Cancelled', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const filteredOrders = recentOrders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const translations = {
    en: {
      title: "Admin Dashboard",
      subtitle: "Overview of your business performance",
      overview: "Overview",
      analytics: "Analytics",
      recentOrders: "Recent Orders",
      revenueChart: "Revenue Chart",
      productStats: "Product Statistics",
      totalOrders: "Total Orders",
      totalProducts: "Total Products",
      totalUsers: "Total Users",
      totalRevenue: "Total Revenue",
      pendingOrders: "Pending Orders",
      completedOrders: "Completed Orders",
      cancelledOrders: "Cancelled Orders",
      lowStockProducts: "Low Stock Products",
      activeUsers: "Active Users",
      averageOrderValue: "Average Order Value",
      viewAll: "View All",
      refresh: "Refresh",
      export: "Export",
      search: "Search orders...",
      timeRange: "Time Range",
      customer: "Customer",
      orderNumber: "Order #",
      total: "Total",
      status: "Status",
      date: "Date",
      items: "Items",
      noOrders: "No recent orders",
      loading: "Loading dashboard data...",
      error: "Error loading data"
    },
    vi: {
      title: "Bảng Điều Khiển Admin",
      subtitle: "Tổng quan hiệu suất kinh doanh",
      overview: "Tổng Quan",
      analytics: "Phân Tích",
      recentOrders: "Đơn Hàng Gần Đây",
      revenueChart: "Biểu Đồ Doanh Thu",
      productStats: "Thống Kê Sản Phẩm",
      totalOrders: "Tổng Đơn Hàng",
      totalProducts: "Tổng Sản Phẩm",
      totalUsers: "Tổng Người Dùng",
      totalRevenue: "Tổng Doanh Thu",
      pendingOrders: "Đơn Hàng Chờ",
      completedOrders: "Đơn Hàng Hoàn Thành",
      cancelledOrders: "Đơn Hàng Hủy",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      activeUsers: "Người Dùng Hoạt Động",
      averageOrderValue: "Giá Trị Đơn Hàng TB",
      viewAll: "Xem Tất Cả",
      refresh: "Làm Mới",
      export: "Xuất Dữ Liệu",
      search: "Tìm kiếm đơn hàng...",
      timeRange: "Khoảng Thời Gian",
      customer: "Khách Hàng",
      orderNumber: "Mã Đơn Hàng",
      total: "Tổng",
      status: "Trạng Thái",
      date: "Ngày",
      items: "Sản Phẩm",
      noOrders: "Không có đơn hàng gần đây",
      loading: "Đang tải dữ liệu...",
      error: "Lỗi tải dữ liệu"
    },
    ja: {
      title: "管理者ダッシュボード",
      subtitle: "ビジネスパフォーマンスの概要",
      overview: "概要",
      analytics: "分析",
      recentOrders: "最近の注文",
      revenueChart: "売上チャート",
      productStats: "商品統計",
      totalOrders: "総注文数",
      totalProducts: "総商品数",
      totalUsers: "総ユーザー数",
      totalRevenue: "総売上",
      pendingOrders: "保留中の注文",
      completedOrders: "完了した注文",
      cancelledOrders: "キャンセルされた注文",
      lowStockProducts: "在庫不足商品",
      activeUsers: "アクティブユーザー",
      averageOrderValue: "平均注文価値",
      viewAll: "すべて表示",
      refresh: "更新",
      export: "エクスポート",
      search: "注文を検索...",
      timeRange: "期間",
      customer: "顧客",
      orderNumber: "注文番号",
      total: "合計",
      status: "ステータス",
      date: "日付",
      items: "商品数",
      noOrders: "最近の注文はありません",
      loading: "データを読み込み中...",
      error: "データ読み込みエラー"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
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
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(stats.ordersTrend)}
                <span className={`ml-1 ${getTrendColor(stats.ordersTrend)}`}>
                  {Math.abs(stats.ordersTrend)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrencyForDisplay(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(stats.revenueTrend)}
                <span className={`ml-1 ${getTrendColor(stats.revenueTrend)}`}>
                  {Math.abs(stats.revenueTrend)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(stats.productsTrend)}
                <span className={`ml-1 ${getTrendColor(stats.productsTrend)}`}>
                  {Math.abs(stats.productsTrend)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(stats.usersTrend)}
                <span className={`ml-1 ${getTrendColor(stats.usersTrend)}`}>
                  {Math.abs(stats.usersTrend)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.pendingOrders}</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.completedOrders}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.lowStockProducts}</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.averageOrderValue}</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrencyForDisplay(stats.averageOrderValue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Orders */}
              <Card className="col-span-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t.recentOrders}</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
                      {t.viewAll}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              {getStatusBadge(order.status)}
                            </div>
                            <div>
                              <p className="font-medium">{order.customer}</p>
                              <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrencyForDisplay(order.total)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items} {t.items} • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.noOrders}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.activeUsers}</span>
                    <span className="text-2xl font-bold">{stats.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.cancelledOrders}</span>
                    <span className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.revenueChart}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Revenue chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Stats Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.productStats}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Product stats chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}