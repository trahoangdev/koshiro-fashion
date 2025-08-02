import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search
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
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";
import { mockCategories } from "@/data/categories";
import AdminLayout from "@/components/AdminLayout";

export default function AdminCategories() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [language, setLanguage] = useState("vi");

  const translations = {
    en: {
      title: "Category Management",
      subtitle: "Manage product categories",
      back: "Back to Dashboard",
      addCategory: "Add Category",
      editCategory: "Edit Category",
      deleteCategory: "Delete Category",
      searchPlaceholder: "Search categories...",
      name: "Name",
      nameEn: "Name (English)",
      nameJa: "Name (Japanese)",
      description: "Description",
      descriptionEn: "Description (English)",
      descriptionJa: "Description (Japanese)",
      slug: "Slug",
      image: "Image URL",
      isActive: "Active",
      productCount: "Products",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this category?",
      deleteWarning: "This action cannot be undone. This will permanently delete the category and all associated products will be affected.",
      categoryCreated: "Category created successfully",
      categoryUpdated: "Category updated successfully",
      categoryDeleted: "Category deleted successfully",
      error: "An error occurred",
      noCategories: "No categories found",
      active: "Active",
      inactive: "Inactive"
    },
    vi: {
      title: "Quản lý danh mục",
      subtitle: "Quản lý các danh mục sản phẩm",
      back: "Quay lại Dashboard",
      addCategory: "Thêm danh mục",
      editCategory: "Chỉnh sửa danh mục",
      deleteCategory: "Xóa danh mục",
      searchPlaceholder: "Tìm kiếm danh mục...",
      name: "Tên",
      nameEn: "Tên (Tiếng Anh)",
      nameJa: "Tên (Tiếng Nhật)",
      description: "Mô tả",
      descriptionEn: "Mô tả (Tiếng Anh)",
      descriptionJa: "Mô tả (Tiếng Nhật)",
      slug: "Slug",
      image: "URL hình ảnh",
      isActive: "Hoạt động",
      productCount: "Sản phẩm",
      actions: "Thao tác",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa danh mục này?",
      deleteWarning: "Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn và tất cả sản phẩm liên quan sẽ bị ảnh hưởng.",
      categoryCreated: "Tạo danh mục thành công",
      categoryUpdated: "Cập nhật danh mục thành công",
      categoryDeleted: "Xóa danh mục thành công",
      error: "Đã xảy ra lỗi",
      noCategories: "Không tìm thấy danh mục nào",
      active: "Hoạt động",
      inactive: "Không hoạt động"
    },
    ja: {
      title: "カテゴリ管理",
      subtitle: "商品カテゴリの管理",
      back: "ダッシュボードに戻る",
      addCategory: "カテゴリを追加",
      editCategory: "カテゴリを編集",
      deleteCategory: "カテゴリを削除",
      searchPlaceholder: "カテゴリを検索...",
      name: "名前",
      nameEn: "名前（英語）",
      nameJa: "名前（日本語）",
      description: "説明",
      descriptionEn: "説明（英語）",
      descriptionJa: "説明（日本語）",
      slug: "スラッグ",
      image: "画像URL",
      isActive: "アクティブ",
      productCount: "商品数",
      actions: "操作",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      deleteConfirm: "このカテゴリを削除してもよろしいですか？",
      deleteWarning: "この操作は元に戻せません。カテゴリは永続的に削除され、関連するすべての商品に影響します。",
      categoryCreated: "カテゴリが正常に作成されました",
      categoryUpdated: "カテゴリが正常に更新されました",
      categoryDeleted: "カテゴリが正常に削除されました",
      error: "エラーが発生しました",
      noCategories: "カテゴリが見つかりません",
      active: "アクティブ",
      inactive: "非アクティブ"
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
    
    // Load categories
    setCategories(mockCategories);
    setFilteredCategories(mockCategories);
  }, [navigate]);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.nameJa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleCreateCategory = (formData: CreateCategoryRequest) => {
    const newCategory: Category = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productCount: 0
    };
    
    setCategories(prev => [...prev, newCategory]);
    setIsCreateDialogOpen(false);
    toast({
      title: t.categoryCreated,
    });
  };

  const handleUpdateCategory = (formData: UpdateCategoryRequest) => {
    if (!editingCategory) return;
    
    const updatedCategory: Category = {
      ...editingCategory,
      ...formData,
      updatedAt: new Date().toISOString()
    };
    
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id ? updatedCategory : cat
    ));
    setIsEditDialogOpen(false);
    setEditingCategory(null);
    toast({
      title: t.categoryUpdated,
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({
      title: t.categoryDeleted,
    });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

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
                {t.addCategory}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.addCategory}</DialogTitle>
              </DialogHeader>
              <CategoryForm 
                onSubmit={handleCreateCategory}
                onCancel={() => setIsCreateDialogOpen(false)}
                translations={t}
              />
            </DialogContent>
          </Dialog>
        </div>
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? t.active : t.inactive}
                  </Badge>
                </div>
                {category.nameEn && (
                  <p className="text-sm text-muted-foreground">{category.nameEn}</p>
                )}
                {category.nameJa && (
                  <p className="text-sm text-muted-foreground">{category.nameJa}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t.productCount}: {category.productCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
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
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            {t.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.noCategories}</p>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.editCategory}</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm 
                category={editingCategory}
                onSubmit={handleUpdateCategory}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingCategory(null);
                }}
                translations={t}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

// Category Form Component
interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  onCancel: () => void;
  translations: any;
}

function CategoryForm({ category, onSubmit, onCancel, translations }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    nameEn: category?.nameEn || "",
    nameJa: category?.nameJa || "",
    description: category?.description || "",
    descriptionEn: category?.descriptionEn || "",
    descriptionJa: category?.descriptionJa || "",
    slug: category?.slug || "",
    image: category?.image || "",
    isActive: category?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      onSubmit({ ...formData, id: category.id });
    } else {
      onSubmit(formData as CreateCategoryRequest);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{translations.name}</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">{translations.slug}</label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{translations.nameEn}</label>
          <Input
            value={formData.nameEn}
            onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{translations.nameJa}</label>
          <Input
            value={formData.nameJa}
            onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{translations.description}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 border rounded-md"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{translations.descriptionEn}</label>
          <textarea
            value={formData.descriptionEn}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{translations.descriptionJa}</label>
          <textarea
            value={formData.descriptionJa}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionJa: e.target.value }))}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{translations.image}</label>
        <Input
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          {translations.isActive}
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {translations.cancel}
        </Button>
        <Button type="submit">
          {translations.save}
        </Button>
      </div>
    </form>
  );
} 