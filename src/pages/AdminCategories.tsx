import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Folder,
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Category } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import CategoryForm from "@/components/CategoryForm";
import { api } from "@/lib/api";

interface CategoryFormData {
  name: string;
  nameEn: string;
  nameJa: string;
  description: string;
  slug: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  const translations = {
    vi: {
      title: "Quản lý Danh mục",
      subtitle: "Quản lý danh sách danh mục sản phẩm",
      addCategory: "Thêm Danh mục",
      editCategory: "Chỉnh sửa Danh mục",
      deleteCategory: "Xóa Danh mục",
      searchPlaceholder: "Tìm kiếm danh mục...",
      name: "Tên",
      nameEn: "Tên (Tiếng Anh)",
      nameJa: "Tên (Tiếng Nhật)",
      description: "Mô tả",
      slug: "Slug",
      status: "Trạng thái",
      actions: "Thao tác",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      deleteConfirm: "Bạn có chắc chắn muốn xóa danh mục này?",
      deleteWarning: "Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.",
      categoryCreated: "Danh mục đã được tạo thành công",
      categoryUpdated: "Danh mục đã được cập nhật thành công",
      categoryDeleted: "Danh mục đã được xóa thành công",
      error: "Đã xảy ra lỗi",
      noCategories: "Không tìm thấy danh mục nào",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      loading: "Đang tải...",
      errorLoading: "Lỗi tải dữ liệu",
      errorLoadingDesc: "Không thể tải danh sách danh mục"
    },
    en: {
      title: "Category Management",
      subtitle: "Manage product categories",
      addCategory: "Add Category",
      editCategory: "Edit Category",
      deleteCategory: "Delete Category",
      searchPlaceholder: "Search categories...",
      name: "Name",
      nameEn: "Name (English)",
      nameJa: "Name (Japanese)",
      description: "Description",
      slug: "Slug",
      status: "Status",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this category?",
      deleteWarning: "This action cannot be undone. This will permanently delete the category.",
      categoryCreated: "Category created successfully",
      categoryUpdated: "Category updated successfully",
      categoryDeleted: "Category deleted successfully",
      error: "An error occurred",
      noCategories: "No categories found",
      active: "Active",
      inactive: "Inactive",
      loading: "Loading...",
      errorLoading: "Error loading data",
      errorLoadingDesc: "Could not load category list"
    },
    ja: {
      title: "カテゴリ管理",
      subtitle: "商品カテゴリを管理",
      addCategory: "カテゴリ追加",
      editCategory: "カテゴリ編集",
      deleteCategory: "カテゴリ削除",
      searchPlaceholder: "カテゴリを検索...",
      name: "名前",
      nameEn: "名前（英語）",
      nameJa: "名前（日本語）",
      description: "説明",
      slug: "スラッグ",
      status: "ステータス",
      actions: "操作",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      deleteConfirm: "このカテゴリを削除してもよろしいですか？",
      deleteWarning: "この操作は元に戻せません。カテゴリは永久に削除されます。",
      categoryCreated: "カテゴリが正常に作成されました",
      categoryUpdated: "カテゴリが正常に更新されました",
      categoryDeleted: "カテゴリが正常に削除されました",
      error: "エラーが発生しました",
      noCategories: "カテゴリが見つかりません",
      active: "アクティブ",
      inactive: "非アクティブ",
      loading: "読み込み中...",
      errorLoading: "データ読み込みエラー",
      errorLoadingDesc: "カテゴリリストを読み込めませんでした"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading admin categories data...');
      
      const categoriesResponse = await api.getAdminCategories({ isActive: true });
      console.log('Categories response:', categoriesResponse);
      
      const categoriesData = categoriesResponse.categories || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
      
    } catch (error) {
      console.error('Error loading admin categories data:', error);
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

  // Filter categories
  useEffect(() => {
    let filtered = categories;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.nameJa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleCreateCategory = async (formData: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await api.createCategory(formData);
      toast({
        title: "Success",
        description: t.categoryCreated,
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: t.error,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (formData: CategoryFormData) => {
    if (!editingCategory) return;
    
    setIsSubmitting(true);
    try {
      await api.updateCategory(editingCategory._id, formData);
      toast({
        title: "Success",
        description: t.categoryUpdated,
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: t.error,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      console.log('Deleting category:', categoryId);
      await api.deleteCategory(categoryId);
      
      // Reload categories
      const categoriesResponse = await api.getAdminCategories({ isActive: true });
      setCategories(categoriesResponse.categories || []);
      
      toast({
        title: t.categoryDeleted,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
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
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6">
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t.noCategories}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.nameEn} / {category.nameJa}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Slug: {category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Products: {category.productCount || 0}
                        </p>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? t.active : t.inactive}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(category)}
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
                                onClick={() => handleDeleteCategory(category._id)}
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
                isLoading={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
} 