import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api, Order } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from "lucide-react";
import { Link } from "react-router-dom";

const ProfileOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserOrders();
        // Handle different response structures
        let ordersData: Order[] = [];
        if (Array.isArray(response)) {
          ordersData = response;
        } else if (response && typeof response === 'object') {
          // Check if it's a pagination response
          if ('data' in response && Array.isArray(response.data)) {
            ordersData = response.data;
          } else if ('orders' in response && Array.isArray(response.orders)) {
            ordersData = response.orders;
          }
        }
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        });
        setOrders([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const translations = {
    en: {
      title: "Order History",
      subtitle: "Track your orders and their status",
      noOrders: "No orders yet",
      noOrdersDesc: "Start shopping to see your order history here",
      startShopping: "Start Shopping",
      orderNumber: "Order #",
      orderDate: "Order Date",
      total: "Total",
      status: "Status",
      items: "items",
      viewDetails: "View Details",
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status"
    },
    vi: {
      title: "Lịch Sử Đơn Hàng",
      subtitle: "Theo dõi đơn hàng và trạng thái của chúng",
      noOrders: "Chưa có đơn hàng nào",
      noOrdersDesc: "Bắt đầu mua sắm để xem lịch sử đơn hàng ở đây",
      startShopping: "Bắt Đầu Mua Sắm",
      orderNumber: "Đơn Hàng #",
      orderDate: "Ngày Đặt",
      total: "Tổng Tiền",
      status: "Trạng Thái",
      items: "sản phẩm",
      viewDetails: "Xem Chi Tiết",
      shippingAddress: "Địa Chỉ Giao Hàng",
      paymentMethod: "Phương Thức Thanh Toán",
      paymentStatus: "Trạng Thái Thanh Toán"
    },
    ja: {
      title: "注文履歴",
      subtitle: "注文とその状況を追跡",
      noOrders: "注文はまだありません",
      noOrdersDesc: "ショッピングを始めて、ここで注文履歴を確認してください",
      startShopping: "ショッピングを始める",
      orderNumber: "注文番号 #",
      orderDate: "注文日",
      total: "合計",
      status: "状況",
      items: "商品",
      viewDetails: "詳細を見る",
      shippingAddress: "配送先住所",
      paymentMethod: "支払い方法",
      paymentStatus: "支払い状況"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">{t.noOrders}</h2>
        <p className="text-muted-foreground mb-8">{t.noOrdersDesc}</p>
        <Link to="/">
          <Button size="lg">{t.startShopping}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="space-y-4">
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="font-semibold">
                        {t.orderNumber}{order.orderNumber}
                      </span>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t.orderDate}</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={item.productId.images[0]}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t.shippingAddress}
                    </p>
                    <div className="text-sm">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t.paymentMethod}
                    </p>
                    <p className="text-sm">{order.paymentMethod}</p>
                    
                    <p className="text-sm font-medium text-muted-foreground mb-1 mt-2">
                      {t.paymentStatus}
                    </p>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">{t.total}</p>
                    <p className="text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} {t.items}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    {t.viewDetails}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.noOrders}</h3>
            <p className="text-muted-foreground">{t.noOrdersDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOrders; 