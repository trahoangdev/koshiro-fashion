import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/types/product";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface CartProps {
  cartItems: CartItem[];
  currentLanguage: string;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const Cart = ({
  cartItems,
  currentLanguage,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartProps) => {
  const translations = {
    en: {
      cart: "Shopping Cart",
      empty: "Your cart is empty",
      emptyDesc: "Add some beautiful items to get started",
      item: "item",
      items: "items",
      subtotal: "Subtotal",
      shipping: "Shipping",
      free: "Free",
      total: "Total",
      checkout: "Proceed to Checkout",
      continueShopping: "Continue Shopping"
    },
    vi: {
      cart: "Giỏ Hàng",
      empty: "Giỏ hàng trống",
      emptyDesc: "Thêm một số sản phẩm đẹp để bắt đầu",
      item: "sản phẩm",
      items: "sản phẩm",
      subtotal: "Tạm tính",
      shipping: "Vận chuyển",
      free: "Miễn phí",
      total: "Tổng cộng",
      checkout: "Tiến Hành Thanh Toán",
      continueShopping: "Tiếp Tục Mua Sắm"
    },
    ja: {
      cart: "ショッピングカート",
      empty: "カートは空です",
      emptyDesc: "美しいアイテムを追加して始めましょう",
      item: "アイテム",
      items: "アイテム",
      subtotal: "小計",
      shipping: "配送料",
      free: "無料",
      total: "合計",
      checkout: "チェックアウトに進む",
      continueShopping: "ショッピングを続ける"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

  const getProductName = (item: CartItem) => {
    switch (currentLanguage) {
      case 'vi': return item.product.name;
      case 'ja': return item.product.nameJa || item.product.name;
      default: return item.product.nameEn || item.product.name;
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t.empty}</h3>
        <p className="text-muted-foreground">{t.emptyDesc}</p>
        <Button variant="zen" className="mt-6">
          {t.continueShopping}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t.cart} ({cartItems.length} {cartItems.length === 1 ? t.item : t.items})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4">
              <img
                src={item.product.images[0] || item.product.image}
                alt={getProductName(item)}
                className="w-20 h-20 object-cover rounded"
              />
              
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">{getProductName(item)}</h4>
                <div className="flex gap-2">
                  <Badge variant="secondary">{item.selectedColor}</Badge>
                  <Badge variant="secondary">{item.selectedSize}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.product.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(`${item.product.id}-${item.selectedColor}-${item.selectedSize}`, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(`${item.product.id}-${item.selectedColor}-${item.selectedSize}`, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemoveItem(`${item.product.id}-${item.selectedColor}-${item.selectedSize}`)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between">
            <span>{t.subtotal}</span>
            <span>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t.shipping}</span>
            <span className="text-green-600">{t.free}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>{t.total}</span>
            <span>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(total)}
            </span>
          </div>
          <Button variant="ink" className="w-full" onClick={onCheckout}>
            {t.checkout}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};