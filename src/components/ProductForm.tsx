import { useState } from "react";
import { 
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Package,
  DollarSign,
  Palette,
  Ruler,
  Star,
  Eye,
  Tag,
  Plus,
  Trash2
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category } from "@/lib/api";

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
  colors: Array<string | { name: string; value: string }>;
  stock: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  metaTitle: string;
  metaDescription: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  sku: string;
  barcode: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const defaultColors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Brown', value: '#A52A2A' }
];

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  mode
}: ProductFormProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    nameEn: '',
    nameJa: '',
    description: '',
    descriptionEn: '',
    descriptionJa: '',
    price: 0,
    originalPrice: 0,
    categoryId: '',
    images: [],
    sizes: [],
    colors: [],
    stock: 0,
    tags: [],
    isActive: true,
    isFeatured: false,
    onSale: false,
    metaTitle: '',
    metaDescription: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    sku: '',
    barcode: '',
    ...initialData
  });

  const [newTag, setNewTag] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newColorName, setNewColorName] = useState('');

  const translations = {
    en: {
      title: mode === 'create' ? 'Create New Product' : 'Edit Product',
      name: 'Product Name',
      nameEn: 'Name (English)',
      nameJa: 'Name (Japanese)',
      description: 'Description',
      descriptionEn: 'Description (English)',
      descriptionJa: 'Description (Japanese)',
      price: 'Price',
      originalPrice: 'Original Price',
      category: 'Category',
      images: 'Product Images',
      sizes: 'Available Sizes',
      colors: 'Available Colors',
      stock: 'Stock Quantity',
      tags: 'Tags',
      isActive: 'Active',
      isFeatured: 'Featured',
      onSale: 'On Sale',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      weight: 'Weight (kg)',
      dimensions: 'Dimensions (cm)',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      sku: 'SKU',
      barcode: 'Barcode',
      addTag: 'Add Tag',
      addSize: 'Add Size',
      addColor: 'Add Color',
      colorName: 'Color Name',
      colorValue: 'Color Value',
      uploadImage: 'Upload Image',
      dragDrop: 'Drag and drop images here, or click to select',
      basicInfo: 'Basic Information',
      pricing: 'Pricing',
      inventory: 'Inventory',
      media: 'Media',
      seo: 'SEO',
      shipping: 'Shipping',
      save: 'Save Product',
      cancel: 'Cancel',
      loading: 'Saving...',
      error: 'Error',
      success: 'Product saved successfully'
    },
    vi: {
      title: mode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm',
      name: 'Tên Sản Phẩm',
      nameEn: 'Tên (Tiếng Anh)',
      nameJa: 'Tên (Tiếng Nhật)',
      description: 'Mô Tả',
      descriptionEn: 'Mô Tả (Tiếng Anh)',
      descriptionJa: 'Mô Tả (Tiếng Nhật)',
      price: 'Giá',
      originalPrice: 'Giá Gốc',
      category: 'Danh Mục',
      images: 'Hình Ảnh Sản Phẩm',
      sizes: 'Kích Thước Có Sẵn',
      colors: 'Màu Sắc Có Sẵn',
      stock: 'Số Lượng Tồn Kho',
      tags: 'Thẻ',
      isActive: 'Hoạt Động',
      isFeatured: 'Nổi Bật',
      onSale: 'Đang Giảm Giá',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      weight: 'Trọng Lượng (kg)',
      dimensions: 'Kích Thước (cm)',
      length: 'Chiều Dài',
      width: 'Chiều Rộng',
      height: 'Chiều Cao',
      sku: 'SKU',
      barcode: 'Mã Vạch',
      addTag: 'Thêm Thẻ',
      addSize: 'Thêm Kích Thước',
      addColor: 'Thêm Màu',
      colorName: 'Tên Màu',
      colorValue: 'Giá Trị Màu',
      uploadImage: 'Tải Lên Hình Ảnh',
      dragDrop: 'Kéo và thả hình ảnh vào đây, hoặc click để chọn',
      basicInfo: 'Thông Tin Cơ Bản',
      pricing: 'Định Giá',
      inventory: 'Tồn Kho',
      media: 'Phương Tiện',
      seo: 'SEO',
      shipping: 'Vận Chuyển',
      save: 'Lưu Sản Phẩm',
      cancel: 'Hủy',
      loading: 'Đang lưu...',
      error: 'Lỗi',
      success: 'Sản phẩm đã được lưu thành công'
    },
    ja: {
      title: mode === 'create' ? '新しい商品を作成' : '商品を編集',
      name: '商品名',
      nameEn: '名前（英語）',
      nameJa: '名前（日本語）',
      description: '説明',
      descriptionEn: '説明（英語）',
      descriptionJa: '説明（日本語）',
      price: '価格',
      originalPrice: '原価',
      category: 'カテゴリ',
      images: '商品画像',
      sizes: '利用可能なサイズ',
      colors: '利用可能な色',
      stock: '在庫数量',
      tags: 'タグ',
      isActive: 'アクティブ',
      isFeatured: 'おすすめ',
      onSale: 'セール中',
      metaTitle: 'メタタイトル',
      metaDescription: 'メタ説明',
      weight: '重量（kg）',
      dimensions: 'サイズ（cm）',
      length: '長さ',
      width: '幅',
      height: '高さ',
      sku: 'SKU',
      barcode: 'バーコード',
      addTag: 'タグを追加',
      addSize: 'サイズを追加',
      addColor: '色を追加',
      colorName: '色名',
      colorValue: '色の値',
      uploadImage: '画像をアップロード',
      dragDrop: 'ここに画像をドラッグ＆ドロップ、またはクリックして選択',
      basicInfo: '基本情報',
      pricing: '価格設定',
      inventory: '在庫',
      media: 'メディア',
      seo: 'SEO',
      shipping: '配送',
      save: '商品を保存',
      cancel: 'キャンセル',
      loading: '保存中...',
      error: 'エラー',
      success: '商品が正常に保存されました'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast({
        title: t.success,
      });
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
  };

  const addColor = () => {
    if (newColorName.trim() && newColor.trim()) {
      const colorExists = formData.colors.some(color => 
        typeof color === 'string' ? color === newColorName.trim() : color.name === newColorName.trim()
      );
      
      if (!colorExists) {
        setFormData(prev => ({
          ...prev,
          colors: [...prev.colors, { name: newColorName.trim(), value: newColor.trim() }]
        }));
        setNewColorName('');
        setNewColor('');
      }
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => 
        typeof color === 'string' ? color !== colorToRemove : color.name !== colorToRemove
      )
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload to a server and get URLs
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t.save}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.basicInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t.nameEn}</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameJa">{t.nameJa}</Label>
              <Input
                id="nameJa"
                value={formData.nameJa}
                onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t.descriptionEn}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionJa">{t.descriptionJa}</Label>
              <Textarea
                id="descriptionJa"
                value={formData.descriptionJa}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionJa: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t.pricing}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">{t.originalPrice}</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isActive}</Label>
                  <p className="text-sm text-muted-foreground">Make product visible to customers</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isFeatured}</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage and featured sections</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.onSale}</Label>
                  <p className="text-sm text-muted-foreground">Mark as on sale</p>
                </div>
                <Switch
                  checked={formData.onSale}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, onSale: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.inventory}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock">{t.stock}</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">{t.sku}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">{t.barcode}</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.sizes}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {defaultSizes.map(size => (
                    <Badge
                      key={size}
                      variant={formData.sizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.sizes.includes(size)) {
                          removeSize(size);
                        } else {
                          setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                        }
                      }}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom size"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addSize}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.colors}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {defaultColors.map(color => (
                    <Badge
                      key={color.name}
                      variant={formData.colors.some(c => 
                        typeof c === 'string' ? c === color.name : c.name === color.name
                      ) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={{ backgroundColor: color.value, color: color.value === '#FFFFFF' ? '#000' : '#fff' }}
                      onClick={() => {
                        const colorExists = formData.colors.some(c => 
                          typeof c === 'string' ? c === color.name : c.name === color.name
                        );
                        if (colorExists) {
                          removeColor(color.name);
                        } else {
                          setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
                        }
                      }}
                    >
                      {color.name}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Color name"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                  />
                  <Input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" onClick={addColor}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addColor}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {t.media}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t.images}</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">{t.dragDrop}</p>
                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t.uploadImage}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t.seo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">{t.metaTitle}</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">{t.metaDescription}</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.tags}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.shipping}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t.weight}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="length">{t.length}</Label>
                <Input
                  id="length"
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">{t.width}</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">{t.height}</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
} 