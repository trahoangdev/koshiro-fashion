import { useState } from "react";
import { Ruler, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState("tops");
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Size Guide",
      subtitle: "Find your perfect fit with our comprehensive size guide",
      tops: "Tops",
      bottoms: "Bottoms",
      hakama: "Hakama",
      accessories: "Accessories",
      howToMeasure: "How to Measure",
      chest: "Chest",
      waist: "Waist",
      hips: "Hips",
      length: "Length",
      sleeve: "Sleeve",
      inseam: "Inseam",
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
      inches: "inches"
    },
    vi: {
      title: "Hướng Dẫn Kích Thước",
      subtitle: "Tìm kích thước hoàn hảo với hướng dẫn chi tiết của chúng tôi",
      tops: "Áo",
      bottoms: "Quần",
      hakama: "Hakama",
      accessories: "Phụ Kiện",
      howToMeasure: "Cách Đo",
      chest: "Ngực",
      waist: "Eo",
      hips: "Hông",
      length: "Chiều Dài",
      sleeve: "Tay Áo",
      inseam: "Đường May Trong",
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
      inches: "inch"
    },
    ja: {
      title: "サイズガイド",
      subtitle: "包括的なサイズガイドで完璧なフィットを見つけましょう",
      tops: "トップス",
      bottoms: "ボトムス",
      hakama: "袴",
      accessories: "アクセサリー",
      howToMeasure: "測定方法",
      chest: "胸囲",
      waist: "ウエスト",
      hips: "ヒップ",
      length: "長さ",
      sleeve: "袖丈",
      inseam: "股下",
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
      inches: "インチ"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const sizeData = {
    tops: [
      { size: "XS", chest: "76-81", waist: "61-66", length: "58-60", sleeve: "58-60" },
      { size: "S", chest: "81-86", waist: "66-71", length: "60-62", sleeve: "60-62" },
      { size: "M", chest: "86-91", waist: "71-76", length: "62-64", sleeve: "62-64" },
      { size: "L", chest: "91-96", waist: "76-81", length: "64-66", sleeve: "64-66" },
      { size: "XL", chest: "96-101", waist: "81-86", length: "66-68", sleeve: "66-68" },
      { size: "XXL", chest: "101-106", waist: "86-91", length: "68-70", sleeve: "68-70" }
    ],
    bottoms: [
      { size: "XS", waist: "61-66", hips: "81-86", inseam: "76-78", length: "96-98" },
      { size: "S", waist: "66-71", hips: "86-91", inseam: "78-80", length: "98-100" },
      { size: "M", waist: "71-76", hips: "91-96", inseam: "80-82", length: "100-102" },
      { size: "L", waist: "76-81", hips: "96-101", inseam: "82-84", length: "102-104" },
      { size: "XL", waist: "81-86", hips: "101-106", inseam: "84-86", length: "104-106" },
      { size: "XXL", waist: "86-91", hips: "106-111", inseam: "86-88", length: "106-108" }
    ],
    hakama: [
      { size: "S", height: "150-160", waist: "61-71", length: "95-100" },
      { size: "M", height: "160-170", waist: "71-81", length: "100-105" },
      { size: "L", height: "170-180", waist: "81-91", length: "105-110" },
      { size: "XL", height: "180-190", waist: "91-101", length: "110-115" }
    ]
  };

  const renderSizeTable = (data: any[], type: string) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-medium">{t.size}</th>
            {type === "hakama" ? (
              <>
                <th className="p-3 text-left font-medium">Height (cm)</th>
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
            ) : (
              <>
                <th className="p-3 text-left font-medium">{t.waist} (cm)</th>
                <th className="p-3 text-left font-medium">{t.hips} (cm)</th>
                <th className="p-3 text-left font-medium">{t.inseam} (cm)</th>
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
              ) : (
                <>
                  <td className="p-3">{item.waist}</td>
                  <td className="p-3">{item.hips}</td>
                  <td className="p-3">{item.inseam}</td>
                  <td className="p-3">{item.length}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

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
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="tops">{t.tops}</TabsTrigger>
                      <TabsTrigger value="bottoms">{t.bottoms}</TabsTrigger>
                      <TabsTrigger value="hakama">{t.hakama}</TabsTrigger>
                      <TabsTrigger value="accessories">{t.accessories}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="tops" className="mt-6">
                      {renderSizeTable(sizeData.tops, "tops")}
                    </TabsContent>
                    
                    <TabsContent value="bottoms" className="mt-6">
                      {renderSizeTable(sizeData.bottoms, "bottoms")}
                    </TabsContent>
                    
                    <TabsContent value="hakama" className="mt-6">
                      {renderSizeTable(sizeData.hakama, "hakama")}
                    </TabsContent>
                    
                    <TabsContent value="accessories" className="mt-6">
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          Accessories are typically one-size-fits-all or come in standard sizes.
                        </p>
                        <Badge variant="secondary">One Size</Badge>
                      </div>
                    </TabsContent>
                  </Tabs>
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