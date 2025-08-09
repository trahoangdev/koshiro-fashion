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
  Globe
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
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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

  const categories = [
    { id: 'shirts', name: 'Shirts', slug: 'shirts' },
    { id: 'pants', name: 'Pants', slug: 'pants' },
    { id: 'dresses', name: 'Dresses', slug: 'dresses' },
    { id: 'accessories', name: 'Accessories', slug: 'accessories' },
    { id: 'shoes', name: 'Shoes', slug: 'shoes' },
    { id: 'bags', name: 'Bags', slug: 'bags' }
  ];

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-background border-l shadow-2xl z-50 transition-transform duration-300 ease-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center space-x-3">
            <Menu className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Menu</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Search */}
          <div className="p-4 border-b">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
          </div>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/cart" onClick={handleLinkClick}>
                  <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg hover:bg-muted transition-colors">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Cart</span>
                    {cartItemsCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Link to="/wishlist" onClick={handleLinkClick}>
                  <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg hover:bg-muted transition-colors">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Wishlist</span>
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                        {wishlistCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b space-y-3">
              <Link to="/login" onClick={handleLinkClick}>
                <Button className="w-full justify-start" size="lg">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={handleLinkClick}>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              <Link to="/" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-12">
                  <Home className="h-5 w-5 mr-3" />
                  Home
                </Button>
              </Link>

              {/* Categories with Collapsible */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-12"
                  onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
                >
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    Categories
                  </div>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      activeSection === 'categories' && "rotate-90"
                    )} 
                  />
                </Button>
                
                {/* Categories Submenu */}
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  activeSection === 'categories' ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="ml-6 mt-2 space-y-1">
                    {categories.map((category) => (
                      <Link key={category.id} to={`/category/${category.slug}`} onClick={handleLinkClick}>
                        <Button variant="ghost" className="w-full justify-start text-sm h-10">
                          {category.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link to="/sale" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-12">
                  <Package className="h-5 w-5 mr-3" />
                  Sale
                  <Badge variant="destructive" className="ml-auto">Hot</Badge>
                </Button>
              </Link>

              <Link to="/about" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-12">
                  <Settings className="h-5 w-5 mr-3" />
                  About
                </Button>
              </Link>

              <Link to="/contact" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start h-12">
                  <MapPin className="h-5 w-5 mr-3" />
                  Contact
                </Button>
              </Link>
            </div>

            <Separator className="my-4" />

            {/* User Menu (if authenticated) */}
            {isAuthenticated && (
              <div className="space-y-1">
                <Link to="/profile" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12">
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Button>
                </Link>

                <Link to="/profile/orders" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12">
                    <Package className="h-5 w-5 mr-3" />
                    Orders
                  </Button>
                </Link>

                <Link to="/profile/addresses" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12">
                    <MapPin className="h-5 w-5 mr-3" />
                    Addresses
                  </Button>
                </Link>

                <Link to="/profile/payment" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12">
                    <CreditCard className="h-5 w-5 mr-3" />
                    Payment Methods
                  </Button>
                </Link>

                <Link to="/compare" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12">
                    <GitCompare className="h-5 w-5 mr-3" />
                    Compare
                  </Button>
                </Link>

                <Separator className="my-2" />

                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            )}

            <Separator className="my-4" />

            {/* Language Selector */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between h-12"
                onClick={() => setActiveSection(activeSection === 'language' ? null : 'language')}
              >
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3" />
                  Language
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      activeSection === 'language' && "rotate-90"
                    )} 
                  />
                </div>
              </Button>

              {/* Language Options */}
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                activeSection === 'language' ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="ml-6 mt-2 space-y-1">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-10"
                      onClick={() => {
                        setLanguage(lang.code as 'vi' | 'en' | 'ja');
                        setActiveSection(null);
                      }}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30">
            <div className="text-center text-xs text-muted-foreground">
              <p>© 2024 Koshiro Fashion</p>
              <p className="mt-1">Made with ❤️ in Japan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedMobileMenu;
