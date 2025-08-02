import { useState, useEffect } from "react";
import { 
  Search,
  Filter,
  Eye,
  Package,
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
import { Order } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

export default function AdminOrders() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  const translations = {
    vi: {
      title: "Quản lý Đơn hàng",
      subtitle: "Quản lý tất cả đơn hàng",
      searchPlaceholder: "Tìm kiếm đơn hàng...",
      filterByStatus: "Lọc theo trạng thái",
      allStatuses: "Tất cả trạng thái",
      orderNumber: "Mã đơn hàng",
      customer: "Khách hàng",
      total: "Tổng tiền",
      status: "Trạng thái",
      date: "Ngày đặt",
      actions: "Thao tác",
      view: "Xem chi tiết",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đã gửi hàng",
      delivered: "Đã giao hàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      noOrders: "Không tìm thấy đơn hàng nào",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách đơn hàng"
    },
    en: {
      title: "Order Management",
      subtitle: "Manage all orders",
      searchPlaceholder: "Search orders...",
      filterByStatus: "Filter by status",
      allStatuses: "All statuses",
      orderNumber: "Order Number",
      customer: "Customer",
      total: "Total",
      status: "Status",
      date: "Date",
      actions: "Actions",
      view: "View Details",
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      noOrders: "No orders found",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load order list"
    },
    ja: {
      title: "注文管理",
      subtitle: "すべての注文を管理",
      searchPlaceholder: "注文を検索...",
      filterByStatus: "ステータスで絞り込み",
      allStatuses: "すべてのステータス",
      orderNumber: "注文番号",
      customer: "顧客",
      total: "合計",
      status: "ステータス",
      date: "日付",
      actions: "操作",
      view: "詳細を見る",
      pending: "保留中",
      processing: "処理中",
      shipped: "発送済み",
      delivered: "配達済み",
      completed: "完了",
      cancelled: "キャンセル",
      noOrders: "注文が見つかりません",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "注文リストを読み込めませんでした"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Load language preference


  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading admin orders data...');
        
        const ordersResponse = await api.getAdminOrders({ page: 1, limit: 50 });
        console.log('Orders response:', ordersResponse);
        
        const ordersData = ordersResponse.data || [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        
      } catch (error) {
        console.error('Error loading admin orders data:', error);
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

  // Filter orders
  useEffect(() => {
    let filtered = orders;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, selectedStatus, orders]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: t.pending },
      processing: { variant: "default" as const, label: t.processing },
      shipped: { variant: "default" as const, label: t.shipped },
      delivered: { variant: "default" as const, label: t.delivered },
      completed: { variant: "default" as const, label: t.completed },
      cancelled: { variant: "destructive" as const, label: t.cancelled }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
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
        </div>

        {/* Orders Grid */}
        <div className="grid gap-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.noOrders}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.userId?.name} ({order.userId?.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Items: {order.items?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrencyForDisplay(order.totalAmount)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement order details view
                            console.log('View order details:', order._id);
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