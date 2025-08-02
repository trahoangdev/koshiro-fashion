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

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState("vi");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("adminLanguage", lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminLanguage");
    toast({
      title: language === "vi" ? "Đăng xuất thành công" : 
            language === "en" ? "Logout successful" : "ログアウト成功",
      description: language === "vi" ? "Hẹn gặp lại!" : 
                  language === "en" ? "See you soon!" : "また会いましょう！",
    });
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
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">KOSHIRO</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {getLabel(item)}
                </Button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Globe className="h-4 w-4" />
                  {language === "vi" ? "Tiếng Việt" : 
                   language === "en" ? "English" : "日本語"}
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
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {language === "vi" ? "Đăng xuất" : 
               language === "en" ? "Logout" : "ログアウト"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 