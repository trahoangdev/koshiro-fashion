import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  Navigation,
  Timer,
  DollarSign,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";

interface ShippingMethod {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  type: 'standard' | 'express' | 'overnight' | 'pickup';
  cost: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
  isActive: boolean;
  supportedRegions: string[];
  weightLimit?: number;
  dimensionsLimit?: string;
  createdAt: string;
  updatedAt: string;
}

interface Shipment {
  _id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  shippingMethod: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  carrier: string;
  carrierTrackingUrl?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  weight?: number;
  dimensions?: string;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
}

interface TrackingEvent {
  _id: string;
  shipmentId: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  carrier?: string;
}

export default function AdminShippingPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false);
  const [isEditMethodDialogOpen, setIsEditMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Shipping & Logistics Management",
      subtitle: "Manage shipping methods, track shipments, and monitor delivery status",
      createMethod: "Create Shipping Method",
      search: "Search shipments...",
      orderNumber: "Order #",
      trackingNumber: "Tracking #",
      customer: "Customer",
      method: "Method",
      status: "Status",
      carrier: "Carrier",
      estimatedDelivery: "Est. Delivery",
      actualDelivery: "Actual Delivery",
      cost: "Cost",
      actions: "Actions",
      pending: "Pending",
      pickedUp: "Picked Up",
      inTransit: "In Transit",
      outForDelivery: "Out for Delivery",
      delivered: "Delivered",
      failed: "Failed",
      returned: "Returned",
      standard: "Standard",
      express: "Express",
      overnight: "Overnight",
      pickup: "Pickup",
      noShipments: "No shipments found",
      totalShipments: "Total Shipments",
      pendingShipments: "Pending Shipments",
      deliveredShipments: "Delivered Shipments",
      totalCost: "Total Shipping Cost",
      trackingDetails: "Tracking Details",
      trackingHistory: "Tracking History",
      updateStatus: "Update Status",
      addTrackingEvent: "Add Tracking Event",
      location: "Location",
      description: "Description",
      timestamp: "Timestamp",
      save: "Save",
      cancel: "Cancel"
    },
    vi: {
      title: "Quản lý Vận chuyển & Giao hàng",
      subtitle: "Quản lý phương thức vận chuyển, theo dõi đơn hàng và giám sát trạng thái giao hàng",
      createMethod: "Tạo Phương thức Vận chuyển",
      search: "Tìm kiếm đơn hàng...",
      orderNumber: "Mã đơn hàng",
      trackingNumber: "Mã theo dõi",
      customer: "Khách hàng",
      method: "Phương thức",
      status: "Trạng thái",
      carrier: "Nhà vận chuyển",
      estimatedDelivery: "Dự kiến giao",
      actualDelivery: "Giao thực tế",
      cost: "Chi phí",
      actions: "Thao tác",
      pending: "Chờ xử lý",
      pickedUp: "Đã lấy hàng",
      inTransit: "Đang vận chuyển",
      outForDelivery: "Đang giao",
      delivered: "Đã giao",
      failed: "Giao thất bại",
      returned: "Trả về",
      standard: "Tiêu chuẩn",
      express: "Nhanh",
      overnight: "Qua đêm",
      pickup: "Tự lấy",
      noShipments: "Không tìm thấy đơn hàng",
      totalShipments: "Tổng đơn hàng",
      pendingShipments: "Đơn chờ xử lý",
      deliveredShipments: "Đơn đã giao",
      totalCost: "Tổng chi phí vận chuyển",
      trackingDetails: "Chi tiết theo dõi",
      trackingHistory: "Lịch sử theo dõi",
      updateStatus: "Cập nhật trạng thái",
      addTrackingEvent: "Thêm sự kiện theo dõi",
      location: "Vị trí",
      description: "Mô tả",
      timestamp: "Thời gian",
      save: "Lưu",
      cancel: "Hủy"
    },
    ja: {
      title: "配送・物流管理",
      subtitle: "配送方法の管理、配送の追跡、配送状況の監視",
      createMethod: "配送方法作成",
      search: "配送検索...",
      orderNumber: "注文番号",
      trackingNumber: "追跡番号",
      customer: "顧客",
      method: "方法",
      status: "ステータス",
      carrier: "運送業者",
      estimatedDelivery: "予定配送",
      actualDelivery: "実際配送",
      cost: "コスト",
      actions: "アクション",
      pending: "保留中",
      pickedUp: "集荷済み",
      inTransit: "輸送中",
      outForDelivery: "配送中",
      delivered: "配送完了",
      failed: "配送失敗",
      returned: "返却",
      standard: "標準",
      express: "速達",
      overnight: "翌日",
      pickup: "店頭受取",
      noShipments: "配送が見つかりません",
      totalShipments: "総配送数",
      pendingShipments: "保留配送",
      deliveredShipments: "配送完了",
      totalCost: "総配送コスト",
      trackingDetails: "追跡詳細",
      trackingHistory: "追跡履歴",
      updateStatus: "ステータス更新",
      addTrackingEvent: "追跡イベント追加",
      location: "場所",
      description: "説明",
      timestamp: "タイムスタンプ",
      save: "保存",
      cancel: "キャンセル"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Mock data for demonstration
  useEffect(() => {
    const mockShippingMethods: ShippingMethod[] = [
      {
        _id: "1",
        name: "Giao hàng tiêu chuẩn",
        nameEn: "Standard Delivery",
        nameJa: "標準配送",
        description: "Giao hàng trong 3-5 ngày làm việc",
        descriptionEn: "Delivery within 3-5 business days",
        descriptionJa: "3-5営業日以内に配送",
        type: "standard",
        cost: 30000,
        freeShippingThreshold: 500000,
        estimatedDays: 4,
        isActive: true,
        supportedRegions: ["Hà Nội", "TP.HCM", "Đà Nẵng"],
        weightLimit: 5,
        dimensionsLimit: "60x40x40 cm",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "2",
        name: "Giao hàng nhanh",
        nameEn: "Express Delivery",
        nameJa: "速達配送",
        description: "Giao hàng trong 1-2 ngày làm việc",
        descriptionEn: "Delivery within 1-2 business days",
        descriptionJa: "1-2営業日以内に配送",
        type: "express",
        cost: 60000,
        freeShippingThreshold: 1000000,
        estimatedDays: 2,
        isActive: true,
        supportedRegions: ["Hà Nội", "TP.HCM"],
        weightLimit: 3,
        dimensionsLimit: "50x30x30 cm",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ];

    const mockShipments: Shipment[] = [
      {
        _id: "1",
        orderId: "order1",
        orderNumber: "ORD-2024-001",
        trackingNumber: "VN123456789",
        shippingMethod: "Giao hàng tiêu chuẩn",
        status: "in_transit",
        customerName: "Nguyễn Văn A",
        customerPhone: "+84 123 456 789",
        shippingAddress: {
          name: "Nguyễn Văn A",
          phone: "+84 123 456 789",
          address: "123 Đường ABC",
          city: "Hà Nội",
          district: "Quận Cầu Giấy"
        },
        carrier: "Viettel Post",
        carrierTrackingUrl: "https://tracking.viettelpost.vn/VN123456789",
        estimatedDelivery: "2024-01-25T00:00:00Z",
        shippingCost: 30000,
        weight: 1.5,
        dimensions: "30x20x10 cm",
        createdAt: "2024-01-20T00:00:00Z",
        updatedAt: "2024-01-22T00:00:00Z"
      },
      {
        _id: "2",
        orderId: "order2",
        orderNumber: "ORD-2024-002",
        trackingNumber: "VN987654321",
        shippingMethod: "Giao hàng nhanh",
        status: "delivered",
        customerName: "Trần Thị B",
        customerPhone: "+84 987 654 321",
        shippingAddress: {
          name: "Trần Thị B",
          phone: "+84 987 654 321",
          address: "456 Đường XYZ",
          city: "TP.HCM",
          district: "Quận 1"
        },
        carrier: "Giao Hàng Nhanh",
        carrierTrackingUrl: "https://tracking.ghn.vn/VN987654321",
        estimatedDelivery: "2024-01-22T00:00:00Z",
        actualDelivery: "2024-01-21T14:30:00Z",
        shippingCost: 60000,
        weight: 0.8,
        dimensions: "25x15x8 cm",
        createdAt: "2024-01-19T00:00:00Z",
        updatedAt: "2024-01-21T14:30:00Z"
      }
    ];

    const mockTrackingEvents: TrackingEvent[] = [
      {
        _id: "1",
        shipmentId: "1",
        status: "picked_up",
        location: "Hà Nội",
        description: "Package picked up from sender",
        timestamp: "2024-01-20T09:00:00Z",
        carrier: "Viettel Post"
      },
      {
        _id: "2",
        shipmentId: "1",
        status: "in_transit",
        location: "Hà Nội Sorting Center",
        description: "Package arrived at sorting center",
        timestamp: "2024-01-21T10:30:00Z",
        carrier: "Viettel Post"
      },
      {
        _id: "3",
        shipmentId: "1",
        status: "in_transit",
        location: "TP.HCM Sorting Center",
        description: "Package in transit to destination",
        timestamp: "2024-01-22T15:45:00Z",
        carrier: "Viettel Post"
      }
    ];

    setShippingMethods(mockShippingMethods);
    setShipments(mockShipments);
    setFilteredShipments(mockShipments);
    setTrackingEvents(mockTrackingEvents);
    setIsLoading(false);
  }, []);

  // Filter shipments
  useEffect(() => {
    let filtered = shipments;

    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(shipment => shipment.status === filterStatus);
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter(shipment => shipment.shippingMethod === filterMethod);
    }

    setFilteredShipments(filtered);
  }, [shipments, searchTerm, filterStatus, filterMethod]);

  const getMethodName = (method: ShippingMethod) => {
    switch (language) {
      case 'vi': return method.name;
      case 'ja': return method.nameJa || method.name;
      default: return method.nameEn || method.name;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t.pending}</Badge>;
      case 'picked_up':
        return <Badge variant="outline"><Package className="h-3 w-3 mr-1" />{t.pickedUp}</Badge>;
      case 'in_transit':
        return <Badge variant="default"><Truck className="h-3 w-3 mr-1" />{t.inTransit}</Badge>;
      case 'out_for_delivery':
        return <Badge variant="default" className="bg-blue-500"><Navigation className="h-3 w-3 mr-1" />{t.outForDelivery}</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.delivered}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t.failed}</Badge>;
      case 'returned':
        return <Badge variant="destructive" className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />{t.returned}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return t.standard;
      case 'express': return t.express;
      case 'overnight': return t.overnight;
      case 'pickup': return t.pickup;
      default: return type;
    }
  };

  const handleViewTracking = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsTrackingDialogOpen(true);
  };

  const handleUpdateStatus = (shipment: Shipment) => {
    // Implementation for updating shipment status
    toast({
      title: "Status Updated",
      description: `Status for ${shipment.orderNumber} has been updated.`,
    });
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    totalCost: shipments.reduce((sum, s) => sum + s.shippingCost, 0)
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsCreateMethodDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createMethod}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalShipments}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.pendingShipments}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.deliveredShipments}</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalCost}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalCost, language)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="picked_up">{t.pickedUp}</SelectItem>
                <SelectItem value="in_transit">{t.inTransit}</SelectItem>
                <SelectItem value="out_for_delivery">{t.outForDelivery}</SelectItem>
                <SelectItem value="delivered">{t.delivered}</SelectItem>
                <SelectItem value="failed">{t.failed}</SelectItem>
                <SelectItem value="returned">{t.returned}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {shippingMethods.map(method => (
                  <SelectItem key={method._id} value={method.name}>
                    {getMethodName(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noShipments}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orderNumber}</TableHead>
                  <TableHead>{t.trackingNumber}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.method}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.carrier}</TableHead>
                  <TableHead>{t.estimatedDelivery}</TableHead>
                  <TableHead>{t.cost}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => (
                  <TableRow key={shipment._id}>
                    <TableCell className="font-mono">{shipment.orderNumber}</TableCell>
                    <TableCell className="font-mono">{shipment.trackingNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{shipment.customerName}</div>
                        <div className="text-sm text-muted-foreground">{shipment.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.shippingMethod}</TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                    <TableCell>{shipment.carrier}</TableCell>
                    <TableCell>
                      {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(shipment.shippingCost, language)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTracking(shipment)}>
                            <MapPin className="h-4 w-4 mr-2" />
                            {t.trackingDetails}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(shipment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.updateStatus}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t.trackingDetails}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              {/* Shipment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Order Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Order: {selectedShipment.orderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tracking: {selectedShipment.trackingNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Method: {selectedShipment.shippingMethod}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Customer Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.customerName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.customerPhone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.shippingAddress.address}, {selectedShipment.shippingAddress.district}, {selectedShipment.shippingAddress.city}
                  </p>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <h3 className="font-medium mb-4">{t.trackingHistory}</h3>
                <div className="space-y-4">
                  {trackingEvents
                    .filter(event => event.shipmentId === selectedShipment._id)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event) => (
                      <div key={event._id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{event.status}</span>
                            <Badge variant="outline">{event.location}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {event.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
