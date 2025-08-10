import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, User, Globe, Heart, LogOut, Settings, Package, CreditCard, MapPin, Bell, LogIn, UserPlus, GitCompare, ChevronDown } from "lucide-react";
import EnhancedMobileMenu from "./EnhancedMobileMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, Product, Category } from "@/lib/api";
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
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  cartItemsCount: number;
  onSearch: (query: string) => void;
  refreshWishlistTrigger?: number; // Add this to trigger wishlist count refresh
}

const Header = ({ cartItemsCount, onSearch, refreshWishlistTrigger }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist count
  useEffect(() => {
    const loadWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.getWishlist();
          // Handle different response formats
          let wishlistData: Product[] = [];
          if (Array.isArray(response)) {
            wishlistData = response;
          } else if (response && typeof response === 'object') {
            const responseObj = response as Record<string, unknown>;
            if (responseObj.items && Array.isArray(responseObj.items)) {
              wishlistData = responseObj.items as Product[];
            } else if (responseObj.data && Array.isArray(responseObj.data)) {
              wishlistData = responseObj.data as Product[];
            } else if (responseObj.wishlist && Array.isArray(responseObj.wishlist)) {
              wishlistData = responseObj.wishlist as Product[];
            }
          }
          setWishlistCount(wishlistData.length);
        } catch (error) {
          console.error("Error loading wishlist count:", error);
        }
      }
    };

    loadWishlistCount();
  }, [isAuthenticated, refreshWishlistTrigger]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const response = await api.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryName = (category: Category) => {
    switch (language) {
      case "vi":
        return category.name || category.nameEn || category.name;
      case "ja":
        return category.nameJa || category.name;
      default:
        return category.name;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-10">
        {/* Logo - Golden ratio proportions */}
        <div className="flex items-center min-w-[130px]">
          <Link to="/">
            <h1 className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors">
              KOSHIRO
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation - Enhanced with golden ratio spacing */}
        <nav className="hidden lg:flex items-center space-x-12">
          <Link to="/categories">
            <Button variant="ghost" className="font-medium text-base h-12 px-6 hover:bg-primary/10 transition-all duration-200">
              {t('categories')}
            </Button>
          </Link>
          <Link to="/sale">
            <Button variant="ghost" className="font-medium text-base h-12 px-6 hover:bg-primary/10 transition-all duration-200">
              {t('sale')}
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="font-medium text-base h-12 px-6 hover:bg-primary/10 transition-all duration-200">
              {t('about')}
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" className="font-medium text-base h-12 px-6 hover:bg-primary/10 transition-all duration-200">
              {t('contact')}
            </Button>
          </Link>
        </nav>

        {/* Right Section - Search, User, Cart */}
        <div className="flex items-center space-x-6">
          {/* Enhanced Search Bar */}
          <div className="hidden md:block relative">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 text-base rounded-full border-2 border-border focus:border-primary transition-all duration-300 bg-muted/50 hover:bg-muted"
              />
            </form>
          </div>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage("vi")}>
                <span className="mr-2">🇻🇳</span>
                Tiếng Việt
                {language === "vi" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                <span className="mr-2">🇺🇸</span>
                English
                {language === "en" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ja")}>
                <span className="mr-2">🇯🇵</span>
                日本語
                {language === "ja" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>{t('orders')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/addresses" className="cursor-pointer">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{t('addresses')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/payment" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>{t('payment')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>{t('wishlist')}</span>
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 w-5 text-xs p-0 flex items-center justify-center rounded-full">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/compare" className="cursor-pointer">
                    <GitCompare className="mr-2 h-4 w-4" />
                    <span>{t('compare')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-9 px-4">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-9 px-4">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 text-xs p-0 flex items-center justify-center rounded-full"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
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