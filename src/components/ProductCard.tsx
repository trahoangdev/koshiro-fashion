import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { ShoppingBag, Heart, Star, GitCompare, Link as LinkIcon } from "lucide-react";
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
    if (product.salePrice && product.salePrice < product.price) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = getDiscountPercentage();
  const isOnSale = product.onSale || (product.salePrice && product.salePrice < product.price);
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const originalDisplayPrice = product.salePrice && product.salePrice < product.price ? product.price : product.originalPrice;

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
            {/* Primary Image - Default */}
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={getName()}
              className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0"
            />
            
            {/* Secondary Image - On Hover */}
            {product.images[1] && (
              <img
                src={product.images[1]}
                alt={getName()}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100"
              />
            )}
            
            {/* Fallback: If no second image, show zoom effect on first image */}
            {!product.images[1] && (
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={getName()}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
              />
            )}
            {/* Stock Status - Higher priority */}
            {product.stock <= 0 && (
              <Badge variant="secondary" className="absolute top-3 left-3 z-10">
                {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
              </Badge>
            )}
            
            {/* Sale Badge - Show when on sale and in stock */}
            {product.stock > 0 && isOnSale && discountPercentage > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3 z-10">
                -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
              </Badge>
            )}
            
            {/* Featured Badge - Show when not on sale and in stock */}
            {product.stock > 0 && !isOnSale && product.isFeatured && (
              <Badge variant="default" className="absolute top-3 right-3">
                {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
              </Badge>
            )}
            
            {/* Action Icons - Same design as Flash Sale */}
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {onAddToWishlist && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
                  onClick={handleAddToWishlist}
                  title={language === 'vi' ? 'Thêm vào yêu thích' : language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
                >
                  <Heart className="h-4 w-4 text-gray-700" />
                </Button>
              )}
              {onAddToCompare && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
                  onClick={handleAddToCompare}
                  title={language === 'vi' ? 'Thêm vào so sánh' : language === 'ja' ? '比較リストに追加' : 'Add to Compare'}
                >
                  <LinkIcon className="h-4 w-4 text-gray-700" />
                </Button>
              )}
            </div>
          </div>
          
          <CardContent className="flex-1 p-4">
            <div className="flex flex-col h-full justify-between min-h-[180px]">
              <div className="space-y-3 flex-1">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">{getName()}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {getDescription() || 'Premium Japanese fashion item with authentic design and quality materials.'}
                </p>
                
                {/* Rating - Same design as Flash Sale */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= 4 // Mock rating of 4 stars
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (4.0)
                  </span>
                  </div>
                  
                {/* Colors - Always show colors section */}
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Colors'}:
                  </p>
                  <div className="flex gap-1">
                    {/* Show actual colors if available */}
                    {product.colors && product.colors.length > 0 ? (
                      <>
                        {product.colors.slice(0, 4).map((color, index) => (
                      <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ 
                              backgroundColor: 
                                // Vietnamese colors
                                color === 'Đỏ' ? '#ef4444' :
                                color === 'Xanh dương' ? '#3b82f6' :
                                color === 'Xanh nhạt' ? '#93c5fd' :
                                color === 'Xanh lá' ? '#22c55e' :
                                color === 'Vàng' ? '#eab308' :
                                color === 'Hồng' ? '#ec4899' :
                                color === 'Tím' ? '#a855f7' :
                                color === 'Cam' ? '#f97316' :
                                color === 'Nâu' ? '#a16207' :
                                color === 'Đen' ? '#000000' :
                                color === 'Trắng' ? '#ffffff' :
                                color === 'Xám' ? '#6b7280' :
                                color === 'Xám đậm' ? '#374151' :
                                color === 'Xám nhạt' ? '#d1d5db' :
                                
                                // English colors
                                color === 'Red' ? '#ef4444' :
                                color === 'Blue' ? '#3b82f6' :
                                color === 'Light Blue' ? '#93c5fd' :
                                color === 'Green' ? '#22c55e' :
                                color === 'Yellow' ? '#eab308' :
                                color === 'Pink' ? '#ec4899' :
                                color === 'Purple' ? '#a855f7' :
                                color === 'Orange' ? '#f97316' :
                                color === 'Brown' ? '#a16207' :
                                color === 'Black' ? '#000000' :
                                color === 'White' ? '#ffffff' :
                                color === 'Gray' ? '#6b7280' :
                                color === 'Dark Gray' ? '#374151' :
                                color === 'Light Gray' ? '#d1d5db' :
                                
                                // Japanese colors
                                color === '赤' ? '#ef4444' :
                                color === '青' ? '#3b82f6' :
                                color === '薄い青' ? '#93c5fd' :
                                color === '緑' ? '#22c55e' :
                                color === '黄色' ? '#eab308' :
                                color === 'ピンク' ? '#ec4899' :
                                color === '紫' ? '#a855f7' :
                                color === 'オレンジ' ? '#f97316' :
                                color === '茶色' ? '#a16207' :
                                color === '黒' ? '#000000' :
                                color === '白' ? '#ffffff' :
                                color === 'グレー' ? '#6b7280' :
                                color === '濃いグレー' ? '#374151' :
                                color === '薄いグレー' ? '#d1d5db' :
                                
                                // Special colors
                                color === 'Đa sắc' ? 'linear-gradient(45deg, #ef4444, #3b82f6, #eab308)' :
                                color === 'Multicolor' ? 'linear-gradient(45deg, #ef4444, #3b82f6, #eab308)' :
                                color === 'マルチカラー' ? 'linear-gradient(45deg, #ef4444, #3b82f6, #eab308)' :
                                color === 'Bạc' ? '#c0c0c0' :
                                color === 'Silver' ? '#c0c0c0' :
                                color === 'シルバー' ? '#c0c0c0' :
                                color === 'Vàng kim' ? '#fbbf24' :
                                color === 'Gold' ? '#fbbf24' :
                                color === 'ゴールド' ? '#fbbf24' :
                                color === 'Đồng' ? '#cd7f32' :
                                color === 'Bronze' ? '#cd7f32' :
                                color === 'ブロンズ' ? '#cd7f32' :
                                
                                // Material colors
                                color === 'natural' ? '#f5f5dc' :
                                color === 'walnut' ? '#8b4513' :
                                color === 'beige' ? '#f5f5dc' :
                                color === 'cream' ? '#fefce8' :
                                color === 'ivory' ? '#fffff0' :
                                color === 'navy' ? '#1e3a8a' :
                                color === 'maroon' ? '#7f1d1d' :
                                color === 'olive' ? '#3f6212' :
                                color === 'teal' ? '#0f766e' :
                                color === 'coral' ? '#f97316' :
                                color === 'lavender' ? '#e0e7ff' :
                                color === 'mint' ? '#ecfdf5' :
                                color === 'peach' ? '#fed7aa' :
                                color === 'rose' ? '#fce7f3' :
                                color === 'sage' ? '#f0fdf4' :
                                color === 'slate' ? '#f8fafc' :
                                
                                // Default fallback
                                '#6b7280'
                            }}
                            title={color}
                      />
                    ))}
                        {product.colors.length > 4 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </>
                    ) : (
                      /* Show default colors when no colors are specified */
                      <>
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-300" title="Default" />
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-blue-300" title="Default" />
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-green-300" title="Default" />
                        <span className="text-xs text-muted-foreground ml-1">
                          {language === 'vi' ? 'Mặc định' : language === 'ja' ? 'デフォルト' : 'Default'}
                        </span>
                      </>
                    )}
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
                  <span className="text-xl font-bold text-red-600">
                    {formatCurrency(displayPrice, language)}
                  </span>
                  {originalDisplayPrice && originalDisplayPrice > displayPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      {formatCurrency(originalDisplayPrice, language)}
                    </span>
                  )}
                </div>
                  
                  <Button
                    variant={product.stock <= 0 ? "secondary" : "default"}
                    size="sm"
                    disabled={product.stock <= 0}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                  {language === 'vi' ? 'Thêm vào giỏ' : language === 'ja' ? 'カートに追加' : 'Add to Cart'}
                  </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-border/40 hover:shadow-lg hover:border-border/60 transition-all duration-300 cursor-pointer rounded-md h-full flex flex-col" onClick={handleCardClick}>
      {/* Image Section - Extended to take more space */}
      <div className="relative overflow-hidden rounded-t-md flex-1">
        {/* Primary Image - Default */}
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={getName()}
          className="w-full h-full min-h-[280px] object-cover transition-all duration-500 group-hover:opacity-0"
        />
        
        {/* Secondary Image - On Hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={getName()}
            className="absolute inset-0 w-full h-full min-h-[280px] object-cover transition-all duration-500 opacity-0 group-hover:opacity-100"
          />
        )}
        
        {/* Fallback: If no second image, show zoom effect on first image */}
        {!product.images[1] && (
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={getName()}
            className="absolute inset-0 w-full h-full min-h-[280px] object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
          />
        )}
        
        {/* Stock Status - Higher priority */}
        {product.stock <= 0 && (
          <Badge variant="secondary" className="absolute top-3 left-3 z-10">
            {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
          </Badge>
        )}
        
        {/* Sale Badge - Show when on sale and in stock */}
        {product.stock > 0 && isOnSale && discountPercentage > 0 && (
          <Badge variant="destructive" className="absolute top-3 left-3 z-10">
            -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
          </Badge>
        )}
        
        {/* Featured Badge - Show when not on sale and in stock */}
        {product.stock > 0 && !isOnSale && product.isFeatured && (
          <Badge variant="default" className="absolute top-3 right-3">
            {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
          </Badge>
        )}
        
        {/* Action Icons - Same design as Flash Sale */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {onAddToWishlist && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
              onClick={handleAddToWishlist}
              title={language === 'vi' ? 'Thêm vào yêu thích' : language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
            >
              <Heart className="h-4 w-4 text-gray-700" />
            </Button>
          )}
          {onAddToCompare && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
              onClick={handleAddToCompare}
              title={language === 'vi' ? 'Thêm vào so sánh' : language === 'ja' ? '比較リストに追加' : 'Add to Compare'}
            >
              <LinkIcon className="h-4 w-4 text-gray-700" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content Section - Compact information at bottom */}
      <CardContent className="p-4 flex-shrink-0">
        {/* Product Name */}
        <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-2">
          {getName()}
        </h3>
        
        {/* Product Description */}
        <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
          {getDescription() || 'Premium Japanese fashion item with authentic design and quality materials.'}
        </p>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= 4 // Mock rating of 4 stars
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            (4.0)
          </span>
        </div>
          
        {/* Colors */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">
            {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Colors'}:
          </p>
          <div className="flex gap-1">
            {/* Show actual colors if available */}
            {product.colors && product.colors.length > 0 ? (
              <>
                {product.colors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ 
                      backgroundColor: 
                        // Vietnamese colors
                        color === 'Đỏ' ? '#ef4444' :
                        color === 'Xanh dương' ? '#3b82f6' :
                        color === 'Xanh nhạt' ? '#93c5fd' :
                        color === 'Xanh lá' ? '#22c55e' :
                        color === 'Vàng' ? '#eab308' :
                        color === 'Hồng' ? '#ec4899' :
                        color === 'Tím' ? '#a855f7' :
                        color === 'Cam' ? '#f97316' :
                        color === 'Nâu' ? '#a16207' :
                        color === 'Đen' ? '#000000' :
                        color === 'Trắng' ? '#ffffff' :
                        color === 'Xám' ? '#6b7280' :
                        color === 'Xám đậm' ? '#374151' :
                        color === 'Xám nhạt' ? '#d1d5db' :
                        
                        // English colors
                        color === 'Red' ? '#ef4444' :
                        color === 'Blue' ? '#3b82f6' :
                        color === 'Light Blue' ? '#93c5fd' :
                        color === 'Green' ? '#22c55e' :
                        color === 'Yellow' ? '#eab308' :
                        color === 'Pink' ? '#ec4899' :
                        color === 'Purple' ? '#a855f7' :
                        color === 'Orange' ? '#f97316' :
                        color === 'Brown' ? '#a16207' :
                        color === 'Black' ? '#000000' :
                        color === 'White' ? '#ffffff' :
                        color === 'Gray' ? '#6b7280' :
                        color === 'Dark Gray' ? '#374151' :
                        color === 'Light Gray' ? '#d1d5db' :
                        
                        // Japanese colors
                        color === '赤' ? '#ef4444' :
                        color === '青' ? '#3b82f6' :
                        color === '薄い青' ? '#93c5fd' :
                        color === '緑' ? '#22c55e' :
                        color === '黄色' ? '#eab308' :
                        color === 'ピンク' ? '#ec4899' :
                        color === '紫' ? '#a855f7' :
                        color === 'オレンジ' ? '#f97316' :
                        color === '茶色' ? '#a16207' :
                        color === '黒' ? '#000000' :
                        color === '白' ? '#ffffff' :
                        color === 'グレー' ? '#6b7280' :
                        color === '濃いグレー' ? '#374151' :
                        color === '薄いグレー' ? '#d1d5db' :
                        
                        // Special colors
                        color === 'Đa sắc' ? 'linear-gradient(45deg, #ef4444, #3b82f6, #eab308)' :
                        color === 'Multicolor' ? 'linear-gradient(45deg, #ef4444, #3b82f6, #eab308)' :
                        color === 'マルチカラー' ? 'linear-gradient(45deg, #ef4444, #3b82f6, #eab308)' :
                        color === 'Bạc' ? '#c0c0c0' :
                        color === 'Silver' ? '#c0c0c0' :
                        color === 'シルバー' ? '#c0c0c0' :
                        color === 'Vàng kim' ? '#fbbf24' :
                        color === 'Gold' ? '#fbbf24' :
                        color === 'ゴールド' ? '#fbbf24' :
                        color === 'Đồng' ? '#cd7f32' :
                        color === 'Bronze' ? '#cd7f32' :
                        color === 'ブロンズ' ? '#cd7f32' :
                        
                        // Material colors
                        color === 'natural' ? '#f5f5dc' :
                        color === 'walnut' ? '#8b4513' :
                        color === 'beige' ? '#f5f5dc' :
                        color === 'cream' ? '#fefce8' :
                        color === 'ivory' ? '#fffff0' :
                        color === 'navy' ? '#1e3a8a' :
                        color === 'maroon' ? '#7f1d1d' :
                        color === 'olive' ? '#3f6212' :
                        color === 'teal' ? '#0f766e' :
                        color === 'coral' ? '#f97316' :
                        color === 'lavender' ? '#e0e7ff' :
                        color === 'mint' ? '#ecfdf5' :
                        color === 'peach' ? '#fed7aa' :
                        color === 'rose' ? '#fce7f3' :
                        color === 'sage' ? '#f0fdf4' :
                        color === 'slate' ? '#f8fafc' :
                        
                        // Default fallback
                        '#6b7280'
                      }}
                      title={color}
                    />
                  ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{product.colors.length - 4}
                  </span>
                )}
              </>
            ) : (
              /* Show default colors when no colors are specified */
              <>
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-gray-300" title="Default" />
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-blue-300" title="Default" />
                <div className="w-4 h-4 rounded-full border border-gray-300 bg-green-300" title="Default" />
                <span className="text-xs text-muted-foreground ml-1">
                  {language === 'vi' ? 'Mặc định' : language === 'ja' ? 'デフォルト' : 'Default'}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Price and Button Section */}
        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">
              {formatCurrency(displayPrice, language)}
            </span>
            {originalDisplayPrice && originalDisplayPrice > displayPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(originalDisplayPrice, language)}
              </span>
            )}
          </div>
            
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full"
            size="sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Thêm vào giỏ' : language === 'ja' ? 'カートに追加' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;