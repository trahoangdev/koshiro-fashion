import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterBar } from "@/components/FilterBar";
import { Cart } from "@/components/Cart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { Product, CartItem } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  // Language state
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
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

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      
      // Price filter
      if (selectedPriceRange !== 'all') {
        if (selectedPriceRange === 'under50' && product.price >= 50) return false;
        if (selectedPriceRange === '50-100' && (product.price < 50 || product.price > 100)) return false;
        if (selectedPriceRange === 'over100' && product.price <= 100) return false;
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
          product.nameVi, 
          product.nameJa,
          product.description,
          product.descriptionVi,
          product.descriptionJa
        ];
        return searchFields.some(field => field.toLowerCase().includes(query));
      }
      
      return true;
    });
  }, [selectedCategory, selectedPriceRange, selectedColor, searchQuery]);

  const addToCart = (product: Product) => {
    // For demo purposes, use default color and size
    const selectedColor = product.colors[0];
    const selectedSize = product.sizes[0];
    
    const existingItem = cartItems.find(item => 
      item.product.id === product.id && 
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
        `${item.product.id}-${item.selectedColor}-${item.selectedSize}` === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(items =>
      items.filter(item => 
        `${item.product.id}-${item.selectedColor}-${item.selectedSize}` !== itemId
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
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
        onCartClick={() => setShowCart(!showCart)}
        showCartPanel={showCart}
      />

      {showCart ? (
        <main className="pt-8 pb-16">
          <div className="container">
            <Cart
              cartItems={cartItems}
              currentLanguage={currentLanguage}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </main>
      ) : (
        <>
          <Hero currentLanguage={currentLanguage} />
          
          <main className="py-16">
            <div className="container space-y-12">
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {currentLanguage === 'vi' ? 'Bộ Sưu Tập' :
                     currentLanguage === 'ja' ? 'コレクション' : 'Collection'}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {currentLanguage === 'vi' ? 'Khám phá bộ sưu tập thời trang Nhật Bản được tuyển chọn cẩn thận' :
                     currentLanguage === 'ja' ? '厳選された日本のファッションコレクションをご覧ください' :
                     'Discover our carefully curated collection of Japanese fashion'}
                  </p>
                </div>

                <FilterBar
                  selectedCategory={selectedCategory}
                  selectedPriceRange={selectedPriceRange}
                  selectedColor={selectedColor}
                  currentLanguage={currentLanguage}
                  onCategoryChange={setSelectedCategory}
                  onPriceRangeChange={setSelectedPriceRange}
                  onColorChange={setSelectedColor}
                  onClearFilters={clearFilters}
                />
              </section>

              <section>
                <ProductGrid
                  products={filteredProducts}
                  currentLanguage={currentLanguage}
                  onAddToCart={addToCart}
                />
              </section>
            </div>
          </main>
          
          <Footer currentLanguage={currentLanguage} />
        </>
      )}
    </div>
  );
};

export default Index;
