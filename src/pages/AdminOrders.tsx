import { useState, useEffect } from "react";
import { Search, Eye, Package, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { formatCurrency } from "@/lib/currency";

// Mock orders data
const mockOrders = [
  {
    id: "ORD001",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "+84 123 456 789",
    items: [
      { name: "Kimono Truyền Thống", nameVi: "Kimono Truyền Thống", quantity: 1, price: 1200000 },
      { name: "Geta Sandals", nameVi: "Dép Geta", quantity: 1, price: 50000 }
    ],
    total: 1250000,
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    shippingAddress: "123 Đường ABC, Quận 1, TP.HCM"
  },
  {
    id: "ORD002",
    customer: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "+84 987 654 321",
    items: [
      { name: "Yukata Summer", nameVi: "Yukata Mùa Hè", quantity: 2, price: 445000 }
    ],
    total: 890000,
    status: "processing",
    createdAt: "2024-01-14T15:20:00Z",
    shippingAddress: "456 Đường XYZ, Quận 3, TP.HCM"
  },
  {
    id: "ORD003",
    customer: "Lê Văn C",
    email: "levanc@email.com",
    phone: "+84 555 123 456",
    items: [
      { name: "Hakama Pants", nameVi: "Quần Hakama", quantity: 1, price: 800000 },
      { name: "Traditional Kimono", nameVi: "Kimono Truyền Thống", quantity: 1, price: 1200000 },
      { name: "Obi Belt", nameVi: "Thắt Lưng Obi", quantity: 1, price: 100000 }
    ],
    total: 2100000,
    status: "completed",
    createdAt: "2024-01-13T09:15:00Z",
    shippingAddress: "789 Đường DEF, Quận 7, TP.HCM"
  },
  {
    id: "ORD004",
    customer: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "+84 777 888 999",
    items: [
      { name: "Casual Yukata", nameVi: "Yukata Thường Ngày", quantity: 1, price: 750000 }
    ],
    total: 750000,
    status: "completed",
    createdAt: "2024-01-12T14:45:00Z",
    shippingAddress: "321 Đường GHI, Quận 5, TP.HCM"
  },
  {
    id: "ORD005",
    customer: "Hoàng Văn E",
    email: "hoangvane@email.com",
    phone: "+84 111 222 333",
    items: [
      { name: "Premium Kimono Set", nameVi: "Bộ Kimono Cao Cấp", quantity: 1, price: 1800000 }
    ],
    total: 1800000,
    status: "processing",
    createdAt: "2024-01-11T11:30:00Z",
    shippingAddress: "654 Đường JKL, Quận 2, TP.HCM"
  }
];

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast({
      title: "Cập nhật trạng thái thành công",
      description: `Đơn hàng ${orderId} đã được cập nhật`,
    });
  };

  const [language, setLanguage] = useState("vi");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", variant: "secondary" as const, icon: Clock },
      processing: { label: "Đang xử lý", variant: "default" as const, icon: Package },
      completed: { label: "Hoàn thành", variant: "default" as const, icon: CheckCircle },
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

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "processing", label: "Đang xử lý" },
    { value: "completed", label: "Hoàn thành" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Xem và cập nhật trạng thái đơn hàng</p>
        </div>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đơn hàng ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Khách hàng: </span>
                            <span className="font-medium">{order.customer}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email: </span>
                            <span>{order.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Số điện thoại: </span>
                            <span>{order.phone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ngày đặt: </span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-muted-foreground">Sản phẩm: </span>
                          <span>{order.items.map(item => `${item.nameVi} (x${item.quantity})`).join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrencyForDisplay(order.total)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.length} sản phẩm
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>

                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Chờ xử lý</SelectItem>
                              <SelectItem value="processing">Đang xử lý</SelectItem>
                              <SelectItem value="completed">Hoàn thành</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                </div>
              )}
            </CardContent>
          </Card>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Chi tiết đơn hàng {selectedOrder.id}
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-muted-foreground">Tên:</span> {selectedOrder.customer}</div>
                      <div><span className="text-muted-foreground">Email:</span> {selectedOrder.email}</div>
                      <div><span className="text-muted-foreground">Điện thoại:</span> {selectedOrder.phone}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Thông tin đơn hàng</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-muted-foreground">Mã đơn:</span> {selectedOrder.id}</div>
                      <div><span className="text-muted-foreground">Ngày đặt:</span> {formatDate(selectedOrder.createdAt)}</div>
                      <div><span className="text-muted-foreground">Trạng thái:</span> {getStatusBadge(selectedOrder.status)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Địa chỉ giao hàng</h4>
                  <p className="text-sm">{selectedOrder.shippingAddress}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Sản phẩm</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">{item.nameVi}</div>
                          <div className="text-sm text-muted-foreground">Số lượng: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrencyForDisplay(item.price * item.quantity)}</div>
                          <div className="text-sm text-muted-foreground">{formatCurrencyForDisplay(item.price)}/sp</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatCurrencyForDisplay(selectedOrder.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}