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
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    trend: number;
    monthly: Array<{ month: string; revenue: number; orders: number }>;
    daily: Array<{ date: string; revenue: number; orders: number }>;
    byCategory: Array<{ category: string; revenue: number; percentage: number }>;
  };
  orders: {
    total: number;
    trend: number;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
    byMonth: Array<{ month: string; orders: number; revenue: number }>;
    byHour: Array<{ hour: string; orders: number }>;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    byCategory: Array<{ category: string; count: number; revenue: number }>;
    topSelling: Array<{ name: string; sales: number; revenue: number; stock: number }>;
    performance: Array<{ name: string; views: number; sales: number; rating: number }>;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
    byLocation: Array<{ location: string; customers: number; revenue: number }>;
    activity: Array<{ date: string; newCustomers: number; activeCustomers: number }>;
  };
  sales: {
    total: number;
    average: number;
    byPaymentMethod: Array<{ method: string; count: number; amount: number }>;
    conversionRate: number;
    cartAbandonment: number;
  };
}

const CHART_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#06B6D4", "#F97316", "#84CC16",
  "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"
];

export default function AdminAnalytics() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [data, setData] = useState<AnalyticsData>({
    revenue: { total: 0, trend: 0, monthly: [], daily: [], byCategory: [] },
    orders: { total: 0, trend: 0, byStatus: [], byMonth: [], byHour: [] },
    products: { total: 0, active: 0, lowStock: 0, byCategory: [], topSelling: [], performance: [] },
    customers: { total: 0, active: 0, newThisMonth: 0, topSpenders: [], byLocation: [], activity: [] },
    sales: { total: 0, average: 0, byPaymentMethod: [], conversionRate: 0, cartAbandonment: 0 }
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
        
        // Load all analytics data from API
        const [
          statsResponse, 
          revenueResponse, 
          productStatsResponse,
          orderAnalyticsResponse,
          customerAnalyticsResponse,
          salesAnalyticsResponse,
          productAnalyticsResponse,
          dailyRevenueResponse
        ] = await Promise.all([
          api.getAdminStats(),
          api.getRevenueData(),
          api.getProductStats(),
          api.getOrderAnalytics(),
          api.getCustomerAnalytics(),
          api.getSalesAnalytics(),
          api.getProductAnalytics(),
          api.getDailyRevenueData(30)
        ]);

        // Transform data for analytics
        const analyticsData: AnalyticsData = {
          revenue: {
            total: statsResponse.totalRevenue || 0,
            trend: statsResponse.revenueTrend || 0,
            monthly: revenueResponse || [],
            daily: dailyRevenueResponse || [],
            byCategory: productStatsResponse.map(item => ({
              category: item.category,
              revenue: item.revenue,
              percentage: 0 // Will be calculated below
            }))
          },
          orders: {
            total: statsResponse.totalOrders || 0,
            trend: statsResponse.ordersTrend || 0,
            byStatus: orderAnalyticsResponse?.byStatus || [],
            byMonth: orderAnalyticsResponse?.byMonth || [],
            byHour: orderAnalyticsResponse?.byHour || []
          },
          products: {
            total: statsResponse.totalProducts || 0,
            active: statsResponse.totalProducts || 0, // Assuming all products are active
            lowStock: productAnalyticsResponse?.lowStock?.length || 0,
            byCategory: productStatsResponse.map(item => ({
              category: item.category,
              count: item.count,
              revenue: item.revenue
            })),
            topSelling: productAnalyticsResponse?.topSelling || [],
            performance: productAnalyticsResponse?.performance || []
          },
          customers: {
            total: statsResponse.totalUsers || 0,
            active: statsResponse.totalUsers || 0, // Assuming all users are active
            newThisMonth: 0, // Will be calculated from customer activity
            topSpenders: customerAnalyticsResponse?.topSpenders || [],
            byLocation: customerAnalyticsResponse?.byLocation || [],
            activity: customerAnalyticsResponse?.activity || []
          },
          sales: {
            total: statsResponse.totalRevenue || 0,
            average: salesAnalyticsResponse?.averageOrderValue || 0,
            byPaymentMethod: salesAnalyticsResponse?.byPaymentMethod || [],
            conversionRate: salesAnalyticsResponse?.conversionRate || 0,
            cartAbandonment: salesAnalyticsResponse?.cartAbandonment || 0
          }
        };

        // Calculate percentages for revenue by category
        const totalRevenue = analyticsData.revenue.total;
        if (totalRevenue > 0) {
          analyticsData.revenue.byCategory = analyticsData.revenue.byCategory.map(item => ({
            ...item,
            percentage: Math.round((item.revenue / totalRevenue) * 100)
          }));
        }

        // Calculate new customers this month from activity data
        if (analyticsData.customers.activity.length > 0) {
          const last30Days = analyticsData.customers.activity.slice(-30);
          analyticsData.customers.newThisMonth = last30Days.reduce((sum, day) => sum + day.newCustomers, 0);
        }

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
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      noData: "No data available",
      revenueTrend: "Revenue Trend",
      orderAnalytics: "Order Analytics",
      customerBehavior: "Customer Behavior",
      productPerformance: "Product Performance",
      salesAnalytics: "Sales Analytics",
      conversionRate: "Conversion Rate",
      cartAbandonment: "Cart Abandonment",
      averageOrderValue: "Average Order Value",
      paymentMethods: "Payment Methods",
      customerLocations: "Customer Locations",
      topProducts: "Top Selling Products",
      productViews: "Product Views vs Sales",
      hourlyOrders: "Orders by Hour",
      dailyActivity: "Daily Customer Activity"
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
      noData: "Không có dữ liệu",
      revenueTrend: "Xu Hướng Doanh Thu",
      orderAnalytics: "Phân Tích Đơn Hàng",
      customerBehavior: "Hành Vi Khách Hàng",
      productPerformance: "Hiệu Suất Sản Phẩm",
      salesAnalytics: "Phân Tích Bán Hàng",
      conversionRate: "Tỷ Lệ Chuyển Đổi",
      cartAbandonment: "Tỷ Lệ Bỏ Giỏ Hàng",
      averageOrderValue: "Giá Trị Đơn Hàng Trung Bình",
      paymentMethods: "Phương Thức Thanh Toán",
      customerLocations: "Vị Trí Khách Hàng",
      topProducts: "Sản Phẩm Bán Chạy",
      productViews: "Lượt Xem vs Bán Hàng",
      hourlyOrders: "Đơn Hàng Theo Giờ",
      dailyActivity: "Hoạt Động Khách Hàng Hàng Ngày"
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
      noData: "データがありません",
      revenueTrend: "売上トレンド",
      orderAnalytics: "注文分析",
      customerBehavior: "顧客行動",
      productPerformance: "商品パフォーマンス",
      salesAnalytics: "売上分析",
      conversionRate: "コンバージョン率",
      cartAbandonment: "カート放棄率",
      averageOrderValue: "平均注文価値",
      paymentMethods: "支払い方法",
      customerLocations: "顧客所在地",
      topProducts: "人気商品",
      productViews: "商品閲覧 vs 売上",
      hourlyOrders: "時間別注文",
      dailyActivity: "日次顧客アクティビティ"
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
              {/* Revenue Trend Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {t.revenueTrend}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                        name="Revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {t.orderStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={data.orders.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) => `${status} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.orders.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Categories Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    {t.productCategories}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.products.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#10B981" name="Products" />
                    </BarChart>
                  </ResponsiveContainer>
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
              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.revenueTrend}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.revenue.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders by Hour */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.hourlyOrders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.orders.byHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.dailyActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data.customers.activity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="newCustomers" fill="#EF4444" name="New Customers" />
                      <Line type="monotone" dataKey="activeCustomers" stroke="#10B981" strokeWidth={2} name="Active Customers" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.paymentMethods}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={data.sales.byPaymentMethod}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }) => `${method} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {data.sales.byPaymentMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Performance Radar Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t.productPerformance}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={data.products.performance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Views"
                        dataKey="views"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Sales"
                        dataKey="sales"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sales Metrics */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t.salesAnalytics}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{data.sales.conversionRate}%</div>
                      <div className="text-sm text-muted-foreground">{t.conversionRate}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{data.sales.cartAbandonment}%</div>
                      <div className="text-sm text-muted-foreground">{t.cartAbandonment}</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.sales.average, language)}</div>
                      <div className="text-sm text-muted-foreground">{t.averageOrderValue}</div>
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
