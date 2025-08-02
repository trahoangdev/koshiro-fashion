import { useState } from "react";
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
import { Product, CreateProductRequest, UpdateProductRequest } from "@/types/product";
import { Category } from "@/types/category";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void;
  onCancel: () => void;
  translations: {
    name: string;
    nameEn: string;
    nameJa: string;
    description: string;
    descriptionEn: string;
    descriptionJa: string;
    price: string;
    originalPrice: string;
    category: string;
    images: string;
    sizes: string;
    colors: string;
    stock: string;
    tags: string;
    isActive: string;
    isFeatured: string;
    save: string;
    cancel: string;
    addImage: string;
    addSize: string;
    addColor: string;
    addTag: string;
    remove: string;
    imageUrl: string;
    size: string;
    color: string;
    tag: string;
  };
}

function ProductForm({ product, categories, onSubmit, onCancel, translations }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    nameJa: product?.nameJa || "",
    description: product?.description || "",
    descriptionEn: product?.descriptionEn || "",
    descriptionJa: product?.descriptionJa || "",
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    categoryId: product?.categoryId || "",
    images: product?.images || [],
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    stock: product?.stock || 0,
    tags: product?.tags || [],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false
  });

  const [newImage, setNewImage] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSubmit({ ...formData, id: product.id });
    } else {
      onSubmit(formData as CreateProductRequest);
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
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
          <label className="text-sm font-medium">{translations.category}</label>
          <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={translations.category} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">{translations.price}</label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            required
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium">{translations.originalPrice}</label>
          <Input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
            min="0"
          />
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="text-sm font-medium">{translations.stock}</label>
        <Input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
          required
          min="0"
        />
      </div>

      {/* Images */}
      <div>
        <label className="text-sm font-medium">{translations.images}</label>
        <div className="space-y-2">
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={image} readOnly />
              <Button type="button" variant="outline" size="sm" onClick={() => removeImage(index)}>
                {translations.remove}
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              placeholder={translations.imageUrl}
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
            />
            <Button type="button" onClick={addImage}>
              {translations.addImage}
            </Button>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className="text-sm font-medium">{translations.sizes}</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {formData.sizes.map((size, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {size}
                <button type="button" onClick={() => removeSize(index)} className="ml-1">
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder={translations.size}
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
            />
            <Button type="button" onClick={addSize}>
              {translations.addSize}
            </Button>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="text-sm font-medium">{translations.colors}</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {formData.colors.map((color, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {color}
                <button type="button" onClick={() => removeColor(index)} className="ml-1">
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder={translations.color}
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            />
            <Button type="button" onClick={addColor}>
              {translations.addColor}
            </Button>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium">{translations.tags}</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(index)} className="ml-1">
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder={translations.tag}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <Button type="button" onClick={addTag}>
              {translations.addTag}
            </Button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-6">
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
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
            className="rounded"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium">
            {translations.isFeatured}
          </label>
        </div>
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

export default ProductForm; 