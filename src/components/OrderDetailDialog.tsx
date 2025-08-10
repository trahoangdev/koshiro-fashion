import { useState } from "react";
import { 
  X,
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Calendar,
  FileText,
  Download,
  Printer,
  Mail,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Order } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface OrderDetailDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onPrint: (order: Order) => void;
  onSendEmail: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => Promise<void>;
  mode?: 'view' | 'edit';
}

export default function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onPrint,
  onSendEmail,
  onEdit,
  onDelete,
  mode = 'view'
}: OrderDetailDialogProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order?.status || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const translations = {
    en: {
      title: 'Order Details',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      status: 'Status',
      paymentStatus: 'Payment Status',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      orderItems: 'Order Items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      updateStatus: 'Update Status',
      printOrder: 'Print Order',
      sendEmail: 'Send Email',
      downloadInvoice: 'Download Invoice',
      close: 'Close',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      paid: 'Paid',
      unpaid: 'Unpaid',
      failed: 'Payment Failed',
      quantity: 'Qty',
      price: 'Price',
      itemTotal: 'Item Total',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country',
      paymentMethod: 'Payment Method',
      trackingNumber: 'Tracking Number',
      notes: 'Notes',
      noNotes: 'No notes available',
      orderDeleted: 'Order deleted successfully',
      deleteFailed: 'Failed to delete order'
    },
    vi: {
      title: 'Chi tiết đơn hàng',
      orderNumber: 'Mã đơn hàng',
      orderDate: 'Ngày đặt',
      status: 'Trạng thái',
      paymentStatus: 'Trạng thái thanh toán',
      customerInfo: 'Thông tin khách hàng',
      shippingAddress: 'Địa chỉ giao hàng',
      billingAddress: 'Địa chỉ thanh toán',
      orderItems: 'Sản phẩm đặt hàng',
      subtotal: 'Tạm tính',
      shipping: 'Phí vận chuyển',
      tax: 'Thuế',
      total: 'Tổng cộng',
      updateStatus: 'Cập nhật trạng thái',
      printOrder: 'In đơn hàng',
      sendEmail: 'Gửi email',
      downloadInvoice: 'Tải hóa đơn',
      close: 'Đóng',
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi hàng',
      delivered: 'Đã giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      paid: 'Đã thanh toán',
      unpaid: 'Chưa thanh toán',
      failed: 'Thanh toán thất bại',
      quantity: 'SL',
      price: 'Giá',
      itemTotal: 'Thành tiền',
      phone: 'Điện thoại',
      email: 'Email',
      address: 'Địa chỉ',
      city: 'Thành phố',
      state: 'Tỉnh/Thành',
      zipCode: 'Mã bưu điện',
      country: 'Quốc gia',
      paymentMethod: 'Phương thức thanh toán',
      trackingNumber: 'Mã theo dõi',
      notes: 'Ghi chú',
      noNotes: 'Không có ghi chú',
      orderDeleted: 'Đã xóa đơn hàng thành công',
      deleteFailed: 'Xóa đơn hàng thất bại'
    },
    ja: {
      title: '注文詳細',
      orderNumber: '注文番号',
      orderDate: '注文日',
      status: 'ステータス',
      paymentStatus: '支払いステータス',
      customerInfo: '顧客情報',
      shippingAddress: '配送先住所',
      billingAddress: '請求先住所',
      orderItems: '注文商品',
      subtotal: '小計',
      shipping: '配送料',
      tax: '税金',
      total: '合計',
      updateStatus: 'ステータス更新',
      printOrder: '注文を印刷',
      sendEmail: 'メール送信',
      downloadInvoice: '請求書をダウンロード',
      close: '閉じる',
      pending: '保留中',
      processing: '処理中',
      shipped: '発送済み',
      delivered: '配達済み',
      completed: '完了',
      cancelled: 'キャンセル',
      paid: '支払い済み',
      unpaid: '未払い',
      failed: '支払い失敗',
      quantity: '数量',
      price: '価格',
      itemTotal: '小計',
      phone: '電話番号',
      email: 'メール',
      address: '住所',
      city: '市区町村',
      state: '都道府県',
      zipCode: '郵便番号',
      country: '国',
      paymentMethod: '支払い方法',
      trackingNumber: '追跡番号',
      notes: '備考',
      noNotes: '備考なし',
      orderDeleted: '注文が正常に削除されました',
      deleteFailed: '注文の削除に失敗しました'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

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

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    
    try {
      setIsUpdating(true);
      await onUpdateStatus(order._id, newStatus);
      toast({
        title: 'Status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (order) {
      onPrint(order);
    }
  };

  const handleSendEmail = () => {
    if (order) {
      onSendEmail(order);
    }
  };

  const handleEdit = () => {
    if (order && onEdit) {
      onEdit(order);
    }
  };

  const handleDelete = async () => {
    if (!order || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await onDelete(order._id);
        toast({
          title: t.orderDeleted || 'Order deleted successfully',
        });
        onClose();
      } catch (error) {
        toast({
          title: t.deleteFailed || 'Failed to delete order',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {t.printOrder}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                {t.sendEmail}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t.downloadInvoice}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.orderDate}: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t.status}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t.paymentStatus}</p>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t.updateStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="processing">{t.processing}</SelectItem>
                    <SelectItem value="shipped">{t.shipped}</SelectItem>
                    <SelectItem value="delivered">{t.delivered}</SelectItem>
                    <SelectItem value="completed">{t.completed}</SelectItem>
                    <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={isUpdating || newStatus === order.status}
                  size="sm"
                >
                  {isUpdating ? 'Updating...' : t.updateStatus}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.customerInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{order.userId?.name}</p>
                  <p className="text-sm text-muted-foreground">{order.userId?.email}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{order.shippingAddress?.phone || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t.shippingAddress}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p className="text-sm">{order.shippingAddress?.address}</p>
                <p className="text-sm">
                  {order.shippingAddress?.city}, {order.shippingAddress?.district}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t.orderItems}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                      {item.productId?.images && item.productId.images.length > 0 ? (
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productId?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.size} • {item.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t.quantity}: {item.quantity}
                      </p>
                      <p className="font-medium">
                        {formatCurrencyForDisplay(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrencyForDisplay(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t.orderNumber}: {order.orderNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{t.total}</span>
                  <span>{formatCurrencyForDisplay(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t.paymentMethod}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.paymentMethod || 'N/A'}</p>
              </CardContent>
            </Card>


          </div>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 