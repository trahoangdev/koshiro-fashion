import { useState, useEffect } from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Activity,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalyticsData {
  revenue: {
    total: number;
    trend: number;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
  };
  orders: {
    total: number;
    trend: number;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    byCategory: Array<{ category: string; count: number; revenue: number }>;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
  };
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [data, setData] = useState<AnalyticsData>({
    revenue: { total: 0, trend: 0, monthly: [] },
    orders: { total: 0, trend: 0, byStatus: [] },
    products: { total: 0, active: 0, lowStock: 0, byCategory: [] },
    customers: { total: 0, active: 0, newThisMonth: 0, topSpenders: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Load analytics data from API
        const [statsResponse, revenueResponse, productStatsResponse] = await Promise.all([
          api.getAdminStats(),
          api.getRevenueData(),
          api.getProductStats()
        ]);

        // Transform data for analytics
        const analyticsData: AnalyticsData = {
          revenue: {
            total: statsResponse.totalRevenue,
            trend: statsResponse.revenueTrend,
            monthly: revenueResponse.map(item => ({
              month: item.month,
              revenue: item.revenue,
              orders: item.orders
            }))
          },
          orders: {
            total: statsResponse.totalOrders,
            trend: statsResponse.ordersTrend,
            byStatus: [
              { status: 'pending', count: 5, percentage: 25 },
              { status: 'processing', count: 8, percentage: 40 },
              { status: 'completed', count: 6, percentage: 30 },
              { status: 'cancelled', count: 1, percentage: 5 }
            ]
          },
          products: {
            total: statsResponse.totalProducts,
            active: statsResponse.totalProducts - 2,
            lowStock: 3,
            byCategory: productStatsResponse.map(item => ({
              category: item.category,
              count: item.count,
              revenue: item.revenue
            }))
          },
          customers: {
            total: statsResponse.totalUsers,
            active: Math.floor(statsResponse.totalUsers * 0.7),
            newThisMonth: Math.floor(statsResponse.totalUsers * 0.1),
            topSpenders: [
              { name: "Nguyễn Văn A", email: "nguyenvana@email.com", totalSpent: 5000000, orders: 5 },
              { name: "Trần Thị B", email: "tranthib@email.com", totalSpent: 3500000, orders: 3 },
              { name: "Lê Văn C", email: "levanc@email.com", totalSpent: 2800000, orders: 4 }
            ]
          }
        };

        setData(analyticsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Error Loading Data",
          description: language === 'vi' ? "Không thể tải dữ liệu phân tích" :
                       language === 'ja' ? "分析データを読み込めませんでした" :
                       "Unable to load analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [toast, language, timeRange]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const translations = {
    en: {
      title: "Analytics Dashboard",
      subtitle: "Detailed insights into your business performance",
      revenue: "Revenue",
      orders: "Orders",
      products: "Products",
      customers: "Customers",
      overview: "Overview",
      detailed: "Detailed Analysis",
      export: "Export Data",
      refresh: "Refresh",
      timeRange: "Time Range",
      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      totalProducts: "Total Products",
      totalCustomers: "Total Customers",
      activeProducts: "Active Products",
      lowStockProducts: "Low Stock Products",
      activeCustomers: "Active Customers",
      newCustomers: "New This Month",
      topSpenders: "Top Spenders",
      orderStatus: "Order Status",
      productCategories: "Product Categories",
      monthlyRevenue: "Monthly Revenue",
      customerActivity: "Customer Activity",
      loading: "Loading analytics data...",
      noData: "No data available"
    },
    vi: {
      title: "Bảng Phân Tích",
      subtitle: "Thông tin chi tiết về hiệu suất kinh doanh",
      revenue: "Doanh Thu",
      orders: "Đơn Hàng",
      products: "Sản Phẩm",
      customers: "Khách Hàng",
      overview: "Tổng Quan",
      detailed: "Phân Tích Chi Tiết",
      export: "Xuất Dữ Liệu",
      refresh: "Làm Mới",
      timeRange: "Khoảng Thời Gian",
      totalRevenue: "Tổng Doanh Thu",
      totalOrders: "Tổng Đơn Hàng",
      totalProducts: "Tổng Sản Phẩm",
      totalCustomers: "Tổng Khách Hàng",
      activeProducts: "Sản Phẩm Hoạt Động",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      activeCustomers: "Khách Hàng Hoạt Động",
      newCustomers: "Mới Tháng Này",
      topSpenders: "Khách Hàng Chi Tiêu Cao",
      orderStatus: "Trạng Thái Đơn Hàng",
      productCategories: "Danh Mục Sản Phẩm",
      monthlyRevenue: "Doanh Thu Hàng Tháng",
      customerActivity: "Hoạt Động Khách Hàng",
      loading: "Đang tải dữ liệu phân tích...",
      noData: "Không có dữ liệu"
    },
    ja: {
      title: "分析ダッシュボード",
      subtitle: "ビジネスパフォーマンスの詳細な洞察",
      revenue: "売上",
      orders: "注文",
      products: "商品",
      customers: "顧客",
      overview: "概要",
      detailed: "詳細分析",
      export: "データエクスポート",
      refresh: "更新",
      timeRange: "期間",
      totalRevenue: "総売上",
      totalOrders: "総注文数",
      totalProducts: "総商品数",
      totalCustomers: "総顧客数",
      activeProducts: "アクティブ商品",
      lowStockProducts: "在庫不足商品",
      activeCustomers: "アクティブ顧客",
      newCustomers: "今月の新規",
      topSpenders: "高額顧客",
      orderStatus: "注文ステータス",
      productCategories: "商品カテゴリ",
      monthlyRevenue: "月次売上",
      customerActivity: "顧客アクティビティ",
      loading: "分析データを読み込み中...",
      noData: "データがありません"
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

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.revenue.total, language)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(data.revenue.trend)}
                <span className={`ml-1 ${getTrendColor(data.revenue.trend)}`}>
                  {Math.abs(data.revenue.trend)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.orders.total.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(data.orders.trend)}
                <span className={`ml-1 ${getTrendColor(data.orders.trend)}`}>
                  {Math.abs(data.orders.trend)}% from last period
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
              <div className="text-2xl font-bold">{data.products.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {data.products.active} {t.activeProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalCustomers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.customers.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {data.customers.active} {t.activeCustomers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="detailed">{t.detailed}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t.monthlyRevenue}
                  </CardTitle>
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

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.orderStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.orders.byStatus.map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
                          <span className="text-sm capitalize">{status.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{status.count}</div>
                          <div className="text-xs text-muted-foreground">{status.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    {t.productCategories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.products.byCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{category.category}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{category.count}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(category.revenue, language)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Spenders */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {t.topSpenders}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.customers.topSpenders.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(customer.totalSpent, language)}</div>
                          <div className="text-sm text-muted-foreground">{customer.orders} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Detailed Revenue Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Revenue Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Detailed revenue analysis will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.customerActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Customer activity chart will be implemented</p>
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