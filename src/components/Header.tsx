import { useState } from "react";
import { Search, ShoppingBag, Menu, X, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

interface HeaderProps {
  cartItemsCount: number;
  onSearch: (query: string) => void;
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
  onCartClick: () => void;
  showCartPanel: boolean;
}

export const Header = ({ cartItemsCount, onSearch, onLanguageChange, currentLanguage, onCartClick, showCartPanel }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
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
      cart: "Cart"
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
      cart: "Giỏ hàng"
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
      cart: "カート"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-medium">
                {t.categories}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t.tops}</DropdownMenuItem>
              <DropdownMenuItem>{t.bottoms}</DropdownMenuItem>
              <DropdownMenuItem>{t.accessories}</DropdownMenuItem>
              <DropdownMenuItem>{t.kimono}</DropdownMenuItem>
              <DropdownMenuItem>{t.yukata}</DropdownMenuItem>
              <DropdownMenuItem>{t.hakama}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" className="font-medium">{t.sale}</Button>
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
              <DropdownMenuItem onClick={() => onLanguageChange('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLanguageChange('vi')}>
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLanguageChange('ja')}>
                日本語
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Account */}
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-4 w-4" />
            </Button>
          </Link>

          {/* Cart */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingBag className="h-4 w-4" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Button>

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