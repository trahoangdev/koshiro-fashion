import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Globe,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  labelEn: string;
  labelJa: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Bảng điều khiển",
    labelEn: "Dashboard",
    labelJa: "ダッシュボード",
    icon: LayoutDashboard,
    path: "/admin"
  },
  {
    id: "products",
    label: "Sản phẩm",
    labelEn: "Products",
    labelJa: "商品",
    icon: Package,
    path: "/admin/products"
  },
  {
    id: "categories",
    label: "Danh mục",
    labelEn: "Categories",
    labelJa: "カテゴリ",
    icon: Tag,
    path: "/admin/categories"
  },
  {
    id: "orders",
    label: "Đơn hàng",
    labelEn: "Orders",
    labelJa: "注文",
    icon: ShoppingCart,
    path: "/admin/orders"
  },
  {
    id: "users",
    label: "Người dùng",
    labelEn: "Users",
    labelJa: "ユーザー",
    icon: Users,
    path: "/admin/users"
  },
  {
    id: "settings",
    label: "Cài đặt",
    labelEn: "Settings",
    labelJa: "設定",
    icon: Settings,
    path: "/admin/settings"
  }
];

function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();



  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("adminLanguage");
    navigate("/admin/login");
  };

  const getLabel = (item: MenuItem) => {
    switch (language) {
      case "en": return item.labelEn;
      case "ja": return item.labelJa;
      default: return item.label;
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-background border-r z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 lg:w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">K</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base sm:text-lg truncate">KOSHIRO</h1>
                <p className="text-xs text-muted-foreground truncate">Admin Panel</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm sm:text-base ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{getLabel(item)}</span>
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t space-y-2 sm:space-y-3 flex-shrink-0">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm sm:text-base">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {language === "vi" ? "Tiếng Việt" : 
                     language === "en" ? "English" : "日本語"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleLanguageChange('vi')}>
                  🇻🇳 Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('ja')}>
                  🇯🇵 日本語
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout */}
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {language === "vi" ? "Đăng xuất" : 
                 language === "en" ? "Logout" : "ログアウト"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar; 