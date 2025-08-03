import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, PaymentMethod } from "@/lib/api";
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Check,
  Lock,
  Shield
} from "lucide-react";

const ProfilePayment = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'credit_card' as 'credit_card' | 'debit_card' | 'paypal',
    name: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    paypalEmail: ""
  });
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const paymentMethodsData = await api.getPaymentMethods();
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error('Failed to load payment methods:', error);
        toast({
          title: "Error",
          description: "Failed to load payment methods. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [toast]);

  const translations = {
    en: {
      title: "Payment Methods",
      subtitle: "Manage your payment methods for faster checkout",
      addPayment: "Add Payment Method",
      editPayment: "Edit Payment Method",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      setDefault: "Set as Default",
      default: "Default",
      cardNumber: "Card Number",
      cardName: "Name on Card",
      expiryMonth: "Month",
      expiryYear: "Year",
      cvv: "CVV",
      paypalEmail: "PayPal Email",
      type: "Payment Type",
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      paypal: "PayPal",
      noPaymentMethods: "No payment methods saved yet",
      noPaymentMethodsDesc: "Add your first payment method to get started",
      paymentAdded: "Payment method added successfully",
      paymentUpdated: "Payment method updated successfully",
      paymentDeleted: "Payment method deleted successfully",
      defaultSet: "Default payment method updated",
      secure: "Secure & Encrypted",
      secureDesc: "Your payment information is protected with bank-level security",
      nameRequired: "Please enter a name for the payment method.",
      cardDetailsRequired: "Please enter card number, expiry month, year, and CVV.",
      paypalEmailRequired: "Please enter a PayPal email address."
    },
    vi: {
      title: "Phương Thức Thanh Toán",
      subtitle: "Quản lý phương thức thanh toán để thanh toán nhanh hơn",
      addPayment: "Thêm Phương Thức Thanh Toán",
      editPayment: "Chỉnh Sửa Phương Thức Thanh Toán",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      setDefault: "Đặt Làm Mặc Định",
      default: "Mặc Định",
      cardNumber: "Số Thẻ",
      cardName: "Tên Trên Thẻ",
      expiryMonth: "Tháng",
      expiryYear: "Năm",
      cvv: "CVV",
      paypalEmail: "Email PayPal",
      type: "Loại Thanh Toán",
      creditCard: "Thẻ Tín Dụng",
      debitCard: "Thẻ Ghi Nợ",
      paypal: "PayPal",
      noPaymentMethods: "Chưa có phương thức thanh toán nào được lưu",
      noPaymentMethodsDesc: "Thêm phương thức thanh toán đầu tiên để bắt đầu",
      paymentAdded: "Đã thêm phương thức thanh toán thành công",
      paymentUpdated: "Đã cập nhật phương thức thanh toán thành công",
      paymentDeleted: "Đã xóa phương thức thanh toán thành công",
      defaultSet: "Đã cập nhật phương thức thanh toán mặc định",
      secure: "Bảo Mật & Mã Hóa",
      secureDesc: "Thông tin thanh toán của bạn được bảo vệ với bảo mật cấp độ ngân hàng",
      nameRequired: "Vui lòng nhập tên cho phương thức thanh toán.",
      cardDetailsRequired: "Vui lòng nhập số thẻ, tháng, năm và CVV.",
      paypalEmailRequired: "Vui lòng nhập địa chỉ email PayPal."
    },
    ja: {
      title: "支払い方法",
      subtitle: "より速いチェックアウトのための支払い方法を管理",
      addPayment: "支払い方法を追加",
      editPayment: "支払い方法を編集",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      setDefault: "デフォルトに設定",
      default: "デフォルト",
      cardNumber: "カード番号",
      cardName: "カード名義人",
      expiryMonth: "月",
      expiryYear: "年",
      cvv: "CVV",
      paypalEmail: "PayPalメール",
      type: "支払いタイプ",
      creditCard: "クレジットカード",
      debitCard: "デビットカード",
      paypal: "PayPal",
      noPaymentMethods: "保存された支払い方法はありません",
      noPaymentMethodsDesc: "最初の支払い方法を追加して開始してください",
      paymentAdded: "支払い方法が正常に追加されました",
      paymentUpdated: "支払い方法が正常に更新されました",
      paymentDeleted: "支払い方法が正常に削除されました",
      defaultSet: "デフォルト支払い方法が更新されました",
      secure: "セキュア＆暗号化",
      secureDesc: "お支払い情報は銀行レベルのセキュリティで保護されています",
      nameRequired: "支払い方法に名前を入力してください。",
      cardDetailsRequired: "カード番号、有効期限月、年、CVVを入力してください。",
      paypalEmailRequired: "PayPalメールアドレスを入力してください。"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'paypal':
        return <span className="text-blue-600 font-bold">PayPal</span>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      type: 'credit_card',
      name: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      paypalEmail: ""
    });
  };

  const handleEdit = (payment: PaymentMethod) => {
    setEditingId(payment._id);
    setIsAdding(false);
    setFormData({
      type: payment.type,
      name: payment.name,
      cardNumber: payment.last4 ? `**** **** **** ${payment.last4}` : "",
      expiryMonth: payment.expiryMonth || "",
      expiryYear: payment.expiryYear || "",
      cvv: "",
      paypalEmail: payment.type === 'paypal' ? payment.name : ""
    });
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: t.nameRequired,
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'credit_card' || formData.type === 'debit_card') {
      if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
        toast({
          title: "Error",
          description: t.cardDetailsRequired,
          variant: "destructive"
        });
        return;
      }
    }

    if (formData.type === 'paypal' && !formData.paypalEmail) {
      toast({
        title: "Error",
        description: t.paypalEmailRequired,
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing payment method
        const updatedPayment = await api.updatePaymentMethod(editingId, {
          type: formData.type,
          name: formData.name,
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          paypalEmail: formData.paypalEmail
        });

        setPaymentMethods(prev => 
          prev.map(pm => pm._id === editingId ? updatedPayment : pm)
        );

        toast({
          title: "Success",
          description: t.paymentUpdated
        });
      } else {
        // Add new payment method
        const newPayment = await api.addPaymentMethod({
          type: formData.type,
          name: formData.name,
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          paypalEmail: formData.paypalEmail
        });

        setPaymentMethods(prev => [...prev, newPayment]);

        toast({
          title: "Success",
          description: t.paymentAdded
        });
      }

      handleCancel();
    } catch (error) {
      console.error('Failed to save payment method:', error);
      toast({
        title: "Error",
        description: "Failed to save payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      type: 'credit_card',
      name: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      paypalEmail: ""
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(pm => pm._id !== id));
      toast({
        title: "Success",
        description: t.paymentDeleted
      });
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultPaymentMethod(id);
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          isDefault: pm._id === id
        }))
      );
      toast({
        title: "Success",
        description: t.defaultSet
      });
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to set default payment method. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addPayment}
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{t.secure}</p>
              <p className="text-xs text-green-600">{t.secureDesc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t.editPayment : t.addPayment}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">{t.type}</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'credit_card' | 'debit_card' | 'paypal'})}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="credit_card">{t.creditCard}</option>
                <option value="debit_card">{t.debitCard}</option>
                <option value="paypal">{t.paypal}</option>
              </select>
            </div>

            {formData.type === 'paypal' ? (
              <div>
                <Label htmlFor="paypalEmail">{t.paypalEmail}</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) => setFormData({...formData, paypalEmail: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="cardNumber">{t.cardNumber}</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardName">{t.cardName}</Label>
                  <Input
                    id="cardName"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="expiryMonth">{t.expiryMonth}</Label>
                    <Input
                      id="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={(e) => setFormData({...formData, expiryMonth: e.target.value})}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">{t.expiryYear}</Label>
                    <Input
                      id="expiryYear"
                      value={formData.expiryYear}
                      onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                      placeholder="YYYY"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">{t.cvv}</Label>
                    <Input
                      id="cvv"
                      value={formData.cvv}
                      onChange={(e) => setFormData({...formData, cvv: e.target.value})}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                {t.cancel}
              </Button>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                {t.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t.noPaymentMethods}</h3>
          <p className="text-muted-foreground mb-8">{t.noPaymentMethodsDesc}</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addPayment}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((payment) => (
            <Card key={payment._id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getPaymentIcon(payment.type)}
                    {payment.isDefault && (
                      <Badge variant="default" className="text-xs">
                        {t.default}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(payment._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{payment.name}</p>
                  {payment.type !== 'paypal' && (
                    <>
                      <p>**** **** **** {payment.last4}</p>
                      <p>Expires: {payment.expiryMonth}/{payment.expiryYear}</p>
                    </>
                  )}
                </div>
                
                {!payment.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleSetDefault(payment._id)}
                  >
                    {t.setDefault}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePayment; 