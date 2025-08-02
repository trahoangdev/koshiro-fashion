import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  Package,
  CreditCard,
  MapPin,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const ProfileSidebar = ({ activeSection, onSectionChange }: ProfileSidebarProps) => {
  const { language } = useLanguage();

  const translations = {
    en: {
      profile: "Profile",
      orders: "My Orders",
      wishlist: "Wishlist",
      addresses: "Addresses",
      payment: "Payment Methods",
      notifications: "Notifications",
      settings: "Account Settings",
      logout: "Logout",
      memberSince: "Member since",
      ordersCount: "orders",
      wishlistCount: "items"
    },
    vi: {
      profile: "Hồ Sơ",
      orders: "Đơn Hàng Của Tôi",
      wishlist: "Danh Sách Yêu Thích",
      addresses: "Địa Chỉ",
      payment: "Phương Thức Thanh Toán",
      notifications: "Thông Báo",
      settings: "Cài Đặt Tài Khoản",
      logout: "Đăng Xuất",
      memberSince: "Thành viên từ",
      ordersCount: "đơn hàng",
      wishlistCount: "sản phẩm"
    },
    ja: {
      profile: "プロフィール",
      orders: "注文履歴",
      wishlist: "お気に入りリスト",
      addresses: "住所",
      payment: "支払い方法",
      notifications: "通知",
      settings: "アカウント設定",
      logout: "ログアウト",
      memberSince: "メンバー登録日",
      ordersCount: "注文",
      wishlistCount: "商品"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const menuItems = [
    {
      id: "profile",
      label: t.profile,
      icon: User
    },
    {
      id: "orders",
      label: t.orders,
      icon: ShoppingBag,
      badge: "5"
    },
    {
      id: "wishlist",
      label: t.wishlist,
      icon: Heart,
      badge: "3"
    },
    {
      id: "addresses",
      label: t.addresses,
      icon: MapPin
    },
    {
      id: "payment",
      label: t.payment,
      icon: CreditCard
    },
    {
      id: "notifications",
      label: t.notifications,
      icon: Bell
    },
    {
      id: "settings",
      label: t.settings,
      icon: Settings
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logout clicked");
  };

  return (
    <div className="w-full lg:w-80 bg-card border-r">
      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">John Doe</h3>
            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {t.memberSince} January 2024
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              5 {t.ordersCount}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              3 {t.wishlistCount}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          // Special handling for wishlist - it should navigate to the wishlist page
          if (item.id === "wishlist") {
            return (
              <Link key={item.id} to="/wishlist">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start h-12"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          {t.logout}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSidebar; 