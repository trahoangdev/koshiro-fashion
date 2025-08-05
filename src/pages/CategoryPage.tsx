import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Product, Category } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Grid, List, Filter } from 'lucide-react';

interface CategoryPageProps {}

const CategoryPage: React.FC<CategoryPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      clearFilters: 'Xóa bộ lọc'
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
      clearFilters: 'Clear Filters'
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
      clearFilters: 'フィルターをクリア'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        
        // Load category info
        const categoryResponse = await api.getCategoryBySlug(slug);
        setCategory(categoryResponse.category);
        
        // Load products in category
        const productsResponse = await api.getCategoryWithProducts(categoryResponse.category._id, {
          page: currentPage,
          limit: 12
        });
        
        setProducts(productsResponse.products);
        setTotalPages(productsResponse.pagination.pages);
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
    // TODO: Implement sorting logic
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{t.loading}</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <Button onClick={() => navigate('/')}>
              {t.backToCategories}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              {t.backToCategories}
            </Button>
            <Badge variant="secondary">{products.length} {t.products}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
            
            {category.image && (
              <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
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
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t.filter}
            </Button>
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

        {/* Products Grid/List */}
        {products.length > 0 ? (
          <div className="space-y-6">
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {t.previous}
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {t.next}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">{t.noProducts}</h3>
                <p className="text-muted-foreground">{t.noProductsDesc}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoryPage; 