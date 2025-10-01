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
        const response = await api.getCategories();
        const categoriesData = response.categories || [];
        setCategories(categoriesData.slice(0, 4)); // Show only first 4 categories
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
      shipping: "Thông Tin Giao Hàng",
      returns: "Đổi Trả",
      faq: "Câu Hỏi Thường Gặp",
      privacy: "Chính Sách Bảo Mật",
      terms: "Điều Khoản Dịch Vụ",
      sizeGuide: "Hướng Dẫn Kích Thước",
      rights: "Tất cả quyền được bảo lưu.",
      newsletter: "Đăng ký nhận bản tin để cập nhật mới nhất",
      subscribe: "Đăng Ký"
    },
    ja: {
      brand: "KOSHIRO",
      description: "現代の魂のための本格的な日本ファッション",
      quickLinks: "クイックリンク",
      categories: "カテゴリー",
      support: "サポート",
      contact: "お問い合わせ",
      about: "私たちについて",
      shipping: "配送情報",
      returns: "返品",
      faq: "よくある質問",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      sizeGuide: "サイズガイド",
      rights: "全著作権所有。",
      newsletter: "最新の更新情報をニュースレターで購読",
      subscribe: "購読"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Helper function to get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi':
        return category.name; // Vietnamese uses default name
      case 'ja':
        return category.nameJa || category.name;
      default:
        return category.nameEn || category.name;
    }
  };

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6 pt-7">
            <div>
              {/* Logo with Brand Text */}
              <div className="mb-4 flex justify-center lg:justify-start items-center gap-3">
                <div className="relative">
                  {/* Light mode: dark logo, Dark mode: light logo */}
                  <img
                    src="/koshino_logo_dark.png"
                    alt="Koshino Fashion Logo"
                    className="h-10 w-auto opacity-90 hover:opacity-100 transition-all duration-300 dark:hidden"
                    loading="lazy"
                  />
                  <img
                    src="/koshino_logo.png"
                    alt="Koshino Fashion Logo"
                    className="h-10 w-auto opacity-90 hover:opacity-100 transition-all duration-300 hidden dark:block"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-2xl font-bold text-primary">{t.brand}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed text-center lg:text-left">
                {t.description}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 pt-7">
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
              <Link to="/order-tracking" className="block text-muted-foreground hover:text-primary transition-colors">
                {language === 'vi' ? 'Theo Dõi Đơn Hàng' : language === 'ja' ? '注文追跡' : 'Order Tracking'}
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-6 pt-7">
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
          <div className="space-y-6 pt-7">
            <h4 className="text-lg font-semibold">{t.support}</h4>
            <nav className="space-y-3">
              <Link to="/faq" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.faq}
              </Link>
              <Link to="/privacy-policy" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.privacy}
              </Link>
              <Link to="/terms-of-service" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.terms}
              </Link>
            </nav>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Copyright */}
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 KOSHIRO Fashion. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;