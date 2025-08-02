import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product, Category } from "@/lib/api";

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

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ 
  product, 
  categories, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ProductFormProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    nameJa: product?.nameJa || "",
    description: product?.description || "",
    descriptionEn: product?.descriptionEn || "",
    descriptionJa: product?.descriptionJa || "",
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    categoryId: typeof product?.categoryId === 'string' ? product.categoryId : product?.categoryId?._id || "",
    images: product?.images || [],
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    stock: product?.stock || 0,
    tags: product?.tags || [],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    onSale: false
  });

  const [newImage, setNewImage] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newTag, setNewTag] = useState("");

  const translations = {
    en: {
      title: product ? "Edit Product" : "Add New Product",
      subtitle: product ? "Update product information" : "Create a new product",
      basicInfo: "Basic Information",
      pricing: "Pricing",
      media: "Media",
      variants: "Variants",
      settings: "Settings",
      name: "Product Name",
      nameEn: "Name (English)",
      nameJa: "Name (Japanese)",
      description: "Description",
      descriptionEn: "Description (English)",
      descriptionJa: "Description (Japanese)",
      price: "Price",
      originalPrice: "Original Price",
      category: "Category",
      selectCategory: "Select a category",
      images: "Product Images",
      addImage: "Add Image URL",
      sizes: "Available Sizes",
      addSize: "Add Size",
      colors: "Available Colors",
      addColor: "Add Color",
      stock: "Stock Quantity",
      tags: "Tags",
      addTag: "Add Tag",
      isActive: "Active",
      isFeatured: "Featured",
      onSale: "On Sale",
      save: "Save Product",
      cancel: "Cancel",
      remove: "Remove",
      imageUrl: "Image URL",
      size: "Size",
      color: "Color",
      tag: "Tag",
      placeholder: {
        name: "Enter product name",
        nameEn: "Enter product name in English",
        nameJa: "Enter product name in Japanese",
        description: "Enter product description",
        descriptionEn: "Enter product description in English",
        descriptionJa: "Enter product description in Japanese",
        price: "0",
        originalPrice: "0",
        imageUrl: "https://example.com/image.jpg",
        size: "S, M, L, XL",
        color: "Red, Blue, Black",
        tag: "fashion, japanese, kimono"
      }
    },
    vi: {
      title: product ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới",
      subtitle: product ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới",
      basicInfo: "Thông Tin Cơ Bản",
      pricing: "Giá Cả",
      media: "Hình Ảnh",
      variants: "Biến Thể",
      settings: "Cài Đặt",
      name: "Tên Sản Phẩm",
      nameEn: "Tên (Tiếng Anh)",
      nameJa: "Tên (Tiếng Nhật)",
      description: "Mô Tả",
      descriptionEn: "Mô Tả (Tiếng Anh)",
      descriptionJa: "Mô Tả (Tiếng Nhật)",
      price: "Giá",
      originalPrice: "Giá Gốc",
      category: "Danh Mục",
      selectCategory: "Chọn danh mục",
      images: "Hình Ảnh Sản Phẩm",
      addImage: "Thêm URL Hình Ảnh",
      sizes: "Kích Thước Có Sẵn",
      addSize: "Thêm Kích Thước",
      colors: "Màu Sắc Có Sẵn",
      addColor: "Thêm Màu Sắc",
      stock: "Số Lượng Tồn Kho",
      tags: "Thẻ",
      addTag: "Thêm Thẻ",
      isActive: "Hoạt Động",
      isFeatured: "Nổi Bật",
      onSale: "Đang Giảm Giá",
      save: "Lưu Sản Phẩm",
      cancel: "Hủy",
      remove: "Xóa",
      imageUrl: "URL Hình Ảnh",
      size: "Kích Thước",
      color: "Màu Sắc",
      tag: "Thẻ",
      placeholder: {
        name: "Nhập tên sản phẩm",
        nameEn: "Nhập tên sản phẩm bằng tiếng Anh",
        nameJa: "Nhập tên sản phẩm bằng tiếng Nhật",
        description: "Nhập mô tả sản phẩm",
        descriptionEn: "Nhập mô tả sản phẩm bằng tiếng Anh",
        descriptionJa: "Nhập mô tả sản phẩm bằng tiếng Nhật",
        price: "0",
        originalPrice: "0",
        imageUrl: "https://example.com/image.jpg",
        size: "S, M, L, XL",
        color: "Đỏ, Xanh, Đen",
        tag: "thời trang, nhật bản, kimono"
      }
    },
    ja: {
      title: product ? "商品編集" : "新商品追加",
      subtitle: product ? "商品情報を更新" : "新しい商品を作成",
      basicInfo: "基本情報",
      pricing: "価格",
      media: "メディア",
      variants: "バリエーション",
      settings: "設定",
      name: "商品名",
      nameEn: "商品名（英語）",
      nameJa: "商品名（日本語）",
      description: "説明",
      descriptionEn: "説明（英語）",
      descriptionJa: "説明（日本語）",
      price: "価格",
      originalPrice: "原価",
      category: "カテゴリ",
      selectCategory: "カテゴリを選択",
      images: "商品画像",
      addImage: "画像URLを追加",
      sizes: "利用可能なサイズ",
      addSize: "サイズを追加",
      colors: "利用可能な色",
      addColor: "色を追加",
      stock: "在庫数量",
      tags: "タグ",
      addTag: "タグを追加",
      isActive: "アクティブ",
      isFeatured: "おすすめ",
      onSale: "セール中",
      save: "商品を保存",
      cancel: "キャンセル",
      remove: "削除",
      imageUrl: "画像URL",
      size: "サイズ",
      color: "色",
      tag: "タグ",
      placeholder: {
        name: "商品名を入力",
        nameEn: "英語で商品名を入力",
        nameJa: "日本語で商品名を入力",
        description: "商品説明を入力",
        descriptionEn: "英語で商品説明を入力",
        descriptionJa: "日本語で商品説明を入力",
        price: "0",
        originalPrice: "0",
        imageUrl: "https://example.com/image.jpg",
        size: "S, M, L, XL",
        color: "赤, 青, 黒",
        tag: "ファッション, 日本, 着物"
      }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleInputChange = (field: keyof ProductFormData, value: ProductFormData[keyof ProductFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImage.trim()] }));
      setNewImage("");
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addSize = () => {
    if (newSize.trim()) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }));
      setNewSize("");
    }
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  const addColor = () => {
    if (newColor.trim()) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor.trim()] }));
      setNewColor("");
    }
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
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
                onChange={(e) => handleInputChange("name", e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="descriptionEn">{t.descriptionEn}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => handleInputChange("descriptionEn", e.target.value)}
                placeholder={t.placeholder.descriptionEn}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionJa">{t.descriptionJa}</Label>
              <Textarea
                id="descriptionJa"
                value={formData.descriptionJa}
                onChange={(e) => handleInputChange("descriptionJa", e.target.value)}
                placeholder={t.placeholder.descriptionJa}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t.category}</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>{t.pricing}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", Number(e.target.value))}
                placeholder={t.placeholder.price}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">{t.originalPrice}</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange("originalPrice", Number(e.target.value))}
                placeholder={t.placeholder.originalPrice}
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>{t.media}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.images}</Label>
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder={t.placeholder.imageUrl}
              />
              <Button type="button" onClick={addImage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((image, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {image.substring(0, 20)}...
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle>{t.variants}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sizes */}
          <div className="space-y-2">
            <Label>{t.sizes}</Label>
            <div className="flex gap-2">
              <Input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder={t.placeholder.size}
              />
              <Button type="button" onClick={addSize} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sizes.map((size, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {size}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSize(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div className="space-y-2">
            <Label>{t.colors}</Label>
            <div className="flex gap-2">
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder={t.placeholder.color}
              />
              <Button type="button" onClick={addColor} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.colors.map((color, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {color}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColor(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">{t.stock}</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange("stock", Number(e.target.value))}
              min="0"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t.tags}</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t.placeholder.tag}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
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
                Product will be visible to customers
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.isFeatured}</Label>
              <p className="text-sm text-muted-foreground">
                Product will be featured on homepage
              </p>
            </div>
            <Switch
              checked={formData.isFeatured}
              onCheckedChange={(checked) => handleInputChange("isFeatured", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.onSale}</Label>
              <p className="text-sm text-muted-foreground">
                Product will be marked as on sale
              </p>
            </div>
            <Switch
              checked={formData.onSale}
              onCheckedChange={(checked) => handleInputChange("onSale", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 