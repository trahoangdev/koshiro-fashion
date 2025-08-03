import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, User, Globe, Heart, LogOut, Settings, Package, CreditCard, MapPin, Bell, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, Product } from "@/lib/api";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  cartItemsCount: number;
  onSearch: (query: string) => void;
  refreshWishlistTrigger?: number; // Add this to trigger wishlist count refresh
}

const Header = ({ cartItemsCount, onSearch, refreshWishlistTrigger }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Load wishlist count
  useEffect(() => {
    const loadWishlistCount = async () => {
      if (!isAuthenticated) {
        setWishlistCount(0);
        return;
      }

      try {
        const response = await api.getWishlist();
        let wishlistData: Product[] = [];
        if (Array.isArray(response)) {
          wishlistData = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as unknown as Record<string, unknown>;
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
    };

    loadWishlistCount();
  }, [isAuthenticated, refreshWishlistTrigger]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const translations = {
    en: {
      search: "Search products...",
      categories: "Categories",
      tops: "Tops",
      bottoms: "Bottoms", 
      accessories: "Accessories",
      kimono: "Kimono",
      yukata: "Yukata",
      hakama: "Hakama",
      sale: "Sale",
      account: "Account",
      cart: "Cart",
      profile: "Profile",
      orders: "Orders",
      addresses: "Addresses",
      payment: "Payment",
      notifications: "Notifications",
      settings: "Settings",
      logout: "Logout",
      login: "Login",
      register: "Register",
      guest: "Guest",
      wishlist: "Wishlist"
    },
    vi: {
      search: "Tìm kiếm sản phẩm...",
      categories: "Danh mục",
      tops: "Áo",
      bottoms: "Quần",
      accessories: "Phụ kiện",
      kimono: "Kimono",
      yukata: "Yukata", 
      hakama: "Hakama",
      sale: "Khuyến mãi",
      account: "Tài khoản",
      cart: "Giỏ hàng",
      profile: "Hồ sơ",
      orders: "Đơn hàng",
      addresses: "Địa chỉ",
      payment: "Thanh toán",
      notifications: "Thông báo",
      settings: "Cài đặt",
      logout: "Đăng xuất",
      login: "Đăng nhập",
      register: "Đăng ký",
      guest: "Khách",
      wishlist: "Danh sách yêu thích"
    },
    ja: {
      search: "商品を検索...",
      categories: "カテゴリ",
      tops: "トップス",
      bottoms: "ボトムス",
      accessories: "アクセサリー",
      kimono: "着物",
      yukata: "浴衣",
      hakama: "袴",
      sale: "セール",
      account: "アカウント", 
      cart: "カート",
      profile: "プロフィール",
      orders: "注文",
      addresses: "住所",
      payment: "支払い",
      notifications: "通知",
      settings: "設定",
      logout: "ログアウト",
      login: "ログイン",
      register: "登録",
      guest: "ゲスト",
      wishlist: "ほしい物リスト"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors">KOSHIRO</h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/categories">
            <Button variant="ghost" className="font-medium">
              {t.categories}
            </Button>
          </Link>
          <Link to="/sale">
            <Button variant="ghost" className="font-medium">{t.sale}</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="font-medium">About</Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" className="font-medium">Contact</Button>
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('vi')}>
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ja')}>
                日本語
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wishlist */}
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback>{getUserInitials(user?.name || '')}</AvatarFallback>
                      </Avatar>
                      {user?.name}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Package className="mr-2 h-4 w-4" />
                    {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    {t.wishlist}
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {wishlistCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=orders')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t.orders}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=addresses')}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {t.addresses}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=payment')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t.payment}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    {t.notifications}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.logout}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>{t.guest}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t.login}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/register')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.register}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link to="/cart">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <nav className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start">{t.tops}</Button>
              <Button variant="ghost" className="justify-start">{t.bottoms}</Button>
              <Button variant="ghost" className="justify-start">{t.accessories}</Button>
              <Button variant="ghost" className="justify-start">{t.kimono}</Button>
              <Button variant="ghost" className="justify-start">{t.yukata}</Button>
              <Button variant="ghost" className="justify-start">{t.hakama}</Button>
              <Button variant="ghost" className="justify-start">{t.sale}</Button>
              <Link to="/profile" className="w-full">
                <Button variant="ghost" className="justify-start w-full">{t.account}</Button>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;