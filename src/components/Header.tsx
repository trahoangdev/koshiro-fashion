import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, User, Globe, Heart, LogOut, Settings, Package, CreditCard, MapPin, Bell, LogIn, UserPlus, GitCompare } from "lucide-react";
import EnhancedMobileMenu from "./EnhancedMobileMenu";
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
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
      wishlist: "Wishlist",
      about: "About",
      contact: "Contact"
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
      wishlist: "Danh sách yêu thích",
      about: "Giới thiệu",
      contact: "Liên hệ"
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
      wishlist: "ほしい物リスト",
      about: "会社概要",
      contact: "お問い合わせ"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-8">
        {/* Logo - Golden ratio proportions */}
        <div className="flex items-center min-w-[130px]">
          <Link to="/">
            <h1 className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors duration-300 transform hover:scale-105">
              KOSHIRO
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation - Golden ratio spacing */}
        <nav className="hidden lg:flex items-center space-x-7 flex-1 justify-center max-w-[420px]">
          <Link to="/categories">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-2 py-2">
              {t.categories}
            </Button>
          </Link>
          <Link to="/sale">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-4 py-2">{t.sale}</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-4 py-2">{t.about}</Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-4 py-2">{t.contact}</Button>
          </Link>
        </nav>

        {/* Search - Golden ratio width */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-[320px] mx-10">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-base rounded-full border-2 focus:border-primary transition-all duration-300"
            />
          </div>
        </form>

        {/* Right section - Golden ratio spacing */}
        <div className="flex items-center space-x-3 min-w-[200px] justify-end">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
                <Globe className="h-5 w-5" />
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
          <div className="h-10 w-10 flex items-center justify-center">
            <ThemeToggle />
          </div>

          {/* Wishlist */}
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="hidden lg:flex relative h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Compare */}
          <Link to="/compare">
            <Button variant="ghost" size="icon" className="hidden lg:flex h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
              <GitCompare className="h-5 w-5" />
            </Button>
          </Link>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
                <User className="h-5 w-5" />
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
              className="relative h-10 w-10 hover:bg-primary/10 transition-colors duration-300"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 hover:bg-primary/10 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Navigation Bar */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur">
        <div className="container px-6 py-3">
          <nav className="flex items-center justify-between">
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors">
                {t.categories}
              </Button>
            </Link>
            <Link to="/sale">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors">{t.sale}</Button>
            </Link>
            <Link to="/wishlist" className="md:hidden">
              <Button variant="ghost" size="sm" className="relative text-sm hover:text-primary transition-colors">
                <Heart className="h-4 w-4 mr-1" />
                {wishlistCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/compare" className="md:hidden">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors">
                <GitCompare className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </nav>
          
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <EnhancedMobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartItemsCount={cartItemsCount}
        wishlistCount={wishlistCount}
        onSearch={onSearch}
      />
    </header>
  );
};

export default Header;