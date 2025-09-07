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
  CreditCard,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  User,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Upload,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";

interface PaymentMethod {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
  provider: string;
  isActive: boolean;
  processingFee: number;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
  icon?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  orderId: string;
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  gatewayResponse?: any;
  gatewayTransactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  processedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Refund {
  _id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedBy: string;
  approvedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false);
  const [isEditMethodDialogOpen, setIsEditMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Payment & Transaction Management",
      subtitle: "Manage payment methods, track transactions, and handle refunds",
      createMethod: "Create Payment Method",
      search: "Search transactions...",
      orderNumber: "Order #",
      transactionId: "Transaction ID",
      customer: "Customer",
      method: "Method",
      amount: "Amount",
      status: "Status",
      processedAt: "Processed At",
      actions: "Actions",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      partiallyRefunded: "Partially Refunded",
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      bankTransfer: "Bank Transfer",
      eWallet: "E-Wallet",
      cod: "Cash on Delivery",
      crypto: "Cryptocurrency",
      noTransactions: "No transactions found",
      totalTransactions: "Total Transactions",
      completedTransactions: "Completed",
      failedTransactions: "Failed",
      totalAmount: "Total Amount",
      refunds: "Refunds",
      processRefund: "Process Refund",
      refundAmount: "Refund Amount",
      refundReason: "Refund Reason",
      save: "Save",
      cancel: "Cancel",
      approve: "Approve",
      reject: "Reject",
      viewDetails: "View Details",
      exportTransactions: "Export Transactions"
    },
    vi: {
      title: "Quản lý Thanh toán & Giao dịch",
      subtitle: "Quản lý phương thức thanh toán, theo dõi giao dịch và xử lý hoàn tiền",
      createMethod: "Tạo Phương thức Thanh toán",
      search: "Tìm kiếm giao dịch...",
      orderNumber: "Mã đơn hàng",
      transactionId: "Mã giao dịch",
      customer: "Khách hàng",
      method: "Phương thức",
      amount: "Số tiền",
      status: "Trạng thái",
      processedAt: "Xử lý lúc",
      actions: "Thao tác",
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      failed: "Thất bại",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
      partiallyRefunded: "Hoàn tiền một phần",
      creditCard: "Thẻ tín dụng",
      debitCard: "Thẻ ghi nợ",
      bankTransfer: "Chuyển khoản",
      eWallet: "Ví điện tử",
      cod: "Thanh toán khi nhận hàng",
      crypto: "Tiền điện tử",
      noTransactions: "Không tìm thấy giao dịch",
      totalTransactions: "Tổng giao dịch",
      completedTransactions: "Hoàn thành",
      failedTransactions: "Thất bại",
      totalAmount: "Tổng số tiền",
      refunds: "Hoàn tiền",
      processRefund: "Xử lý hoàn tiền",
      refundAmount: "Số tiền hoàn",
      refundReason: "Lý do hoàn tiền",
      save: "Lưu",
      cancel: "Hủy",
      approve: "Phê duyệt",
      reject: "Từ chối",
      viewDetails: "Xem chi tiết",
      exportTransactions: "Xuất giao dịch"
    },
    ja: {
      title: "支払い・取引管理",
      subtitle: "支払い方法の管理、取引の追跡、返金の処理",
      createMethod: "支払い方法作成",
      search: "取引検索...",
      orderNumber: "注文番号",
      transactionId: "取引ID",
      customer: "顧客",
      method: "方法",
      amount: "金額",
      status: "ステータス",
      processedAt: "処理日時",
      actions: "アクション",
      pending: "保留中",
      processing: "処理中",
      completed: "完了",
      failed: "失敗",
      cancelled: "キャンセル",
      refunded: "返金済み",
      partiallyRefunded: "一部返金",
      creditCard: "クレジットカード",
      debitCard: "デビットカード",
      bankTransfer: "銀行振込",
      eWallet: "電子ウォレット",
      cod: "代金引換",
      crypto: "暗号通貨",
      noTransactions: "取引が見つかりません",
      totalTransactions: "総取引数",
      completedTransactions: "完了",
      failedTransactions: "失敗",
      totalAmount: "総金額",
      refunds: "返金",
      processRefund: "返金処理",
      refundAmount: "返金額",
      refundReason: "返金理由",
      save: "保存",
      cancel: "キャンセル",
      approve: "承認",
      reject: "拒否",
      viewDetails: "詳細表示",
      exportTransactions: "取引エクスポート"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Mock data for demonstration
  useEffect(() => {
    const mockPaymentMethods: PaymentMethod[] = [
      {
        _id: "1",
        name: "Thẻ tín dụng",
        nameEn: "Credit Card",
        nameJa: "クレジットカード",
        type: "credit_card",
        provider: "VNPay",
        isActive: true,
        processingFee: 1.5,
        minAmount: 10000,
        maxAmount: 50000000,
        supportedCurrencies: ["VND", "USD"],
        description: "Thanh toán bằng thẻ tín dụng qua VNPay",
        descriptionEn: "Pay with credit card via VNPay",
        descriptionJa: "VNPay経由でクレジットカード決済",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "2",
        name: "Ví điện tử",
        nameEn: "E-Wallet",
        nameJa: "電子ウォレット",
        type: "e_wallet",
        provider: "MoMo",
        isActive: true,
        processingFee: 0.5,
        minAmount: 1000,
        maxAmount: 20000000,
        supportedCurrencies: ["VND"],
        description: "Thanh toán qua ví MoMo",
        descriptionEn: "Pay with MoMo wallet",
        descriptionJa: "MoMoウォレットで決済",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "3",
        name: "Thanh toán khi nhận hàng",
        nameEn: "Cash on Delivery",
        nameJa: "代金引換",
        type: "cod",
        provider: "Internal",
        isActive: true,
        processingFee: 0,
        minAmount: 50000,
        maxAmount: 10000000,
        supportedCurrencies: ["VND"],
        description: "Thanh toán khi nhận hàng",
        descriptionEn: "Pay when receiving goods",
        descriptionJa: "商品受取時支払い",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        _id: "1",
        orderId: "order1",
        orderNumber: "ORD-2024-001",
        transactionId: "TXN-2024-001",
        paymentMethod: "Thẻ tín dụng",
        paymentProvider: "VNPay",
        amount: 1200000,
        currency: "VND",
        status: "completed",
        customerName: "Nguyễn Văn A",
        customerEmail: "nguyenvana@email.com",
        customerPhone: "+84 123 456 789",
        gatewayTransactionId: "VNPAY-123456789",
        processedAt: "2024-01-20T10:30:00Z",
        createdAt: "2024-01-20T10:25:00Z",
        updatedAt: "2024-01-20T10:30:00Z"
      },
      {
        _id: "2",
        orderId: "order2",
        orderNumber: "ORD-2024-002",
        transactionId: "TXN-2024-002",
        paymentMethod: "Ví điện tử",
        paymentProvider: "MoMo",
        amount: 600000,
        currency: "VND",
        status: "completed",
        customerName: "Trần Thị B",
        customerEmail: "tranthib@email.com",
        customerPhone: "+84 987 654 321",
        gatewayTransactionId: "MOMO-987654321",
        processedAt: "2024-01-19T15:45:00Z",
        createdAt: "2024-01-19T15:40:00Z",
        updatedAt: "2024-01-19T15:45:00Z"
      },
      {
        _id: "3",
        orderId: "order3",
        orderNumber: "ORD-2024-003",
        transactionId: "TXN-2024-003",
        paymentMethod: "Thanh toán khi nhận hàng",
        paymentProvider: "Internal",
        amount: 800000,
        currency: "VND",
        status: "pending",
        customerName: "Lê Văn C",
        customerEmail: "levanc@email.com",
        customerPhone: "+84 555 123 456",
        createdAt: "2024-01-21T09:15:00Z",
        updatedAt: "2024-01-21T09:15:00Z"
      },
      {
        _id: "4",
        orderId: "order4",
        orderNumber: "ORD-2024-004",
        transactionId: "TXN-2024-004",
        paymentMethod: "Thẻ tín dụng",
        paymentProvider: "VNPay",
        amount: 1500000,
        currency: "VND",
        status: "failed",
        customerName: "Phạm Thị D",
        customerEmail: "phamthid@email.com",
        customerPhone: "+84 777 888 999",
        failedAt: "2024-01-18T14:20:00Z",
        createdAt: "2024-01-18T14:15:00Z",
        updatedAt: "2024-01-18T14:20:00Z"
      }
    ];

    const mockRefunds: Refund[] = [
      {
        _id: "1",
        transactionId: "TXN-2024-001",
        orderId: "order1",
        amount: 200000,
        reason: "Product defect",
        status: "approved",
        requestedBy: "customer1",
        approvedBy: "admin1",
        processedAt: "2024-01-22T10:00:00Z",
        createdAt: "2024-01-21T16:30:00Z"
      }
    ];

    setPaymentMethods(mockPaymentMethods);
    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
    setRefunds(mockRefunds);
    setIsLoading(false);
  }, []);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filterMethod);
    }

    // Date range filter
    if (filterDateRange !== "all") {
      const now = new Date();
      const days = filterDateRange === "today" ? 0 : 
                   filterDateRange === "week" ? 7 : 
                   filterDateRange === "month" ? 30 : 365;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(transaction => 
        new Date(transaction.createdAt) >= cutoffDate
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterStatus, filterMethod, filterDateRange]);

  const getMethodName = (method: PaymentMethod) => {
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
      case 'processing':
        return <Badge variant="default"><RefreshCw className="h-3 w-3 mr-1" />{t.processing}</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.completed}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t.failed}</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />{t.cancelled}</Badge>;
      case 'refunded':
        return <Badge variant="destructive" className="bg-orange-500"><TrendingDown className="h-3 w-3 mr-1" />{t.refunded}</Badge>;
      case 'partially_refunded':
        return <Badge variant="destructive" className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />{t.partiallyRefunded}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card': return t.creditCard;
      case 'debit_card': return t.debitCard;
      case 'bank_transfer': return t.bankTransfer;
      case 'e_wallet': return t.eWallet;
      case 'cod': return t.cod;
      case 'crypto': return t.crypto;
      default: return type;
    }
  };

  const handleProcessRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsRefundDialogOpen(true);
  };

  const handleViewDetails = (transaction: Transaction) => {
    // Implementation for viewing transaction details
    toast({
      title: "Transaction Details",
      description: `Viewing details for ${transaction.transactionId}`,
    });
  };

  const handleExportTransactions = () => {
    // Implementation for exporting transactions
    toast({
      title: "Export Started",
      description: "Transaction data is being exported...",
    });
  };

  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalAmount: transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
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
            <Button variant="outline" onClick={handleExportTransactions}>
              <Download className="h-4 w-4 mr-2" />
              {t.exportTransactions}
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
              <CreditCard className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalTransactions}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.completedTransactions}</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.failedTransactions}</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalAmount}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount, language)}</p>
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
                <SelectItem value="processing">{t.processing}</SelectItem>
                <SelectItem value="completed">{t.completed}</SelectItem>
                <SelectItem value="failed">{t.failed}</SelectItem>
                <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                <SelectItem value="refunded">{t.refunded}</SelectItem>
                <SelectItem value="partially_refunded">{t.partiallyRefunded}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map(method => (
                  <SelectItem key={method._id} value={method.name}>
                    {getMethodName(method)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noTransactions}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orderNumber}</TableHead>
                  <TableHead>{t.transactionId}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.method}</TableHead>
                  <TableHead>{t.amount}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.processedAt}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="font-mono">{transaction.orderNumber}</TableCell>
                    <TableCell className="font-mono">{transaction.transactionId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.customerName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.paymentMethod}</div>
                        <div className="text-sm text-muted-foreground">{transaction.paymentProvider}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount, language)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.processedAt 
                        ? new Date(transaction.processedAt).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t.viewDetails}
                          </DropdownMenuItem>
                          {transaction.status === 'completed' && (
                            <DropdownMenuItem onClick={() => handleProcessRefund(transaction)}>
                              <TrendingDown className="h-4 w-4 mr-2" />
                              {t.processRefund}
                            </DropdownMenuItem>
                          )}
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

      {/* Refunds Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.refunds}</CardTitle>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No refunds found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>{t.refundAmount}</TableHead>
                  <TableHead>{t.refundReason}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund._id}>
                    <TableCell className="font-mono">{refund.transactionId}</TableCell>
                    <TableCell className="font-mono">{refund.orderId}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(refund.amount, language)}
                    </TableCell>
                    <TableCell>{refund.reason}</TableCell>
                    <TableCell>
                      <Badge variant={refund.status === 'approved' ? 'default' : 'secondary'}>
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{refund.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.processRefund}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Transaction Details</h3>
                <p className="text-sm text-muted-foreground">
                  Order: {selectedTransaction.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(selectedTransaction.amount, language)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Customer: {selectedTransaction.customerName}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.refundAmount}</label>
                <Input
                  type="number"
                  placeholder="Enter refund amount"
                  max={selectedTransaction.amount}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.refundReason}</label>
                <Input
                  placeholder="Enter refund reason"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Refund Processed",
                    description: "Refund request has been submitted for approval.",
                  });
                  setIsRefundDialogOpen(false);
                }}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
