import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  ShoppingBag,
  Tag,
  Star,
  Save
} from "lucide-react";

interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletters: boolean;
    productRecommendations: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    backInStock: boolean;
    priceDrops: boolean;
  };
  sms: {
    orderUpdates: boolean;
    promotions: boolean;
  };
}

const ProfileNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      orderUpdates: true,
      promotions: true,
      newsletters: false,
      productRecommendations: true
    },
    push: {
      orderUpdates: true,
      promotions: false,
      backInStock: true,
      priceDrops: true
    },
    sms: {
      orderUpdates: false,
      promotions: false
    }
  });
  const { language, t: tCommon } = useLanguage();
  const { toast } = useToast();

  const translations = {
    en: {
      title: "Notification Settings",
      subtitle: "Choose how you want to be notified about your orders and updates",
      email: "Email Notifications",
      push: "Push Notifications",
      sms: "SMS Notifications",
      orderUpdates: "Order Updates",
      orderUpdatesDesc: "Get notified about order status changes, shipping updates, and delivery confirmations",
      promotions: "Promotions & Offers",
      promotionsDesc: "Receive notifications about sales, discounts, and special offers",
      newsletters: "Newsletters",
      newslettersDesc: "Stay updated with our latest news, fashion trends, and brand stories",
      productRecommendations: "Product Recommendations",
      productRecommendationsDesc: "Get personalized product suggestions based on your preferences",
      backInStock: "Back in Stock Alerts",
      backInStockDesc: "Be notified when items in your wishlist come back in stock",
      priceDrops: "Price Drop Alerts",
      priceDropsDesc: "Get notified when items in your wishlist go on sale",
      save: "Save Settings",
      settingsSaved: "Notification settings saved successfully",
      enableAll: "Enable All",
      disableAll: "Disable All"
    },
    vi: {
      title: "Cài Đặt Thông Báo",
      subtitle: "Chọn cách bạn muốn được thông báo về đơn hàng và cập nhật",
      email: "Thông Báo Email",
      push: "Thông Báo Push",
      sms: "Thông Báo SMS",
      orderUpdates: "Cập Nhật Đơn Hàng",
      orderUpdatesDesc: "Nhận thông báo về thay đổi trạng thái đơn hàng, cập nhật vận chuyển và xác nhận giao hàng",
      promotions: "Khuyến Mãi & Ưu Đãi",
      promotionsDesc: "Nhận thông báo về giảm giá, khuyến mãi và ưu đãi đặc biệt",
      newsletters: "Bản Tin",
      newslettersDesc: "Cập nhật tin tức mới nhất, xu hướng thời trang và câu chuyện thương hiệu",
      productRecommendations: "Gợi Ý Sản Phẩm",
      productRecommendationsDesc: "Nhận gợi ý sản phẩm cá nhân hóa dựa trên sở thích của bạn",
      backInStock: "Thông Báo Có Hàng",
      backInStockDesc: "Được thông báo khi sản phẩm trong wishlist có hàng trở lại",
      priceDrops: "Thông Báo Giảm Giá",
      priceDropsDesc: "Được thông báo khi sản phẩm trong wishlist giảm giá",
      save: "Lưu Cài Đặt",
      settingsSaved: "Đã lưu cài đặt thông báo thành công",
      enableAll: "Bật Tất Cả",
      disableAll: "Tắt Tất Cả"
    },
    ja: {
      title: "通知設定",
      subtitle: "注文とアップデートについてどのように通知を受け取りたいかを選択",
      email: "メール通知",
      push: "プッシュ通知",
      sms: "SMS通知",
      orderUpdates: "注文更新",
      orderUpdatesDesc: "注文状況の変更、配送更新、配達確認について通知を受け取る",
      promotions: "プロモーション＆オファー",
      promotionsDesc: "セール、割引、特別オファーについて通知を受け取る",
      newsletters: "ニュースレター",
      newslettersDesc: "最新ニュース、ファッショントレンド、ブランドストーリーについて更新を受け取る",
      productRecommendations: "商品レコメンデーション",
      productRecommendationsDesc: "お好みに基づいたパーソナライズされた商品提案を受け取る",
      backInStock: "在庫復旧アラート",
      backInStockDesc: "お気に入りリストの商品が在庫復旧した際に通知を受け取る",
      priceDrops: "価格下落アラート",
      priceDropsDesc: "お気に入りリストの商品がセールになった際に通知を受け取る",
      save: "設定を保存",
      settingsSaved: "通知設定が正常に保存されました",
      enableAll: "すべて有効",
      disableAll: "すべて無効"
    }
  };

  const tl = translations[language as keyof typeof translations] || translations.en;

  const handleToggle = (category: keyof NotificationSettings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: tCommon('success'),
      description: tl.settingsSaved,
    });
  };

  const handleEnableAll = () => {
    setSettings({
      email: {
        orderUpdates: true,
        promotions: true,
        newsletters: true,
        productRecommendations: true
      },
      push: {
        orderUpdates: true,
        promotions: true,
        backInStock: true,
        priceDrops: true
      },
      sms: {
        orderUpdates: true,
        promotions: true
      }
    });
  };

  const handleDisableAll = () => {
    setSettings({
      email: {
        orderUpdates: false,
        promotions: false,
        newsletters: false,
        productRecommendations: false
      },
      push: {
        orderUpdates: false,
        promotions: false,
        backInStock: false,
        priceDrops: false
      },
      sms: {
        orderUpdates: false,
        promotions: false
      }
    });
  };

  const NotificationItem = ({ 
    icon, 
    title, 
    description, 
    checked, 
    onToggle 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-start space-x-3 p-4 rounded-lg border">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Label htmlFor={title} className="text-sm font-medium">
            {title}
          </Label>
          <Switch
            id={title}
            checked={checked}
            onCheckedChange={onToggle}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{tl.title}</h2>
          <p className="text-muted-foreground">{tl.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEnableAll}>
            {tl.enableAll}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDisableAll}>
            {tl.disableAll}
          </Button>
        </div>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            {tl.email}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.orderUpdates}
            description={tl.orderUpdatesDesc}
            checked={settings.email.orderUpdates}
            onToggle={() => handleToggle('email', 'orderUpdates')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.promotions}
            description={tl.promotionsDesc}
            checked={settings.email.promotions}
            onToggle={() => handleToggle('email', 'promotions')}
          />
          
          <NotificationItem
            icon={<Bell className="h-4 w-4" />}
            title={tl.newsletters}
            description={tl.newslettersDesc}
            checked={settings.email.newsletters}
            onToggle={() => handleToggle('email', 'newsletters')}
          />
          
          <NotificationItem
            icon={<Star className="h-4 w-4" />}
            title={tl.productRecommendations}
            description={tl.productRecommendationsDesc}
            checked={settings.email.productRecommendations}
            onToggle={() => handleToggle('email', 'productRecommendations')}
          />
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {tl.push}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.orderUpdates}
            description={tl.orderUpdatesDesc}
            checked={settings.push.orderUpdates}
            onToggle={() => handleToggle('push', 'orderUpdates')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.promotions}
            description={tl.promotionsDesc}
            checked={settings.push.promotions}
            onToggle={() => handleToggle('push', 'promotions')}
          />
          
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.backInStock}
            description={tl.backInStockDesc}
            checked={settings.push.backInStock}
            onToggle={() => handleToggle('push', 'backInStock')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.priceDrops}
            description={tl.priceDropsDesc}
            checked={settings.push.priceDrops}
            onToggle={() => handleToggle('push', 'priceDrops')}
          />
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            {tl.sms}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.orderUpdates}
            description={tl.orderUpdatesDesc}
            checked={settings.sms.orderUpdates}
            onToggle={() => handleToggle('sms', 'orderUpdates')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.promotions}
            description={tl.promotionsDesc}
            checked={settings.sms.promotions}
            onToggle={() => handleToggle('sms', 'promotions')}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {tl.save}
        </Button>
      </div>
    </div>
  );
};

export default ProfileNotifications; 