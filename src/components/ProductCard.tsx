import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductCard = ({ product, viewMode = 'grid', onAddToCart, onAddToWishlist }: ProductCardProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getName = () => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  const getDescription = () => {
    switch (language) {
      case 'vi': return product.description;
      case 'ja': return product.descriptionJa || product.description;
      default: return product.descriptionEn || product.description;
    }
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();

  const translations = {
    en: { 
      outOfStock: "Out of Stock", 
      addToCart: "Add to Cart",
      addToWishlist: "Add to Wishlist",
      viewDetails: "View Details",
      off: "OFF",
      addedToWishlist: "Added to wishlist",
      removedFromWishlist: "Removed from wishlist"
    },
    vi: { 
      outOfStock: "Hết Hàng", 
      addToCart: "Thêm Vào Giỏ",
      addToWishlist: "Thêm Yêu Thích",
      viewDetails: "Xem Chi Tiết",
      off: "GIẢM",
      addedToWishlist: "Đã thêm vào danh sách yêu thích",
      removedFromWishlist: "Đã xóa khỏi danh sách yêu thích"
    },
    ja: { 
      outOfStock: "在庫切れ", 
      addToCart: "カートに追加",
      addToWishlist: "お気に入りに追加",
      viewDetails: "詳細を見る",
      off: "OFF",
      addedToWishlist: "お気に入りに追加されました",
      removedFromWishlist: "お気に入りから削除されました"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
    
    // Show toast notification
    toast({
      title: "Success",
      description: t.addedToWishlist,
    });
  };

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden border-border/50 hover:shadow-medium transition-all duration-300 cursor-pointer" onClick={handleCardClick}>
        <div className="flex">
          <div className="relative w-48 h-48 flex-shrink-0">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={getName()}
              className="w-full h-full object-cover"
            />
            {product.stock <= 0 && (
              <Badge variant="secondary" className="absolute top-3 left-3">
                {t.outOfStock}
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3">
                -{discountPercentage}% {t.off}
              </Badge>
            )}
            {product.isFeatured && !discountPercentage && (
              <Badge variant="default" className="absolute top-3 right-3">
                Featured
              </Badge>
            )}
          </div>
          
          <CardContent className="flex-1 p-6">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-3">
                <h3 className="font-semibold text-xl leading-tight">{getName()}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {getDescription()}
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">(4.5)</span>
                  </div>
                  
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
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddToWishlist}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    disabled={product.stock <= 0}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t.addToCart}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-border/50 hover:shadow-medium transition-all duration-300 cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={getName()}
          className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            {t.outOfStock}
          </Badge>
        )}
        {discountPercentage > 0 && (
          <Badge variant="destructive" className="absolute top-3 left-3">
            -{discountPercentage}% {t.off}
          </Badge>
        )}
        {product.isFeatured && !discountPercentage && (
          <Badge variant="default" className="absolute top-3 right-3">
            Featured
          </Badge>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
            onClick={handleAddToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight">{getName()}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {getDescription()}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            
            <Button
              variant="default"
              size="sm"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {t.addToCart}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;