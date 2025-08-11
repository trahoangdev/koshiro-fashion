import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Order } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar,
  Loader2
} from "lucide-react";

const OrderTrackingPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoading(true);
    try {
      const order = await api.trackOrder(orderNumber);
      setOrder(order);
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: language === 'vi' ? "Lỗi tìm kiếm" : 
               language === 'ja' ? "検索エラー" : 
               "Search Error",
        description: language === 'vi' ? "Không thể tìm thấy đơn hàng" :
                     language === 'ja' ? "注文が見つかりませんでした" :
                     "Order not found",
        variant: "destructive",
      });
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <Clock className="h-6 w-6 text-red-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return language === 'vi' ? 'Chờ xử lý' : language === 'ja' ? '処理待ち' : 'Pending';
      case 'processing':
        return language === 'vi' ? 'Đang xử lý' : language === 'ja' ? '処理中' : 'Processing';
      case 'completed':
        return language === 'vi' ? 'Hoàn thành' : language === 'ja' ? '完了' : 'Completed';
      case 'cancelled':
        return language === 'vi' ? 'Đã hủy' : language === 'ja' ? 'キャンセル' : 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translations = {
    en: {
      title: "Order Tracking",
      subtitle: "Track your order status",
      searchPlaceholder: "Enter order number...",
      search: "Track Order",
      orderDetails: "Order Details",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      status: "Status",
      total: "Total",
      items: "Items",
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status",
      noOrder: "No order found",
      noOrderDesc: "Enter an order number to track your order",
      loading: "Searching...",
      notFound: "Order not found",
      notFoundDesc: "Please check your order number and try again"
    },
    vi: {
      title: "Theo Dõi Đơn Hàng",
      subtitle: "Kiểm tra trạng thái đơn hàng của bạn",
      searchPlaceholder: "Nhập số đơn hàng...",
      search: "Theo Dõi",
      orderDetails: "Chi Tiết Đơn Hàng",
      orderNumber: "Số Đơn Hàng",
      orderDate: "Ngày Đặt",
      status: "Trạng Thái",
      total: "Tổng Cộng",
      items: "Sản Phẩm",
      shippingAddress: "Địa Chỉ Giao Hàng",
      paymentMethod: "Phương Thức Thanh Toán",
      paymentStatus: "Trạng Thái Thanh Toán",
      noOrder: "Chưa có đơn hàng",
      noOrderDesc: "Nhập số đơn hàng để theo dõi",
      loading: "Đang tìm kiếm...",
      notFound: "Không tìm thấy đơn hàng",
      notFoundDesc: "Vui lòng kiểm tra số đơn hàng và thử lại"
    },
    ja: {
      title: "注文追跡",
      subtitle: "注文の状況を確認",
      searchPlaceholder: "注文番号を入力...",
      search: "追跡",
      orderDetails: "注文詳細",
      orderNumber: "注文番号",
      orderDate: "注文日",
      status: "状況",
      total: "合計",
      items: "商品",
      shippingAddress: "配送先住所",
      paymentMethod: "支払い方法",
      paymentStatus: "支払い状況",
      noOrder: "注文が見つかりません",
      noOrderDesc: "注文番号を入力して注文を追跡してください",
      loading: "検索中...",
      notFound: "注文が見つかりません",
      notFoundDesc: "注文番号を確認して再試行してください"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">{t.search}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Details */}
          {order && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t.orderDetails}</CardTitle>
                    <p className="text-muted-foreground">{order.orderNumber}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{getStatusText(order.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t.orderNumber}</h4>
                    <p className="text-muted-foreground">{order.orderNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t.orderDate}</h4>
                    <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t.total}</h4>
                    <p className="text-muted-foreground">{order.totalAmount.toLocaleString()} VND</p>
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-4">{t.items}</h4>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.productId?.images?.[0] || '/placeholder.svg'}
                          alt={item.productId?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.productId?.name || 'Unknown Product'}</h5>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {item.price.toLocaleString()} VND
                          </p>
                          {item.size && (
                            <p className="text-sm text-muted-foreground">
                              Size: {item.size}
                            </p>
                          )}
                          {item.color && (
                            <p className="text-sm text-muted-foreground">
                              Color: {item.color}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.shippingAddress}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.district}, {order.shippingAddress.city}</p>
                      <p>{order.shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">{t.paymentMethod}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{order.paymentMethod}</p>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {order.paymentStatus === 'paid' ? 
                        (language === 'vi' ? 'Đã thanh toán' : language === 'ja' ? '支払い済み' : 'Paid') :
                        (language === 'vi' ? 'Chưa thanh toán' : language === 'ja' ? '未払い' : 'Pending')
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Order State */}
          {!order && !isLoading && (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{t.noOrder}</h2>
              <p className="text-muted-foreground">{t.noOrderDesc}</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTrackingPage; 