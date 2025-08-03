import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/currency';
import { cartService, CartItem } from '@/lib/cartService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Truck } from 'lucide-react';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  const translations = {
    vi: {
      title: 'Giỏ hàng',
      emptyCart: 'Giỏ hàng trống',
      emptyCartDesc: 'Bạn chưa có sản phẩm nào trong giỏ hàng',
      continueShopping: 'Tiếp tục mua sắm',
      orderSummary: 'Tóm tắt đơn hàng',
      subtotal: 'Tạm tính',
      shipping: 'Phí vận chuyển',
      tax: 'Thuế',
      total: 'Tổng cộng',
      checkout: 'Thanh toán',
      remove: 'Xóa',
      update: 'Cập nhật',
      quantity: 'Số lượng',
      size: 'Kích thước',
      color: 'Màu sắc',
      freeShipping: 'Miễn phí vận chuyển',
      estimatedDelivery: 'Dự kiến giao hàng',
      deliveryDate: '3-5 ngày làm việc',
      secureCheckout: 'Thanh toán an toàn',
      secureCheckoutDesc: 'Thông tin của bạn được bảo vệ',
      outOfStock: 'Hết hàng',
      inStock: 'Còn hàng',
      removeItem: 'Xóa sản phẩm',
      removeItemDesc: 'Sản phẩm đã được xóa khỏi giỏ hàng',
      updateQuantity: 'Cập nhật số lượng',
      updateQuantityDesc: 'Số lượng đã được cập nhật',
      loading: 'Đang tải...',
      errorLoading: 'Lỗi tải dữ liệu',
      errorLoadingDesc: 'Không thể tải thông tin giỏ hàng'
    },
    en: {
      title: 'Shopping Cart',
      emptyCart: 'Your cart is empty',
      emptyCartDesc: 'You don\'t have any items in your cart',
      continueShopping: 'Continue Shopping',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      remove: 'Remove',
      update: 'Update',
      quantity: 'Quantity',
      size: 'Size',
      color: 'Color',
      freeShipping: 'Free Shipping',
      estimatedDelivery: 'Estimated Delivery',
      deliveryDate: '3-5 business days',
      secureCheckout: 'Secure Checkout',
      secureCheckoutDesc: 'Your information is protected',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      removeItem: 'Item Removed',
      removeItemDesc: 'Item has been removed from cart',
      updateQuantity: 'Quantity Updated',
      updateQuantityDesc: 'Quantity has been updated',
      loading: 'Loading...',
      errorLoading: 'Error Loading Data',
      errorLoadingDesc: 'Unable to load cart information'
    },
    ja: {
      title: 'ショッピングカート',
      emptyCart: 'カートは空です',
      emptyCartDesc: 'カートに商品がありません',
      continueShopping: '買い物を続ける',
      orderSummary: '注文サマリー',
      subtotal: '小計',
      shipping: '配送料',
      tax: '税金',
      total: '合計',
      checkout: 'チェックアウト',
      remove: '削除',
      update: '更新',
      quantity: '数量',
      size: 'サイズ',
      color: '色',
      freeShipping: '送料無料',
      estimatedDelivery: '配送予定日',
      deliveryDate: '3-5営業日',
      secureCheckout: '安全なチェックアウト',
      secureCheckoutDesc: 'あなたの情報は保護されています',
      outOfStock: '在庫切れ',
      inStock: '在庫あり',
      removeItem: '商品削除',
      removeItemDesc: '商品がカートから削除されました',
      updateQuantity: '数量更新',
      updateQuantityDesc: '数量が更新されました',
      loading: '読み込み中...',
      errorLoading: 'データ読み込みエラー',
      errorLoadingDesc: 'カート情報を読み込めません'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const cart = cartService.getCart();
        setCartItems(cart);
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: t.errorLoading,
          description: t.errorLoadingDesc,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [toast, t.errorLoading, t.errorLoadingDesc]);

  const updateQuantity = async (productId: string, newQuantity: number, selectedSize?: string, selectedColor?: string) => {
    if (newQuantity < 1) return;
    
    setUpdating(productId);
    try {
      const updatedCart = cartService.updateQuantity(productId, newQuantity, selectedSize, selectedColor);
      setCartItems(updatedCart);
      
      toast({
        title: t.updateQuantity,
        description: t.updateQuantityDesc,
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string, selectedSize?: string, selectedColor?: string) => {
    setUpdating(productId);
    try {
      const updatedCart = cartService.removeFromCart(productId, selectedSize, selectedColor);
      setCartItems(updatedCart);
      
      toast({
        title: t.removeItem,
        description: t.removeItemDesc,
      });
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 2000000 ? 0 : 50000; // Free shipping over 2M VND
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t.emptyCart}</h1>
            <p className="text-muted-foreground mb-8">{t.emptyCartDesc}</p>
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
      <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.continueShopping}
          </Button>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <Badge variant="secondary">{cartItems.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.product._id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-muted-foreground text-sm">{item.product.categoryId.name}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product._id, item.selectedSize, item.selectedColor)}
                        disabled={updating === item.product._id}
                      >
                        {updating === item.product._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      {item.selectedSize && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{t.size}:</span>
                          <Badge variant="outline">{item.selectedSize}</Badge>
                        </div>
                      )}
                      
                      {item.selectedColor && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{t.color}:</span>
                          <Badge variant="outline">{item.selectedColor}</Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                          disabled={item.quantity <= 1 || updating === item.product._id}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1, item.selectedSize, item.selectedColor)}
                          className="w-16 text-center"
                          disabled={updating === item.product._id}
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          disabled={item.quantity >= item.product.stock || updating === item.product._id}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency(item.product.price * item.quantity, language)}
                        </div>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatCurrency(item.product.originalPrice * item.quantity, language)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.orderSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t.subtotal}</span>
                    <span>{formatCurrency(calculateSubtotal(), language)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{t.shipping}</span>
                    <span className={calculateShipping() === 0 ? 'text-green-600' : ''}>
                      {calculateShipping() === 0 ? t.freeShipping : formatCurrency(calculateShipping(), language)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{t.tax}</span>
                    <span>{formatCurrency(calculateTax(), language)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}</span>
                    <span>{formatCurrency(calculateTotal(), language)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t.checkout}
                  </Button>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{t.estimatedDelivery}: {t.deliveryDate}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    {t.secureCheckout}
                    <br />
                    {t.secureCheckoutDesc}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage; 