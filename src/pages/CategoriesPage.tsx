import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Package, Search, Grid, List, SortAsc, SortDesc, Filter, TrendingUp, Star, Eye, Users } from "lucide-react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories({ isActive: true });
        const categoriesData = response.categories || [];
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
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

  // Filter and sort categories
  useEffect(() => {
    let filtered = [...categories];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(category => {
        const name = getCategoryName(category);
        const description = getCategoryDescription(category);
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return getCategoryName(a).localeCompare(getCategoryName(b));
        case 'nameDesc':
          return getCategoryName(b).localeCompare(getCategoryName(a));
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchQuery, sortBy, language]);

  const translations = {
    en: {
      title: "Categories",
      subtitle: "Explore Our Collections",
      description: "Discover our carefully curated categories of Japanese fashion",
      loading: "Loading categories...",
      noCategories: "No categories available at the moment.",
      viewProducts: "View Products",
      products: "products",
      search: "Search categories...",
      sortBy: "Sort by",
      name: "Name A-Z",
      nameDesc: "Name Z-A",
      newest: "Newest",
      mostProducts: "Most Products",
      viewMode: "View",
      grid: "Grid",
      list: "List",
      exploreAll: "Explore All Categories",
      totalCategories: "categories available",
      noResults: "No categories found",
      tryDifferent: "Try a different search term",
      clearSearch: "Clear search",
      browse: "Browse All Products",
      ready: "Ready to Shop?",
      exploreCollection: "Explore our complete collection of Japanese fashion"
    },
    vi: {
      title: "Danh Mục",
      subtitle: "Khám Phá Bộ Sưu Tập",
      description: "Khám phá các danh mục thời trang Nhật Bản được tuyển chọn cẩn thận",
      loading: "Đang tải danh mục...",
      noCategories: "Hiện tại không có danh mục nào.",
      viewProducts: "Xem Sản Phẩm",
      products: "sản phẩm",
      search: "Tìm kiếm danh mục...",
      sortBy: "Sắp xếp theo",
      name: "Tên A-Z",
      nameDesc: "Tên Z-A",
      newest: "Mới nhất",
      mostProducts: "Nhiều sản phẩm nhất",
      viewMode: "Hiển thị",
      grid: "Lưới",
      list: "Danh sách",
      exploreAll: "Khám phá tất cả danh mục",
      totalCategories: "danh mục có sẵn",
      noResults: "Không tìm thấy danh mục nào",
      tryDifferent: "Thử từ khóa tìm kiếm khác",
      clearSearch: "Xóa tìm kiếm",
      browse: "Duyệt tất cả sản phẩm",
      ready: "Sẵn sàng mua sắm?",
      exploreCollection: "Khám phá bộ sưu tập thời trang Nhật Bản hoàn chỉnh"
    },
    ja: {
      title: "カテゴリ",
      subtitle: "コレクションを探索",
      description: "厳選された日本のファッションカテゴリをご覧ください",
      loading: "カテゴリを読み込み中...",
      noCategories: "現在カテゴリはありません。",
      viewProducts: "商品を見る",
      products: "商品",
      search: "カテゴリを検索...",
      sortBy: "並び替え",
      name: "名前A-Z",
      nameDesc: "名前Z-A",
      newest: "最新",
      mostProducts: "商品数順",
      viewMode: "表示",
      grid: "グリッド",
      list: "リスト",
      exploreAll: "すべてのカテゴリを探索",
      totalCategories: "カテゴリが利用可能",
      noResults: "カテゴリが見つかりません",
      tryDifferent: "別の検索語を試してください",
      clearSearch: "検索をクリア",
      browse: "すべての商品を閲覧",
      ready: "お買い物の準備はできましたか？",
      exploreCollection: "日本のファッションコレクション全体をご覧ください"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header
        cartItemsCount={0}
        onSearch={() => {}}
      />

      <main className="py-8">
        <div className="container space-y-8">
          {/* Enhanced Hero Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-muted-foreground">
                {t.subtitle}
              </p>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground mb-6">
                {t.description}
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {filteredCategories.length} {t.totalCategories}
              </Badge>
            </div>
          </section>

          {/* Controls Section */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>{t.exploreAll}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">{t.name}</SelectItem>
                      <SelectItem value="nameDesc">{t.nameDesc}</SelectItem>
                      <SelectItem value="products">{t.mostProducts}</SelectItem>
                      <SelectItem value="newest">{t.newest}</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-sm text-muted-foreground">{t.viewMode}:</span>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Categories Grid/List */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">
                  {t.loading}
                </p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? t.noResults : t.noCategories}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? t.tryDifferent : t.noCategories}
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery('')} variant="outline">
                        {t.clearSearch}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-4'
              }>
                {filteredCategories.map((category) => (
                  <Card 
                    key={category._id} 
                    className={`group hover:shadow-xl transition-all duration-300 cursor-pointer rounded-md ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    onClick={() => navigate(`/category/${category.slug}`)}
                  >
                    {viewMode === 'grid' ? (
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex items-center space-x-2">
                            {category.isActive && (
                              <Badge variant="secondary">Active</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {category.productCount || 0}
                            </Badge>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {getCategoryName(category)}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                          {getCategoryDescription(category)}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {category.productCount || 0} {t.products}
                          </span>
                          
                          <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                            {t.viewProducts}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="p-6 flex items-center space-x-6 w-full">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                              {getCategoryName(category)}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {category.isActive && (
                                <Badge variant="secondary">Active</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {category.productCount || 0}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                            {getCategoryDescription(category)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {category.productCount || 0} {t.products}
                            </span>
                            
                            <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                              {t.viewProducts}
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Enhanced CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative">
              <div className="absolute inset-0 bg-black/5"></div>
              <CardContent className="p-12 relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 mr-2" />
                  <h2 className="text-3xl font-bold">{t.ready}</h2>
                </div>
                <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                  {t.exploreCollection}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/">
                    <Button size="lg" variant="secondary" className="px-8">
                      <Eye className="h-5 w-5 mr-2" />
                      {t.browse}
                    </Button>
                  </Link>
                  <Link to="/sale">
                    <Button size="lg" variant="outline" className="px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Sale Items
                    </Button>
                  </Link>
                </div>
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