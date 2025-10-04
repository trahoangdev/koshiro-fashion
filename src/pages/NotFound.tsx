import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "404",
      subtitle: "Oops! Page not found",
      description: "The page you're looking for doesn't exist or has been moved.",
      returnHome: "Return to Home",
      errorLog: "404 Error: User attempted to access non-existent route:"
    },
    vi: {
      title: "404",
      subtitle: "Ôi! Không tìm thấy trang",
      description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.",
      returnHome: "Quay Về Trang Chủ",
      errorLog: "Lỗi 404: Người dùng cố gắng truy cập đường dẫn không tồn tại:"
    },
    ja: {
      title: "404",
      subtitle: "おっと！ページが見つかりません",
      description: "お探しのページは存在しないか、移動されました。",
      returnHome: "ホームに戻る",
      errorLog: "404エラー：ユーザーが存在しないルートにアクセスしようとしました："
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    console.error(
      t.errorLog,
      location.pathname
    );
  }, [location.pathname, t.errorLog]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Banner Background */}
      <div className="absolute inset-0">
        <img 
          src="/images/banners/banner-05.png" 
          alt="404 Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
      </div>
      
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto px-6">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-white to-stone-200 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            {t.title}
          </h1>
        </div>
        
        {/* Main Content */}
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-white drop-shadow-lg">
            {t.subtitle}
          </h2>
          
          <p className="text-lg text-white/90 leading-relaxed drop-shadow-md">
            {t.description}
          </p>
          
          {/* Action Button */}
          <div className="pt-4">
            <Link to="/">
              <Button 
                size="lg"
                className="flex items-center gap-3 bg-white/90 hover:bg-white text-stone-800 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-white/20"
              >
                <Home className="h-5 w-5" />
                {t.returnHome}
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default NotFound;
