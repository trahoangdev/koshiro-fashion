import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { toast } = useToast();

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories({ isActive: true });
        const categoriesData = response.categories || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải danh mục sản phẩm",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [toast]);

  const translations = {
    en: {
      title: "Categories",
      subtitle: "Explore Our Collections",
      description: "Discover our carefully curated categories of Japanese fashion",
      loading: "Loading categories...",
      noCategories: "No categories available at the moment.",
      viewProducts: "View Products",
      products: "products"
    },
    vi: {
      title: "Danh Mục",
      subtitle: "Khám Phá Bộ Sưu Tập",
      description: "Khám phá các danh mục thời trang Nhật Bản được tuyển chọn cẩn thận",
      loading: "Đang tải danh mục...",
      noCategories: "Hiện tại không có danh mục nào.",
      viewProducts: "Xem Sản Phẩm",
      products: "sản phẩm"
    },
    ja: {
      title: "カテゴリ",
      subtitle: "コレクションを探索",
      description: "厳選された日本のファッションカテゴリをご覧ください",
      loading: "カテゴリを読み込み中...",
      noCategories: "現在カテゴリはありません。",
      viewProducts: "商品を見る",
      products: "商品"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi': return category.name;
      case 'ja': return category.nameJa || category.name;
      default: return category.nameEn || category.name;
    }
  };

  const getCategoryDescription = (category: Category) => {
    switch (language) {
      case 'vi': return category.description;
      case 'ja': return category.descriptionJa || category.description;
      default: return category.descriptionEn || category.description;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header
        cartItemsCount={0}
        onSearch={() => {}}
      />

      <main className="py-16">
        <div className="container space-y-12">
          {/* Hero Section */}
          <section className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-muted-foreground">
              {t.subtitle}
            </p>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              {t.description}
            </p>
          </section>

          {/* Categories Grid */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {t.loading}
                </p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t.noCategories}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category) => (
                  <Card key={category._id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        {category.isActive && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">
                        {getCategoryName(category)}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {getCategoryDescription(category)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {category.productCount || 0} {t.products}
                        </span>
                        
                        <Link to={`/category/${category.slug}`}>
                          <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                            {t.viewProducts}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
                <p className="text-lg mb-8 opacity-90">
                  Explore our complete collection of Japanese fashion
                </p>
                <Link to="/">
                  <Button size="lg" variant="secondary">
                    Browse All Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage; 