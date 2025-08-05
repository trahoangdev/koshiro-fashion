import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category } from "@/lib/api";

interface CategoryFormData {
  name: string;
  nameEn: string;
  nameJa: string;
  description: string;
  slug: string;
  isActive: boolean;
}

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CategoryForm({ 
  category, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: CategoryFormProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || "",
    nameEn: category?.nameEn || "",
    nameJa: category?.nameJa || "",
    description: category?.description || "",
    slug: category?.slug || "",
    isActive: category?.isActive ?? true
  });

  const translations = {
    en: {
      title: category ? "Edit Category" : "Add New Category",
      subtitle: category ? "Update category information" : "Create a new category",
      basicInfo: "Basic Information",
      settings: "Settings",
      name: "Category Name",
      nameEn: "Name (English)",
      nameJa: "Name (Japanese)",
      description: "Description",
      slug: "Slug",
      slugHelp: "URL-friendly identifier (e.g., 'kimono-robes')",
      isActive: "Active",
      isActiveHelp: "Category will be visible to customers",
      save: "Save Category",
      cancel: "Cancel",
      placeholder: {
        name: "Enter category name",
        nameEn: "Enter category name in English",
        nameJa: "Enter category name in Japanese",
        description: "Enter category description",
        slug: "kimono-robes"
      }
    },
    vi: {
      title: category ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới",
      subtitle: category ? "Cập nhật thông tin danh mục" : "Tạo danh mục mới",
      basicInfo: "Thông Tin Cơ Bản",
      settings: "Cài Đặt",
      name: "Tên Danh Mục",
      nameEn: "Tên (Tiếng Anh)",
      nameJa: "Tên (Tiếng Nhật)",
      description: "Mô Tả",
      slug: "Slug",
      slugHelp: "Định danh thân thiện với URL (ví dụ: 'ao-kimono')",
      isActive: "Hoạt Động",
      isActiveHelp: "Danh mục sẽ hiển thị cho khách hàng",
      save: "Lưu Danh Mục",
      cancel: "Hủy",
      placeholder: {
        name: "Nhập tên danh mục",
        nameEn: "Nhập tên danh mục bằng tiếng Anh",
        nameJa: "Nhập tên danh mục bằng tiếng Nhật",
        description: "Nhập mô tả danh mục",
        slug: "ao-kimono"
      }
    },
    ja: {
      title: category ? "カテゴリ編集" : "新カテゴリ追加",
      subtitle: category ? "カテゴリ情報を更新" : "新しいカテゴリを作成",
      basicInfo: "基本情報",
      settings: "設定",
      name: "カテゴリ名",
      nameEn: "カテゴリ名（英語）",
      nameJa: "カテゴリ名（日本語）",
      description: "説明",
      slug: "スラッグ",
      slugHelp: "URLフレンドリーな識別子（例：'kimono-robes'）",
      isActive: "アクティブ",
      isActiveHelp: "カテゴリは顧客に表示されます",
      save: "カテゴリを保存",
      cancel: "キャンセル",
      placeholder: {
        name: "カテゴリ名を入力",
        nameEn: "英語でカテゴリ名を入力",
        nameJa: "日本語でカテゴリ名を入力",
        description: "カテゴリの説明を入力",
        slug: "kimono-robes"
      }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleInputChange = (field: keyof CategoryFormData, value: CategoryFormData[keyof CategoryFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    handleInputChange("name", value);
    // Auto-generate slug if it's empty or if user hasn't manually edited it
    if (!formData.slug || formData.slug === generateSlug(category?.name || "")) {
      handleInputChange("slug", generateSlug(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : t.save}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t.basicInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t.placeholder.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t.nameEn}</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => handleInputChange("nameEn", e.target.value)}
                placeholder={t.placeholder.nameEn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameJa">{t.nameJa}</Label>
              <Input
                id="nameJa"
                value={formData.nameJa}
                onChange={(e) => handleInputChange("nameJa", e.target.value)}
                placeholder={t.placeholder.nameJa}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t.placeholder.description}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t.slug}</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              placeholder={t.placeholder.slug}
              required
            />
            <p className="text-sm text-muted-foreground">{t.slugHelp}</p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.isActive}</Label>
              <p className="text-sm text-muted-foreground">
                {t.isActiveHelp}
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 