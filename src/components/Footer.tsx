import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, Category } from "@/lib/api";

const Footer = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories({ isActive: true });
        // response returns { categories: Category[] }
        const categoriesData = response.categories || [];
        setCategories(categoriesData.slice(0, 6)); // Show only first 6 categories
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);
  
  const translations = {
    en: {
      brand: "KOSHIRO",
      description: "Authentic Japanese fashion for the modern soul",
      quickLinks: "Quick Links",
      categories: "Categories",
      support: "Support",
      contact: "Contact",
      about: "About Us",
      shipping: "Shipping Info",
      returns: "Returns",
      faq: "FAQ",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      sizeGuide: "Size Guide",
      rights: "All rights reserved.",
      newsletter: "Subscribe to our newsletter for latest updates",
      subscribe: "Subscribe"
    },
    vi: {
      brand: "KOSHIRO",
      description: "Thời trang Nhật Bản chính hãng cho tâm hồn hiện đại",
      quickLinks: "Liên Kết Nhanh",
      categories: "Danh Mục",
      support: "Hỗ Trợ",
      contact: "Liên Hệ",
      about: "Về Chúng Tôi",
      shipping: "Thông Tin Vận Chuyển",
      returns: "Đổi Trả",
      faq: "Câu Hỏi Thường Gặp",
      privacy: "Chính Sách Bảo Mật",
      terms: "Điều Khoản Dịch Vụ",
      sizeGuide: "Hướng Dẫn Kích Thước",
      rights: "Tất cả quyền được bảo lưu.",
      newsletter: "Đăng ký nhận bản tin để cập nhật tin tức mới nhất",
      subscribe: "Đăng Ký"
    },
    ja: {
      brand: "KOSHIRO",
      description: "現代の魂のための本格的な日本のファッション",
      quickLinks: "クイックリンク",
      categories: "カテゴリー",
      support: "サポート",
      contact: "お問い合わせ",
      about: "会社概要",
      shipping: "配送情報",
      returns: "返品",
      faq: "よくある質問",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      sizeGuide: "サイズガイド",
      rights: "すべての権利が保護されています。",
      newsletter: "最新情報をお届けするニュースレターに登録",
      subscribe: "登録"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Helper function to get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi': return category.nameEn || category.name; // Using nameEn for Vietnamese as fallback
      case 'ja': return category.nameJa || category.name;
      default: return category.nameEn || category.name;
    }
  };

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-2">{t.brand}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t.description}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t.quickLinks}</h4>
            <nav className="space-y-3">
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.about}
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.contact}
              </Link>
              <Link to="/size-guide" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.sizeGuide}
              </Link>
              <Link to="/info/shipping-info" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.shipping}
              </Link>
              <Link to="/info/returns" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.returns}
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t.categories}</h4>
            <nav className="space-y-3">
              {categories.map((category) => (
                <Link 
                  key={category._id}
                  to={`/category/${category.slug}`} 
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {getCategoryName(category)}
                </Link>
              ))}
              <Link to="/categories" className="block text-primary hover:text-primary/80 transition-colors font-medium">
                View All Categories →
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t.support}</h4>
            <nav className="space-y-3">
              <Link to="/order-tracking" className="block text-muted-foreground hover:text-primary transition-colors">
                {language === 'vi' ? 'Theo Dõi Đơn Hàng' : language === 'ja' ? '注文追跡' : 'Order Tracking'}
              </Link>
              <Link to="/reviews" className="block text-muted-foreground hover:text-primary transition-colors">
                {language === 'vi' ? 'Đánh Giá Khách Hàng' : language === 'ja' ? 'お客様のレビュー' : 'Customer Reviews'}
              </Link>
              <Link to="/info/faq" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.faq}
              </Link>
              <Link to="/privacy-policy" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.privacy}
              </Link>
              <Link to="/info/terms-of-service" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.terms}
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © 2024 {t.brand}. {t.rights}
          </p>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">🇯🇵</span>
            <span className="text-sm text-muted-foreground">Authentic Japanese Fashion</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;