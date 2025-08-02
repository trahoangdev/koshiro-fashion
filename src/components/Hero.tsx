import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { language } = useLanguage();
  const translations = {
    en: {
      title: "Timeless Japanese Fashion",
      subtitle: "Discover the beauty of minimalist design and exceptional craftsmanship",
      cta: "Shop Collection"
    },
    vi: {
      title: "Thời Trang Nhật Bản Vượt Thời Gian",
      subtitle: "Khám phá vẻ đẹp của thiết kế tối giản và nghề thủ công đặc biệt",
      cta: "Xem Bộ Sưu Tập"
    },
    ja: {
      title: "時代を超えた日本のファッション",
      subtitle: "ミニマルなデザインと卓越した職人技の美しさを発見してください",
      cta: "コレクションを見る"
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
          <Button variant="ink" size="xl" className="shadow-strong text-slate-50">
            {t.cta}
          </Button>
        </div>
      </div>
    </section>;
};

export default Hero;