import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api, Product, type FlashSale } from "@/lib/api";
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
  Link as LinkIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface FlashSaleProduct extends Product {
  flashSalePrice: number;
  flashSaleDiscount: number;
  flashSaleDiscountType: string;
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
  const [flashSaleProducts, setFlashSaleProducts] = useState<FlashSaleProduct[]>([]);
  const [currentFlashSale, setCurrentFlashSale] = useState<FlashSale | null>(null);
  const [nextFlashSale, setNextFlashSale] = useState<FlashSale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % flashSaleProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + flashSaleProducts.length) % flashSaleProducts.length);
  };

  // Drag functions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) { // Minimum drag distance
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) { // Minimum drag distance
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setIsDragging(false);
  };

  // Load flash sale data from API
  useEffect(() => {
    const loadFlashSaleData = async () => {
      try {
        setIsLoading(true);
        
        // Get current flash sale
        const currentSaleResponse = await api.getCurrentFlashSale();
        if (currentSaleResponse.success) {
          setCurrentFlashSale(currentSaleResponse.flashSale);
          setNextFlashSale(currentSaleResponse.nextFlashSale || null);
          
          // Load products for current flash sale
          if (currentSaleResponse.flashSale) {
            const productsResponse = await api.getFlashSaleProducts(currentSaleResponse.flashSale._id, { limit: 8 });
            if (productsResponse.success) {
              setFlashSaleProducts(productsResponse.products);
            }
          }
        }
      } catch (error) {
        console.error('Error loading flash sale data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashSaleData();
  }, []);

  // Find current active session
  const currentSession = currentFlashSale ? {
    id: currentFlashSale._id,
    name: language === 'vi' ? currentFlashSale.name : 
          language === 'ja' ? currentFlashSale.nameJa || currentFlashSale.name :
          currentFlashSale.nameEn || currentFlashSale.name,
    startTime: new Date(currentFlashSale.startTime),
    endTime: new Date(currentFlashSale.endTime),
    discount: currentFlashSale.discountValue
  } : null;

  // Find next upcoming session
  const nextSession = nextFlashSale ? {
    id: nextFlashSale._id,
    name: language === 'vi' ? nextFlashSale.name : 
          language === 'ja' ? nextFlashSale.nameJa || nextFlashSale.name :
          nextFlashSale.nameEn || nextFlashSale.name,
    startTime: new Date(nextFlashSale.startTime),
    endTime: new Date(nextFlashSale.endTime),
    discount: nextFlashSale.discountValue
  } : null;

  // Calculate time remaining for current session
  const getTimeRemaining = (session: any) => {
    const now = currentTime.getTime();
    const end = session.endTime.getTime();
    const timeLeft = end - now;
    
    if (timeLeft <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Calculate time until next session
  const getTimeUntilNext = (session: any) => {
    const now = currentTime.getTime();
    const start = session.startTime.getTime();
    const timeLeft = start - now;
    
    if (timeLeft <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Calculate progress percentage
  const getProgressPercentage = (session: any) => {
    const now = currentTime.getTime();
    const start = session.startTime.getTime();
    const end = session.endTime.getTime();
    const total = end - start;
    const elapsed = now - start;
    
    if (elapsed <= 0) return 0;
    if (elapsed >= total) return 100;
    
    return (elapsed / total) * 100;
  };


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
      timeUntilNext: "Time Until Next Sale",
      viewAll: "View All",
      addToCart: "Add to Cart",
      soldOut: "Sold Out",
      noActiveSale: "No active sale at the moment",
      comingSoon: "Coming Soon",
      discount: "OFF",
      addToWishlist: "Add to Wishlist",
      addToCompare: "Add to Compare",
      rating: "Rating",
      colors: "Colors",
      hurryUp: "Hurry up! Sale ends soon!",
      nextSaleStarts: "Next sale starts in"
    },
    vi: {
      title: "Flash Sale",
      subtitle: "Ưu đãi có thời hạn với giảm giá lớn",
      currentSale: "Đang Sale",
      nextSale: "Sale Tiếp Theo",
      timeRemaining: "Thời Gian Còn Lại",
      timeUntilNext: "Thời Gian Đến Sale Tiếp Theo",
      viewAll: "Xem Tất Cả",
      addToCart: "Thêm Vào Giỏ",
      soldOut: "Hết Hàng",
      noActiveSale: "Hiện tại không có sale nào",
      comingSoon: "Sắp Diễn Ra",
      discount: "GIẢM",
      addToWishlist: "Thêm Vào Yêu Thích",
      addToCompare: "Thêm Vào So Sánh",
      rating: "Đánh Giá",
      colors: "Màu Sắc",
      hurryUp: "Nhanh lên! Sale sắp kết thúc!",
      nextSaleStarts: "Sale tiếp theo bắt đầu sau"
    },
    ja: {
      title: "フラッシュセール",
      subtitle: "期間限定の大割引オファー",
      currentSale: "現在のセール",
      nextSale: "次のセール",
      timeRemaining: "残り時間",
      timeUntilNext: "次のセールまで",
      viewAll: "すべて見る",
      addToCart: "カートに追加",
      soldOut: "売り切れ",
      noActiveSale: "現在アクティブなセールはありません",
      comingSoon: "近日公開",
      discount: "OFF",
      addToWishlist: "お気に入りに追加",
      addToCompare: "比較リストに追加",
      rating: "評価",
      colors: "色",
      hurryUp: "急いで！セールが終わります！",
      nextSaleStarts: "次のセールまで"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Enhanced countdown component
  const CountdownTimer = ({ time, label, isUrgent = false }: { 
    time: { hours: number; minutes: number; seconds: number }; 
    label: string;
    isUrgent?: boolean;
  }) => (
    <div className="flex flex-col items-center">
      <span className={`text-sm opacity-80 mb-2 ${isUrgent ? 'text-red-200 font-semibold' : ''}`}>
        {label}
      </span>
      <div className="flex space-x-2">
        <div className={`bg-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center ${isUrgent ? 'animate-pulse' : ''}`}>
          <div className="text-2xl font-bold">
            {time.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-80">
            {language === 'vi' ? 'Giờ' : language === 'ja' ? '時間' : 'Hours'}
          </div>
        </div>
        <div className={`bg-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center ${isUrgent ? 'animate-pulse' : ''}`}>
          <div className="text-2xl font-bold">
            {time.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-80">
            {language === 'vi' ? 'Phút' : language === 'ja' ? '分' : 'Minutes'}
          </div>
        </div>
        <div className={`bg-white/20 rounded-lg px-3 py-2 min-w-[60px] text-center ${isUrgent ? 'animate-pulse' : ''}`}>
          <div className="text-2xl font-bold">
            {time.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-80">
            {language === 'vi' ? 'Giây' : language === 'ja' ? '秒' : 'Seconds'}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flash sale...</p>
        </CardContent>
      </Card>
    );
  }

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
    <Card className={`${className}`}>
      <CardContent className="p-0">
        {/* Enhanced Flash Sale Header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-8">
          <div className="flex items-center justify-center mb-6">
            <Flame className="h-12 w-12 mr-3 animate-pulse" />
            <h2 className="text-4xl font-bold">{t.title}</h2>
          </div>
          <p className="text-xl text-center opacity-90 mb-8">
            {currentFlashSale ? (
              language === 'vi' ? currentFlashSale.description :
              language === 'ja' ? currentFlashSale.descriptionJa || currentFlashSale.description :
              currentFlashSale.descriptionEn || currentFlashSale.description
            ) : t.subtitle}
          </p>
          
          {/* Current Sale Session with Enhanced Countdown */}
          {currentSession ? (
            <div className="text-center">
              <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2 mb-4">
                {t.currentSale}: {currentSession.name} - {currentSession.discount}% {t.discount}
              </Badge>
              
              {/* Enhanced Countdown Timer */}
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 mr-2" />
                  <span className="text-lg font-semibold">{t.timeRemaining}</span>
                </div>
                
                <CountdownTimer 
                  time={getTimeRemaining(currentSession)} 
                  label=""
                  isUrgent={getTimeRemaining(currentSession).hours < 1}
                />
                
                {/* Urgency message */}
                {getTimeRemaining(currentSession).hours < 1 && (
                  <p className="text-red-200 font-semibold mt-3 animate-pulse">
                    {t.hurryUp}
                  </p>
                )}
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="max-w-md mx-auto">
                <Progress 
                  value={getProgressPercentage(currentSession)} 
                  className="h-3 bg-white/20" 
                />
                <p className="text-sm opacity-80 mt-2">
                  {Math.round(getProgressPercentage(currentSession))}% {language === 'vi' ? 'hoàn thành' : language === 'ja' ? '完了' : 'complete'}
                </p>
              </div>
            </div>
          ) : nextSession ? (
            /* Show next sale countdown */
            <div className="text-center">
              <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2 mb-4">
                {t.nextSale}: {nextSession.name} - {nextSession.discount}% {t.discount}
              </Badge>
              <p className="text-lg opacity-80 mb-4">{t.nextSaleStarts}</p>
              
              <CountdownTimer 
                time={getTimeUntilNext(nextSession)} 
                label=""
              />
            </div>
          ) : (
            <div className="text-center">
              <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2 mb-4">
                {t.comingSoon}
              </Badge>
              <p className="text-lg opacity-80">{t.noActiveSale}</p>
            </div>
          )}
        </div>

        {/* Flash Sale Products - Moved up above Sale Schedule */}
        {flashSaleProducts.length > 0 && (
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                {language === 'vi' ? 'Sản Phẩm Flash Sale' : language === 'ja' ? 'フラッシュセール商品' : 'Flash Sale Products'}
              </h3>
              <Link to="/sale">
                <Button variant="outline" size="sm">
                  {t.viewAll}
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                {/* Navigation Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </Button>

                {/* Auto-sliding container */}
                <div 
                  className="flex transition-transform duration-500 ease-in-out cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateX(-${currentSlide * (100 / flashSaleProducts.length)}%)`,
                    width: `${flashSaleProducts.length * 100}%`
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Products */}
                  {flashSaleProducts.map((product, index) => {
                    const discount = product.flashSaleDiscount || 
                      (product.salePrice && product.salePrice < product.price
                        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                        : product.originalPrice && product.originalPrice > product.price
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0);
                    return (
                                             <div key={product._id} className="flex-shrink-0 px-2" style={{ width: `${100 / flashSaleProducts.length}%` }}>
                         <Card 
                           className="group hover:shadow-lg transition-all duration-300 h-full cursor-pointer"
                           onClick={() => window.location.href = `/product/${product._id}`}
                         >
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
                                    {product.colors.slice(0, 4).map((color, colorIndex) => (
                                      <div
                                        key={colorIndex}
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
                                {formatCurrency(product.flashSalePrice || product.salePrice || product.price, language)}
                              </span>
                              {product.price && (product.flashSalePrice || product.salePrice) && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.price, language)}
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
                      </div>
                    );
                  })}
                </div>
                
                {/* Slide indicators */}
                <div className="flex justify-center mt-4 space-x-2">
                  {flashSaleProducts.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 hover:scale-110 ${
                        currentSlide === index 
                          ? 'bg-primary' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default FlashSale;
