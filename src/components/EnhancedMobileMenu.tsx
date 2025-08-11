import React, { useState, useEffect } from 'react';
import { 
  X, 
  Menu, 
  Search, 
  Home, 
  ShoppingBag, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  LogIn, 
  UserPlus,
  ChevronRight,
  ShoppingCart,
  Package,
  CreditCard,
  MapPin,
  Bell,
  GitCompare,
  Globe,
  Star,
  Percent,
  Phone,
  Info,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface EnhancedMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemsCount: number;
  wishlistCount: number;
  onSearch: (query: string) => void;
}

const EnhancedMobileMenu: React.FC<EnhancedMobileMenuProps> = ({
  isOpen,
  onClose,
  cartItemsCount,
  wishlistCount,
  onSearch
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{_id: string; name: string; slug: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories();
        const categoriesArray = Array.isArray(response) ? response : response.categories || [];
        setCategories(categoriesArray.slice(0, 6)); // Limit to 6 categories for mobile
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Close menu on escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
      
      // Add menu-open class to body for additional styling if needed
      document.body.classList.add('mobile-menu-open');
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleLinkClick = () => {
    onClose();
    setActiveSection(null);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const translations = {
    en: {
      menu: "Menu",
      search: "Search products...",
      signIn: "Sign In",
      signUp: "Sign Up",
      home: "Home",
      categories: "Categories",
      sale: "Sale",
      about: "About",
      contact: "Contact",
      profile: "Profile",
      orders: "Orders",
      addresses: "Addresses",
      payment: "Payment",
      compare: "Compare",
      signOut: "Sign Out",
      language: "Language",
      cart: "Cart",
      wishlist: "Wishlist",
      viewAll: "View All",
      mainMenu: "Main Menu",
      quickActions: "Quick Actions",
      account: "Account",
      helpSupport: "Help & Support",
      settings: "Settings",
      specialOffers: "Special Offers",
      reviews: "Reviews",
      trackOrder: "Track Order",
      sizeGuide: "Size Guide",
      faq: "FAQ",
      shippingInfo: "Shipping Info",
      returnPolicy: "Return Policy",
      firstOrderDiscount: "First Order Discount",
      firstOrderDescription: "Get 20% off your first purchase",
      shopNow: "Shop Now",
      stayUpdated: "Stay Updated",
      newsletterDescription: "Get latest fashion trends & deals",
      subscribeNewsletter: "Subscribe Newsletter",
      premiumMember: "Premium Member",
      welcomeKoshiro: "Welcome to Koshiro",
      signInAccess: "Sign in to access your account",
      madeWithLove: "Made with",
      inJapan: "in Japan",
      authenticJapanese: "Authentic Japanese Fashion"
    },
    vi: {
      menu: "Menu",
      search: "Tìm kiếm sản phẩm...",
      signIn: "Đăng nhập",
      signUp: "Đăng ký",
      home: "Trang chủ",
      categories: "Danh mục",
      sale: "Khuyến mãi",
      about: "Giới thiệu",
      contact: "Liên hệ",
      profile: "Hồ sơ",
      orders: "Đơn hàng",
      addresses: "Địa chỉ",
      payment: "Thanh toán",
      compare: "So sánh",
      signOut: "Đăng xuất",
      language: "Ngôn ngữ",
      cart: "Giỏ hàng",
      wishlist: "Yêu thích",
      viewAll: "Xem tất cả",
      mainMenu: "Menu Chính",
      quickActions: "Thao Tác Nhanh",
      account: "Tài Khoản",
      helpSupport: "Trợ Giúp & Hỗ Trợ",
      settings: "Cài Đặt",
      specialOffers: "Ưu Đãi Đặc Biệt",
      reviews: "Đánh Giá",
      trackOrder: "Theo Dõi Đơn Hàng",
      sizeGuide: "Hướng Dẫn Kích Thước",
      faq: "Câu Hỏi Thường Gặp",
      shippingInfo: "Thông Tin Giao Hàng",
      returnPolicy: "Chính Sách Đổi Trả",
      firstOrderDiscount: "Giảm Giá Đơn Hàng Đầu",
      firstOrderDescription: "Giảm 20% cho đơn hàng đầu tiên",
      shopNow: "Mua Ngay",
      stayUpdated: "Cập Nhật Tin Tức",
      newsletterDescription: "Nhận xu hướng thời trang và ưu đãi mới nhất",
      subscribeNewsletter: "Đăng Ký Bản Tin",
      premiumMember: "Thành Viên Cao Cấp",
      welcomeKoshiro: "Chào mừng đến với Koshiro",
      signInAccess: "Đăng nhập để truy cập tài khoản",
      madeWithLove: "Được tạo với",
      inJapan: "tại Nhật Bản",
      authenticJapanese: "Thời Trang Nhật Bản Chính Hiệu"
    },
    ja: {
      menu: "メニュー",
      search: "商品を検索...",
      signIn: "ログイン",
      signUp: "登録",
      home: "ホーム",
      categories: "カテゴリ",
      sale: "セール",
      about: "について",
      contact: "お問い合わせ",
      profile: "プロフィール",
      orders: "注文",
      addresses: "住所",
      payment: "支払い",
      compare: "比較",
      signOut: "ログアウト",
      language: "言語",
      cart: "カート",
      wishlist: "ほしい物リスト",
      viewAll: "すべて表示",
      mainMenu: "メインメニュー",
      quickActions: "クイックアクション",
      account: "アカウント",
      helpSupport: "ヘルプとサポート",
      settings: "設定",
      specialOffers: "特別オファー",
      reviews: "レビュー",
      trackOrder: "注文追跡",
      sizeGuide: "サイズガイド",
      faq: "よくある質問",
      shippingInfo: "配送情報",
      returnPolicy: "返品ポリシー",
      firstOrderDiscount: "初回注文割引",
      firstOrderDescription: "初回購入で20%オフ",
      shopNow: "今すぐ購入",
      stayUpdated: "最新情報を取得",
      newsletterDescription: "最新のファッショントレンドとお得な情報を入手",
      subscribeNewsletter: "ニュースレターを購読",
      premiumMember: "プレミアムメンバー",
      welcomeKoshiro: "Koshiroへようこそ",
      signInAccess: "アカウントにアクセスするにはログインしてください",
      madeWithLove: "愛を込めて作成",
      inJapan: "日本で",
      authenticJapanese: "本格的な日本ファッション"
    }
  };

  const tr = translations[language as keyof typeof translations] || translations.en;

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="mobile-menu-backdrop fixed inset-0 bg-black/80 lg:hidden"
        onClick={onClose}
        style={{
          animation: 'fadeIn 300ms ease-out',
          opacity: 1
        }}
      />

      {/* Menu */}
      <div 
        className="mobile-menu-panel fixed top-0 right-0 h-screen w-[380px] bg-background border-l border-border shadow-2xl lg:hidden overflow-hidden"
        style={{
          transform: 'translateX(0)',
          transition: 'transform 300ms ease-out'
        }}
      >
        {/* Header - Enhanced */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Menu className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">{tr.menu}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Enhanced Search */}
          <div className="p-6 border-b border-border flex-shrink-0">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="search"
                  placeholder={tr.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base rounded-full border-2 border-border focus:border-primary transition-all duration-300 bg-muted"
                />
              </div>
            </form>
          </div>

          {/* Enhanced User Section */}
          {isAuthenticated ? (
            <div className="p-6 border-b border-border flex-shrink-0">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-border">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {getUserInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-xs text-muted-foreground">{tr.premiumMember}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Link to="/cart" onClick={handleLinkClick}>
                  <div className="group flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-blue-200 dark:border-blue-800">
                    <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{tr.cart}</span>
                    {cartItemsCount > 0 && (
                      <Badge variant="destructive" className="h-6 w-6 text-xs p-0 flex items-center justify-center animate-pulse">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Link to="/wishlist" onClick={handleLinkClick}>
                  <div className="group flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-pink-200 dark:border-pink-800">
                    <div className="p-2 bg-pink-500/10 rounded-full group-hover:bg-pink-500/20 transition-colors">
                      <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">{tr.wishlist}</span>
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="h-6 w-6 text-xs p-0 flex items-center justify-center">
                        {wishlistCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 border-b border-border space-y-4 flex-shrink-0">
              <div className="text-center mb-6">
                <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{tr.welcomeKoshiro}</h3>
                <p className="text-sm text-muted-foreground">{tr.signInAccess}</p>
              </div>
              <Link to="/login" onClick={handleLinkClick}>
                <Button className="w-full justify-center h-12 text-base font-semibold rounded-xl" size="lg">
                  <LogIn className="h-5 w-5 mr-3" />
                  {tr.signIn}
                </Button>
              </Link>
              <Link to="/register" onClick={handleLinkClick}>
                <Button variant="outline" className="w-full justify-center h-12 text-base font-semibold rounded-xl border-2" size="lg">
                  <UserPlus className="h-5 w-5 mr-3" />
                  {tr.signUp}
                </Button>
              </Link>
            </div>
          )}

          {/* Enhanced Navigation - Scrollable Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden mobile-menu-scroll">
            <div className="p-6 space-y-4 pb-8">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {tr.mainMenu}
              </h4>
              
              <Link to="/" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-green-500/10 rounded-lg mr-4">
                    <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {tr.home}
                </Button>
              </Link>

              {/* Enhanced Categories with Collapsible */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200"
                  onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/10 rounded-lg mr-4">
                      <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {tr.categories}
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      activeSection === 'categories' && "rotate-180"
                    )} 
                  />
                </Button>
                
                {/* Enhanced Categories Submenu */}
                <div className={cn(
                  "overflow-hidden transition-all duration-400 ease-out",
                  activeSection === 'categories' ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}>
                  <div className="ml-4 space-y-1 p-2 bg-muted rounded-xl border border-border">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        {categories.map((category) => (
                          <Link key={category._id} to={`/category/${category.slug}`} onClick={handleLinkClick}>
                            <Button variant="ghost" className="w-full justify-start text-sm h-11 rounded-lg hover:bg-muted">
                              <div className="w-2 h-2 bg-primary/50 rounded-full mr-3"></div>
                              {category.name}
                            </Button>
                          </Link>
                        ))}
                        <Link to="/categories" onClick={handleLinkClick}>
                          <Button variant="ghost" className="w-full justify-start text-sm h-11 rounded-lg hover:bg-muted font-medium text-primary">
                            <ChevronRight className="h-4 w-4 mr-3" />
                            {tr.viewAll}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Link to="/sale" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-between h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-500/10 rounded-lg mr-4">
                      <Percent className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    {tr.sale}
                  </div>
                  <Badge variant="destructive" className="animate-pulse font-semibold">
                    {language === 'vi' ? 'NÓNG' : language === 'ja' ? 'ホット' : 'HOT'}
                  </Badge>
                </Button>
              </Link>

              <Link to="/about" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-purple-500/10 rounded-lg mr-4">
                    <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  {tr.about}
                </Button>
              </Link>

              <Link to="/contact" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-orange-500/10 rounded-lg mr-4">
                    <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  {tr.contact}
                </Button>
              </Link>
            </div>

            <Separator className="my-6" />

            {/* Quick Actions Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {tr.quickActions}
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <Link to="/reviews" onClick={handleLinkClick}>
                  <div className="group flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-yellow-200 dark:border-yellow-800">
                    <div className="p-2 bg-yellow-500/10 rounded-full group-hover:bg-yellow-500/20 transition-colors">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">{tr.reviews}</span>
                  </div>
                </Link>
                
                <Link to="/order-tracking" onClick={handleLinkClick}>
                  <div className="group flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-green-200 dark:border-yellow-800">
                    <div className="p-2 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                      <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-semibold text-green-900 dark:text-green-100">{tr.trackOrder}</span>
                  </div>
                </Link>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Enhanced User Menu (if authenticated) */}
            {isAuthenticated && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                  {tr.account}
                </h4>
                
                <Link to="/profile" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                    <div className="p-2 bg-blue-500/10 rounded-lg mr-4">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {tr.profile}
                  </Button>
                </Link>

                <Link to="/profile/orders" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                    <div className="p-2 bg-green-500/10 rounded-lg mr-4">
                      <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    {tr.orders}
                  </Button>
                </Link>

                <Link to="/profile/addresses" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                    <div className="p-2 bg-purple-500/10 rounded-lg mr-4">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    {tr.addresses}
                  </Button>
                </Link>

                <Link to="/profile/payment" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                    <div className="p-2 bg-yellow-500/10 rounded-lg mr-4">
                      <CreditCard className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    {tr.payment}
                  </Button>
                </Link>

                <Link to="/compare" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                    <div className="p-2 bg-indigo-500/10 rounded-lg mr-4">
                      <GitCompare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    {tr.compare}
                  </Button>
                </Link>

                <Separator className="my-4" />

                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-14 text-base font-medium rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  onClick={handleLogout}
                >
                  <div className="p-2 bg-red-500/10 rounded-lg mr-4">
                    <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  {tr.signOut}
                </Button>
              </div>
            )}

            <Separator className="my-6" />

            {/* Help & Support Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {tr.helpSupport}
              </h4>
              
              <Link to="/size-guide" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-cyan-500/10 rounded-lg mr-4">
                    <Settings className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  {tr.sizeGuide}
                </Button>
              </Link>

              <Link to="/faq" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-teal-500/10 rounded-lg mr-4">
                    <Info className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  {tr.faq}
                </Button>
              </Link>

              <Link to="/shipping-info" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-slate-500/10 rounded-lg mr-4">
                    <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  {tr.shippingInfo}
                </Button>
              </Link>

              <Link to="/return-policy" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200">
                  <div className="p-2 bg-amber-500/10 rounded-lg mr-4">
                    <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  {tr.returnPolicy}
                </Button>
              </Link>
            </div>

            <Separator className="my-6" />

            {/* Enhanced Language Selector */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {tr.settings}
              </h4>
              
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-14 text-base font-medium rounded-xl hover:bg-primary/10 transition-all duration-200"
                  onClick={() => setActiveSection(activeSection === 'language' ? null : 'language')}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-500/10 rounded-lg mr-4">
                      <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {tr.language}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-full">
                      <span className="text-lg">
                        {languages.find(l => l.code === language)?.flag}
                      </span>
                      <span className="text-sm font-medium">
                        {languages.find(l => l.code === language)?.code?.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        activeSection === 'language' && "rotate-180"
                      )} 
                    />
                  </div>
                </Button>

                {/* Enhanced Language Options */}
                <div className={cn(
                  "overflow-hidden transition-all duration-400 ease-out",
                  activeSection === 'language' ? "max-h-48 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}>
                  <div className="ml-4 space-y-1 p-2 bg-muted rounded-xl border border-border">
                    {languages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={language === lang.code ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm h-12 rounded-lg transition-all duration-200"
                        onClick={() => {
                          setLanguage(lang.code as 'vi' | 'en' | 'ja');
                          setActiveSection(null);
                        }}
                      >
                        <span className="text-lg mr-3">{lang.flag}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</span>
                        </div>
                        {language === lang.code && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Promotional Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {tr.specialOffers}
              </h4>
              
              {/* Promo Card */}
              <div className="mx-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">{tr.firstOrderDiscount}</h5>
                    <p className="text-xs text-muted-foreground">{tr.firstOrderDescription}</p>
                  </div>
                </div>
                <Link to="/sale" onClick={handleLinkClick}>
                  <Button size="sm" className="w-full text-xs font-semibold">
                    {tr.shopNow}
                  </Button>
                </Link>
              </div>

              {/* Newsletter Signup */}
              <div className="mx-3 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-secondary/50 rounded-full">
                    <Bell className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">{tr.stayUpdated}</h5>
                    <p className="text-xs text-muted-foreground">{tr.newsletterDescription}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  {tr.subscribeNewsletter}
                </Button>
              </div>
            </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="p-6 border-t border-border bg-gradient-to-r from-muted/30 to-muted/10 flex-shrink-0">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-lg tracking-tight">KOSHIRO</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">© 2024 Koshiro Fashion</p>
                <p className="flex items-center justify-center space-x-1">
                  <span>{tr.madeWithLove}</span>
                  <span className="text-red-500 animate-pulse">❤️</span>
                  <span>{tr.inJapan}</span>
                </p>
                <p className="text-primary/70">{tr.authenticJapanese}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedMobileMenu;
