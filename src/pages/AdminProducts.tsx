import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Search,
  Filter,
  Image as ImageIcon,
  Tag,
  Package
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
import { useNavigate } from "react-router-dom";
import { Product, CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { Category } from "@/types/category";
import { mockProducts } from "@/data/products";
import { mockCategories } from "@/data/categories";
import { ProductForm } from "@/components/ProductForm";

export default function AdminProducts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [language, setLanguage] = useState("vi");

  const translations = {
    en: {
      title: "Product Management",
      subtitle: "Manage your products",
      back: "Back to Dashboard",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      deleteProduct: "Delete Product",
      searchPlaceholder: "Search products...",
      filterByCategory: "Filter by category",
      allCategories: "All Categories",
      name: "Name",
      nameEn: "Name (English)",
      nameJa: "Name (Japanese)",
      description: "Description",
      descriptionEn: "Description (English)",
      descriptionJa: "Description (Japanese)",
      price: "Price",
      originalPrice: "Original Price",
      category: "Category",
      images: "Images",
      sizes: "Sizes",
      colors: "Colors",
      stock: "Stock",
      tags: "Tags",
      isActive: "Active",
      isFeatured: "Featured",
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
      featured: "Featured",
      notFeatured: "Not Featured",
      addImage: "Add Image URL",
      addSize: "Add Size",
      addColor: "Add Color",
      addTag: "Add Tag",
      remove: "Remove",
      imageUrl: "Image URL",
      size: "Size",
      color: "Color",
      tag: "Tag"
    },
    vi: {
      title: "Quản lý sản phẩm",
      subtitle: "Quản lý các sản phẩm của bạn",
      back: "Quay lại Dashboard",
      addProduct: "Thêm sản phẩm",
      editProduct: "Chỉnh sửa sản phẩm",
      deleteProduct: "Xóa sản phẩm",
      searchPlaceholder: "Tìm kiếm sản phẩm...",
      filterByCategory: "Lọc theo danh mục",
      allCategories: "Tất cả danh mục",
      name: "Tên",
      nameEn: "Tên (Tiếng Anh)",
      nameJa: "Tên (Tiếng Nhật)",
      description: "Mô tả",
      descriptionEn: "Mô tả (Tiếng Anh)",
      descriptionJa: "Mô tả (Tiếng Nhật)",
      price: "Giá",
      originalPrice: "Giá gốc",
      category: "Danh mục",
      images: "Hình ảnh",
      sizes: "Kích thước",
      colors: "Màu sắc",
      stock: "Tồn kho",
      tags: "Thẻ",
      isActive: "Hoạt động",
      isFeatured: "Nổi bật",
      actions: "Thao tác",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      deleteWarning: "Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn.",
      productCreated: "Tạo sản phẩm thành công",
      productUpdated: "Cập nhật sản phẩm thành công",
      productDeleted: "Xóa sản phẩm thành công",
      error: "Đã xảy ra lỗi",
      noProducts: "Không tìm thấy sản phẩm nào",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      featured: "Nổi bật",
      notFeatured: "Không nổi bật",
      addImage: "Thêm URL hình ảnh",
      addSize: "Thêm kích thước",
      addColor: "Thêm màu sắc",
      addTag: "Thêm thẻ",
      remove: "Xóa",
      imageUrl: "URL hình ảnh",
      size: "Kích thước",
      color: "Màu sắc",
      tag: "Thẻ"
    },
    ja: {
      title: "商品管理",
      subtitle: "商品の管理",
      back: "ダッシュボードに戻る",
      addProduct: "商品を追加",
      editProduct: "商品を編集",
      deleteProduct: "商品を削除",
      searchPlaceholder: "商品を検索...",
      filterByCategory: "カテゴリでフィルター",
      allCategories: "すべてのカテゴリ",
      name: "名前",
      nameEn: "名前（英語）",
      nameJa: "名前（日本語）",
      description: "説明",
      descriptionEn: "説明（英語）",
      descriptionJa: "説明（日本語）",
      price: "価格",
      originalPrice: "元の価格",
      category: "カテゴリ",
      images: "画像",
      sizes: "サイズ",
      colors: "色",
      stock: "在庫",
      tags: "タグ",
      isActive: "アクティブ",
      isFeatured: "おすすめ",
      actions: "操作",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      deleteConfirm: "この商品を削除してもよろしいですか？",
      deleteWarning: "この操作は元に戻せません。商品は永続的に削除されます。",
      productCreated: "商品が正常に作成されました",
      productUpdated: "商品が正常に更新されました",
      productDeleted: "商品が正常に削除されました",
      error: "エラーが発生しました",
      noProducts: "商品が見つかりません",
      active: "アクティブ",
      inactive: "非アクティブ",
      featured: "おすすめ",
      notFeatured: "おすすめではない",
      addImage: "画像URLを追加",
      addSize: "サイズを追加",
      addColor: "色を追加",
      addTag: "タグを追加",
      remove: "削除",
      imageUrl: "画像URL",
      size: "サイズ",
      color: "色",
      tag: "タグ"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load data
    setProducts(mockProducts);
    setCategories(mockCategories);
    setFilteredProducts(mockProducts);
  }, [navigate]);

  useEffect(() => {
    let filtered = products;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameJa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleCreateProduct = (formData: CreateProductRequest) => {
    const newProduct: Product = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: categories.find(cat => cat.id === formData.categoryId)
    };
    
    setProducts(prev => [...prev, newProduct]);
    setIsCreateDialogOpen(false);
    toast({
      title: t.productCreated,
    });
  };

  const handleUpdateProduct = (formData: UpdateProductRequest) => {
    if (!editingProduct) return;
    
    const updatedProduct: Product = {
      ...editingProduct,
      ...formData,
      updatedAt: new Date().toISOString(),
      category: categories.find(cat => cat.id === (formData.categoryId || editingProduct.categoryId))
    };
    
    setProducts(prev => prev.map(prod => 
      prod.id === editingProduct.id ? updatedProduct : prod
    ));
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({
      title: t.productUpdated,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(prod => prod.id !== productId));
    toast({
      title: t.productDeleted,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
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
                translations={t}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t.filterByCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t.allCategories}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? t.active : t.inactive}
                    </Badge>
                    {product.isFeatured && (
                      <Badge variant="outline">{t.featured}</Badge>
                    )}
                  </div>
                </div>
                {product.nameEn && (
                  <p className="text-sm text-muted-foreground">{product.nameEn}</p>
                )}
                {product.nameJa && (
                  <p className="text-sm text-muted-foreground">{product.nameJa}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {t.category}: {product.category?.name || "N/A"}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {t.stock}: {product.stock}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.slice(0, 3).map((size) => (
                      <Badge key={size} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                    {product.sizes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.sizes.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                              onClick={() => handleDeleteProduct(product.id)}
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
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.noProducts}</p>
          </div>
        )}
      </main>

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
              translations={t}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

