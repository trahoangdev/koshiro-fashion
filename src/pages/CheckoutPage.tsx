import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ArrowLeft,
  Lock,
  Shield,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Vietnam",
    // Payment Information
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    // Additional
    notes: ""
  });
  const { language } = useLanguage();
  const { toast } = useToast();

  // Load cart items from API if authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getCart();
        if (response && response.items && Array.isArray(response.items)) {
          const cartItemsData = response.items
            .filter((item: { 
              productId: string; 
              quantity: number; 
              size?: string; 
              color?: string; 
              product: Product; 
            }) => {
              // More lenient filtering - just check essential fields
              if (!item || !item.product) {
                console.warn('Cart item missing product:', item);
                return false;
              }
              if (!item.product._id) {
                console.warn('Cart item product missing ID:', item.product);
                return false;
              }
              return true;
            })
            .map((item: { 
              productId: string; 
              quantity: number; 
              size?: string; 
              color?: string; 
              product: Product; 
            }) => ({
              productId: item.productId,
              product: {
                ...item.product,
                images: item.product.images || [] // Ensure images is always an array
              },
              quantity: item.quantity,
              selectedSize: item.size,
              selectedColor: item.color
            }));
          console.log('Loaded cart items:', cartItemsData);
          setCartItems(cartItemsData);
        } else {
          console.warn('Invalid cart response:', response);
          setCartItems([]);
        }
        
        // Pre-fill form with user data if authenticated
        if (isAuthenticated && user) {
          setFormData(prev => ({
            ...prev,
            firstName: user.name.split(' ')[0] || '',
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          }));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải giỏ hàng" : 
                 language === 'ja' ? "カート読み込みエラー" : 
                 "Error Loading Cart",
          description: language === 'vi' ? "Không thể tải thông tin giỏ hàng" :
                       language === 'ja' ? "カート情報を読み込めませんでした" :
                       "Unable to load cart information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, user, toast, language]);

  // Redirect if cart is empty or user not authenticated
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      if (cartItems.length === 0) {
        navigate('/cart');
      }
    }
  }, [loading, cartItems.length, navigate, isAuthenticated]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 2000000 ? 0 : 50000; // Free shipping over 2M VND
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  const translations = {
    en: {
      title: "Checkout",
      subtitle: "Complete Your Purchase",
      shippingInfo: "Shipping Information",
      payment: "Payment Information",
      orderSummary: "Order Summary",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State/Province",
      zipCode: "ZIP/Postal Code",
      country: "Country",
      cardNumber: "Card Number",
      cardName: "Name on Card",
      expiryMonth: "Month",
      expiryYear: "Year",
      cvv: "CVV",
      notes: "Order Notes (Optional)",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Tax",
      total: "Total",
      placeOrder: "Place Order",
      processing: "Processing...",
      backToCart: "Back to Cart",
      secure: "Secure Checkout",
      secureDescription: "Your payment information is encrypted and secure",
      orderComplete: "Order Complete!",
      orderCompleteDescription: "Thank you for your purchase. You will receive an email confirmation shortly.",
      orderNumber: "Order #12345",
      continueShopping: "Continue Shopping"
    },
    vi: {
      title: "Thanh Toán",
      subtitle: "Hoàn Tất Đơn Hàng",
      shippingInfo: "Thông Tin Giao Hàng",
      payment: "Thông Tin Thanh Toán",
      orderSummary: "Tóm Tắt Đơn Hàng",
      firstName: "Tên",
      lastName: "Họ",
      email: "Địa Chỉ Email",
      phone: "Số Điện Thoại",
      address: "Địa Chỉ",
      city: "Thành Phố",
      state: "Tỉnh/Thành",
      zipCode: "Mã Bưu Điện",
      country: "Quốc Gia",
      cardNumber: "Số Thẻ",
      cardName: "Tên Trên Thẻ",
      expiryMonth: "Tháng",
      expiryYear: "Năm",
      cvv: "CVV",
      notes: "Ghi Chú Đơn Hàng (Tùy Chọn)",
      subtotal: "Tạm Tính",
      shipping: "Phí Vận Chuyển",
      tax: "Thuế",
      total: "Tổng Cộng",
      placeOrder: "Đặt Hàng",
      processing: "Đang Xử Lý...",
      backToCart: "Quay Lại Giỏ Hàng",
      secure: "Thanh Toán An Toàn",
      secureDescription: "Thông tin thanh toán của bạn được mã hóa và bảo mật",
      orderComplete: "Đặt Hàng Thành Công!",
      orderCompleteDescription: "Cảm ơn bạn đã mua hàng. Bạn sẽ nhận được email xác nhận trong thời gian ngắn.",
      orderNumber: "Đơn Hàng #12345",
      continueShopping: "Tiếp Tục Mua Sắm"
    },
    ja: {
      title: "チェックアウト",
      subtitle: "購入を完了",
      shippingInfo: "配送情報",
      payment: "支払い情報",
      orderSummary: "注文サマリー",
      firstName: "名",
      lastName: "姓",
      email: "メールアドレス",
      phone: "電話番号",
      address: "住所",
      city: "市区町村",
      state: "都道府県",
      zipCode: "郵便番号",
      country: "国",
      cardNumber: "カード番号",
      cardName: "カード名義人",
      expiryMonth: "月",
      expiryYear: "年",
      cvv: "CVV",
      notes: "注文メモ（任意）",
      subtotal: "小計",
      shipping: "配送料",
      tax: "税金",
      total: "合計",
      placeOrder: "注文する",
      processing: "処理中...",
      backToCart: "カートに戻る",
      secure: "セキュアチェックアウト",
      secureDescription: "お支払い情報は暗号化され、安全です",
      orderComplete: "注文完了！",
      orderCompleteDescription: "ご購入ありがとうございます。確認メールをすぐにお送りします。",
      orderNumber: "注文番号 #12345",
      continueShopping: "ショッピングを続ける"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục thanh toán",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.');
      }

      // Validate each cart item
      for (const item of cartItems) {
        if (!item.product || !item.product._id) {
          throw new Error('Some products in your cart are no longer available. Please refresh and try again.');
        }
        if (item.quantity <= 0) {
          throw new Error('Invalid quantity detected. Please check your cart.');
        }
      }

      // Validate form data
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city || !formData.state) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId || item.product._id, // Fallback to product._id
          quantity: item.quantity,
          price: item.product.price, // Include price for validation
          size: item.selectedSize,
          color: item.selectedColor
        })),
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.state
        },
        billingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.state
        },
        paymentMethod: "Credit Card",
        notes: formData.notes
      };

      // Debug: Log order data
      console.log('Creating order with data:', orderData);
      console.log('Cart items before order:', cartItems);
      
      // Create order via API
      const response = await api.createOrder(orderData);
      console.log('Order created successfully:', response);
      
      setIsProcessing(false);
      setIsCompleted(true);
      
      // Clear cart after successful order (with error handling)
      try {
        await api.clearCart();
        console.log('Cart cleared successfully');
      } catch (clearError) {
        console.warn('Failed to clear cart automatically:', clearError);
        // Don't fail the checkout if cart clearing fails
        // User can manually clear cart later
      }
      
      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đã được xác nhận và sẽ được giao sớm.",
      });
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      setIsProcessing(false);
      
      // Better error message handling
      let errorMessage = "Có lỗi xảy ra khi đặt hàng";
      if (error instanceof Error) {
        if (error.message.includes('Product not found in cart')) {
          errorMessage = "Giỏ hàng đã thay đổi. Vui lòng kiểm tra lại giỏ hàng và thử lại.";
        } else if (error.message.includes('Insufficient stock')) {
          errorMessage = "Sản phẩm không đủ số lượng trong kho. Vui lòng giảm số lượng.";
        } else if (error.message.includes('Product') && error.message.includes('not found')) {
          errorMessage = "Một số sản phẩm không còn tồn tại. Vui lòng kiểm tra lại giỏ hàng.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Lỗi đặt hàng",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-zen">
        <Header cartItemsCount={0} onSearch={handleSearch} />
        <main className="py-16">
          <div className="container max-w-2xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">{t.orderComplete}</h1>
            <p className="text-muted-foreground mb-4">{t.orderCompleteDescription}</p>
            <Badge variant="secondary" className="mb-8">{t.orderNumber}</Badge>
            <div className="space-x-4">
              <Link to="/">
                <Button>{t.continueShopping}</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-zen">
        <Header cartItemsCount={0} onSearch={handleSearch} />
        <main className="py-16">
          <div className="container max-w-2xl mx-auto text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang tải...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header cartItemsCount={cartItemsCount} onSearch={handleSearch} />

      <main className="py-16">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
            <Link to="/cart">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToCart}
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      {t.shippingInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.firstName}</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.lastName}</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.email}</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.phone}</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t.address}</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.city}</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.state}</label>
                        <Input
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.zipCode}</label>
                        <Input
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t.country}</label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="japan">Japan</SelectItem>
                          <SelectItem value="vietnam">Vietnam</SelectItem>
                          <SelectItem value="usa">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      {t.payment}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t.cardNumber}</label>
                      <Input
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t.cardName}</label>
                      <Input
                        value={formData.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.expiryMonth}</label>
                        <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                              <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.expiryYear}</label>
                        <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.cvv}</label>
                        <Input
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardContent className="pt-6">
                    <label className="text-sm font-medium mb-2 block">{t.notes}</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      placeholder="Any special instructions or notes..."
                    />
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.orderSummary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex items-center space-x-3">
                        <img
                          src={item.product.images[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedSize} • {item.selectedColor} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.product.price * item.quantity, language)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t.subtotal}</span>
                      <span>{formatCurrency(subtotal, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.shipping}</span>
                      <span>{formatCurrency(shipping, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.tax}</span>
                      <span>{formatCurrency(tax, language)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t.total}</span>
                      <span>{formatCurrency(total, language)}</span>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{t.secure}</p>
                      <p className="text-xs text-green-600">{t.secureDescription}</p>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        {t.placeOrder}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage; 