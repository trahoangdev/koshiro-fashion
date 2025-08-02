import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ArrowLeft,
  Lock,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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
    country: "",
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

  // Mock cart data
  const cartItems = [
    {
      id: "1",
      product: {
        name: "Traditional Kimono",
        price: 299.99,
        originalPrice: 399.99,
        image: "/src/assets/product-kimono-1.jpg"
      },
      quantity: 1,
      size: "M",
      color: "Red"
    },
    {
      id: "2", 
      product: {
        name: "Modern Yukata",
        price: 149.99,
        originalPrice: 199.99,
        image: "/src/assets/product-yukata-1.jpg"
      },
      quantity: 2,
      size: "L",
      color: "White"
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 15.00;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

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
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been confirmed and will be shipped soon.",
      });
    }, 3000);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-zen">
        <Header cartItemsCount={0} onSearch={() => {}} />
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

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header cartItemsCount={0} onSearch={() => {}} />

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
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.size} • {item.color} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t.subtotal}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.shipping}</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.tax}</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t.total}</span>
                      <span>${total.toFixed(2)}</span>
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