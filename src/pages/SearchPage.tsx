import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdvancedSearch from "@/components/AdvancedSearch";
import EnhancedProductGrid from "@/components/EnhancedProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search as SearchIcon, TrendingUp } from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
  featured: boolean;
  sortBy: string;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [refreshWishlistTrigger, setRefreshWishlistTrigger] = useState(0);

  const initialQuery = searchParams.get('q') || '';

  // Popular categories/searches for display when no search is performed
  const [popularCategories] = useState([
    'T-Shirts', 'Jeans', 'Jackets', 'Sneakers', 'Dresses', 'Hoodies'
  ]);

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  // Load trending products on mount
  useEffect(() => {
    const loadTrendingProducts = async () => {
      try {
        const response = await api.getProducts({ 
          featured: true, 
          limit: 8 
        });
        setTrendingProducts(response.products || []);
      } catch (error) {
        console.error('Error loading trending products:', error);
      }
    };

    loadTrendingProducts();
  }, []);

  // Perform search when URL params change
  useEffect(() => {
    if (initialQuery) {
      handleSearch({
        query: initialQuery,
        category: '',
        priceRange: [0, 1000],
        inStock: false,
        onSale: false,
        featured: false,
        sortBy: 'relevance'
      });
    }
  }, [initialQuery]);

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      setCurrentFilters(filters);
      setSearchPerformed(true);

      // Update URL params
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 1000) params.set('maxPrice', filters.priceRange[1].toString());
      if (filters.inStock) params.set('inStock', 'true');
      if (filters.onSale) params.set('onSale', 'true');
      if (filters.featured) params.set('featured', 'true');
      if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);

      setSearchParams(params);

      // Build API query parameters
      const queryParams: any = {};
      if (filters.query) queryParams.search = filters.query;
      if (filters.category) queryParams.category = filters.category;
      if (filters.priceRange[0] > 0) queryParams.minPrice = filters.priceRange[0];
      if (filters.priceRange[1] < 1000) queryParams.maxPrice = filters.priceRange[1];
      if (filters.inStock) queryParams.inStock = true;
      if (filters.onSale) queryParams.onSale = true;
      if (filters.featured) queryParams.featured = true;

      // Map sort options to API params
      switch (filters.sortBy) {
        case 'price-low':
          queryParams.sortBy = 'price';
          queryParams.sortOrder = 'asc';
          break;
        case 'price-high':
          queryParams.sortBy = 'price';
          queryParams.sortOrder = 'desc';
          break;
        case 'newest':
          queryParams.sortBy = 'createdAt';
          queryParams.sortOrder = 'desc';
          break;
        case 'popular':
          queryParams.sortBy = 'featured';
          break;
        default:
          // Relevance - let API handle default sorting
          break;
      }

      const response = await api.getProducts(queryParams);
      setProducts(response.products || []);

      // Show results toast
      toast({
        title: `Found ${response.products?.length || 0} products`,
        description: filters.query ? `Results for "${filters.query}"` : 'Filtered results',
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await api.addToCart(product._id, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      await api.addToWishlist(product._id);
      setRefreshWishlistTrigger(prev => prev + 1);
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCompare = (product: Product) => {
    // Implement compare functionality
    toast({
      title: "Added to Compare",
      description: `${product.name} has been added to compare list.`,
    });
  };

  const handleCategoryClick = (category: string) => {
    handleSearch({
      query: category,
      category: '',
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
      featured: false,
      sortBy: 'relevance'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemsCount={0} 
        onSearch={(query) => handleSearch({
          query,
          category: '',
          priceRange: [0, 1000],
          inStock: false,
          onSale: false,
          featured: false,
          sortBy: 'relevance'
        })} 
        refreshWishlistTrigger={refreshWishlistTrigger}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Advanced Search Component */}
        <div className="mb-8">
          <AdvancedSearch
            onSearch={handleSearch}
            initialQuery={initialQuery}
            showFilters={searchPerformed}
          />
        </div>

        {/* Search Results or Welcome Content */}
        {searchPerformed ? (
          <div className="space-y-6">
            {/* Results Header */}
            {currentFilters && (
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {currentFilters.query ? (
                    <>Search results for "<span className="text-primary">{currentFilters.query}</span>"</>
                  ) : (
                    'Filtered Products'
                  )}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {products.length} products found
                </div>
              </div>
            )}

            {/* Products Grid */}
            <EnhancedProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onAddToCompare={handleAddToCompare}
              loading={loading}
            />
          </div>
        ) : (
          /* Welcome Content - No Search Performed Yet */
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h1 className="text-4xl font-bold mb-4">
                Find Your Perfect Style
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover thousands of products from top brands. Search by name, category, or browse our curated collections.
              </p>
            </div>

            {/* Popular Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Popular Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {popularCategories.map((category, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <span className="font-medium">{category}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Products */}
            {trendingProducts.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Trending Now</h2>
                  <p className="text-muted-foreground">
                    Check out what's popular among our customers
                  </p>
                </div>

                <EnhancedProductGrid
                  products={trendingProducts}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onAddToCompare={handleAddToCompare}
                  loading={false}
                />
              </div>
            )}

            {/* Search Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Search Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Quick Search</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Try searching for brands like "Nike", "Adidas"</li>
                      <li>• Search by product type: "running shoes", "denim jacket"</li>
                      <li>• Use colors: "red dress", "black sneakers"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Advanced Filters</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Use price filters to find products in your budget</li>
                      <li>• Filter by availability to see in-stock items only</li>
                      <li>• Sort by price, popularity, or newest arrivals</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;