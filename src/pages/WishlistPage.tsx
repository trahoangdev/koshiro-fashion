import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [refreshWishlistTrigger, setRefreshWishlistTrigger] = useState(0);
  const { language } = useLanguage();
  const { toast } = useToast();

  // Load wishlist items from API
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);
        // Load real wishlist data from API
        const response = await api.getWishlist();
        let wishlistData: Product[] = [];
        
        if (Array.isArray(response)) {
          wishlistData = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as Record<string, unknown>;
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            wishlistData = responseObj.data as Product[];
          } else if ('wishlist' in responseObj && Array.isArray(responseObj.wishlist)) {
            wishlistData = responseObj.wishlist as Product[];
          }
        }
        
        setWishlistItems(wishlistData);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải danh sách yêu thích",
          variant: "destructive",
        });
        setWishlistItems([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [toast]);

  // Load cart items from API
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await api.getCart();
        if (response && response.items) {
          const cartItemsData = response.items.map((item: { productId: Product; quantity: number }) => ({
            id: item.productId._id,
            product: item.productId,
            quantity: item.quantity
          }));
          setCartItems(cartItemsData);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Don't show error toast for cart loading as it's not critical
      }
    };

    loadCart();
  }, []);

  const addToCart = async (product: Product) => {
    try {
      // Add to cart via API
      await api.addToCart(product._id, 1);
      
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === product._id);
        if (existingItem) {
          return prev.map(item =>
            item.id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { id: product._id, product, quantity: 1 }];
      });

      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${product.name} đã được thêm vào giỏ hàng`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      // Remove from wishlist via API
      await api.removeFromWishlist(productId);
      
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      // Refresh wishlist count in header
      setRefreshWishlistTrigger(prev => prev + 1);
      toast({
        title: "Đã xóa khỏi danh sách yêu thích",
        description: "Sản phẩm đã được xóa khỏi wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khỏi danh sách yêu thích",
        variant: "destructive",
      });
    }
  };

  const clearWishlist = async () => {
    try {
      // Clear wishlist via API
      await api.clearWishlist();
      
      setWishlistItems([]);
      // Refresh wishlist count in header
      setRefreshWishlistTrigger(prev => prev + 1);
      toast({
        title: "Đã xóa tất cả",
        description: "Danh sách yêu thích đã được làm trống",
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa danh sách yêu thích",
        variant: "destructive",
      });
    }
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const translations = {
    en: {
      title: "My Wishlist",
      subtitle: "Your Favorite Items",
      description: "Keep track of items you love and want to purchase later",
      empty: "Your wishlist is empty",
      emptyDescription: "Start adding items to your wishlist to see them here",
      startShopping: "Start Shopping",
      clearAll: "Clear All",
      addToCart: "Add to Cart",
      remove: "Remove",
      items: "items",
      loading: "Loading wishlist..."
    },
    vi: {
      title: "Danh Sách Yêu Thích",
      subtitle: "Những Sản Phẩm Bạn Yêu Thích",
      description: "Theo dõi những sản phẩm bạn yêu thích và muốn mua sau",
      empty: "Danh sách yêu thích của bạn trống",
      emptyDescription: "Bắt đầu thêm sản phẩm vào danh sách yêu thích để xem chúng ở đây",
      startShopping: "Bắt Đầu Mua Sắm",
      clearAll: "Xóa Tất Cả",
      addToCart: "Thêm Vào Giỏ",
      remove: "Xóa",
      items: "sản phẩm",
      loading: "Đang tải danh sách yêu thích..."
    },
    ja: {
      title: "お気に入りリスト",
      subtitle: "お気に入りの商品",
      description: "お気に入りの商品を追跡し、後で購入したい商品を管理",
      empty: "お気に入りリストが空です",
      emptyDescription: "お気に入りリストに商品を追加してここで確認してください",
      startShopping: "ショッピングを始める",
      clearAll: "すべて削除",
      addToCart: "カートに追加",
      remove: "削除",
      items: "商品",
      loading: "お気に入りリストを読み込み中..."
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header
        cartItemsCount={cartItemsCount}
        onSearch={() => {}}
        refreshWishlistTrigger={refreshWishlistTrigger}
      />

      <main className="py-16">
        <div className="container space-y-12">
          {/* Header */}
          <section className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                {t.title}
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-4 text-muted-foreground">
              {t.subtitle}
            </p>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              {t.description}
            </p>
          </section>

          {/* Wishlist Content */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {t.loading}
                </p>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {t.empty}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t.emptyDescription}
                </p>
                <Link to="/">
                  <Button size="lg">
                    {t.startShopping}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Wishlist Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {wishlistItems.length} {t.items}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={clearWishlist}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.clearAll}
                  </Button>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((product) => (
                    <Card key={product._id} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="relative mb-4">
                          <img
                            src={product.images[0] || "/src/assets/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                            onClick={() => removeFromWishlist(product._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(product.price, language)}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.originalPrice, language)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            className="flex-1"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t.addToCart}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Back to Shopping */}
          {wishlistItems.length > 0 && (
            <section className="text-center">
              <Link to="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage; 