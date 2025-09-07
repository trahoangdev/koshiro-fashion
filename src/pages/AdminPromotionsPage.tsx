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
  Copy,
  Eye,
  Calendar,
  Percent,
  Tag,
  Users,
  ShoppingCart,
  Download,
  Upload,
  RefreshCw,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";

interface Promotion {
  _id: string;
  code: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableUsers?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPromotionsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Promotion Management",
      subtitle: "Manage discounts, coupons, and promotional campaigns",
      createPromotion: "Create Promotion",
      search: "Search promotions...",
      code: "Code",
      name: "Name",
      type: "Type",
      value: "Value",
      usage: "Usage",
      status: "Status",
      startDate: "Start Date",
      endDate: "End Date",
      actions: "Actions",
      percentage: "Percentage",
      fixed: "Fixed Amount",
      freeShipping: "Free Shipping",
      active: "Active",
      inactive: "Inactive",
      expired: "Expired",
      edit: "Edit",
      delete: "Delete",
      copy: "Copy Code",
      view: "View Details",
      noPromotions: "No promotions found",
      createNew: "Create New Promotion",
      totalPromotions: "Total Promotions",
      activePromotions: "Active Promotions",
      expiredPromotions: "Expired Promotions"
    },
    vi: {
      title: "Quản lý Khuyến mãi",
      subtitle: "Quản lý giảm giá, mã giảm giá và chiến dịch khuyến mãi",
      createPromotion: "Tạo Khuyến mãi",
      search: "Tìm kiếm khuyến mãi...",
      code: "Mã",
      name: "Tên",
      type: "Loại",
      value: "Giá trị",
      usage: "Sử dụng",
      status: "Trạng thái",
      startDate: "Ngày bắt đầu",
      endDate: "Ngày kết thúc",
      actions: "Thao tác",
      percentage: "Phần trăm",
      fixed: "Số tiền cố định",
      freeShipping: "Miễn phí vận chuyển",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      expired: "Hết hạn",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      copy: "Sao chép mã",
      view: "Xem chi tiết",
      noPromotions: "Không tìm thấy khuyến mãi",
      createNew: "Tạo khuyến mãi mới",
      totalPromotions: "Tổng khuyến mãi",
      activePromotions: "Khuyến mãi hoạt động",
      expiredPromotions: "Khuyến mãi hết hạn"
    },
    ja: {
      title: "プロモーション管理",
      subtitle: "割引、クーポン、プロモーションキャンペーンの管理",
      createPromotion: "プロモーション作成",
      search: "プロモーション検索...",
      code: "コード",
      name: "名前",
      type: "タイプ",
      value: "値",
      usage: "使用",
      status: "ステータス",
      startDate: "開始日",
      endDate: "終了日",
      actions: "アクション",
      percentage: "パーセント",
      fixed: "固定金額",
      freeShipping: "送料無料",
      active: "アクティブ",
      inactive: "非アクティブ",
      expired: "期限切れ",
      edit: "編集",
      delete: "削除",
      copy: "コードコピー",
      view: "詳細表示",
      noPromotions: "プロモーションが見つかりません",
      createNew: "新しいプロモーションを作成",
      totalPromotions: "総プロモーション",
      activePromotions: "アクティブプロモーション",
      expiredPromotions: "期限切れプロモーション"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Mock data for demonstration
  useEffect(() => {
    const mockPromotions: Promotion[] = [
      {
        _id: "1",
        code: "WELCOME10",
        name: "Chào mừng khách hàng mới",
        nameEn: "Welcome New Customer",
        nameJa: "新規顧客歓迎",
        description: "Giảm 10% cho đơn hàng đầu tiên",
        descriptionEn: "10% off on first order",
        descriptionJa: "初回注文10%オフ",
        type: "percentage",
        value: 10,
        minOrderAmount: 500000,
        maxDiscountAmount: 100000,
        usageLimit: 1000,
        usedCount: 245,
        isActive: true,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "2",
        code: "FREESHIP",
        name: "Miễn phí vận chuyển",
        nameEn: "Free Shipping",
        nameJa: "送料無料",
        description: "Miễn phí vận chuyển cho đơn hàng từ 1 triệu",
        descriptionEn: "Free shipping for orders over 1M VND",
        descriptionJa: "100万円以上の注文で送料無料",
        type: "free_shipping",
        value: 0,
        minOrderAmount: 1000000,
        usageLimit: 500,
        usedCount: 89,
        isActive: true,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        _id: "3",
        code: "SAVE50K",
        name: "Tiết kiệm 50k",
        nameEn: "Save 50k",
        nameJa: "5万円節約",
        description: "Giảm 50,000 VND cho đơn hàng từ 500k",
        descriptionEn: "50,000 VND off for orders over 500k",
        descriptionJa: "50万円以上の注文で5万円オフ",
        type: "fixed",
        value: 50000,
        minOrderAmount: 500000,
        usageLimit: 200,
        usedCount: 156,
        isActive: false,
        startDate: "2024-01-01",
        endDate: "2024-06-30",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      }
    ];

    setPromotions(mockPromotions);
    setFilteredPromotions(mockPromotions);
    setIsLoading(false);
  }, []);

  // Filter promotions
  useEffect(() => {
    let filtered = promotions;

    if (searchTerm) {
      filtered = filtered.filter(promo => 
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promo.nameEn && promo.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (promo.nameJa && promo.nameJa.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(promo => promo.type === filterType);
    }

    if (filterStatus !== "all") {
      const now = new Date();
      filtered = filtered.filter(promo => {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        
        if (filterStatus === "active") {
          return promo.isActive && startDate <= now && endDate >= now;
        } else if (filterStatus === "inactive") {
          return !promo.isActive;
        } else if (filterStatus === "expired") {
          return endDate < now;
        }
        return true;
      });
    }

    setFilteredPromotions(filtered);
  }, [promotions, searchTerm, filterType, filterStatus]);

  const getPromotionName = (promotion: Promotion) => {
    switch (language) {
      case 'vi': return promotion.name;
      case 'ja': return promotion.nameJa || promotion.name;
      default: return promotion.nameEn || promotion.name;
    }
  };

  const getPromotionDescription = (promotion: Promotion) => {
    switch (language) {
      case 'vi': return promotion.description;
      case 'ja': return promotion.descriptionJa || promotion.description;
      default: return promotion.descriptionEn || promotion.description;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return t.percentage;
      case 'fixed': return t.fixed;
      case 'free_shipping': return t.freeShipping;
      default: return type;
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return <Badge variant="secondary">{t.inactive}</Badge>;
    }

    if (endDate < now) {
      return <Badge variant="destructive">{t.expired}</Badge>;
    }

    if (startDate > now) {
      return <Badge variant="outline">Upcoming</Badge>;
    }

    return <Badge variant="default">{t.active}</Badge>;
  };

  const getValueDisplay = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}%`;
      case 'fixed':
        return formatCurrency(promotion.value, language);
      case 'free_shipping':
        return t.freeShipping;
      default:
        return promotion.value.toString();
    }
  };

  const handleCreatePromotion = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsEditDialogOpen(true);
  };

  const handleDeletePromotion = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setIsDeleteDialogOpen(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Code "${code}" copied to clipboard`,
    });
  };

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.isActive && new Date(p.endDate) >= new Date()).length,
    expired: promotions.filter(p => new Date(p.endDate) < new Date()).length
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
            <Button onClick={handleCreatePromotion}>
              <Plus className="h-4 w-4 mr-2" />
              {t.createPromotion}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalPromotions}</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {filteredPromotions.length} showing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activePromotions}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.expiredPromotions}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">
                Expired promotions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promotions.length > 0 ? Math.round((promotions.reduce((sum, p) => sum + p.usedCount, 0) / promotions.reduce((sum, p) => sum + (p.usageLimit || 0), 0)) * 100) || 0 : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average usage
              </p>
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
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">{t.percentage}</SelectItem>
                    <SelectItem value="fixed">{t.fixed}</SelectItem>
                    <SelectItem value="free_shipping">{t.freeShipping}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                    <SelectItem value="expired">{t.expired}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPromotions.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noPromotions}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.code}</TableHead>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.value}</TableHead>
                  <TableHead>{t.usage}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.startDate}</TableHead>
                  <TableHead>{t.endDate}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion._id}>
                    <TableCell className="font-mono">{promotion.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getPromotionName(promotion)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getPromotionDescription(promotion)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(promotion.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getValueDisplay(promotion)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{promotion.usedCount}</span>
                        {promotion.usageLimit && (
                          <span className="text-muted-foreground">
                            / {promotion.usageLimit}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion)}</TableCell>
                    <TableCell>
                      {new Date(promotion.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(promotion.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPromotion(promotion)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyCode(promotion.code)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t.copy}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePromotion(promotion)}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the promotion "{promotionToDelete?.code}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (promotionToDelete) {
                  setPromotions(prev => prev.filter(p => p._id !== promotionToDelete._id));
                  setFilteredPromotions(prev => prev.filter(p => p._id !== promotionToDelete._id));
                  toast({
                    title: "Promotion deleted",
                    description: `Promotion "${promotionToDelete.code}" has been deleted.`,
                  });
                }
                setIsDeleteDialogOpen(false);
                setPromotionToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}
