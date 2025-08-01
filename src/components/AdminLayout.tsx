import { useState, useEffect, ReactNode } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Globe,
  Tag,
  Home,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState("vi");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const translations = {
    en: {
      title: "KOSHIRO Admin",
      subtitle: "Administration Dashboard",
      logout: "Logout",
      manageProducts: "Manage Products",
      manageCategories: "Manage Categories",
      manageOrders: "Manage Orders",
      manageUsers: "Manage Users",
      logoutSuccess: "Logout successful",
      seeYouSoon: "See you soon!",
      dashboard: "Dashboard",
      settings: "Settings"
    },
    vi: {
      title: "KOSHIRO Admin",
      subtitle: "Bảng điều khiển quản trị",
      logout: "Đăng xuất",
      manageProducts: "Quản lý sản phẩm",
      manageCategories: "Quản lý danh mục",
      manageOrders: "Quản lý đơn hàng",
      manageUsers: "Quản lý người dùng",
      logoutSuccess: "Đăng xuất thành công",
      seeYouSoon: "Hẹn gặp lại!",
      dashboard: "Bảng điều khiển",
      settings: "Cài đặt"
    },
    ja: {
      title: "KOSHIRO Admin",
      subtitle: "管理ダッシュボード",
      logout: "ログアウト",
      manageProducts: "商品管理",
      manageCategories: "カテゴリ管理",
      manageOrders: "注文管理",
      manageUsers: "ユーザー管理",
      logoutSuccess: "ログアウト成功",
      seeYouSoon: "また会いましょう！",
      dashboard: "ダッシュボード",
      settings: "設定"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Navigation items
  const navigationItems = [
    {
      name: t.dashboard,
      href: "/admin",
      icon: Home,
      current: location.pathname === "/admin"
    },
    {
      name: t.manageProducts,
      href: "/admin/products",
      icon: Package,
      current: location.pathname === "/admin/products"
    },
    {
      name: t.manageCategories,
      href: "/admin/categories",
      icon: Tag,
      current: location.pathname === "/admin/categories"
    },
    {
      name: t.manageOrders,
      href: "/admin/orders",
      icon: ShoppingCart,
      current: location.pathname === "/admin/orders"
    },
    {
      name: t.manageUsers,
      href: "/admin/users",
      icon: Users,
      current: location.pathname === "/admin/users"
    },
    {
      name: t.settings,
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname === "/admin/settings"
    }
  ];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    const savedLanguage = localStorage.getItem("adminLanguage");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [navigate]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("adminLanguage", lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminLanguage");
    toast({
      title: t.logoutSuccess,
      description: t.seeYouSoon,
    });
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div>
              <h1 className="text-xl font-bold">{t.title}</h1>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
                  className={`w-full justify-start ${item.current ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('vi')}>
                    Tiếng Việt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ja')}>
                    日本語
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" onClick={handleLogout} className="flex-1 ml-2">
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('vi')}>
                    Tiếng Việt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('ja')}>
                    日本語
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" onClick={handleLogout} className="lg:hidden">
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 