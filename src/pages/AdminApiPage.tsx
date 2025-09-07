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
  Key,
  Globe,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Zap,
  Shield,
  Database,
  Server,
  Code,
  Link,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
  rateLimit: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Integration {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  type: 'payment' | 'shipping' | 'email' | 'sms' | 'analytics' | 'social' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  config: Record<string, any>;
  lastSync?: string;
  errorCount: number;
  successCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiLog {
  _id: string;
  apiKey: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  requestBody?: any;
  responseBody?: any;
  error?: string;
  timestamp: string;
}

export default function AdminApiPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ApiLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false);
  const [isCreateIntegrationDialogOpen, setIsCreateIntegrationDialogOpen] = useState(false);
  const [isEditKeyDialogOpen, setIsEditKeyDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "API & Integration Management",
      subtitle: "Manage API keys, integrations, and monitor API usage",
      createKey: "Create API Key",
      createIntegration: "Create Integration",
      search: "Search...",
      apiKeys: "API Keys",
      integrations: "Integrations",
      apiLogs: "API Logs",
      name: "Name",
      key: "Key",
      permissions: "Permissions",
      status: "Status",
      usage: "Usage",
      lastUsed: "Last Used",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      expired: "Expired",
      payment: "Payment",
      shipping: "Shipping",
      email: "Email",
      sms: "SMS",
      analytics: "Analytics",
      social: "Social",
      other: "Other",
      noKeys: "No API keys found",
      noIntegrations: "No integrations found",
      noLogs: "No API logs found",
      totalKeys: "Total Keys",
      activeKeys: "Active Keys",
      totalIntegrations: "Total Integrations",
      activeIntegrations: "Active Integrations",
      totalRequests: "Total Requests",
      successRate: "Success Rate",
      copyKey: "Copy Key",
      regenerateKey: "Regenerate Key",
      viewLogs: "View Logs",
      testConnection: "Test Connection",
      syncNow: "Sync Now",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      generateNewKey: "Generate New Key",
      keyDescription: "Key Description",
      selectPermissions: "Select Permissions",
      integrationName: "Integration Name",
      integrationType: "Integration Type",
      provider: "Provider",
      configuration: "Configuration",
      endpoint: "Endpoint",
      method: "Method",
      statusCode: "Status Code",
      responseTime: "Response Time",
      ipAddress: "IP Address",
      timestamp: "Timestamp",
      exportLogs: "Export Logs",
      clearLogs: "Clear Logs"
    },
    vi: {
      title: "Quản lý API & Tích hợp",
      subtitle: "Quản lý API keys, tích hợp và giám sát sử dụng API",
      createKey: "Tạo API Key",
      createIntegration: "Tạo Tích hợp",
      search: "Tìm kiếm...",
      apiKeys: "API Keys",
      integrations: "Tích hợp",
      apiLogs: "Logs API",
      name: "Tên",
      key: "Key",
      permissions: "Quyền hạn",
      status: "Trạng thái",
      usage: "Sử dụng",
      lastUsed: "Sử dụng cuối",
      actions: "Thao tác",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      expired: "Hết hạn",
      payment: "Thanh toán",
      shipping: "Vận chuyển",
      email: "Email",
      sms: "SMS",
      analytics: "Phân tích",
      social: "Mạng xã hội",
      other: "Khác",
      noKeys: "Không tìm thấy API key",
      noIntegrations: "Không tìm thấy tích hợp",
      noLogs: "Không tìm thấy logs API",
      totalKeys: "Tổng Keys",
      activeKeys: "Keys hoạt động",
      totalIntegrations: "Tổng tích hợp",
      activeIntegrations: "Tích hợp hoạt động",
      totalRequests: "Tổng yêu cầu",
      successRate: "Tỷ lệ thành công",
      copyKey: "Sao chép Key",
      regenerateKey: "Tạo lại Key",
      viewLogs: "Xem Logs",
      testConnection: "Test kết nối",
      syncNow: "Đồng bộ ngay",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      save: "Lưu",
      cancel: "Hủy",
      generateNewKey: "Tạo Key mới",
      keyDescription: "Mô tả Key",
      selectPermissions: "Chọn quyền hạn",
      integrationName: "Tên tích hợp",
      integrationType: "Loại tích hợp",
      provider: "Nhà cung cấp",
      configuration: "Cấu hình",
      endpoint: "Endpoint",
      method: "Method",
      statusCode: "Mã trạng thái",
      responseTime: "Thời gian phản hồi",
      ipAddress: "Địa chỉ IP",
      timestamp: "Thời gian",
      exportLogs: "Xuất Logs",
      clearLogs: "Xóa Logs"
    },
    ja: {
      title: "API・統合管理",
      subtitle: "APIキー、統合の管理、API使用状況の監視",
      createKey: "APIキー作成",
      createIntegration: "統合作成",
      search: "検索...",
      apiKeys: "APIキー",
      integrations: "統合",
      apiLogs: "APIログ",
      name: "名前",
      key: "キー",
      permissions: "権限",
      status: "ステータス",
      usage: "使用",
      lastUsed: "最終使用",
      actions: "アクション",
      active: "アクティブ",
      inactive: "非アクティブ",
      expired: "期限切れ",
      payment: "支払い",
      shipping: "配送",
      email: "メール",
      sms: "SMS",
      analytics: "分析",
      social: "ソーシャル",
      other: "その他",
      noKeys: "APIキーが見つかりません",
      noIntegrations: "統合が見つかりません",
      noLogs: "APIログが見つかりません",
      totalKeys: "総キー数",
      activeKeys: "アクティブキー",
      totalIntegrations: "総統合数",
      activeIntegrations: "アクティブ統合",
      totalRequests: "総リクエスト数",
      successRate: "成功率",
      copyKey: "キーコピー",
      regenerateKey: "キー再生成",
      viewLogs: "ログ表示",
      testConnection: "接続テスト",
      syncNow: "今すぐ同期",
      edit: "編集",
      delete: "削除",
      save: "保存",
      cancel: "キャンセル",
      generateNewKey: "新しいキー生成",
      keyDescription: "キー説明",
      selectPermissions: "権限選択",
      integrationName: "統合名",
      integrationType: "統合タイプ",
      provider: "プロバイダー",
      configuration: "設定",
      endpoint: "エンドポイント",
      method: "メソッド",
      statusCode: "ステータスコード",
      responseTime: "レスポンス時間",
      ipAddress: "IPアドレス",
      timestamp: "タイムスタンプ",
      exportLogs: "ログエクスポート",
      clearLogs: "ログクリア"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Mock data for demonstration
  useEffect(() => {
    const mockApiKeys: ApiKey[] = [
      {
        _id: "1",
        name: "Frontend App",
        key: "ak_live_1234567890abcdef",
        description: "API key for frontend application",
        permissions: ["read:products", "read:orders", "create:orders"],
        isActive: true,
        lastUsed: "2024-01-22T10:30:00Z",
        usageCount: 15420,
        rateLimit: 1000,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-22T10:30:00Z"
      },
      {
        _id: "2",
        name: "Mobile App",
        key: "ak_live_abcdef1234567890",
        description: "API key for mobile application",
        permissions: ["read:products", "read:orders", "create:orders", "update:profile"],
        isActive: true,
        lastUsed: "2024-01-21T15:45:00Z",
        usageCount: 8930,
        rateLimit: 500,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-21T15:45:00Z"
      },
      {
        _id: "3",
        name: "Webhook Integration",
        key: "ak_live_webhook123456",
        description: "API key for webhook integrations",
        permissions: ["webhook:receive"],
        isActive: false,
        lastUsed: "2024-01-15T09:20:00Z",
        usageCount: 2340,
        rateLimit: 100,
        expiresAt: "2024-02-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T09:20:00Z"
      }
    ];

    const mockIntegrations: Integration[] = [
      {
        _id: "1",
        name: "VNPay Payment",
        nameEn: "VNPay Payment",
        nameJa: "VNPay支払い",
        type: "payment",
        provider: "VNPay",
        status: "active",
        description: "Tích hợp thanh toán VNPay",
        descriptionEn: "VNPay payment integration",
        descriptionJa: "VNPay支払い統合",
        config: {
          merchantId: "MERCHANT123",
          secretKey: "SECRET456",
          endpoint: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
        },
        lastSync: "2024-01-22T10:30:00Z",
        errorCount: 5,
        successCount: 1240,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-22T10:30:00Z"
      },
      {
        _id: "2",
        name: "Giao Hàng Nhanh",
        nameEn: "Fast Delivery",
        nameJa: "高速配送",
        type: "shipping",
        provider: "GHN",
        status: "active",
        description: "Tích hợp vận chuyển GHN",
        descriptionEn: "GHN shipping integration",
        descriptionJa: "GHN配送統合",
        config: {
          apiKey: "GHN_API_KEY",
          shopId: "SHOP123",
          endpoint: "https://dev-online-gateway.ghn.vn/shiip/public-api"
        },
        lastSync: "2024-01-21T15:45:00Z",
        errorCount: 2,
        successCount: 890,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-21T15:45:00Z"
      },
      {
        _id: "3",
        name: "SendGrid Email",
        nameEn: "SendGrid Email",
        nameJa: "SendGridメール",
        type: "email",
        provider: "SendGrid",
        status: "error",
        description: "Tích hợp gửi email SendGrid",
        descriptionEn: "SendGrid email integration",
        descriptionJa: "SendGridメール統合",
        config: {
          apiKey: "SG.API_KEY",
          fromEmail: "noreply@koshiro.com",
          templateId: "TEMPLATE123"
        },
        lastSync: "2024-01-20T08:15:00Z",
        errorCount: 15,
        successCount: 2340,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-20T08:15:00Z"
      }
    ];

    const mockApiLogs: ApiLog[] = [
      {
        _id: "1",
        apiKey: "ak_live_1234567890abcdef",
        endpoint: "/api/products",
        method: "GET",
        statusCode: 200,
        responseTime: 150,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: "2024-01-22T10:30:00Z"
      },
      {
        _id: "2",
        apiKey: "ak_live_abcdef1234567890",
        endpoint: "/api/orders",
        method: "POST",
        statusCode: 201,
        responseTime: 320,
        ipAddress: "192.168.1.101",
        userAgent: "KoshiroApp/1.0.0 (iOS 17.0)",
        timestamp: "2024-01-22T10:25:00Z"
      },
      {
        _id: "3",
        apiKey: "ak_live_1234567890abcdef",
        endpoint: "/api/products/123",
        method: "GET",
        statusCode: 404,
        responseTime: 45,
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        error: "Product not found",
        timestamp: "2024-01-22T10:20:00Z"
      }
    ];

    setApiKeys(mockApiKeys);
    setIntegrations(mockIntegrations);
    setApiLogs(mockApiLogs);
    setFilteredLogs(mockApiLogs);
    setIsLoading(false);
  }, []);

  // Filter logs
  useEffect(() => {
    let filtered = apiLogs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.apiKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      const statusCode = filterStatus === "success" ? 200 : 
                        filterStatus === "error" ? 400 : 0;
      filtered = filtered.filter(log => 
        filterStatus === "success" ? log.statusCode >= 200 && log.statusCode < 300 :
        filterStatus === "error" ? log.statusCode >= 400 :
        true
      );
    }

    setFilteredLogs(filtered);
  }, [apiLogs, searchTerm, filterStatus]);

  const getIntegrationName = (integration: Integration) => {
    switch (language) {
      case 'vi': return integration.name;
      case 'ja': return integration.nameJa || integration.name;
      default: return integration.nameEn || integration.name;
    }
  };

  const getIntegrationDescription = (integration: Integration) => {
    switch (language) {
      case 'vi': return integration.description;
      case 'ja': return integration.descriptionJa || integration.description;
      default: return integration.descriptionEn || integration.description;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'payment': return t.payment;
      case 'shipping': return t.shipping;
      case 'email': return t.email;
      case 'sms': return t.sms;
      case 'analytics': return t.analytics;
      case 'social': return t.social;
      case 'other': return t.other;
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.active}</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />{t.inactive}</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCodeBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge variant="default" className="bg-green-500">{statusCode}</Badge>;
    } else if (statusCode >= 400) {
      return <Badge variant="destructive">{statusCode}</Badge>;
    } else {
      return <Badge variant="outline">{statusCode}</Badge>;
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleRegenerateKey = (keyId: string) => {
    const newKey = `ak_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys(prev => prev.map(k => 
      k._id === keyId ? { ...k, key: newKey, updatedAt: new Date().toISOString() } : k
    ));
    toast({
      title: "Key Regenerated",
      description: "API key has been regenerated successfully.",
    });
  };

  const handleTestConnection = (integrationId: string) => {
    toast({
      title: "Testing Connection",
      description: "Testing integration connection...",
    });
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Connection Test Complete",
        description: "Integration connection test completed successfully.",
      });
    }, 2000);
  };

  const handleSyncNow = (integrationId: string) => {
    toast({
      title: "Sync Started",
      description: "Integration sync has been started.",
    });
    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i._id === integrationId 
          ? { ...i, lastSync: new Date().toISOString(), successCount: i.successCount + 1 }
          : i
      ));
      toast({
        title: "Sync Complete",
        description: "Integration sync completed successfully.",
      });
    }, 3000);
  };

  const handleDeleteKey = (key: ApiKey) => {
    setKeyToDelete(key);
    setIsDeleteDialogOpen(true);
  };

  const stats = {
    totalKeys: apiKeys.length,
    activeKeys: apiKeys.filter(k => k.isActive).length,
    totalIntegrations: integrations.length,
    activeIntegrations: integrations.filter(i => i.status === 'active').length,
    totalRequests: apiLogs.length,
    successRate: apiLogs.length > 0 ? 
      Math.round((apiLogs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length / apiLogs.length) * 100) : 0
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
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
            <Button variant="outline" onClick={() => setIsCreateIntegrationDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createIntegration}
            </Button>
            <Button onClick={() => setIsCreateKeyDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createKey}
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalKeys}</p>
                <p className="text-2xl font-bold">{stats.totalKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.activeKeys}</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalIntegrations}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalIntegrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.totalRequests}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t.successRate}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.apiKeys}</CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noKeys}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.key}</TableHead>
                  <TableHead>{t.permissions}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.usage}</TableHead>
                  <TableHead>{t.lastUsed}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <div className="text-sm text-muted-foreground">{key.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {key.key.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.slice(0, 2).map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {key.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.isActive ? 
                        <Badge variant="default" className="bg-green-500">{t.active}</Badge> :
                        <Badge variant="secondary">{t.inactive}</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>{key.usageCount.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.lastUsed ? 
                        new Date(key.lastUsed).toLocaleDateString() : 
                        'Never'
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
                          <DropdownMenuItem onClick={() => handleCopyKey(key.key)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t.copyKey}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRegenerateKey(key._id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t.regenerateKey}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteKey(key)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.delete}
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

      {/* Integrations Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.integrations}</CardTitle>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noIntegrations}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.integrationType}</TableHead>
                  <TableHead>{t.provider}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getIntegrationName(integration)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getIntegrationDescription(integration)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(integration.type)}</Badge>
                    </TableCell>
                    <TableCell>{integration.provider}</TableCell>
                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${integration.successCount + integration.errorCount > 0 ? 
                                (integration.successCount / (integration.successCount + integration.errorCount)) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {integration.successCount + integration.errorCount > 0 ? 
                            Math.round((integration.successCount / (integration.successCount + integration.errorCount)) * 100) : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {integration.lastSync ? 
                        new Date(integration.lastSync).toLocaleDateString() : 
                        'Never'
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
                          <DropdownMenuItem onClick={() => handleTestConnection(integration._id)}>
                            <Zap className="h-4 w-4 mr-2" />
                            {t.testConnection}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSyncNow(integration._id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t.syncNow}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            {t.edit}
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

      {/* API Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.apiLogs}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t.exportLogs}
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                {t.clearLogs}
              </Button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noLogs}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.endpoint}</TableHead>
                  <TableHead>{t.method}</TableHead>
                  <TableHead>{t.statusCode}</TableHead>
                  <TableHead>{t.responseTime}</TableHead>
                  <TableHead>{t.ipAddress}</TableHead>
                  <TableHead>{t.timestamp}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 20).map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.method}</Badge>
                    </TableCell>
                    <TableCell>{getStatusCodeBadge(log.statusCode)}</TableCell>
                    <TableCell>{log.responseTime}ms</TableCell>
                    <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the API key "{keyToDelete?.name}"? 
              This action cannot be undone and will break any applications using this key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (keyToDelete) {
                  setApiKeys(prev => prev.filter(k => k._id !== keyToDelete._id));
                  toast({
                    title: "API Key deleted",
                    description: `API key "${keyToDelete.name}" has been deleted.`,
                  });
                }
                setIsDeleteDialogOpen(false);
                setKeyToDelete(null);
              }}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}
