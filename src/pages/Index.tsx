import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EnhancedProductGrid from "@/components/EnhancedProductGrid";
import FilterBar from "@/components/FilterBar";
import Cart from "@/components/Cart";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api, Product, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

const Index = () => {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View state
  const [showCart, setShowCart] = useState(false);
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.getProducts({ isActive: true, limit: 50 }),
          api.getCategories({ isActive: true })
        ]);
        
        console.log('Products response:', productsResponse);
        console.log('Categories response:', categoriesResponse);
        
        // Handle response structures
        const productsData = productsResponse.products || [];
        const categoriesData = categoriesResponse.categories || [];
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Data Loading Error",
          description: language === 'vi' ? "Không thể tải sản phẩm và danh mục" :
                       language === 'ja' ? "商品とカテゴリを読み込めませんでした" :
                       "Could not load products and categories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast, language]);

  // Load cart from API if authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        return;
      }

      try {
        const response = await api.getCart();
        if (response && response.items) {
          const cartItemsData = response.items.map((item: { 
            productId: string; 
            quantity: number; 
            size?: string; 
            color?: string; 
            product: Product; 
          }) => ({
            product: item.product,
            quantity: item.quantity,
            selectedColor: item.color || item.product.colors[0],
            selectedSize: item.size || item.product.sizes[0]
          }));
          setCartItems(cartItemsData);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Don't show error toast for cart loading as it's not critical
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Helper function to get product name in current language
  const getProductName = (product: Product) => {
    if (language === 'vi') return product.name;
    if (language === 'ja') return product.nameJa || product.name;
    return product.nameEn || product.name;
  };

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all') {
        const categorySlug = typeof product.categoryId === 'string' 
          ? null 
          : product.categoryId?.slug;
        if (categorySlug !== selectedCategory) {
          return false;
        }
      }
      
      // Price filter
      if (selectedPriceRange !== 'all') {
        if (selectedPriceRange === 'under50' && product.price >= 50000) return false;
        if (selectedPriceRange === '50-100' && (product.price < 50000 || product.price > 100000)) return false;
        if (selectedPriceRange === 'over100' && product.price <= 100000) return false;
      }
      
      // Color filter
      if (selectedColor !== 'all' && !product.colors.includes(selectedColor)) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          product.name,
          product.nameEn, 
          product.nameJa,
          product.description,
          product.descriptionEn,
          product.descriptionJa
        ].filter(Boolean);
        return searchFields.some(field => field.toLowerCase().includes(query));
      }
      
      return true;
    });
  }, [products, selectedCategory, selectedPriceRange, selectedColor, searchQuery]);

  const addToCart = async (product: Product) => {
    try {
      // For demo purposes, use default color and size
      const selectedColor = product.colors[0];
      const selectedSize = product.sizes[0];
      
      // Add to cart via API if authenticated
      if (isAuthenticated) {
        await api.addToCart(product._id, 1);
      }
      
      const existingItem = cartItems.find(item => 
        item.product._id === product._id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );

      if (existingItem) {
        setCartItems(items => 
          items.map(item => 
            item === existingItem 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCartItems(items => [...items, {
          product,
          quantity: 1,
          selectedColor,
          selectedSize
        }]);
      }

      toast({
        title: language === 'vi' ? "Đã thêm vào giỏ hàng" : 
               language === 'ja' ? "カートに追加されました" : 
               "Added to Cart",
        description: language === 'vi' ? `${getProductName(product)} đã được thêm vào giỏ hàng` :
                     language === 'ja' ? `${getProductName(product)}がカートに追加されました` :
                     `${getProductName(product)} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể thêm vào giỏ hàng" :
                     language === 'ja' ? "カートに追加できませんでした" :
                     "Could not add to cart",
        variant: "destructive",
      });
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      // Update cart via API if authenticated
      if (isAuthenticated) {
        const item = cartItems.find(item => 
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
        );
        if (item) {
          await api.updateCartItem(item.product._id, quantity);
        }
      }
      
      setCartItems(items =>
        items.map(item =>
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể cập nhật số lượng" :
                     language === 'ja' ? "数量を更新できませんでした" :
                     "Could not update quantity",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Remove from cart via API if authenticated
      if (isAuthenticated) {
        const item = cartItems.find(item => 
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
        );
        if (item) {
          await api.removeFromCart(item.product._id);
        }
      }
      
      setCartItems(items =>
        items.filter(item => 
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` !== itemId
        )
      );
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể xóa khỏi giỏ hàng" :
                     language === 'ja' ? "カートから削除できませんでした" :
                     "Could not remove from cart",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    toast({
      title: language === 'vi' ? "Bắt đầu thanh toán" : 
             language === 'ja' ? "チェックアウト開始" : 
             "Checkout initiated",
      description: language === 'vi' ? "Đây là demo. Trong ứng dụng thực tế, sẽ chuyển đến trang thanh toán." :
                   language === 'ja' ? "これはデモです。実際のアプリでは、決済処理ページにリダイレクトされます。" :
                   "This is a demo. In a real app, this would redirect to payment processing.",
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedColor('all');
    setSearchQuery('');
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích" :
                     language === 'ja' ? "お気に入りリストに商品を追加するにはログインしてください" :
                     "Please login to add products to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.addToWishlist(product._id);
      
      toast({
        title: language === 'vi' ? "Đã thêm vào danh sách yêu thích" : 
               language === 'ja' ? "お気に入りに追加されました" : 
               "Added to Wishlist",
        description: language === 'vi' ? `${getProductName(product)} đã được thêm vào danh sách yêu thích` :
                     language === 'ja' ? `${getProductName(product)}がお気に入りに追加されました` :
                     `${getProductName(product)} has been added to wishlist`,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể thêm vào danh sách yêu thích" :
                     language === 'ja' ? "お気に入りに追加できませんでした" :
                     "Could not add to wishlist",
        variant: "destructive",
      });
    }
  };

  const addToCompare = (product: Product) => {
    const savedCompareList = localStorage.getItem('koshiro_compare_list');
    let compareList: Product[] = [];
    
    if (savedCompareList) {
      try {
        compareList = JSON.parse(savedCompareList);
      } catch (error) {
        console.error('Error parsing compare list:', error);
      }
    }

    if (compareList.length >= 4) {
      toast({
        title: language === 'vi' ? "Giới hạn so sánh" : 
               language === 'ja' ? "比較制限" : 
               "Compare Limit",
        description: language === 'vi' ? "Bạn chỉ có thể so sánh tối đa 4 sản phẩm" :
                     language === 'ja' ? "最大4つの商品を比較できます" :
                     "You can compare up to 4 products",
        variant: "destructive",
      });
      return;
    }

    if (compareList.find(p => p._id === product._id)) {
      toast({
        title: language === 'vi' ? "Sản phẩm đã có" : 
               language === 'ja' ? "商品は既に追加済み" : 
               "Product Already Added",
        description: language === 'vi' ? "Sản phẩm này đã có trong danh sách so sánh" :
                     language === 'ja' ? "この商品は既に比較リストにあります" :
                     "This product is already in the compare list",
        variant: "destructive",
      });
      return;
    }

    const newCompareList = [...compareList, product];
    localStorage.setItem('koshiro_compare_list', JSON.stringify(newCompareList));
    
    toast({
      title: language === 'vi' ? "Đã thêm vào so sánh" : 
             language === 'ja' ? "比較リストに追加" : 
             "Added to Compare",
      description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
                   language === 'ja' ? "商品が比較リストに追加されました" :
                   "Product has been added to compare list",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header
        cartItemsCount={cartItemsCount}
        onSearch={setSearchQuery}
      />

      <Hero />
      
      <main className="py-16">
        <div className="container space-y-12">
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'vi' ? 'Bộ Sưu Tập' :
                 language === 'ja' ? 'コレクション' : 'Collection'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {language === 'vi' ? 'Khám phá bộ sưu tập thời trang Nhật Bản được tuyển chọn cẩn thận' :
                 language === 'ja' ? '厳選された日本のファッションコレクションをご覧ください' :
                 'Discover our carefully curated collection of Japanese fashion'}
              </p>
            </div>

            <FilterBar
              selectedCategory={selectedCategory}
              selectedPriceRange={selectedPriceRange}
              selectedColor={selectedColor}
              onCategoryChange={setSelectedCategory}
              onPriceRangeChange={setSelectedPriceRange}
              onColorChange={setSelectedColor}
              onClearFilters={clearFilters}
            />
          </section>

          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {language === 'vi' ? 'Đang tải sản phẩm...' :
                   language === 'ja' ? '商品を読み込み中...' : 'Loading products...'}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === 'vi' ? 'Không tìm thấy sản phẩm nào.' :
                   language === 'ja' ? '商品が見つかりません。' : 'No products found.'}
                </p>
              </div>
            ) : (
              <EnhancedProductGrid
                products={filteredProducts}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                onAddToCompare={addToCompare}
                loading={isLoading}
              />
            )}
          </section>

          {/* Cart Toggle Button */}
          {cartItemsCount > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                onClick={() => setShowCart(!showCart)}
                size="lg"
                className="rounded-full shadow-lg"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {language === 'vi' ? 'Xem Giỏ Hàng' :
                 language === 'ja' ? 'カートを見る' : 'View Cart'}
                <Badge variant="secondary" className="ml-2">
                  {cartItemsCount}
                </Badge>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
