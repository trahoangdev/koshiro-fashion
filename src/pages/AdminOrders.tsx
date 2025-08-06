import { useState, useEffect } from "react";
import { 
  Search,
  Filter,
  Eye,
  Package,
  Loader2,
  Calendar,
  User,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Printer,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Plus
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Order, User as UserType, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";
import OrderDetailDialog from "@/components/OrderDetailDialog";
import OrderForm from "@/components/OrderForm";
import { api } from "@/lib/api";

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function AdminOrders() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { language } = useLanguage();

  const translations = {
    vi: {
      title: "Quản lý Đơn hàng",
      subtitle: "Quản lý tất cả đơn hàng và theo dõi trạng thái",
      searchPlaceholder: "Tìm kiếm đơn hàng, khách hàng...",
      filterByStatus: "Lọc theo trạng thái",
      filterByPayment: "Lọc theo thanh toán",
      filterByDate: "Lọc theo ngày",
      sortBy: "Sắp xếp theo",
      allStatuses: "Tất cả trạng thái",
      allPaymentStatuses: "Tất cả thanh toán",
      allDates: "Tất cả thời gian",
      orderNumber: "Mã đơn hàng",
      customer: "Khách hàng",
      total: "Tổng tiền",
      status: "Trạng thái",
      paymentStatus: "Thanh toán",
      date: "Ngày đặt",
      actions: "Thao tác",
      view: "Xem chi tiết",
      edit: "Chỉnh sửa",
      print: "In đơn hàng",
      email: "Gửi email",
      updateStatus: "Cập nhật trạng thái",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đã gửi hàng",
      delivered: "Đã giao hàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      paid: "Đã thanh toán",
      unpaid: "Chưa thanh toán",
      failed: "Thanh toán thất bại",
      noOrders: "Không tìm thấy đơn hàng nào",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách đơn hàng",
      bulkActions: "Thao tác hàng loạt",
      selectAll: "Chọn tất cả",
      deselectAll: "Bỏ chọn tất cả",
      export: "Xuất dữ liệu",
      refresh: "Làm mới",
      today: "Hôm nay",
      thisWeek: "Tuần này",
      thisMonth: "Tháng này",
      lastMonth: "Tháng trước",
      custom: "Tùy chỉnh",
      orderDate: "Ngày đặt"
    },
    en: {
      title: "Order Management",
      subtitle: "Manage all orders and track their status",
      searchPlaceholder: "Search orders, customers...",
      filterByStatus: "Filter by status",
      filterByPayment: "Filter by payment",
      filterByDate: "Filter by date",
      sortBy: "Sort by",
      allStatuses: "All statuses",
      allPaymentStatuses: "All payment statuses",
      allDates: "All time",
      orderNumber: "Order Number",
      customer: "Customer",
      total: "Total",
      status: "Status",
      paymentStatus: "Payment Status",
      date: "Date",
      actions: "Actions",
      view: "View Details",
      edit: "Edit",
      print: "Print Order",
      email: "Send Email",
      updateStatus: "Update Status",
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      paid: "Paid",
      unpaid: "Unpaid",
      failed: "Payment Failed",
      noOrders: "No orders found",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load order list",
      bulkActions: "Bulk Actions",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      export: "Export",
      refresh: "Refresh",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      custom: "Custom",
      orderDate: "Order Date"
    },
    ja: {
      title: "注文管理",
      subtitle: "すべての注文を管理し、ステータスを追跡",
      searchPlaceholder: "注文、顧客を検索...",
      filterByStatus: "ステータスで絞り込み",
      filterByPayment: "支払いで絞り込み",
      filterByDate: "日付で絞り込み",
      sortBy: "並び替え",
      allStatuses: "すべてのステータス",
      allPaymentStatuses: "すべての支払いステータス",
      allDates: "すべての期間",
      orderNumber: "注文番号",
      customer: "顧客",
      total: "合計",
      status: "ステータス",
      paymentStatus: "支払いステータス",
      date: "日付",
      actions: "操作",
      view: "詳細を見る",
      edit: "編集",
      print: "注文を印刷",
      email: "メール送信",
      updateStatus: "ステータス更新",
      pending: "保留中",
      processing: "処理中",
      shipped: "発送済み",
      delivered: "配達済み",
      completed: "完了",
      cancelled: "キャンセル",
      paid: "支払い済み",
      unpaid: "未払い",
      failed: "支払い失敗",
      noOrders: "注文が見つかりません",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "注文リストを読み込めませんでした",
      bulkActions: "一括操作",
      selectAll: "すべて選択",
      deselectAll: "選択解除",
      export: "エクスポート",
      refresh: "更新",
      today: "今日",
      thisWeek: "今週",
      thisMonth: "今月",
      lastMonth: "先月",
      custom: "カスタム",
      orderDate: "注文日"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, selectedStatus, selectedPaymentStatus, dateRange, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
        api.getAdminOrders({ page: 1, limit: 100 }),
        api.getAdminUsers({ page: 1, limit: 1000 }),
        api.getAdminProducts({ page: 1, limit: 1000 })
      ]);
      
      setOrders(ordersResponse.data);
      setUsers(usersResponse.data);
      setProducts(productsResponse.data);
      
      // Calculate stats
      const orderStats: OrderStats = {
        total: ordersResponse.data.length,
        pending: ordersResponse.data.filter(o => o.status === 'pending').length,
        processing: ordersResponse.data.filter(o => o.status === 'processing').length,
        completed: ordersResponse.data.filter(o => o.status === 'completed').length,
        cancelled: ordersResponse.data.filter(o => o.status === 'cancelled').length,
        totalRevenue: ordersResponse.data.reduce((sum, o) => sum + o.totalAmount, 0),
        averageOrderValue: ordersResponse.data.length > 0 
          ? ordersResponse.data.reduce((sum, o) => sum + o.totalAmount, 0) / ordersResponse.data.length 
          : 0
      };
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: t.errorLoading,
        description: t.errorLoadingDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by payment status
    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      const orderDate = new Date();
      
      switch (dateRange) {
        case "today":
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case "thisWeek": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= weekAgo;
          });
          break;
        }
        case "thisMonth": {
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= monthAgo;
          });
          break;
        }
        case "lastMonth": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= lastMonth && orderDate < thisMonth;
          });
          break;
        }
      }
    }

    // Sort orders
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "orderNumber":
          aValue = a.orderNumber;
          bValue = b.orderNumber;
          break;
        case "totalAmount":
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case "customerName":
          aValue = a.userId?.name || "";
          bValue = b.userId?.name || "";
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await api.updateOrder(orderId, { status: newStatus as 'pending' | 'processing' | 'completed' | 'cancelled' });
      toast({
        title: "Status updated successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await Promise.all(selectedOrders.map(id => api.updateOrder(id, { status: newStatus as 'pending' | 'processing' | 'completed' | 'cancelled' })));
      toast({
        title: `${selectedOrders.length} orders updated successfully`,
      });
      setSelectedOrders([]);
      loadData();
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      toast({
        title: "Error updating orders",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t.pending, variant: "secondary" as const, icon: Clock },
      processing: { label: t.processing, variant: "default" as const, icon: Package },
      shipped: { label: t.shipped, variant: "default" as const, icon: Truck },
      delivered: { label: t.delivered, variant: "default" as const, icon: CheckCircle },
      completed: { label: t.completed, variant: "default" as const, icon: CheckCircle },
      cancelled: { label: t.cancelled, variant: "destructive" as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: t.paid, variant: "default" as const },
      unpaid: { label: t.unpaid, variant: "secondary" as const },
      failed: { label: t.failed, variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US'
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o._id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrderForDetail(order);
    setIsDetailDialogOpen(true);
  };

  const handleOrderDetailClose = () => {
    setIsDetailDialogOpen(false);
    setSelectedOrderForDetail(null);
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled');
      toast({
        title: t.updateStatus,
        description: "Order status updated successfully",
      });
      loadData(); // Reload data
    } catch (error) {
      toast({
        title: t.updateStatus,
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleCreateOrder = async (formData: {
    userId: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      size?: string;
      color?: string;
    }>;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
    paymentMethod: string;
    notes?: string;
    trackingNumber?: string;
  }) => {
    try {
      setIsSubmitting(true);
      await api.createOrder(formData);
      toast({
        title: "Create Order",
        description: "Order created successfully",
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Create Order",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrder = async (formData: {
    userId: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      size?: string;
      color?: string;
    }>;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
    paymentMethod: string;
    notes?: string;
    trackingNumber?: string;
  }) => {
    if (!editingOrder) return;
    
    try {
      setIsSubmitting(true);
      await api.updateOrder(editingOrder._id, {
        status: formData.status as 'pending' | 'processing' | 'completed' | 'cancelled',
        paymentStatus: formData.paymentStatus
      });
      toast({
        title: "Edit Order",
        description: "Order updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      loadData();
    } catch (error) {
      toast({
        title: "Edit Order",
        description: "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Note: deleteOrder API method doesn't exist yet, using cancelOrder instead
      await api.cancelOrderAdmin(orderId);
      toast({
        title: "Delete Order",
        description: "Order deleted successfully",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Delete Order",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingOrder(null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrencyForDisplay(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrencyForDisplay(stats.averageOrderValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStatuses}</SelectItem>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="processing">{t.processing}</SelectItem>
                    <SelectItem value="shipped">{t.shipped}</SelectItem>
                    <SelectItem value="delivered">{t.delivered}</SelectItem>
                    <SelectItem value="completed">{t.completed}</SelectItem>
                    <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByPayment} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allPaymentStatuses}</SelectItem>
                    <SelectItem value="paid">{t.paid}</SelectItem>
                    <SelectItem value="unpaid">{t.unpaid}</SelectItem>
                    <SelectItem value="failed">{t.failed}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.filterByDate} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allDates}</SelectItem>
                    <SelectItem value="today">{t.today}</SelectItem>
                    <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                    <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                    <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">{t.orderDate}</SelectItem>
                                            <SelectItem value="totalAmount">{t.total}</SelectItem>
                        <SelectItem value="customerName">{t.customer}</SelectItem>
                    <SelectItem value="status">{t.status}</SelectItem>
                    <SelectItem value="orderNumber">{t.orderNumber}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedOrders.length} orders selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedOrders.length === filteredOrders.length ? t.deselectAll : t.selectAll}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('pending')}>
                        {t.pending}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processing')}>
                        {t.processing}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shipped')}>
                        {t.shipped}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusUpdate('completed')}>
                        {t.completed}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4">{t.orderNumber}</th>
                    <th className="text-left p-4">{t.customer}</th>
                    <th className="text-left p-4">{t.total}</th>
                    <th className="text-left p-4">{t.status}</th>
                    <th className="text-left p-4">{t.paymentStatus}</th>
                    <th className="text-left p-4">{t.date}</th>
                    <th className="text-left p-4">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedOrders.includes(order._id)}
                          onCheckedChange={() => handleSelectOrder(order._id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} items
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{order.userId?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{order.userId?.email}</div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrencyForDisplay(order.totalAmount)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrderDetail(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              {t.print}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              {t.email}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order._id, 'pending')}>
                              {t.pending}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order._id, 'processing')}>
                              {t.processing}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}>
                              {t.shipped}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order._id, 'completed')}>
                              {t.completed}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noOrders}</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all" || dateRange !== "all"
                  ? "Try adjusting your filters"
                  : "No orders have been placed yet"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order Detail Dialog */}
        {selectedOrderForDetail && (
          <OrderDetailDialog
            order={selectedOrderForDetail}
            isOpen={isDetailDialogOpen}
            onClose={handleOrderDetailClose}
            onUpdateStatus={handleOrderStatusUpdate}
            onEdit={openEditDialog}
            onDelete={handleDeleteOrder}
            onPrint={(order) => {
              // TODO: Implement print functionality
              console.log('Print order:', order);
            }}
            onSendEmail={(order) => {
              // TODO: Implement email functionality
              console.log('Send email for order:', order);
            }}
          />
        )}

        {/* Create Order Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <OrderForm
              users={users}
              products={products}
              onSubmit={handleCreateOrder}
              onCancel={closeCreateDialog}
              isSubmitting={isSubmitting}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        {editingOrder && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <OrderForm
                initialData={editingOrder}
                users={users}
                products={products}
                onSubmit={handleEditOrder}
                onCancel={closeEditDialog}
                isSubmitting={isSubmitting}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}