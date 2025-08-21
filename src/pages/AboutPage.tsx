import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "About KOSHIRO",
      subtitle: "Japanese Fashion Excellence",
      description: "We bring the finest Japanese fashion to the world, combining traditional craftsmanship with modern design.",
      story: {
        title: "Our Story",
        content: "Founded with a passion for Japanese culture and fashion, KOSHIRO has been bringing authentic Japanese style to fashion enthusiasts worldwide. Our journey began with a simple mission: to share the beauty and elegance of Japanese fashion with the world."
      },
      mission: {
        title: "Our Mission",
        content: "To provide high-quality, authentic Japanese fashion that celebrates both tradition and innovation. We believe in sustainable fashion that respects both the environment and the artisans who create our pieces."
      },
      values: {
        title: "Our Values",
        quality: "Quality Craftsmanship",
        authenticity: "Authentic Japanese Design",
        sustainability: "Sustainable Fashion",
        community: "Community Focus"
      },
      stats: {
        customers: "Happy Customers",
        countries: "Countries Served",
        products: "Quality Products",
        years: "Years of Excellence"
      },
      cta: "Explore Our Collection"
    },
    vi: {
      title: "Về KOSHIRO",
      subtitle: "Sự Xuất Sắc Của Thời Trang Nhật Bản",
      description: "Chúng tôi mang đến thời trang Nhật Bản tinh túy nhất cho thế giới, kết hợp nghề thủ công truyền thống với thiết kế hiện đại.",
      story: {
        title: "Câu Chuyện Của Chúng Tôi",
        content: "Được thành lập với niềm đam mê văn hóa và thời trang Nhật Bản, KOSHIRO đã mang phong cách Nhật Bản chân chính đến những người yêu thời trang trên toàn thế giới. Hành trình của chúng tôi bắt đầu với sứ mệnh đơn giản: chia sẻ vẻ đẹp và sự thanh lịch của thời trang Nhật Bản với thế giới."
      },
      mission: {
        title: "Sứ Mệnh Của Chúng Tôi",
        content: "Cung cấp thời trang Nhật Bản chất lượng cao, chân chính, tôn vinh cả truyền thống và sự đổi mới. Chúng tôi tin vào thời trang bền vững, tôn trọng cả môi trường và những nghệ nhân tạo ra các tác phẩm của chúng tôi."
      },
      values: {
        title: "Giá Trị Của Chúng Tôi",
        quality: "Nghề Thủ Công Chất Lượng",
        authenticity: "Thiết Kế Nhật Bản Chân Chính",
        sustainability: "Thời Trang Bền Vững",
        community: "Tập Trung Cộng Đồng"
      },
      stats: {
        customers: "Khách Hàng Hài Lòng",
        countries: "Quốc Gia Phục Vụ",
        products: "Sản Phẩm Chất Lượng",
        years: "Năm Xuất Sắc"
      },
      cta: "Khám Phá Bộ Sưu Tập"
    },
    ja: {
      title: "KOSHIROについて",
      subtitle: "日本のファッションの卓越性",
      description: "伝統的な職人技とモダンデザインを組み合わせ、最高品質の日本のファッションを世界にお届けします。",
      story: {
        title: "私たちの物語",
        content: "日本の文化とファッションへの情熱を持って設立されたKOSHIROは、世界中のファッション愛好家に本格的な日本のスタイルをお届けしています。私たちの旅は、日本のファッションの美しさと優雅さを世界と共有するというシンプルな使命から始まりました。"
      },
      mission: {
        title: "私たちの使命",
        content: "伝統と革新の両方を称える高品質で本格的な日本のファッションを提供することです。私たちは、環境と私たちの作品を作る職人の両方を尊重する持続可能なファッションを信じています。"
      },
      values: {
        title: "私たちの価値観",
        quality: "品質の職人技",
        authenticity: "本格的な日本のデザイン",
        sustainability: "持続可能なファッション",
        community: "コミュニティ重視"
      },
      stats: {
        customers: "満足したお客様",
        countries: "サービス提供国",
        products: "品質製品",
        years: "卓越性の年数"
      },
      cta: "コレクションを探索"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header
        cartItemsCount={0}
        onSearch={() => {}}
      />

      <main className="py-16">
        <div className="container space-y-16">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-2xl">
            {/* Banner Background */}
            <div className="absolute inset-0">
              <img 
                src="/images/categories/kimono.jpg" 
                alt="About Us Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-12 md:p-16 text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-white/90">
                {t.subtitle}
              </p>
              <p className="text-lg max-w-3xl mx-auto text-white/80">
                {t.description}
              </p>
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">{t.stats.customers}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">{t.stats.countries}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">{t.stats.products}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5+</div>
              <div className="text-muted-foreground">{t.stats.years}</div>
            </div>
          </section>

          {/* Story & Mission Section */}
          <section className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">{t.story.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.story.content}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">{t.mission.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.mission.content}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Values Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">{t.values.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t.values.quality}</h3>
                  <p className="text-sm text-muted-foreground">
                    Every piece is crafted with attention to detail and quality
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t.values.authenticity}</h3>
                  <p className="text-sm text-muted-foreground">
                    Authentic Japanese design and cultural heritage
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t.values.sustainability}</h3>
                  <p className="text-sm text-muted-foreground">
                    Environmentally conscious and sustainable practices
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{t.values.community}</h3>
                  <p className="text-sm text-muted-foreground">
                    Building a global community of fashion enthusiasts
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Ready to Experience Japanese Fashion?</h2>
                <p className="text-lg mb-8 opacity-90">
                  Discover our collection and find your perfect piece
                </p>
                <Link to="/">
                  <Button size="lg" variant="secondary">
                    {t.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage; 