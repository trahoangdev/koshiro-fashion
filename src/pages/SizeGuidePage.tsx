import { useState, useEffect } from "react";
import { Ruler, Download, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SizeDataItem {
  size: string;
  height?: string;
  waist: string;
  length: string;
  chest?: string;
  sleeve?: string;
  hips?: string;
  inseam?: string;
}

// Size guide data mapping for different categories
const getSizeDataForCategory = (categoryName: string): SizeDataItem[] => {
  const categoryLower = categoryName.toLowerCase();
  
  if (categoryLower.includes('shirt') || categoryLower.includes('top') || categoryLower.includes('áo')) {
    return [
      { size: "S", chest: "86-91", waist: "71-76", length: "65-70", sleeve: "58-63" },
      { size: "M", chest: "91-96", waist: "76-81", length: "70-75", sleeve: "63-68" },
      { size: "L", chest: "96-101", waist: "81-86", length: "75-80", sleeve: "68-73" },
      { size: "XL", chest: "101-106", waist: "86-91", length: "80-85", sleeve: "73-78" }
    ];
  }
  
  if (categoryLower.includes('pant') || categoryLower.includes('quần') || categoryLower.includes('bottom')) {
    return [
      { size: "S", waist: "71-76", hips: "91-96", inseam: "75-80", length: "95-100" },
      { size: "M", waist: "76-81", hips: "96-101", inseam: "80-85", length: "100-105" },
      { size: "L", waist: "81-86", hips: "101-106", inseam: "85-90", length: "105-110" },
      { size: "XL", waist: "86-91", hips: "106-111", inseam: "90-95", length: "110-115" }
    ];
  }
  
  if (categoryLower.includes('hakama') || categoryLower.includes('袴')) {
    return [
      { size: "S", height: "160-170", waist: "71-81", length: "95-105" },
      { size: "M", height: "170-180", waist: "81-91", length: "105-115" },
      { size: "L", height: "175-185", waist: "86-96", length: "110-120" },
      { size: "XL", height: "180-190", waist: "91-101", length: "110-115" }
    ];
  }
  
  if (categoryLower.includes('accessory') || categoryLower.includes('phụ kiện') || categoryLower.includes('アクセサリー')) {
    return [
      { size: "S", waist: "71-76", length: "95-100" },
      { size: "M", waist: "76-81", length: "100-105" },
      { size: "L", waist: "81-86", length: "105-110" },
      { size: "XL", waist: "86-91", length: "110-115" }
    ];
  }
  
  // Default size guide for unknown categories
  return [
    { size: "S", chest: "86-91", waist: "71-76", length: "65-70" },
    { size: "M", chest: "91-96", waist: "76-81", length: "70-75" },
    { size: "L", chest: "96-101", waist: "81-86", length: "75-80" },
    { size: "XL", chest: "101-106", waist: "86-91", length: "80-85" }
  ];
};

// Get category type for rendering appropriate columns
const getCategoryType = (categoryName: string): string => {
  const categoryLower = categoryName.toLowerCase();
  
  if (categoryLower.includes('hakama') || categoryLower.includes('袴')) {
    return "hakama";
  }
  
  if (categoryLower.includes('shirt') || categoryLower.includes('top') || categoryLower.includes('áo')) {
    return "tops";
  }
  
  if (categoryLower.includes('pant') || categoryLower.includes('quần') || categoryLower.includes('bottom')) {
    return "bottoms";
  }
  
  if (categoryLower.includes('accessory') || categoryLower.includes('phụ kiện') || categoryLower.includes('アクセサリー')) {
    return "accessories";
  }
  
  return "default";
};

export default function SizeGuidePage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  const translations = {
    en: {
      title: "Size Guide",
      subtitle: "Find your perfect fit with our comprehensive size guide",
      howToMeasure: "How to Measure",
      chest: "Chest",
      waist: "Waist",
      hips: "Hips",
      length: "Length",
      sleeve: "Sleeve",
      inseam: "Inseam",
      height: "Height",
      download: "Download Size Chart",
      tips: "Sizing Tips",
      tip1: "Measure yourself while wearing light clothing",
      tip2: "Keep the measuring tape snug but not tight",
      tip3: "For the best fit, measure your body, not your clothes",
      tip4: "If you're between sizes, we recommend sizing up",
      tip5: "Hakama sizing is based on your height and waist measurement",
      size: "Size",
      measurements: "Measurements",
      cm: "cm",
      inches: "inches",
      loading: "Loading categories...",
      error: "Failed to load categories",
      oneSize: "One Size",
      accessoriesNote: "Accessories are typically one-size-fits-all or come in standard sizes."
    },
    vi: {
      title: "Hướng Dẫn Kích Thước",
      subtitle: "Tìm kích thước hoàn hảo với hướng dẫn chi tiết của chúng tôi",
      howToMeasure: "Cách Đo",
      chest: "Ngực",
      waist: "Eo",
      hips: "Hông",
      length: "Chiều Dài",
      sleeve: "Tay Áo",
      inseam: "Đường May Trong",
      height: "Chiều Cao",
      download: "Tải Bảng Kích Thước",
      tips: "Mẹo Chọn Kích Thước",
      tip1: "Đo khi mặc quần áo mỏng",
      tip2: "Giữ thước đo vừa khít nhưng không quá chặt",
      tip3: "Để có kích thước tốt nhất, đo cơ thể, không đo quần áo",
      tip4: "Nếu bạn ở giữa hai kích thước, chúng tôi khuyên nên chọn size lớn hơn",
      tip5: "Kích thước Hakama dựa trên chiều cao và số đo eo",
      size: "Kích Thước",
      measurements: "Số Đo",
      cm: "cm",
      inches: "inch",
      loading: "Đang tải danh mục...",
      error: "Không thể tải danh mục",
      oneSize: "Một Kích Thước",
      accessoriesNote: "Phụ kiện thường có một kích thước hoặc có kích thước tiêu chuẩn."
    },
    ja: {
      title: "サイズガイド",
      subtitle: "包括的なサイズガイドで完璧なフィットを見つけましょう",
      howToMeasure: "測定方法",
      chest: "胸囲",
      waist: "ウエスト",
      hips: "ヒップ",
      length: "長さ",
      sleeve: "袖丈",
      inseam: "股下",
      height: "身長",
      download: "サイズチャートをダウンロード",
      tips: "サイズ選びのコツ",
      tip1: "薄手の服を着て測定してください",
      tip2: "メジャーはきつすぎず、ゆるすぎずに保ってください",
      tip3: "最適なフィットのため、服ではなく体を測定してください",
      tip4: "サイズの間にある場合は、大きいサイズをお勧めします",
      tip5: "袴のサイズは身長とウエスト測定に基づいています",
      size: "サイズ",
      measurements: "測定値",
      cm: "cm",
      inches: "インチ",
      loading: "カテゴリを読み込み中...",
      error: "カテゴリの読み込みに失敗しました",
      oneSize: "ワンサイズ",
      accessoriesNote: "アクセサリーは通常ワンサイズまたは標準サイズです。"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories({ isActive: true });
        const activeCategories = response.categories.filter(cat => cat.isActive);
        setCategories(activeCategories);
        
        // Set first category as active tab
        if (activeCategories.length > 0) {
          setActiveTab(activeCategories[0]._id);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: t.error,
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [toast, t.error]);

  // Get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi':
        return category.nameEn || category.name;
      case 'ja':
        return category.nameJa || category.name;
      default:
        return category.nameEn || category.name;
    }
  };

  const renderSizeTable = (data: SizeDataItem[], type: string) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">{t.size}</th>
            {type === "hakama" ? (
              <>
                <th className="p-3 text-left font-medium">{t.height} (cm)</th>
                <th className="p-3 text-left font-medium">{t.waist} (cm)</th>
                <th className="p-3 text-left font-medium">{t.length} (cm)</th>
              </>
            ) : type === "tops" ? (
              <>
                <th className="p-3 text-left font-medium">{t.chest} (cm)</th>
                <th className="p-3 text-left font-medium">{t.waist} (cm)</th>
                <th className="p-3 text-left font-medium">{t.length} (cm)</th>
                <th className="p-3 text-left font-medium">{t.sleeve} (cm)</th>
              </>
            ) : type === "bottoms" ? (
              <>
                <th className="p-3 text-left font-medium">{t.waist} (cm)</th>
                <th className="p-3 text-left font-medium">{t.hips} (cm)</th>
                <th className="p-3 text-left font-medium">{t.inseam} (cm)</th>
                <th className="p-3 text-left font-medium">{t.length} (cm)</th>
              </>
            ) : (
              <>
                <th className="p-3 text-left font-medium">{t.chest} (cm)</th>
                <th className="p-3 text-left font-medium">{t.waist} (cm)</th>
                <th className="p-3 text-left font-medium">{t.length} (cm)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b hover:bg-muted/30">
              <td className="p-3 font-medium">{item.size}</td>
              {type === "hakama" ? (
                <>
                  <td className="p-3">{item.height}</td>
                  <td className="p-3">{item.waist}</td>
                  <td className="p-3">{item.length}</td>
                </>
              ) : type === "tops" ? (
                <>
                  <td className="p-3">{item.chest}</td>
                  <td className="p-3">{item.waist}</td>
                  <td className="p-3">{item.length}</td>
                  <td className="p-3">{item.sleeve}</td>
                </>
              ) : type === "bottoms" ? (
                <>
                  <td className="p-3">{item.waist}</td>
                  <td className="p-3">{item.hips}</td>
                  <td className="p-3">{item.inseam}</td>
                  <td className="p-3">{item.length}</td>
                </>
              ) : (
                <>
                  <td className="p-3">{item.chest}</td>
                  <td className="p-3">{item.waist}</td>
                  <td className="p-3">{item.length}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-zen">
        <Header cartItemsCount={0} onSearch={() => {}} />
        <main className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-2xl mb-12">
            {/* Banner Background */}
            <div className="absolute inset-0">
              <img 
                src="/images/banners/banner-04.png" 
                alt="Size Guide Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-12 text-center text-white">
              <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t.subtitle}
              </p>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    {t.measurements}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.length > 0 ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        {categories.slice(0, 4).map((category) => (
                          <TabsTrigger key={category._id} value={category._id}>
                            {getCategoryName(category)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {categories.slice(0, 4).map((category) => {
                        const categoryName = getCategoryName(category);
                        const categoryType = getCategoryType(categoryName);
                        const sizeData = getSizeDataForCategory(categoryName);
                        
                        return (
                          <TabsContent key={category._id} value={category._id} className="mt-6">
                            {categoryType === "accessories" ? (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                  {t.accessoriesNote}
                                </p>
                                <Badge variant="secondary">{t.oneSize}</Badge>
                              </div>
                            ) : (
                              renderSizeTable(sizeData, categoryType)
                            )}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No categories available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* How to Measure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    {t.howToMeasure}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t.chest}</h4>
                    <p className="text-sm text-muted-foreground">
                      Measure around the fullest part of your chest, keeping the tape horizontal.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">{t.waist}</h4>
                    <p className="text-sm text-muted-foreground">
                      Measure around your natural waistline, keeping the tape comfortably loose.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">{t.hips}</h4>
                    <p className="text-sm text-muted-foreground">
                      Measure around the fullest part of your hips, keeping the tape horizontal.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">{t.length}</h4>
                    <p className="text-sm text-muted-foreground">
                      For tops: from shoulder to desired length. For bottoms: from waist to desired length.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sizing Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    {t.tips}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{t.tip1}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{t.tip2}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{t.tip3}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{t.tip4}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm">{t.tip5}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Download */}
              <Card>
                <CardContent className="pt-6">
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t.download}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 