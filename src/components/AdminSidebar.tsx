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
  X,
  BarChart3,
  FileText,
  Bell,
  User,
  Shield,
  Palette,
  Database,
  Activity,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  badge?: string;
  isNew?: boolean;
}

interface MenuGroup {
  title: string;
  titleEn: string;
  titleJa: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Tổng Quan",
    titleEn: "Overview",
    titleJa: "概要",
    items: [
      {
        id: "dashboard",
        label: "Bảng điều khiển",
        labelEn: "Dashboard",
        labelJa: "ダッシュボード",
        icon: LayoutDashboard,
        path: "/admin"
      },
      {
        id: "analytics",
        label: "Phân tích",
        labelEn: "Analytics",
        labelJa: "分析",
        icon: BarChart3,
        path: "/admin/analytics",
        isNew: true
      }
    ]
  },
  {
    title: "Quản Lý",
    titleEn: "Management",
    titleJa: "管理",
    items: [
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
        path: "/admin/orders",
        badge: "5"
      },
      {
        id: "users",
        label: "Người dùng",
        labelEn: "Users",
        labelJa: "ユーザー",
        icon: Users,
        path: "/admin/users"
      }
    ]
  },
  {
    title: "Hệ Thống",
    titleEn: "System",
    titleJa: "システム",
    items: [
      {
        id: "settings",
        label: "Cài đặt",
        labelEn: "Settings",
        labelJa: "設定",
        icon: Settings,
        path: "/admin/settings"
      },
      {
        id: "reports",
        label: "Báo cáo",
        labelEn: "Reports",
        labelJa: "レポート",
        icon: FileText,
        path: "/admin/reports"
      },
      {
        id: "activity",
        label: "Hoạt động",
        labelEn: "Activity",
        labelJa: "アクティビティ",
        icon: Activity,
        path: "/admin/activity"
      }
    ]
  }
];

function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState(3);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("adminLanguage", lang);
    toast({
      title: language === 'vi' ? "Ngôn ngữ đã thay đổi" : 
             language === 'ja' ? "言語が変更されました" : 
             "Language changed",
      description: language === 'vi' ? "Giao diện đã được cập nhật" :
                   language === 'ja' ? "インターフェースが更新されました" :
                   "Interface has been updated",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
    toast({
      title: language === 'vi' ? "Đăng xuất thành công" : 
             language === 'ja' ? "ログアウトしました" : 
             "Logged out successfully",
    });
  };

  const getLabel = (item: MenuItem) => {
    switch (language) {
      case 'vi': return item.label;
      case 'ja': return item.labelJa;
      default: return item.labelEn;
    }
  };

  const getGroupTitle = (group: MenuGroup) => {
    switch (language) {
      case 'vi': return group.title;
      case 'ja': return group.titleJa;
      default: return group.titleEn;
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
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

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@koshiro.com'}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {user?.role || 'admin'}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {getGroupTitle(group)}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Button
                      key={item.id}
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={`w-full justify-start h-10 px-3 relative ${
                        isActive(item.path) ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => handleMenuClick(item.path)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      <span className="flex-1 text-left">{getLabel(item)}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.isNew && (
                        <Badge variant="default" className="ml-auto text-xs bg-green-500">
                          New
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
                {groupIndex < menuGroups.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">New order received</p>
                        <p className="text-xs text-muted-foreground">Order #12345 has been placed</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Low stock alert</p>
                        <p className="text-xs text-muted-foreground">Product "Kimono" is running low</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
            </div>

            {/* Logout */}
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {language === 'vi' ? 'Đăng xuất' : language === 'ja' ? 'ログアウト' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar; 