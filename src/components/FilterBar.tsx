import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterBarProps {
  selectedCategory: string;
  selectedPriceRange: string;
  selectedColor: string;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: string) => void;
  onColorChange: (color: string) => void;
  onClearFilters: () => void;
}

const FilterBar = ({
  selectedCategory,
  selectedPriceRange,
  selectedColor,
  onCategoryChange,
  onPriceRangeChange,
  onColorChange,
  onClearFilters
}: FilterBarProps) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      allCategories: "All Categories",
      tops: "Tops",
      bottoms: "Bottoms",
      accessories: "Accessories",
      kimono: "Kimono",
      yukata: "Yukata",
      hakama: "Hakama",
      priceRange: "Price Range",
      allPrices: "All Prices",
      under50: "Under $50",
      range50to100: "$50 - $100",
      over100: "Over $100",
      color: "Color",
      allColors: "All Colors",
      clearFilters: "Clear Filters"
    },
    vi: {
      allCategories: "Tất Cả Danh Mục",
      tops: "Áo",
      bottoms: "Quần",
      accessories: "Phụ Kiện",
      kimono: "Kimono",
      yukata: "Yukata",
      hakama: "Hakama",
      priceRange: "Khoảng Giá",
      allPrices: "Tất Cả Giá",
      under50: "Dưới $50",
      range50to100: "$50 - $100",
      over100: "Trên $100",
      color: "Màu Sắc",
      allColors: "Tất Cả Màu",
      clearFilters: "Xóa Bộ Lọc"
    },
    ja: {
      allCategories: "すべてのカテゴリ",
      tops: "トップス",
      bottoms: "ボトムス",
      accessories: "アクセサリー",
      kimono: "着物",
      yukata: "浴衣",
      hakama: "袴",
      priceRange: "価格帯",
      allPrices: "すべての価格",
      under50: "$50未満",
      range50to100: "$50 - $100",
      over100: "$100以上",
      color: "色",
      allColors: "すべての色",
      clearFilters: "フィルターをクリア"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const hasActiveFilters = selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedColor !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4 p-6 bg-card rounded-lg border shadow-soft">
      {/* Category Filter */}
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allCategories}</SelectItem>
          <SelectItem value="tops">{t.tops}</SelectItem>
          <SelectItem value="bottoms">{t.bottoms}</SelectItem>
          <SelectItem value="accessories">{t.accessories}</SelectItem>
          <SelectItem value="kimono">{t.kimono}</SelectItem>
          <SelectItem value="yukata">{t.yukata}</SelectItem>
          <SelectItem value="hakama">{t.hakama}</SelectItem>
        </SelectContent>
      </Select>

      {/* Price Range Filter */}
      <Select value={selectedPriceRange} onValueChange={onPriceRangeChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t.priceRange} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allPrices}</SelectItem>
          <SelectItem value="under50">{t.under50}</SelectItem>
          <SelectItem value="50-100">{t.range50to100}</SelectItem>
          <SelectItem value="over100">{t.over100}</SelectItem>
        </SelectContent>
      </Select>

      {/* Color Filter */}
      <Select value={selectedColor} onValueChange={onColorChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t.color} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allColors}</SelectItem>
          <SelectItem value="black">Black</SelectItem>
          <SelectItem value="white">White</SelectItem>
          <SelectItem value="beige">Beige</SelectItem>
          <SelectItem value="brown">Brown</SelectItem>
          <SelectItem value="navy">Navy</SelectItem>
          <SelectItem value="natural">Natural</SelectItem>
          <SelectItem value="olive">Olive</SelectItem>
          <SelectItem value="khaki">Khaki</SelectItem>
          <SelectItem value="grey">Grey</SelectItem>
          <SelectItem value="pink">Pink</SelectItem>
          <SelectItem value="purple">Purple</SelectItem>
          <SelectItem value="green">Green</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
          <SelectItem value="burgundy">Burgundy</SelectItem>
          <SelectItem value="gold">Gold</SelectItem>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="emerald">Emerald</SelectItem>
          <SelectItem value="coral">Coral</SelectItem>
          <SelectItem value="turquoise">Turquoise</SelectItem>
          <SelectItem value="yellow">Yellow</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          {t.clearFilters}
        </Button>
      )}

      {/* Active Filters Display */}
      <div className="flex gap-2 ml-auto">
        {selectedCategory !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {t[selectedCategory as keyof typeof t]}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onCategoryChange('all')} />
          </Badge>
        )}
        {selectedPriceRange !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {selectedPriceRange === 'under50' ? t.under50 : 
             selectedPriceRange === '50-100' ? t.range50to100 : t.over100}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onPriceRangeChange('all')} />
          </Badge>
        )}
        {selectedColor !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {selectedColor}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onColorChange('all')} />
          </Badge>
        )}
      </div>
    </div>
  );
};

export default FilterBar;