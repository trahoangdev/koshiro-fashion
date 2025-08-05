import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  Loader2,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Tag,
  MoreHorizontal,
  Grid3X3,
  List,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Product, Category } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import AdminLayout from "@/components/AdminLayout";
import ProductForm from "@/components/ProductForm";
import { api } from "@/lib/api";

interface ProductFormData {
  name: string;
  nameEn: string;
  nameJa: string;
  description: string;
  descriptionEn: string;
  descriptionJa: string;
  price: number;
  originalPrice: number;
  categoryId: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
}

export default function AdminProducts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  const translations = {
    vi: {
      title: "Quản lý Sản phẩm",
      subtitle: "Quản lý danh sách sản phẩm",
      addProduct: "Thêm Sản phẩm",
      editProduct: "Chỉnh sửa Sản phẩm",
      deleteProduct: "Xóa Sản phẩm",
      searchPlaceholder: "Tìm kiếm sản phẩm...",
      filterByCategory: "Lọc theo danh mục",
      filterByStatus: "Lọc theo trạng thái",
      allCategories: "Tất cả danh mục",
      allStatus: "Tất cả trạng thái",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      featured: "Nổi bật",
      onSale: "Đang giảm giá",
      name: "Tên",
      price: "Giá",
      category: "Danh mục",
      stock: "Tồn kho",
      status: "Trạng thái",
      actions: "Thao tác",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      confirmDelete: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      deleteSuccess: "Xóa sản phẩm thành công",
      deleteError: "Lỗi khi xóa sản phẩm",
      createSuccess: "Tạo sản phẩm thành công",
      createError: "Lỗi khi tạo sản phẩm",
      updateSuccess: "Cập nhật sản phẩm thành công",
      updateError: "Lỗi khi cập nhật sản phẩm",
      loadError: "Lỗi khi tải dữ liệu",
      noProducts: "Không có sản phẩm nào",
      bulkActions: "Thao tác hàng loạt",
      selectAll: "Chọn tất cả",
      deselectAll: "Bỏ chọn tất cả",
      export: "Xuất dữ liệu",
      import: "Nhập dữ liệu",
      refresh: "Làm mới",
      gridView: "Xem dạng lưới",
      listView: "Xem dạng danh sách",
      lowStock: "Sắp hết hàng",
      outOfStock: "Hết hàng",
      inStock: "Còn hàng"
    },
    en: {
      title: "Product Management",
      subtitle: "Manage your product catalog",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      deleteProduct: "Delete Product",
      searchPlaceholder: "Search products...",
      filterByCategory: "Filter by category",
      filterByStatus: "Filter by status",
      allCategories: "All categories",
      allStatus: "All status",
      active: "Active",
      inactive: "Inactive",
      featured: "Featured",
      onSale: "On Sale",
      name: "Name",
      price: "Price",
      category: "Category",
      stock: "Stock",
      status: "Status",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this product?",
      deleteSuccess: "Product deleted successfully",
      deleteError: "Error deleting product",
      createSuccess: "Product created successfully",
      createError: "Error creating product",
      updateSuccess: "Product updated successfully",
      updateError: "Error updating product",
      loadError: "Error loading data",
      noProducts: "No products found",
      bulkActions: "Bulk Actions",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      gridView: "Grid View",
      listView: "List View",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      inStock: "In Stock"
    },
    ja: {
      title: "商品管理",
      subtitle: "商品カタログを管理",
      addProduct: "商品追加",
      editProduct: "商品編集",
      deleteProduct: "商品削除",
      searchPlaceholder: "商品を検索...",
      filterByCategory: "カテゴリで絞り込み",
      filterByStatus: "ステータスで絞り込み",
      allCategories: "すべてのカテゴリ",
      allStatus: "すべてのステータス",
      active: "アクティブ",
      inactive: "非アクティブ",
      featured: "おすすめ",
      onSale: "セール中",
      name: "名前",
      price: "価格",
      category: "カテゴリ",
      stock: "在庫",
      status: "ステータス",
      actions: "操作",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      confirmDelete: "この商品を削除してもよろしいですか？",
      deleteSuccess: "商品が正常に削除されました",
      deleteError: "商品の削除中にエラーが発生しました",
      createSuccess: "商品が正常に作成されました",
      createError: "商品の作成中にエラーが発生しました",
      updateSuccess: "商品が正常に更新されました",
      updateError: "商品の更新中にエラーが発生しました",
      loadError: "データの読み込み中にエラーが発生しました",
      noProducts: "商品が見つかりません",
      bulkActions: "一括操作",
      selectAll: "すべて選択",
      deselectAll: "選択解除",
      export: "エクスポート",
      import: "インポート",
      refresh: "更新",
      gridView: "グリッド表示",
      listView: "リスト表示",
      lowStock: "在庫不足",
      outOfStock: "在庫切れ",
      inStock: "在庫あり"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.getAdminProducts(),
        api.getCategories()
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: t.loadError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameJa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Filter by status
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filtered = filtered.filter(product => product.isActive);
          break;
        case "inactive":
          filtered = filtered.filter(product => !product.isActive);
          break;
        case "featured":
          filtered = filtered.filter(product => product.isFeatured);
          break;
        case "onSale":
          filtered = filtered.filter(product => product.onSale);
          break;
        case "lowStock":
          filtered = filtered.filter(product => product.stock <= 10 && product.stock > 0);
          break;
        case "outOfStock":
          filtered = filtered.filter(product => product.stock === 0);
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const handleCreateProduct = async (formData: ProductFormData) => {
    try {
      setIsSubmitting(true);
      await api.createProduct(formData);
      toast({
        title: t.createSuccess,
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: t.createError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (!editingProduct) return;
    
    try {
      setIsSubmitting(true);
      await api.updateProduct(editingProduct._id, formData);
      toast({
        title: t.updateSuccess,
      });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: t.updateError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      toast({
        title: t.deleteSuccess,
      });
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: t.deleteError,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedProducts.map(id => api.deleteProduct(id)));
      toast({
        title: `${selectedProducts.length} products deleted successfully`,
      });
      setSelectedProducts([]);
      loadData();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast({
        title: "Error bulk deleting products",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: t.outOfStock, variant: "destructive" as const };
    if (stock <= 10) return { label: t.lowStock, variant: "secondary" as const };
    return { label: t.inStock, variant: "default" as const };
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
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
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t.export}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {t.import}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addProduct}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t.addProduct}</DialogTitle>
                </DialogHeader>
                <ProductForm
                  categories={categories}
                  onSubmit={handleCreateProduct}
                  isSubmitting={isSubmitting}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t.filterByCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStatus}</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                    <SelectItem value="featured">{t.featured}</SelectItem>
                    <SelectItem value="onSale">{t.onSale}</SelectItem>
                    <SelectItem value="lowStock">{t.lowStock}</SelectItem>
                    <SelectItem value="outOfStock">{t.outOfStock}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {selectedProducts.length} products selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedProducts.length === filteredProducts.length ? t.deselectAll : t.selectAll}
                  </Button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Products</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedProducts.length} selected products? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onCheckedChange={() => handleSelectProduct(product._id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.deleteProduct}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.confirmDelete}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product._id)}>
                                {t.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                      {product.isFeatured && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{formatCurrencyForDisplay(product.price)}</span>
                      <Badge variant={getStockStatus(product.stock).variant}>
                        {getStockStatus(product.stock).label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Stock: {product.stock}</span>
                      {product.onSale && <Badge variant="secondary" className="text-xs">Sale</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">
                        <Checkbox
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left p-4">{t.name}</th>
                      <th className="text-left p-4">{t.category}</th>
                      <th className="text-left p-4">{t.price}</th>
                      <th className="text-left p-4">{t.stock}</th>
                      <th className="text-left p-4">{t.status}</th>
                      <th className="text-left p-4">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedProducts.includes(product._id)}
                            onCheckedChange={() => handleSelectProduct(product._id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-full h-full p-2 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {categories.find(c => c._id === product.categoryId)?.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {categories.find(c => c._id === product.categoryId)?.name}
                        </td>
                        <td className="p-4 font-medium">
                          {formatCurrencyForDisplay(product.price)}
                        </td>
                        <td className="p-4">
                          <Badge variant={getStockStatus(product.stock).variant}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {product.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {product.isFeatured && <Star className="h-4 w-4 text-yellow-500" />}
                            {product.onSale && <Badge variant="secondary">Sale</Badge>}
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t.deleteProduct}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t.confirmDelete}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product._id)}>
                                      {t.delete}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.noProducts}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first product"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addProduct}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.editProduct}</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm
                categories={categories}
                product={editingProduct}
                onSubmit={handleUpdateProduct}
                isSubmitting={isSubmitting}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingProduct(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

