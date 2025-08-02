import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  Loader2
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
      allCategories: "Tất cả danh mục",
      name: "Tên",
      price: "Giá",
      category: "Danh mục",
      stock: "Tồn kho",
      status: "Trạng thái",
      actions: "Thao tác",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      deleteWarning: "Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn.",
      productCreated: "Sản phẩm đã được tạo thành công",
      productUpdated: "Sản phẩm đã được cập nhật thành công",
      productDeleted: "Sản phẩm đã được xóa thành công",
      error: "Đã xảy ra lỗi",
      noProducts: "Không tìm thấy sản phẩm nào",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách sản phẩm"
    },
    en: {
      title: "Product Management",
      subtitle: "Manage your products",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      deleteProduct: "Delete Product",
      searchPlaceholder: "Search products...",
      filterByCategory: "Filter by category",
      allCategories: "All Categories",
      name: "Name",
      price: "Price",
      category: "Category",
      stock: "Stock",
      status: "Status",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this product?",
      deleteWarning: "This action cannot be undone. This will permanently delete the product.",
      productCreated: "Product created successfully",
      productUpdated: "Product updated successfully",
      productDeleted: "Product deleted successfully",
      error: "An error occurred",
      noProducts: "No products found",
      active: "Active",
      inactive: "Inactive",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load product list"
    },
    ja: {
      title: "商品管理",
      subtitle: "商品リストを管理",
      addProduct: "商品追加",
      editProduct: "商品編集",
      deleteProduct: "商品削除",
      searchPlaceholder: "商品を検索...",
      filterByCategory: "カテゴリで絞り込み",
      allCategories: "すべてのカテゴリ",
      name: "名前",
      price: "価格",
      category: "カテゴリ",
      stock: "在庫",
      status: "ステータス",
      actions: "操作",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      deleteConfirm: "この商品を削除してもよろしいですか？",
      deleteWarning: "この操作は元に戻せません。商品は永久に削除されます。",
      productCreated: "商品が正常に作成されました",
      productUpdated: "商品が正常に更新されました",
      productDeleted: "商品が正常に削除されました",
      error: "エラーが発生しました",
      noProducts: "商品が見つかりません",
      active: "アクティブ",
      inactive: "非アクティブ",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "商品リストを読み込めませんでした"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Load language preference


  // Load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading admin products data...');
      
      // Load products and categories
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.getAdminProducts({ page: 1, limit: 50 }),
        api.getAdminCategories({ isActive: true })
      ]);
      
      console.log('Products response:', productsResponse);
      console.log('Categories response:', categoriesResponse);
      
      const productsData = productsResponse.data || [];
      const categoriesData = categoriesResponse.categories || [];
      
      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
      
    } catch (error) {
      console.error('Error loading admin products data:', error);
      toast({
        title: t.errorLoading,
        description: t.errorLoadingDesc,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [toast, t.errorLoading, t.errorLoadingDesc]);

  // Filter products
  useEffect(() => {
    let filtered = products;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameJa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categoryId?._id === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleCreateProduct = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await api.createProduct(formData);
      toast({
        title: "Success",
        description: t.productCreated,
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: t.error,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      await api.updateProduct(editingProduct._id, formData);
      toast({
        title: "Success",
        description: t.productUpdated,
      });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: t.error,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('Deleting product:', productId);
      await api.deleteProduct(productId);
      
      // Reload products
      const productsResponse = await api.getAdminProducts({ page: 1, limit: 50 });
      setProducts(productsResponse.data || []);
      
      toast({
        title: t.productDeleted,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: t.error,
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{t.loading}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          
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
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.editProduct}</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSubmit={handleUpdateProduct}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingProduct(null);
                }}
                isLoading={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
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
        </div>

        {/* Products Grid */}
        <div className="grid gap-6">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.noProducts}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.nameEn} / {product.nameJa}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.categoryId?.name || 'No category'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrencyForDisplay(product.price)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.stock}: {product.stock}
                        </p>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? t.active : t.inactive}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.deleteWarning}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.editProduct}</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSubmit={handleUpdateProduct}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingProduct(null);
                }}
                isLoading={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

