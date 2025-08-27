import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Order, Product, User as UserType } from "@/lib/api";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const ProfileSidebar = ({ activeSection, onSectionChange, refreshTrigger }: ProfileSidebarProps) => {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load real data for counts
  const loadCounts = async () => {
    // Only load counts if user is authenticated
    if (!isAuthenticated) {
      setOrdersCount(0);
      setWishlistCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load orders count
      try {
        const ordersResponse = await api.getUserOrders();
        let ordersData: Order[] = [];
        if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse && typeof ordersResponse === 'object') {
          const responseObj = ordersResponse as unknown as Record<string, unknown>;
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            ordersData = responseObj.data as Order[];
          } else if ('orders' in responseObj && Array.isArray(responseObj.orders)) {
            ordersData = responseObj.orders as Order[];
          }
        }
        setOrdersCount(ordersData.length);
      } catch (error) {
        console.error('Failed to load orders count:', error);
        setOrdersCount(0);
      }

      // Load wishlist count
      try {
        const wishlistResponse = await api.getWishlist();
        let wishlistData: Product[] = [];
        if (Array.isArray(wishlistResponse)) {
          wishlistData = wishlistResponse;
        } else if (wishlistResponse && typeof wishlistResponse === 'object') {
          const responseObj = wishlistResponse as unknown as Record<string, unknown>;
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            wishlistData = responseObj.data as Product[];
          } else if ('wishlist' in responseObj && Array.isArray(responseObj.wishlist)) {
            wishlistData = responseObj.wishlist as Product[];
          }
        }
        setWishlistCount(wishlistData.length);
      } catch (error) {
        console.error('Failed to load wishlist count:', error);
        setWishlistCount(0);
      }
    } catch (error) {
      console.error('Failed to load counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, [refreshTrigger, isAuthenticated]); // Re-run when refreshTrigger or authentication changes

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
      wishlistCount: "items",
      totalSpent: "Total Spent"
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
      wishlistCount: "sản phẩm",
      totalSpent: "Tổng Chi Tiêu"
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
      wishlistCount: "商品",
      totalSpent: "総支出額"
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
      icon: Package,
      badge: isLoading ? "..." : ordersCount.toString()
    },
    {
      id: "wishlist",
      label: t.wishlist,
      icon: Heart,
      badge: isLoading ? "..." : wishlistCount.toString()
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
            <div className="text-lg font-semibold text-primary">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user?.name || 'User'}</h3>
            <p className="text-sm text-muted-foreground truncate">{user?.email || 'email@example.com'}</p>
            <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-xs mt-1">
              {user?.role === 'admin' ? 'Admin' : 'Customer'}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {t.memberSince} {(user as unknown as UserType)?.createdAt ? new Date((user as unknown as UserType).createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center">
              <Package className="h-3 w-3 mr-1" />
              {isLoading ? "..." : ordersCount} {t.ordersCount}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {isLoading ? "..." : wishlistCount} {t.wishlistCount}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {t.totalSpent}: {formatCurrency(((user as unknown as UserType)?.totalSpent || 0), language)}
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
                  {item.badge && item.badge !== "0" && item.badge !== "..." && (
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
              {item.badge && item.badge !== "0" && item.badge !== "..." && (
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