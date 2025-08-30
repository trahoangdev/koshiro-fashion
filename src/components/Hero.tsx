import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const handleExplore = () => {
    // Scroll to Collection section
    const collectionSection = document.querySelector('[data-section="collection"]');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const translations = {
    en: {
      title: "Elevate Your Style with KOSHIRO",
      subtitle: "Japanese-inspired fashion for the new generation. Redefine your wardrobe with minimal, bold, and timeless pieces.",
      cta: "Explore Now"
    },
    vi: {
      title: "Nâng Tầm Phong Cách Cùng KOSHIRO",
      subtitle: "Thời trang lấy cảm hứng từ Nhật Bản dành cho thế hệ mới. Tái định nghĩa tủ đồ của bạn với những thiết kế tối giản, cá tính và vượt thời gian.",
      cta: "Khám Phá Ngay"
    },
    ja: {
      title: "KOSHIROでスタイルを格上げ",
      subtitle: "新世代のための日本発インスパイアファッション。ミニマルで大胆、そして時代を超えるデザインであなたのワードローブを再定義。",
      cta: "今すぐ見る"
    }
  };
  const t = translations[language as keyof typeof translations] || translations.en;
  return <section className="relative min-h-[70vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroImage})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            {t.subtitle}
          </p>
          <Button 
            variant="ink" 
            size="xl" 
            className="shadow-strong text-slate-50 hover:scale-105 transition-transform duration-200"
            onClick={handleExplore}
          >
            {t.cta}
          </Button>
        </div>
      </div>
    </section>;
};

export default Hero;