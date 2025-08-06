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
  FileText,
  Download as DownloadIcon,
  Printer,
  Mail,
  Share2,
  AlertCircle,
  XCircle
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

interface ReportData {
  sales: {
    total: number;
    trend: number;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
    topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
    byCategory: Array<{ category: string; count: number; value: number }>;
  };
  performance: {
    conversionRate: number;
    averageOrderValue: number;
    customerRetention: number;
    topCategories: Array<{ category: string; revenue: number; percentage: number }>;
  };
}

export default function AdminReports() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [data, setData] = useState<ReportData>({
    sales: { total: 0, trend: 0, monthly: [], topProducts: [] },
    customers: { total: 0, new: 0, active: 0, topSpenders: [] },
    inventory: { total: 0, lowStock: 0, outOfStock: 0, byCategory: [] },
    performance: { conversionRate: 0, averageOrderValue: 0, customerRetention: 0, topCategories: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("sales");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // Load data from API
      const [statsResponse, revenueResponse, productStatsResponse] = await Promise.all([
        api.getAdminStats(),
        api.getRevenueData(),
        api.getProductStats()
      ]);

      // Transform data for reports
      const reportData: ReportData = {
        sales: {
          total: statsResponse.totalRevenue,
          trend: statsResponse.revenueTrend,
          monthly: revenueResponse.map(item => ({
            month: item.month,
            revenue: item.revenue,
            orders: item.orders
          })),
          topProducts: [
            { name: "Kimono Traditional", revenue: 2500000, quantity: 15 },
            { name: "Yukata Summer", revenue: 1800000, quantity: 12 },
            { name: "Hakama Formal", revenue: 1200000, quantity: 8 },
            { name: "Obi Belt", revenue: 800000, quantity: 25 },
            { name: "Geta Sandals", revenue: 600000, quantity: 30 }
          ]
        },
        customers: {
          total: statsResponse.totalUsers,
          new: Math.floor(statsResponse.totalUsers * 0.15),
          active: Math.floor(statsResponse.totalUsers * 0.7),
          topSpenders: [
            { name: "Nguyễn Văn A", email: "nguyenvana@email.com", totalSpent: 5000000, orders: 5 },
            { name: "Trần Thị B", email: "tranthib@email.com", totalSpent: 3500000, orders: 3 },
            { name: "Lê Văn C", email: "levanc@email.com", totalSpent: 2800000, orders: 4 },
            { name: "Phạm Thị D", email: "phamthid@email.com", totalSpent: 2200000, orders: 2 },
            { name: "Hoàng Văn E", email: "hoangvane@email.com", totalSpent: 1800000, orders: 3 }
          ]
        },
        inventory: {
          total: statsResponse.totalProducts,
          lowStock: 5,
          outOfStock: 2,
          byCategory: productStatsResponse.map(item => ({
            category: item.category,
            count: item.count,
            value: item.revenue
          }))
        },
        performance: {
          conversionRate: 3.2,
          averageOrderValue: statsResponse.totalRevenue > 0 && statsResponse.totalOrders > 0 
            ? statsResponse.totalRevenue / statsResponse.totalOrders 
            : 850000,
          customerRetention: 78.5,
          topCategories: [
            { category: "Kimono", revenue: 3500000, percentage: 35 },
            { category: "Yukata", revenue: 2500000, percentage: 25 },
            { category: "Accessories", revenue: 2000000, percentage: 20 },
            { category: "Footwear", revenue: 1500000, percentage: 15 },
            { category: "Others", revenue: 500000, percentage: 5 }
          ]
        }
      };

      setData(reportData);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: language === 'vi' ? "Lỗi tải dữ liệu" : 
               language === 'ja' ? "データ読み込みエラー" : 
               "Error Loading Data",
        description: language === 'vi' ? "Không thể tải dữ liệu báo cáo" :
                     language === 'ja' ? "レポートデータを読み込めませんでした" :
                     "Unable to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const translations = {
    en: {
      title: "Reports & Analytics",
      subtitle: "Comprehensive business insights and performance metrics",
      sales: "Sales",
      customers: "Customers",
      inventory: "Inventory",
      performance: "Performance",
      export: "Export Report",
      refresh: "Refresh",
      timeRange: "Time Range",
      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      totalCustomers: "Total Customers",
      totalProducts: "Total Products",
      newCustomers: "New Customers",
      activeCustomers: "Active Customers",
      lowStockProducts: "Low Stock Products",
      outOfStockProducts: "Out of Stock Products",
      conversionRate: "Conversion Rate",
      averageOrderValue: "Average Order Value",
      customerRetention: "Customer Retention",
      topProducts: "Top Products",
      topSpenders: "Top Spenders",
      topCategories: "Top Categories",
      monthlyRevenue: "Monthly Revenue",
      customerGrowth: "Customer Growth",
      inventoryStatus: "Inventory Status",
      performanceMetrics: "Performance Metrics",
      loading: "Loading report data...",
      noData: "No data available"
    },
    vi: {
      title: "Báo Cáo & Phân Tích",
      subtitle: "Thông tin chi tiết về kinh doanh và chỉ số hiệu suất",
      sales: "Bán Hàng",
      customers: "Khách Hàng",
      inventory: "Tồn Kho",
      performance: "Hiệu Suất",
      export: "Xuất Báo Cáo",
      refresh: "Làm Mới",
      timeRange: "Khoảng Thời Gian",
      totalRevenue: "Tổng Doanh Thu",
      totalOrders: "Tổng Đơn Hàng",
      totalCustomers: "Tổng Khách Hàng",
      totalProducts: "Tổng Sản Phẩm",
      newCustomers: "Khách Hàng Mới",
      activeCustomers: "Khách Hàng Hoạt Động",
      lowStockProducts: "Sản Phẩm Sắp Hết",
      outOfStockProducts: "Sản Phẩm Hết Hàng",
      conversionRate: "Tỷ Lệ Chuyển Đổi",
      averageOrderValue: "Giá Trị Đơn Hàng TB",
      customerRetention: "Tỷ Lệ Giữ Chân",
      topProducts: "Sản Phẩm Bán Chạy",
      topSpenders: "Khách Hàng Chi Tiêu Cao",
      topCategories: "Danh Mục Hàng Đầu",
      monthlyRevenue: "Doanh Thu Hàng Tháng",
      customerGrowth: "Tăng Trưởng Khách Hàng",
      inventoryStatus: "Trạng Thái Tồn Kho",
      performanceMetrics: "Chỉ Số Hiệu Suất",
      loading: "Đang tải dữ liệu báo cáo...",
      noData: "Không có dữ liệu"
    },
    ja: {
      title: "レポート・分析",
      subtitle: "包括的なビジネス洞察とパフォーマンス指標",
      sales: "売上",
      customers: "顧客",
      inventory: "在庫",
      performance: "パフォーマンス",
      export: "レポートエクスポート",
      refresh: "更新",
      timeRange: "期間",
      totalRevenue: "総売上",
      totalOrders: "総注文数",
      totalCustomers: "総顧客数",
      totalProducts: "総商品数",
      newCustomers: "新規顧客",
      activeCustomers: "アクティブ顧客",
      lowStockProducts: "在庫不足商品",
      outOfStockProducts: "在庫切れ商品",
      conversionRate: "コンバージョン率",
      averageOrderValue: "平均注文価値",
      customerRetention: "顧客維持率",
      topProducts: "人気商品",
      topSpenders: "高額顧客",
      topCategories: "人気カテゴリ",
      monthlyRevenue: "月次売上",
      customerGrowth: "顧客成長",
      inventoryStatus: "在庫状況",
      performanceMetrics: "パフォーマンス指標",
      loading: "レポートデータを読み込み中...",
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
              <DownloadIcon className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
            <Button variant="outline" size="sm" onClick={loadReportData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">{t.sales}</TabsTrigger>
            <TabsTrigger value="customers">{t.customers}</TabsTrigger>
            <TabsTrigger value="inventory">{t.inventory}</TabsTrigger>
            <TabsTrigger value="performance">{t.performance}</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            {/* Sales Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.sales.total, language)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(data.sales.trend)}
                    <span className={`ml-1 ${getTrendColor(data.sales.trend)}`}>
                      {Math.abs(data.sales.trend)}% from last period
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
                  <div className="text-2xl font-bold">{data.sales.monthly.reduce((sum, m) => sum + m.orders, 0)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(data.sales.total / Math.max(data.sales.monthly.reduce((sum, m) => sum + m.orders, 0), 1), language)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.sales.trend}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Revenue Chart */}
              <Card>
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
                      <p className="text-muted-foreground">Monthly revenue chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    {t.topProducts}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.sales.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.revenue, language)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            {/* Customer Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalCustomers}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.customers.total.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.newCustomers}</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.customers.new}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activeCustomers}</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{data.customers.active}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.customerRetention}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Customer Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {t.customerGrowth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Customer growth chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Spenders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
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

          <TabsContent value="inventory" className="space-y-4">
            {/* Inventory Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.inventory.total.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.lowStockProducts}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{data.inventory.lowStock}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.outOfStockProducts}</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{data.inventory.outOfStock}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(data.inventory.byCategory.reduce((sum, cat) => sum + cat.value, 0), language)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Inventory Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.inventoryStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Inventory status chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Inventory by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.inventory.byCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.count} products</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.value, language)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {/* Performance Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.conversionRate}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.conversionRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.averageOrderValue}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(data.performance.averageOrderValue, language)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.customerRetention}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.performance.customerRetention}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5%</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Performance Metrics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {t.performanceMetrics}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Performance metrics chart will be implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.topCategories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.performance.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}% of revenue</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.revenue, language)}</div>
                        </div>
                      </div>
                    ))}
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