import { Separator } from "@/components/ui/separator";

interface FooterProps {
  currentLanguage: string;
}

export const Footer = ({ currentLanguage }: FooterProps) => {
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
      rights: "すべての権利が保護されています。",
      newsletter: "最新情報をお届けするニュースレターに登録",
      subscribe: "登録"
    }
  };

  const t = translations[currentLanguage as keyof typeof translations] || translations.en;

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
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.about}
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.contact}
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.shipping}
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.returns}
              </a>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t.categories}</h4>
            <nav className="space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Kimono
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Yukata
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Hakama
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Accessories
              </a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">{t.support}</h4>
            <nav className="space-y-3">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.faq}
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.privacy}
              </a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                {t.terms}
              </a>
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