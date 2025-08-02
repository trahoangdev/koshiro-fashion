import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Product } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { cartService } from '@/lib/cartService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  const translations = {
    vi: {
      addToCart: 'Thêm vào giỏ hàng',
      buyNow: 'Mua ngay',
      addToWishlist: 'Thêm vào yêu thích',
      description: 'Mô tả',
      specifications: 'Thông số kỹ thuật',
      reviews: 'Đánh giá',
      size: 'Kích thước',
      color: 'Màu sắc',
      quantity: 'Số lượng',
      outOfStock: 'Hết hàng',
      inStock: 'Còn hàng',
      originalPrice: 'Giá gốc',
      shipping: 'Miễn phí vận chuyển',
      warranty: 'Bảo hành 30 ngày',
      return: 'Đổi trả 7 ngày',
      relatedProducts: 'Sản phẩm liên quan',
      loading: 'Đang tải...',
      errorLoading: 'Lỗi tải dữ liệu',
      errorLoadingDesc: 'Không thể tải thông tin sản phẩm',
      selectSize: 'Chọn kích thước',
      selectColor: 'Chọn màu sắc',
      addToCartSuccess: 'Đã thêm vào giỏ hàng',
      addToCartSuccessDesc: 'Sản phẩm đã được thêm vào giỏ hàng',
      addToWishlistSuccess: 'Đã thêm vào yêu thích',
      addToWishlistSuccessDesc: 'Sản phẩm đã được thêm vào danh sách yêu thích',
      goToCart: 'Xem giỏ hàng',
      continueShopping: 'Tiếp tục mua sắm'
    },
    en: {
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      addToWishlist: 'Add to Wishlist',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      size: 'Size',
      color: 'Color',
      quantity: 'Quantity',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      originalPrice: 'Original Price',
      shipping: 'Free Shipping',
      warranty: '30 Day Warranty',
      return: '7 Day Return',
      relatedProducts: 'Related Products',
      loading: 'Loading...',
      errorLoading: 'Error Loading Data',
      errorLoadingDesc: 'Unable to load product information',
      selectSize: 'Select Size',
      selectColor: 'Select Color',
      addToCartSuccess: 'Added to Cart',
      addToCartSuccessDesc: 'Product has been added to cart',
      addToWishlistSuccess: 'Added to Wishlist',
      addToWishlistSuccessDesc: 'Product has been added to wishlist',
      goToCart: 'View Cart',
      continueShopping: 'Continue Shopping'
    },
    ja: {
      addToCart: 'カートに追加',
      buyNow: '今すぐ購入',
      addToWishlist: 'お気に入りに追加',
      description: '説明',
      specifications: '仕様',
      reviews: 'レビュー',
      size: 'サイズ',
      color: '色',
      quantity: '数量',
      outOfStock: '在庫切れ',
      inStock: '在庫あり',
      originalPrice: '定価',
      shipping: '送料無料',
      warranty: '30日保証',
      return: '7日返品',
      relatedProducts: '関連商品',
      loading: '読み込み中...',
      errorLoading: 'データ読み込みエラー',
      errorLoadingDesc: '商品情報を読み込めません',
      selectSize: 'サイズを選択',
      selectColor: '色を選択',
      addToCartSuccess: 'カートに追加されました',
      addToCartSuccessDesc: '商品がカートに追加されました',
      addToWishlistSuccess: 'お気に入りに追加されました',
      addToWishlistSuccessDesc: '商品がお気に入りに追加されました',
      goToCart: 'カートを見る',
      continueShopping: '買い物を続ける'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.getProduct(id);
        setProduct(response.product);
        
        // Set default selections
        if (response.product.sizes.length > 0) {
          setSelectedSize(response.product.sizes[0]);
        }
        if (response.product.colors.length > 0) {
          setSelectedColor(response.product.colors[0]);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: t.errorLoading,
          description: t.errorLoadingDesc,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, toast, t.errorLoading, t.errorLoadingDesc]);

  const handleAddToCart = () => {
    if (!product) return;
    
    cartService.addToCart(product, quantity, selectedSize, selectedColor);

    toast({
      title: t.addToCartSuccess,
      description: t.addToCartSuccessDesc,
    });
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    
    // TODO: Implement add to wishlist functionality
    toast({
      title: t.addToWishlistSuccess,
      description: t.addToWishlistSuccessDesc,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Add to cart first, then navigate to checkout
    cartService.addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={0} onSearch={handleSearch} />
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={0} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button onClick={() => navigate('/')}>
              {t.continueShopping}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemsCount={0} onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-4">{product.categoryId.name}</p>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.5)</span>
                </div>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? t.inStock : t.outOfStock}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {product.sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.size}</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectSize} />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {product.colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.color}</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectColor} />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">{t.quantity}</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.isActive}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t.addToCart}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleBuyNow}
                disabled={!product.isActive}
              >
                {t.buyNow}
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg"
                onClick={handleAddToWishlist}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.shipping}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.warranty}</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.return}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">{t.description}</TabsTrigger>
              <TabsTrigger value="specifications">{t.specifications}</TabsTrigger>
              <TabsTrigger value="reviews">{t.reviews}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {product.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{product.categoryId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Stock:</span>
                      <span>{product.stock} units</span>
                    </div>
                    {product.tags.length > 0 && (
                      <div>
                        <span className="font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Reviews coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail; 