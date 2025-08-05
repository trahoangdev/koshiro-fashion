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
    <div className="min-h-screen flex items-center justify-center bg-gradient-zen">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-8xl font-bold text-primary mb-4">{t.title}</h1>
        <h2 className="text-2xl font-semibold mb-4">{t.subtitle}</h2>
        <p className="text-muted-foreground mb-8">{t.description}</p>
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t.returnHome}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
