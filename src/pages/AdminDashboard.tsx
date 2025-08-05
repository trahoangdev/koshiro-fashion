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
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface ProductStats {
  category: string;
  count: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    ordersTrend: 0,
    productsTrend: 0,
    usersTrend: 0,
    revenueTrend: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
    if (savedLanguage) {
      // setLanguage(savedLanguage); // This line is removed as per the edit hint
    }
  }, [navigate]);

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
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
        setStats(statsResponse);
        
        // Load recent orders
        const ordersResponse = await api.getAdminOrders({ page: 1, limit: 5 });
        console.log('Recent orders loaded:', ordersResponse);
        
        // Transform Order data to RecentOrder format
        const transformedOrders: RecentOrder[] = ordersResponse.data.map(order => ({
          id: order.orderNumber,
          customer: order.userId?.name || 'Unknown Customer',
          total: order.totalAmount,
          status: order.status
        }));
        
        setRecentOrders(transformedOrders);
        
        // Load revenue data for chart
        const revenueResponse = await api.getRevenueData();
        setRevenueData(revenueResponse);
        
        // Load product statistics
        const productStatsResponse = await api.getProductStats();
        setProductStats(productStatsResponse);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: t('errorLoading'),
          description: t('errorLoading'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [toast, t]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('pending'), class: "bg-yellow-100 text-yellow-800" },
      processing: { label: t('processing'), class: "bg-blue-100 text-blue-800" },
      completed: { label: t('completed'), class: "bg-green-100 text-green-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  // Simple Revenue Chart Component
  const RevenueChart = ({ data }: { data: RevenueData[] }) => {
    if (data.length === 0) {
      return (
        <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm sm:text-base">
          {t('noData')}
        </div>
      );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const maxHeight = 120; // Reduced height for mobile

    return (
      <div className="h-48 sm:h-64 flex items-end justify-between space-x-1 p-2 sm:p-4">
        {data.map((item, index) => {
          const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * maxHeight : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1 sm:mb-2 text-center">
                {formatCurrencyForDisplay(item.revenue)}
              </div>
              <div 
                className="w-full bg-primary rounded-t min-h-[4px]"
                style={{ height: `${Math.max(height, 4)}px` }}
              />
              <div className="text-xs text-muted-foreground mt-1 sm:mt-2 text-center truncate w-full">
                {item.month}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Simple Product Stats Chart Component
  const ProductStatsChart = ({ data }: { data: ProductStats[] }) => {
    if (data.length === 0) {
      return (
        <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm sm:text-base">
          {t('noData')}
        </div>
      );
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    return (
      <div className="h-48 sm:h-64 space-y-2 sm:space-y-3 p-2 sm:p-4 overflow-y-auto">
        {data.map((item, index) => {
          const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
          return (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span className="text-xs sm:text-sm font-medium truncate">{item.category}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xs sm:text-sm font-medium">
                  {formatCurrencyForDisplay(item.revenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.count} {t('products')} ({percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t('dashboard')}</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('orders')}</CardTitle>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalOrders}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">+{stats.ordersTrend}% {t('fromLastMonth')}</span>
                <span className="sm:hidden">+{stats.ordersTrend}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('products')}</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalProducts}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">+{stats.productsTrend}% {t('fromLastMonth')}</span>
                <span className="sm:hidden">+{stats.productsTrend}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('users')}</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">+{stats.usersTrend}% {t('fromLastMonth')}</span>
                <span className="sm:hidden">+{stats.usersTrend}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('revenue')}</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrencyForDisplay(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">+{stats.revenueTrend}% {t('fromLastMonth')}</span>
                <span className="sm:hidden">+{stats.revenueTrend}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t('revenueChart')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm sm:text-base">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {t('productStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <ProductStatsChart data={productStats} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">{t('recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                  {t('noOrders')}
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{order.id}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                      <div className="text-right">
                        <span className="font-medium text-sm sm:text-base">{formatCurrencyForDisplay(order.total)}</span>
                        <div className="mt-1 sm:mt-0">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            className="h-16 sm:h-20 flex flex-col p-2"
            onClick={() => navigate("/admin/products")}
          >
            <Package className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm">{t('manageProducts')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 sm:h-20 flex flex-col p-2"
            onClick={() => navigate("/admin/categories")}
          >
            <Tag className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm">{t('manageCategories')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 sm:h-20 flex flex-col p-2"
            onClick={() => navigate("/admin/orders")}
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm">{t('manageOrders')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 sm:h-20 flex flex-col p-2"
            onClick={() => navigate("/admin/users")}
          >
            <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm">{t('manageUsers')}</span>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}