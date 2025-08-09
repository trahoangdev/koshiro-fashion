import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Product, Category } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnhancedProductGrid from '@/components/EnhancedProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Loader2, Grid, List, Filter, Search, X, SlidersHorizontal, Tag, Star, Heart, ShoppingCart, ArrowLeft, ChevronDown, Package, TrendingUp } from 'lucide-react';

interface CategoryPageProps {
  // Props can be added here when needed
}

const CategoryPage: React.FC<CategoryPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStock, setInStock] = useState<boolean>(false);
  const [onSale, setOnSale] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  const translations = {
    vi: {
      loading: 'Đang tải...',
      errorLoading: 'Lỗi tải dữ liệu',
      errorLoadingDesc: 'Không thể tải thông tin danh mục',
      noProducts: 'Không có sản phẩm nào',
      noProductsDesc: 'Danh mục này chưa có sản phẩm',
      sortBy: 'Sắp xếp theo',
      newest: 'Mới nhất',
      oldest: 'Cũ nhất',
      priceLowToHigh: 'Giá tăng dần',
      priceHighToLow: 'Giá giảm dần',
      nameAZ: 'Tên A-Z',
      nameZA: 'Tên Z-A',
      viewMode: 'Chế độ xem',
      grid: 'Lưới',
      list: 'Danh sách',
      products: 'sản phẩm',
      showing: 'Hiển thị',
      of: 'trên tổng số',
      previous: 'Trước',
      next: 'Tiếp',
      backToCategories: 'Quay lại danh mục',
      filter: 'Lọc',
      clearFilters: 'Xóa bộ lọc',
      search: 'Tìm kiếm sản phẩm...',
      priceRange: 'Khoảng giá',
      size: 'Kích thước',
      color: 'Màu sắc',
      inStock: 'Còn hàng',
      onSale: 'Đang khuyến mãi',
      rating: 'Đánh giá',
      starsAndUp: 'sao trở lên',
      allProducts: 'Tất cả',
      featured: 'Nổi bật',
      bestSelling: 'Bán chạy',
      applyFilters: 'Áp dụng',
      resultsFound: 'kết quả tìm thấy',
      noFiltersMatch: 'Không có sản phẩm nào phù hợp với bộ lọc',
      adjustFilters: 'Hãy thử điều chỉnh bộ lọc của bạn',
      home: 'Trang chủ',
      categories: 'Danh mục'
    },
    en: {
      loading: 'Loading...',
      errorLoading: 'Error Loading Data',
      errorLoadingDesc: 'Unable to load category information',
      noProducts: 'No Products',
      noProductsDesc: 'This category has no products yet',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      priceLowToHigh: 'Price Low to High',
      priceHighToLow: 'Price High to Low',
      nameAZ: 'Name A-Z',
      nameZA: 'Name Z-A',
      viewMode: 'View Mode',
      grid: 'Grid',
      list: 'List',
      products: 'products',
      showing: 'Showing',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      backToCategories: 'Back to Categories',
      filter: 'Filter',
      clearFilters: 'Clear Filters',
      search: 'Search products...',
      priceRange: 'Price Range',
      size: 'Size',
      color: 'Color',
      inStock: 'In Stock',
      onSale: 'On Sale',
      rating: 'Rating',
      starsAndUp: 'stars & up',
      allProducts: 'All',
      featured: 'Featured',
      bestSelling: 'Best Selling',
      applyFilters: 'Apply',
      resultsFound: 'results found',
      noFiltersMatch: 'No products match your filters',
      adjustFilters: 'Try adjusting your filters',
      home: 'Home',
      categories: 'Categories'
    },
    ja: {
      loading: '読み込み中...',
      errorLoading: 'データ読み込みエラー',
      errorLoadingDesc: 'カテゴリ情報を読み込めません',
      noProducts: '商品なし',
      noProductsDesc: 'このカテゴリにはまだ商品がありません',
      sortBy: '並び替え',
      newest: '最新',
      oldest: '古い順',
      priceLowToHigh: '価格安い順',
      priceHighToLow: '価格高い順',
      nameAZ: '名前A-Z',
      nameZA: '名前Z-A',
      viewMode: '表示モード',
      grid: 'グリッド',
      list: 'リスト',
      products: '商品',
      showing: '表示中',
      of: 'の',
      previous: '前へ',
      next: '次へ',
      backToCategories: 'カテゴリに戻る',
      filter: 'フィルター',
      clearFilters: 'フィルターをクリア',
      search: '商品を検索...',
      priceRange: '価格帯',
      size: 'サイズ',
      color: '色',
      inStock: '在庫あり',
      onSale: 'セール中',
      rating: '評価',
      starsAndUp: '星以上',
      allProducts: 'すべて',
      featured: 'おすすめ',
      bestSelling: 'ベストセラー',
      applyFilters: '適用',
      resultsFound: '件の結果',
      noFiltersMatch: 'フィルターに一致する商品がありません',
      adjustFilters: 'フィルターを調整してください',
      home: 'ホーム',
      categories: 'カテゴリ'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Helper functions for multilingual support
  const getCategoryName = () => {
    if (!category) return '';
    switch (language) {
      case 'vi': return category.name;
      case 'ja': return category.nameJa || category.name;
      default: return category.nameEn || category.name;
    }
  };

  const getCategoryDescription = () => {
    if (!category) return '';
    switch (language) {
      case 'vi': return category.description;
      case 'ja': return category.descriptionJa || category.description;
      default: return category.descriptionEn || category.description;
    }
  };

  const getProductName = (product: Product) => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  // Advanced filtering logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        getProductName(product).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes?.some(size => selectedSizes.includes(size))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors?.some(color => selectedColors.includes(color))
      );
    }

    // In stock filter
    if (inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // On sale filter
    if (onSale) {
      filtered = filtered.filter(product => product.salePrice && product.salePrice < product.price);
    }

    // Rating filter (only if product has rating property)
    if (minRating > 0) {
      filtered = filtered.filter(product => ((product as any).rating || 0) >= minRating);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceLowToHigh':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'priceHighToLow':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'nameAZ':
          return getProductName(a).localeCompare(getProductName(b));
        case 'nameZA':
          return getProductName(b).localeCompare(getProductName(a));
        case 'oldest':
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        case 'newest':
        default:
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
    });

    return filtered;
  }, [products, searchQuery, priceRange, selectedSizes, selectedColors, inStock, onSale, minRating, sortBy, language, getProductName]);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        console.log('Loading category data for slug:', slug);
        
        // Load category info
        const categoryResponse = await api.getCategoryBySlug(slug);
        console.log('Category loaded:', categoryResponse.category);
        setCategory(categoryResponse.category);
        
        // Load products in category
        console.log('Loading products for category ID:', categoryResponse.category._id);
        const productsResponse = await api.getCategoryWithProducts(categoryResponse.category._id, {
          page: currentPage,
          limit: 12
        });
        
        console.log('Products loaded:', productsResponse.products.length, 'products');
        setProducts(productsResponse.products);
        setTotalPages(productsResponse.pagination.pages);

        // Extract available sizes and colors
        const allSizes = new Set<string>();
        const allColors = new Set<string>();
        const prices = productsResponse.products.map(p => p.salePrice || p.price);
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 2000000; // Default max price if no products
        
        productsResponse.products.forEach(product => {
          product.sizes?.forEach(size => allSizes.add(size));
          product.colors?.forEach(color => allColors.add(color));
        });

        setAvailableSizes(Array.from(allSizes));
        setAvailableColors(Array.from(allColors));
        setPriceRange([0, Math.ceil(maxPrice / 100000) * 100000]); // Round up to nearest 100k
      } catch (error) {
        console.error('Error loading category data:', error);
        toast({
          title: t.errorLoading,
          description: t.errorLoadingDesc,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [slug, currentPage, toast, t.errorLoading, t.errorLoadingDesc]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 2000000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStock(false);
    setOnSale(false);
    setMinRating(0);
  };

  const hasActiveFilters = searchQuery || selectedSizes.length > 0 || selectedColors.length > 0 || inStock || onSale || minRating > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header cartItemsCount={0} onSearch={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-lg">{t.loading}</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header cartItemsCount={0} onSearch={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToCategories}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer">
                {t.home}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/categories')} className="cursor-pointer">
                {t.categories}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{getCategoryName()}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Enhanced Category Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/categories')} size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.backToCategories}
                    </Button>
                    <Badge variant="secondary" className="px-3 py-1">
                      {filteredAndSortedProducts.length} {t.resultsFound}
                    </Badge>
                    {hasActiveFilters && (
                      <Badge variant="outline" className="px-3 py-1">
                        <Filter className="h-3 w-3 mr-1" />
                        Filtered
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {getCategoryName()}
                    </h1>
                    {getCategoryDescription() && (
                      <p className="text-muted-foreground text-lg max-w-2xl">
                        {getCategoryDescription()}
                      </p>
                    )}
                  </div>
                </div>
                
                {category.image && (
                  <div className="w-32 h-32 bg-muted rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={category.image}
                      alt={getCategoryName()}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>{t.filter}</span>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <X className="h-4 w-4 mr-1" />
                      {t.clearFilters}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.search}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-4 block">{t.priceRange}</label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={2000000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(priceRange[0], language)}</span>
                      <span>{formatCurrency(priceRange[1], language)}</span>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">{t.size}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSizes.includes(size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSizeToggle(size)}
                          className="h-8"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-3 block">{t.color}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {availableColors.map((color) => (
                        <Button
                          key={color}
                          variant={selectedColors.includes(color) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleColorToggle(color)}
                          className="h-8 text-xs"
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={inStock}
                      onCheckedChange={(checked) => setInStock(checked === true)}
                    />
                    <label htmlFor="inStock" className="text-sm cursor-pointer">
                      {t.inStock}
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onSale"
                      checked={onSale}
                      onCheckedChange={(checked) => setOnSale(checked === true)}
                    />
                    <label htmlFor="onSale" className="text-sm cursor-pointer">
                      {t.onSale}
                    </label>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block">{t.rating}</label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className="w-full justify-start"
                      >
                        <div className="flex items-center space-x-2">
                          {Array.from({ length: rating }, (_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                          <span className="text-xs">{rating} {t.starsAndUp}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t.newest}</SelectItem>
                    <SelectItem value="oldest">{t.oldest}</SelectItem>
                    <SelectItem value="priceLowToHigh">{t.priceLowToHigh}</SelectItem>
                    <SelectItem value="priceHighToLow">{t.priceHighToLow}</SelectItem>
                    <SelectItem value="nameAZ">{t.nameAZ}</SelectItem>
                    <SelectItem value="nameZA">{t.nameZA}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
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

            {/* Products Display */}
            {filteredAndSortedProducts.length > 0 ? (
              <EnhancedProductGrid
                products={filteredAndSortedProducts}
                loading={loading}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {hasActiveFilters ? t.noFiltersMatch : t.noProducts}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters ? t.adjustFilters : t.noProductsDesc}
                    </p>
                    {hasActiveFilters && (
                      <Button onClick={clearAllFilters} variant="outline">
                        {t.clearFilters}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoryPage; 