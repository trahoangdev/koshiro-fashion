import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { Order } from "@/lib/api";

interface OrderStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface OrderDetails {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  shippingMethod: string;
  trackingNumber?: string;
  timeline: OrderStatus[];
}

const OrderTracking = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { id: orderIdFromUrl } = useParams();
  const navigate = useNavigate();
  
  const [searchType, setSearchType] = useState<'orderId' | 'email'>('orderId');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [error, setError] = useState('');

  // Mock data for Header component
  const mockCartItemsCount = 0;
  const mockOnSearch = (query: string) => {
    console.log('Search query:', query);
  };

  // Auto-load order if ID is in URL
  useEffect(() => {
    if (orderIdFromUrl) {
      setSearchValue(orderIdFromUrl);
      setSearchType('orderId');
      handleSearch(orderIdFromUrl);
    }
  }, [orderIdFromUrl]);

  const translations = {
    en: {
      title: "Order Tracking",
      subtitle: "Track your order status and delivery progress",
      searchByOrderId: "Search by Order ID",
      searchByEmail: "Search by Email",
      orderIdPlaceholder: "Enter your order ID (e.g., ORD-2024-001)",
      emailPlaceholder: "Enter your email address",
      searchButton: "Track Order",
      orderNotFound: "Order not found. Please check your order ID or email.",
      orderDetails: "Order Details",
      orderStatus: "Order Status",
      customerInfo: "Customer Information",
      orderItems: "Order Items",
      deliveryInfo: "Delivery Information",
      estimatedDelivery: "Estimated Delivery",
      shippingMethod: "Shipping Method",
      trackingNumber: "Tracking Number",
      total: "Total",
             status: {
         pending: "Pending",
         processing: "Processing",
         completed: "Completed",
         cancelled: "Cancelled"
       },
       statusDescription: {
         pending: "Your order has been placed and is waiting for confirmation",
         processing: "Your order is being processed and prepared for shipping",
         completed: "Your order has been delivered successfully",
         cancelled: "Your order has been cancelled"
       }
    },
    vi: {
      title: "Theo Dõi Đơn Hàng",
      subtitle: "Theo dõi trạng thái đơn hàng và tiến trình giao hàng",
      searchByOrderId: "Tìm kiếm theo Mã Đơn Hàng",
      searchByEmail: "Tìm kiếm theo Email",
      orderIdPlaceholder: "Nhập mã đơn hàng (ví dụ: ORD-2024-001)",
      emailPlaceholder: "Nhập địa chỉ email của bạn",
      searchButton: "Theo Dõi Đơn Hàng",
      orderNotFound: "Không tìm thấy đơn hàng. Vui lòng kiểm tra mã đơn hàng hoặc email.",
      orderDetails: "Chi Tiết Đơn Hàng",
      orderStatus: "Trạng Thái Đơn Hàng",
      customerInfo: "Thông Tin Khách Hàng",
      orderItems: "Sản Phẩm Đặt Hàng",
      deliveryInfo: "Thông Tin Giao Hàng",
      estimatedDelivery: "Dự Kiến Giao Hàng",
      shippingMethod: "Phương Thức Giao Hàng",
      trackingNumber: "Mã Theo Dõi",
      total: "Tổng Cộng",
             status: {
         pending: "Chờ Xử Lý",
         processing: "Đang Xử Lý",
         completed: "Hoàn Thành",
         cancelled: "Đã Hủy"
       },
       statusDescription: {
         pending: "Đơn hàng của bạn đã được đặt và đang chờ xác nhận",
         processing: "Đơn hàng của bạn đang được xử lý và chuẩn bị giao hàng",
         completed: "Đơn hàng của bạn đã được giao thành công",
         cancelled: "Đơn hàng của bạn đã bị hủy"
       }
    },
    ja: {
      title: "注文追跡",
      subtitle: "注文状況と配送の進行状況を追跡",
      searchByOrderId: "注文IDで検索",
      searchByEmail: "メールで検索",
      orderIdPlaceholder: "注文IDを入力してください（例：ORD-2024-001）",
      emailPlaceholder: "メールアドレスを入力してください",
      searchButton: "注文を追跡",
      orderNotFound: "注文が見つかりません。注文IDまたはメールを確認してください。",
      orderDetails: "注文詳細",
      orderStatus: "注文状況",
      customerInfo: "顧客情報",
      orderItems: "注文商品",
      deliveryInfo: "配送情報",
      estimatedDelivery: "予定配送日",
      shippingMethod: "配送方法",
      trackingNumber: "追跡番号",
      total: "合計",
             status: {
         pending: "保留中",
         processing: "処理中",
         completed: "完了",
         cancelled: "キャンセル済み"
       },
       statusDescription: {
         pending: "注文が完了し、確認待ちです",
         processing: "注文が処理され、発送準備中です",
         completed: "注文が正常に配達されました",
         cancelled: "注文がキャンセルされました"
       }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSearch = async (searchValueParam?: string) => {
    const valueToSearch = searchValueParam || searchValue;
    if (!valueToSearch.trim()) return;

    setIsSearching(true);
    setError('');
    setOrderDetails(null);

    try {
      let order: Order;
      
      if (searchType === 'orderId') {
        // Search by order ID
        order = await api.getOrderById(valueToSearch);
        setOrderDetails(order);
        toast({
          title: "Order Found",
          description: `Successfully found order ${order.orderNumber}`,
        });
      } else {
        // Search by email
        const orders = await api.trackOrderByEmail(valueToSearch);
        if (orders.length > 0) {
          // Show the most recent order
          order = orders[0];
          setOrderDetails(order);
          toast({
            title: "Orders Found",
            description: `Found ${orders.length} order(s) for ${valueToSearch}`,
          });
        } else {
          setError(t.orderNotFound);
        }
      }
    } catch (error) {
      console.error('Order tracking error:', error);
      setError(t.orderNotFound);
      toast({
        title: "Order Not Found",
        description: "Please check your order ID or email and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header 
        cartItemsCount={mockCartItemsCount}
        onSearch={mockOnSearch}
      />
      
      <main className="py-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex gap-2">
                  <Button
                    variant={searchType === 'orderId' ? 'default' : 'outline'}
                    onClick={() => setSearchType('orderId')}
                    className="flex-1 md:flex-none"
                  >
                    {t.searchByOrderId}
                  </Button>
                  <Button
                    variant={searchType === 'email' ? 'default' : 'outline'}
                    onClick={() => setSearchType('email')}
                    className="flex-1 md:flex-none"
                  >
                    {t.searchByEmail}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder={searchType === 'orderId' ? t.orderIdPlaceholder : t.emailPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                                 <Button 
                   onClick={() => handleSearch()} 
                   disabled={isSearching || !searchValue.trim()}
                   className="px-8"
                 >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      {t.searchButton}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 text-lg">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {orderDetails && (
            <div className="space-y-8">
              {/* Order Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(orderDetails.status)}
                    {t.orderStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Badge className={`${getStatusColor(orderDetails.status)} text-sm font-medium px-3 py-1`}>
                        {t.status[orderDetails.status]}
                      </Badge>
                      <p className="text-muted-foreground mt-2">
                        {t.statusDescription[orderDetails.status]}
                      </p>
                    </div>
                                         <div className="text-right">
                       <p className="text-sm text-muted-foreground">Order Number</p>
                       <p className="font-mono font-bold text-lg">{orderDetails.orderNumber}</p>
                     </div>
                   </div>

                   {/* Order Status Timeline */}
                   <div className="space-y-4">
                     <div className="flex items-start gap-4">
                       <div className="flex-shrink-0">
                         {getStatusIcon(orderDetails.status)}
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center justify-between">
                           <h4 className="font-semibold">{t.status[orderDetails.status]}</h4>
                           <span className="text-sm text-muted-foreground">
                             {new Date(orderDetails.createdAt).toLocaleDateString()}
                           </span>
                         </div>
                         <p className="text-muted-foreground text-sm">
                           {t.statusDescription[orderDetails.status]}
                         </p>
                       </div>
                     </div>
                   </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {t.customerInfo}
                    </CardTitle>
                  </CardHeader>
                                     <CardContent className="space-y-4">
                     <div>
                       <p className="text-sm text-muted-foreground">Name</p>
                       <p className="font-medium">{orderDetails.userId.name}</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Email</p>
                       <p className="font-medium">{orderDetails.userId.email}</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Phone</p>
                       <p className="font-medium">{orderDetails.userId.phone}</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Address</p>
                       <p className="font-medium">
                         {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.district}
                       </p>
                     </div>
                   </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {t.deliveryInfo}
                    </CardTitle>
                  </CardHeader>
                                     <CardContent className="space-y-4">
                     <div>
                       <p className="text-sm text-muted-foreground">Order Date</p>
                       <p className="font-medium">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Payment Method</p>
                       <p className="font-medium">{orderDetails.paymentMethod}</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Payment Status</p>
                       <p className="font-medium">{orderDetails.paymentStatus}</p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Order Number</p>
                       <p className="font-mono font-medium">{orderDetails.orderNumber}</p>
                     </div>
                   </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t.orderItems}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                                         {orderDetails.items.map((item, index) => (
                       <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                         {item.productId?.images?.[0] ? (
                           <img
                             src={item.productId.images[0]}
                             alt={item.name}
                             className="w-16 h-16 object-cover rounded-md"
                           />
                         ) : (
                           <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                             <Package className="h-8 w-8 text-gray-400" />
                           </div>
                         )}
                         <div className="flex-1">
                           <h4 className="font-medium">{item.name}</h4>
                           <p className="text-sm text-muted-foreground">
                             Quantity: {item.quantity}
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                           <p className="text-sm text-muted-foreground">
                             {formatCurrency(item.price)} each
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <Separator className="my-6" />
                   
                   <div className="flex justify-between items-center">
                     <span className="text-lg font-semibold">{t.total}</span>
                     <span className="text-2xl font-bold text-primary">
                       {formatCurrency(orderDetails.totalAmount)}
                     </span>
                   </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;
