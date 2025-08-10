import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { api, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SalePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { language } = useLanguage();
  const { toast } = useToast();

  // Load sale products
  useEffect(() => {
    const loadSaleProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProducts({ 
          isActive: true, 
          limit: 50,
          onSale: true 
        });
        
        const saleProducts = response.products || [];
        setProducts(saleProducts);
      } catch (error) {
        console.error('Error loading sale products:', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải sản phẩm khuyến mãi",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSaleProducts();
  }, [toast]);

  const addToCart = (product: Product) => {
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
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const translations = {
    en: {
      title: "Sale",
      subtitle: "Limited Time Offers",
      description: "Discover amazing deals on our Japanese fashion collection",
      noProducts: "No sale products available at the moment.",
      loading: "Loading sale products..."
    },
    vi: {
      title: "Khuyến Mãi",
      subtitle: "Ưu Đãi Có Hạn",
      description: "Khám phá những ưu đãi tuyệt vời cho bộ sưu tập thời trang Nhật Bản",
      noProducts: "Hiện tại không có sản phẩm khuyến mãi.",
      loading: "Đang tải sản phẩm khuyến mãi..."
    },
    ja: {
      title: "セール",
      subtitle: "期間限定オファー",
      description: "日本のファッションコレクションの素晴らしいお得情報をご覧ください",
      noProducts: "現在セール商品はありません。",
      loading: "セール商品を読み込み中..."
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header
        cartItemsCount={cartItemsCount}
        onSearch={() => {}}
      />

      <main className="py-16">
        <div className="container space-y-12">
          {/* Hero Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-16 rounded-lg">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl mb-2 opacity-90">
                {t.subtitle}
              </p>
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                {t.description}
              </p>
            </div>
          </section>

          {/* Products Section */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {t.loading}
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t.noProducts}
                </p>
              </div>
            ) : (
              <ProductGrid
                products={products}
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

export default SalePage; 