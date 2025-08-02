import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import FilterBar from "@/components/FilterBar";
import Cart from "@/components/Cart";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api, Product, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  
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
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải sản phẩm và danh mục",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.categoryId?.slug !== selectedCategory) {
        return false;
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

  const addToCart = (product: Product) => {
    // For demo purposes, use default color and size
    const selectedColor = product.colors[0];
    const selectedSize = product.sizes[0];
    
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
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(items =>
      items.filter(item => 
        `${item.product._id}-${item.selectedColor}-${item.selectedSize}` !== itemId
      )
    );
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout initiated",
      description: "This is a demo. In a real app, this would redirect to payment processing.",
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedColor('all');
    setSearchQuery('');
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
              <ProductGrid
                products={filteredProducts}
                onAddToCart={addToCart}
              />
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
