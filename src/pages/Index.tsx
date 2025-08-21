import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { CartItem } from "@/types/cart";

const Index = () => {
  const navigate = useNavigate();
  
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
    if (cartItems.length === 0) {
      toast({
        title: language === 'vi' ? "Giỏ hàng trống" : 
               language === 'ja' ? "カートが空です" : 
               "Empty Cart",
        description: language === 'vi' ? "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán" :
                     language === 'ja' ? "チェックアウトする前に商品をカートに追加してください" :
                     "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để tiếp tục thanh toán" :
                     language === 'ja' ? "チェックアウトを続行するにはログインしてください" :
                     "Please login to continue checkout",
        variant: "destructive",
      });
      return;
    }

    // Close cart sidebar
    setShowCart(false);
    
    // Navigate to checkout page
    navigate('/checkout');
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
          {/* Flash Sale Section */}
          <section className="relative overflow-hidden rounded-2xl">
            {/* Banner Background */}
            <div className="absolute inset-0">
              <img 
                src="/images/categories/banner-01-flashsale.jpg" 
                alt="Flash Sale Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  🔥 {language === 'vi' ? 'Flash Sale' : language === 'ja' ? 'フラッシュセール' : 'Flash Sale'}
                </h2>
                <p className="text-lg text-white/90">
                  {language === 'vi' ? 'Giảm giá lên đến 50% cho các sản phẩm được tuyển chọn' :
                   language === 'ja' ? '厳選商品が最大50%オフ' : 'Up to 50% off on selected items'}
                </p>
              </div>
            {(() => {
              const flashSaleProducts = products.filter(product => {
                const isOnSale = product.onSale || product.salePrice || (product.originalPrice && product.originalPrice > product.price);
                if (!isOnSale) return false;
                
                let discountPercent = 0;
                if (product.salePrice && product.salePrice < product.price) {
                  discountPercent = ((product.price - product.salePrice) / product.price) * 100;
                } else if (product.originalPrice && product.originalPrice > product.price) {
                  discountPercent = ((product.originalPrice - product.price) / product.originalPrice) * 100;
                }
                return discountPercent >= 50;
              }).slice(0, 4);
              
              return flashSaleProducts.length > 0 ? (
                <EnhancedProductGrid
                  products={flashSaleProducts}
                  onAddToCart={addToCart}
                  onAddToWishlist={addToWishlist}
                  onAddToCompare={addToCompare}
                  loading={isLoading}
                />
              ) : (
                <div className="text-center py-8 text-white/90">
                  {language === 'vi' ? 'Hiện tại không có sản phẩm Flash Sale' :
                   language === 'ja' ? '現在フラッシュセール商品はありません' : 'No flash sale items currently available'}
                </div>
              );
            })()}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="relative overflow-hidden rounded-2xl">
            {/* Banner Background */}
            <div className="absolute inset-0">
              <img 
                src="/images/categories/banner-02-newarrivals.jpg" 
                alt="New Arrivals Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  ✨ {language === 'vi' ? 'Sản Phẩm Mới' : language === 'ja' ? '新着商品' : 'New Arrivals'}
                </h2>
                <p className="text-lg text-white/90">
                  {language === 'vi' ? 'Khám phá những sản phẩm mới nhất trong bộ sưu tập của chúng tôi' :
                   language === 'ja' ? '最新コレクションの新商品をご覧ください' : 'Discover the latest additions to our collection'}
                </p>
              </div>
            {(() => {
              const newProducts = products.filter(product => {
                const createdDate = new Date(product.createdAt || '');
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).slice(0, 4);
              
              return newProducts.length > 0 ? (
                <EnhancedProductGrid
                  products={newProducts}
                  onAddToCart={addToCart}
                  onAddToWishlist={addToWishlist}
                  onAddToCompare={addToCompare}
                  loading={isLoading}
                />
              ) : (
                <div className="text-center py-8 text-white/90">
                  {language === 'vi' ? 'Hiện tại không có sản phẩm mới' :
                   language === 'ja' ? '現在新着商品はありません' : 'No new arrivals currently available'}
                </div>
              );
            })()}
            </div>
          </section>
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
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-background shadow-xl overflow-hidden transform transition-transform duration-300 ease-out">
            <div className="h-full">
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
                onClose={() => setShowCart(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
