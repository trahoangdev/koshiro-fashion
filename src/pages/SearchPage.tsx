import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Loader2,
  X
} from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await api.searchProducts(query, 50);
      setProducts(response.products || []);
      
      // Update URL params
      const newParams = new URLSearchParams();
      newParams.set('q', query);
      if (filters.category) newParams.set('category', filters.category);
      if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
      if (filters.sortBy) newParams.set('sortBy', filters.sortBy);
      setSearchParams(newParams);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: language === 'vi' ? "Lỗi tìm kiếm" : 
               language === 'ja' ? "検索エラー" : 
               "Search Error",
        description: language === 'vi' ? "Không thể thực hiện tìm kiếm" :
                     language === 'ja' ? "検索を実行できませんでした" :
                     "Unable to perform search",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance'
    });
    const newParams = new URLSearchParams();
    newParams.set('q', searchQuery);
    setSearchParams(newParams);
  };

  const addToCart = async (product: Product) => {
    // This will be handled by ProductGrid component
    console.log('Add to cart:', product);
  };

  // Load search results on mount
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, []);

  const translations = {
    en: {
      title: "Search Results",
      searchPlaceholder: "Search products...",
      search: "Search",
      filters: "Filters",
      clearFilters: "Clear Filters",
      results: "results",
      noResults: "No results found",
      noResultsDesc: "Try adjusting your search terms or filters",
      tryAgain: "Try Again",
      category: "Category",
      price: "Price",
      sortBy: "Sort By",
      relevance: "Relevance",
      priceLowToHigh: "Price: Low to High",
      priceHighToLow: "Price: High to Low",
      newest: "Newest",
      oldest: "Oldest",
      gridView: "Grid View",
      listView: "List View"
    },
    vi: {
      title: "Kết Quả Tìm Kiếm",
      searchPlaceholder: "Tìm kiếm sản phẩm...",
      search: "Tìm kiếm",
      filters: "Bộ lọc",
      clearFilters: "Xóa bộ lọc",
      results: "kết quả",
      noResults: "Không tìm thấy kết quả",
      noResultsDesc: "Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc",
      tryAgain: "Thử lại",
      category: "Danh mục",
      price: "Giá",
      sortBy: "Sắp xếp theo",
      relevance: "Liên quan",
      priceLowToHigh: "Giá: Thấp đến cao",
      priceHighToLow: "Giá: Cao đến thấp",
      newest: "Mới nhất",
      oldest: "Cũ nhất",
      gridView: "Xem dạng lưới",
      listView: "Xem dạng danh sách"
    },
    ja: {
      title: "検索結果",
      searchPlaceholder: "商品を検索...",
      search: "検索",
      filters: "フィルター",
      clearFilters: "フィルターをクリア",
      results: "件の結果",
      noResults: "結果が見つかりません",
      noResultsDesc: "検索語句やフィルターを調整してみてください",
      tryAgain: "再試行",
      category: "カテゴリ",
      price: "価格",
      sortBy: "並び替え",
      relevance: "関連性",
      priceLowToHigh: "価格: 安い順",
      priceHighToLow: "価格: 高い順",
      newest: "最新",
      oldest: "古い順",
      gridView: "グリッド表示",
      listView: "リスト表示"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {/* Results Count */}
            {products.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {products.length} {t.results}
                </p>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
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
            )}
          </div>

          {/* Filters and Results */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      {t.filters}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  {/* Sort By */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      {t.sortBy}
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="relevance">{t.relevance}</option>
                      <option value="price_asc">{t.priceLowToHigh}</option>
                      <option value="price_desc">{t.priceHighToLow}</option>
                      <option value="newest">{t.newest}</option>
                      <option value="oldest">{t.oldest}</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">
                      {t.price}
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>{language === 'vi' ? "Đang tìm kiếm..." : language === 'ja' ? "検索中..." : "Searching..."}</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t.noResults}</h2>
                  <p className="text-muted-foreground mb-8">{t.noResultsDesc}</p>
                  <Button onClick={() => navigate('/')}>
                    {t.tryAgain}
                  </Button>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  onAddToCart={addToCart}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchPage; 