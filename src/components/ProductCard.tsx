import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/types/product";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  currentLanguage: string;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, currentLanguage, onAddToCart }: ProductCardProps) => {
  const getName = () => {
    switch (currentLanguage) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  const getDescription = () => {
    switch (currentLanguage) {
      case 'vi': return product.description;
      case 'ja': return product.descriptionJa || product.description;
      default: return product.descriptionEn || product.description;
    }
  };

  const translations = {
    en: { outOfStock: "Out of Stock", addToCart: "Add to Cart" },
    vi: { outOfStock: "Hết Hàng", addToCart: "Thêm Vào Giỏ" },
    ja: { outOfStock: "在庫切れ", addToCart: "カートに追加" }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-medium transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={product.images[0] || product.image}
          alt={getName()}
          className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            {t.outOfStock}
          </Badge>
        )}
        {product.isFeatured && (
          <Badge variant="default" className="absolute top-3 right-3">
            Featured
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight">{getName()}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {getDescription()}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatCurrency(product.price, currentLanguage)}
            </span>
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: color === 'natural' ? '#f5f5dc' : 
                                   color === 'walnut' ? '#8b4513' : color 
                  }}
                />
              ))}
            </div>
          </div>

          <Button
            variant="zen"
            className="w-full"
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {t.addToCart}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};