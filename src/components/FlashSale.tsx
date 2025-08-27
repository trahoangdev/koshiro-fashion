import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Clock, 
  Flame, 
  ShoppingBag, 
  Star,
  Timer,
  Zap,
  Heart,
  Link as LinkIcon
} from "lucide-react";
import { Link } from "react-router-dom";

interface FlashSaleSession {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  discount: number;
  products: string[]; // Product IDs
}

interface FlashSaleProps {
  className?: string;
  onAddToWishlist?: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

const FlashSale: React.FC<FlashSaleProps> = ({ 
  className = "", 
  onAddToWishlist,
  onAddToCompare 
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock flash sale sessions - in real app, this would come from API
  const flashSaleSessions: FlashSaleSession[] = [
    {
      id: "1",
      name: "Morning Sale",
      startTime: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 9, 0, 0),
      endTime: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 12, 0, 0),
      discount: 50,
      products: []
    },
    {
      id: "2", 
      name: "Afternoon Sale",
      startTime: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 14, 0, 0),
      endTime: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 17, 0, 0),
      discount: 40,
      products: []
    },
    {
      id: "3",
      name: "Evening Sale", 
      startTime: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 19, 0, 0),
      endTime: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), 22, 0, 0),
      discount: 60,
      products: []
    }
  ];

  // Find current active session
  const currentSession = flashSaleSessions.find(session => 
    currentTime >= session.startTime && currentTime <= session.endTime
  );

  // Calculate time remaining for current session
  const getTimeRemaining = (session: FlashSaleSession) => {
    const now = currentTime.getTime();
    const end = session.endTime.getTime();
    const timeLeft = end - now;
    
    if (timeLeft <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Calculate progress percentage
  const getProgressPercentage = (session: FlashSaleSession) => {
    const now = currentTime.getTime();
    const start = session.startTime.getTime();
    const end = session.endTime.getTime();
    const total = end - start;
    const elapsed = now - start;
    
    if (elapsed <= 0) return 0;
    if (elapsed >= total) return 100;
    
    return (elapsed / total) * 100;
  };

  // Load flash sale products
  useEffect(() => {
    const loadFlashSaleProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProducts({ 
          isActive: true, 
          limit: 100 
        });
        
        // Filter products that are on sale with high discount
        const saleProducts = (response.products || []).filter(product => {
          const isOnSale = product.onSale || product.salePrice || (product.originalPrice && product.originalPrice > product.price);
          if (!isOnSale) return false;
          
          let discountPercent = 0;
          if (product.salePrice && product.salePrice < product.price) {
            discountPercent = ((product.price - product.salePrice) / product.price) * 100;
          } else if (product.originalPrice && product.originalPrice > product.price) {
            discountPercent = ((product.originalPrice - product.price) / product.originalPrice) * 100;
          }
          
          return discountPercent >= 30; // Show products with 30%+ discount
        }).slice(0, 8); // Show max 8 products
        
        setFlashSaleProducts(saleProducts);
      } catch (error) {
        console.error('Error loading flash sale products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashSaleProducts();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Add to cart function
  const addToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: language === 'vi' ? 'Cần đăng nhập' : language === 'ja' ? 'ログインが必要' : 'Login Required',
        description: language === 'vi' ? 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' : 
                    language === 'ja' ? 'カートに商品を追加するにはログインしてください' : 
                    'Please login to add products to cart',
        variant: "destructive"
      });
      return;
    }

    try {
      await api.addToCart(product._id, 1);
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào giỏ hàng' : 
                    language === 'ja' ? '商品をカートに追加しました' : 
                    'Product added to cart',
      });
    } catch (error) {
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào giỏ hàng' : 
                    language === 'ja' ? '商品をカートに追加できませんでした' : 
                    'Failed to add product to cart',
        variant: "destructive"
      });
    }
  };

  const translations = {
    en: {
      title: "Flash Sale",
      subtitle: "Limited time offers with massive discounts",
      currentSale: "Current Sale",
      nextSale: "Next Sale",
      timeRemaining: "Time Remaining",
      viewAll: "View All",
      addToCart: "Add to Cart",
      soldOut: "Sold Out",
      noActiveSale: "No active sale at the moment",
      comingSoon: "Coming Soon",
      discount: "OFF",
      addToWishlist: "Add to Wishlist",
      addToCompare: "Add to Compare",
      rating: "Rating",
      colors: "Colors"
    },
    vi: {
      title: "Flash Sale",
      subtitle: "Ưu đãi có thời hạn với giảm giá lớn",
      currentSale: "Đang Sale",
      nextSale: "Sale Tiếp Theo",
      timeRemaining: "Thời Gian Còn Lại",
      viewAll: "Xem Tất Cả",
      addToCart: "Thêm Vào Giỏ",
      soldOut: "Hết Hàng",
      noActiveSale: "Hiện tại không có sale nào",
      comingSoon: "Sắp Diễn Ra",
      discount: "GIẢM",
      addToWishlist: "Thêm Vào Yêu Thích",
      addToCompare: "Thêm Vào So Sánh",
      rating: "Đánh Giá",
      colors: "Màu Sắc"
    },
    ja: {
      title: "フラッシュセール",
      subtitle: "期間限定の大割引オファー",
      currentSale: "現在のセール",
      nextSale: "次のセール",
      timeRemaining: "残り時間",
      viewAll: "すべて見る",
      addToCart: "カートに追加",
      soldOut: "売り切れ",
      noActiveSale: "現在アクティブなセールはありません",
      comingSoon: "近日公開",
      discount: "OFF",
      addToWishlist: "お気に入りに追加",
      addToCompare: "比較リストに追加",
      rating: "評価",
      colors: "色"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (flashSaleProducts.length === 0 && !currentSession) {
    return (
      <Card className={`bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white ${className}`}>
        <CardContent className="p-8 text-center">
          <Flame className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-lg opacity-90 mb-4">{t.subtitle}</p>
          <p className="text-lg opacity-80">{t.noActiveSale}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Flash Sale Header */}
      <Card className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-center mb-6">
            <Flame className="h-12 w-12 mr-3" />
            <h2 className="text-4xl font-bold">{t.title}</h2>
          </div>
          <p className="text-xl text-center opacity-90 mb-8">{t.subtitle}</p>
          
          {/* Current Sale Session */}
          {currentSession ? (
            <div className="text-center">
              <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2 mb-4">
                {t.currentSale}: {currentSession.name} - {currentSession.discount}% {t.discount}
              </Badge>
              
              {/* Countdown Timer */}
              <div className="flex justify-center items-center space-x-4 mb-6">
                <Clock className="h-6 w-6" />
                <span className="text-lg">{t.timeRemaining}:</span>
                <div className="flex space-x-2">
                  <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="text-2xl font-bold">
                      {getTimeRemaining(currentSession).hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs opacity-80">Hours</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="text-2xl font-bold">
                      {getTimeRemaining(currentSession).minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs opacity-80">Minutes</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                    <div className="text-2xl font-bold">
                      {getTimeRemaining(currentSession).seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs opacity-80">Seconds</div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <Progress value={getProgressPercentage(currentSession)} className="h-3 bg-white/20" />
                <p className="text-sm opacity-80 mt-2">
                  {Math.round(getProgressPercentage(currentSession))}% {language === 'vi' ? 'hoàn thành' : language === 'ja' ? '完了' : 'complete'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2 mb-4">
                {t.comingSoon}
              </Badge>
              <p className="text-lg opacity-80">{t.noActiveSale}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {language === 'vi' ? 'Lịch Trình Sale' : language === 'ja' ? 'セールスケジュール' : 'Sale Schedule'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashSaleSessions.map((session) => {
              const isActive = currentTime >= session.startTime && currentTime <= session.endTime;
              const isUpcoming = currentTime < session.startTime;
              const isPast = currentTime > session.endTime;
              
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                      : isUpcoming 
                      ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-gray-300 bg-gray-50 dark:bg-gray-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{session.name}</h3>
                    <Badge variant={isActive ? "destructive" : isUpcoming ? "secondary" : "outline"}>
                      {isActive ? t.currentSale : isUpcoming ? t.comingSoon : "Ended"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {session.discount}% {t.discount}
                  </p>
                  {isActive && (
                    <div className="mt-2">
                      <Progress value={getProgressPercentage(session)} className="h-2" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Flash Sale Products */}
      {flashSaleProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {language === 'vi' ? 'Sản Phẩm Flash Sale' : language === 'ja' ? 'フラッシュセール商品' : 'Flash Sale Products'}
              </CardTitle>
              <Link to="/sale">
                <Button variant="outline" size="sm">
                  {t.viewAll}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {flashSaleProducts.map((product) => {
                  const discount = product.salePrice && product.salePrice < product.price
                    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                    : product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                                     return (
                     <Card key={product._id} className="group hover:shadow-lg transition-all duration-300">
                       <div className="relative">
                         <img
                           src={product.images[0] || '/placeholder.svg'}
                           alt={product.name}
                           className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                         />
                         <Badge variant="destructive" className="absolute top-2 left-2">
                           -{discount}%
                         </Badge>
                         {product.stock === 0 && (
                           <Badge variant="secondary" className="absolute top-2 right-2">
                             {t.soldOut}
                           </Badge>
                         )}
                         
                         {/* Action Icons */}
                         <div className="absolute top-2 right-2 flex flex-col gap-2">
                           {onAddToWishlist && (
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
                               onClick={() => onAddToWishlist(product)}
                               title={t.addToWishlist}
                             >
                               <Heart className="h-4 w-4 text-gray-700" />
                             </Button>
                           )}
                           {onAddToCompare && (
                             <Button
                               variant="ghost"
                               size="sm"
                               className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
                               onClick={() => onAddToCompare(product)}
                               title={t.addToCompare}
                             >
                               <LinkIcon className="h-4 w-4 text-gray-700" />
                             </Button>
                           )}
                         </div>
                       </div>
                       <CardContent className="p-4">
                         <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                           {language === 'vi' ? product.name : language === 'ja' ? product.nameJa || product.name : product.nameEn || product.name}
                         </h3>
                         
                         {/* Rating - Using mock rating for now */}
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
                            <p className="text-xs text-muted-foreground mb-1">{t.colors}:</p>
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
                         
                         {/* Price */}
                         <div className="flex items-center gap-2 mb-3">
                           <span className="text-lg font-bold text-red-600">
                             {formatCurrency(product.salePrice || product.price, language)}
                           </span>
                           {product.originalPrice && product.originalPrice > product.price && (
                             <span className="text-sm text-muted-foreground line-through">
                               {formatCurrency(product.originalPrice, language)}
                             </span>
                           )}
                         </div>
                         
                         {/* Add to Cart Button */}
                         <Button
                           onClick={() => addToCart(product)}
                           disabled={product.stock === 0}
                           className="w-full"
                           size="sm"
                         >
                           <ShoppingBag className="h-4 w-4 mr-2" />
                           {t.addToCart}
                         </Button>
                       </CardContent>
                     </Card>
                   );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlashSale;
