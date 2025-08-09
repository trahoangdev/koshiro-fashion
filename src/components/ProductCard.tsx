import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { ShoppingBag, Heart, Star, GitCompare } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

const ProductCard = ({ product, viewMode = 'grid', onAddToCart, onAddToWishlist, onAddToCompare }: ProductCardProps) => {
  const { language, t } = useLanguage();
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

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
    
    // Show toast notification using centralized translation
    toast({
      title: t('success'),
      description: t('addedToWishlist'),
    });
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCompare?.(product);
    
    // Show toast notification
    toast({
      title: language === 'vi' ? "Thành công" : language === 'ja' ? "成功" : "Success",
      description: language === 'vi' ? "Đã thêm vào danh sách so sánh" : 
                   language === 'ja' ? "比較リストに追加されました" : 
                   "Added to compare list",
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 cursor-pointer rounded-md" onClick={handleCardClick}>
        <div className="flex">
          <div className="relative w-48 h-48 flex-shrink-0 rounded-l-md overflow-hidden">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={getName()}
              className="w-full h-full object-cover"
            />
            {product.stock <= 0 && (
              <Badge variant="secondary" className="absolute top-3 left-3">
                {t('outOfStock')}
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3">
                -{discountPercentage}% {t('off')}
              </Badge>
            )}
            {product.isFeatured && !discountPercentage && (
              <Badge variant="default" className="absolute top-3 right-3">
                Featured
              </Badge>
            )}
          </div>
          
          <CardContent className="flex-1 p-4">
            <div className="flex flex-col h-full justify-between min-h-[180px]">
              <div className="space-y-3 flex-1">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">{getName()}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {getDescription() || 'Premium Japanese fashion item with authentic design and quality materials.'}
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">(4.5)</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {product.colors?.slice(0, 3).map((color) => (
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
                
                {/* Stock Status */}
                <p className="text-sm text-muted-foreground">
                  {product.stock > 0 ? 
                    (language === 'vi' ? `${product.stock} còn lại` : 
                     language === 'ja' ? `残り${product.stock}個` : 
                     `${product.stock} left`) : 
                    (language === 'vi' ? 'Hết hàng' : 
                     language === 'ja' ? '在庫切れ' : 
                     'Out of stock')}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(product.price, language)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice, language)}
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
                    variant="ghost"
                    size="sm"
                    onClick={handleAddToCompare}
                  >
                    <GitCompare className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={product.stock <= 0 ? "secondary" : "default"}
                    size="sm"
                    disabled={product.stock <= 0}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {product.stock <= 0 ? 
                      (language === 'vi' ? 'Hết hàng' : 
                       language === 'ja' ? '在庫切れ' : 
                       'Out of stock') : 
                      (language === 'vi' ? 'Thêm vào giỏ' : 
                       language === 'ja' ? 'カートに追加' : 
                       'Add to cart')}
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
    <Card className="group overflow-hidden border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 cursor-pointer rounded-md h-full flex flex-col" onClick={handleCardClick}>
      <div className="relative overflow-hidden rounded-t-md">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={getName()}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <Badge variant="secondary" className="absolute top-3 left-3">
            {t('outOfStock')}
          </Badge>
        )}
        {discountPercentage > 0 && (
          <Badge variant="destructive" className="absolute top-3 left-3">
            -{discountPercentage}% {t('off')}
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
        
        <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
            onClick={handleAddToCompare}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col h-full">
        <div className="space-y-3 flex-1">
          {/* Product Name - Improved layout */}
          <h3 className="font-semibold text-base leading-tight min-h-[2.5rem] line-clamp-2">
            {getName()}
          </h3>
          
          {/* Product Description - Better text handling */}
          <p className="text-muted-foreground text-xs line-clamp-2 min-h-[2rem]">
            {getDescription() || 'Premium Japanese fashion item with authentic design and quality materials.'}
          </p>
          
          {/* Rating and Colors - Compact design */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
            </div>
            
            <div className="flex gap-1">
              {product.colors?.slice(0, 3).map((color) => (
                <div
                  key={color}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ 
                    backgroundColor: color === 'natural' ? '#f5f5dc' : 
                                   color === 'walnut' ? '#8b4513' : color 
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Price and Actions - Fixed bottom section */}
        <div className="space-y-3 mt-auto pt-3 border-t">
          {/* Price Section - Better layout */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(product.price, language)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.originalPrice, language)}
                </span>
              )}
            </div>
            {/* Stock Status */}
            <p className="text-xs text-muted-foreground">
              {product.stock > 0 ? 
                (language === 'vi' ? `${product.stock} còn lại` : 
                 language === 'ja' ? `残り${product.stock}個` : 
                 `${product.stock} left`) : 
                (language === 'vi' ? 'Hết hàng' : 
                 language === 'ja' ? '在庫切れ' : 
                 'Out of stock')}
            </p>
          </div>
          
          {/* Action Button - Responsive */}
          <Button
            variant={product.stock <= 0 ? "secondary" : "default"}
            size="sm"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className="w-full text-xs"
          >
            <ShoppingBag className="mr-1 h-3 w-3" />
            {product.stock <= 0 ? 
              (language === 'vi' ? 'Hết hàng' : 
               language === 'ja' ? '在庫切れ' : 
               'Out of stock') : 
              (language === 'vi' ? 'Thêm vào giỏ' : 
               language === 'ja' ? 'カートに追加' : 
               'Add to cart')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;