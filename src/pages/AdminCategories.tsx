import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Tag
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
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/types/category";
import { mockCategories } from "@/data/categories";
import AdminLayout from "@/components/AdminLayout";

export default function AdminCategories() {
  const { toast } = useToast();
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
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Load categories
    setCategories(mockCategories);
    setFilteredCategories(mockCategories);
  }, []);

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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
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
        <div className="space-y-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="h-fit">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2 mb-1">{category.name}</CardTitle>
                    {category.nameEn && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{category.nameEn}</p>
                    )}
                    {category.nameJa && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{category.nameJa}</p>
                    )}
                  </div>
                  <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs ml-2">
                    {category.isActive ? t.active : t.inactive}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="space-y-2">
                  <p className="text-xs line-clamp-2 text-muted-foreground">{category.description}</p>
                  
                  <div className="text-xs text-muted-foreground">
                    {t.productCount}: <span className="font-medium">{category.productCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Trash2 className="h-3 w-3" />
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="text-center py-6">
              <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">{t.noCategories}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Get started by adding your first category"}
              </p>
            </CardContent>
          </Card>
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