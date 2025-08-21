import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();

  const translations = {
    en: {
      title: "Contact Us",
      subtitle: "Get in Touch",
      description: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      form: {
        name: "Full Name",
        email: "Email Address",
        subject: "Subject",
        message: "Message",
        submit: "Send Message",
        submitting: "Sending...",
        success: "Message sent successfully!"
      },
      info: {
        title: "Contact Information",
        address: "123 Fashion Street, Tokyo, Japan",
        phone: "+81 3-1234-5678",
        email: "info@koshiro.com",
        hours: "Mon-Fri: 9AM-6PM (JST)"
      },
      faq: {
        title: "Frequently Asked Questions",
        shipping: "How long does shipping take?",
        shippingAnswer: "International shipping typically takes 7-14 business days.",
        returns: "What is your return policy?",
        returnsAnswer: "We offer 30-day returns for unused items in original packaging.",
        sizing: "How do I know my size?",
        sizingAnswer: "Check our size guide or contact us for personalized assistance."
      }
    },
    vi: {
      title: "Liên Hệ",
      subtitle: "Liên Lạc Với Chúng Tôi",
      description: "Chúng tôi rất muốn nghe từ bạn. Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.",
      form: {
        name: "Họ Tên",
        email: "Địa Chỉ Email",
        subject: "Tiêu Đề",
        message: "Tin Nhắn",
        submit: "Gửi Tin Nhắn",
        submitting: "Đang gửi...",
        success: "Tin nhắn đã được gửi thành công!"
      },
      info: {
        title: "Thông Tin Liên Hệ",
        address: "123 Đường Thời Trang, Tokyo, Nhật Bản",
        phone: "+81 3-1234-5678",
        email: "info@koshiro.com",
        hours: "T2-T6: 9AM-6PM (JST)"
      },
      faq: {
        title: "Câu Hỏi Thường Gặp",
        shipping: "Vận chuyển mất bao lâu?",
        shippingAnswer: "Vận chuyển quốc tế thường mất 7-14 ngày làm việc.",
        returns: "Chính sách đổi trả của bạn là gì?",
        returnsAnswer: "Chúng tôi cung cấp đổi trả trong 30 ngày cho các sản phẩm chưa sử dụng trong bao bì gốc.",
        sizing: "Làm thế nào để biết kích thước của tôi?",
        sizingAnswer: "Kiểm tra hướng dẫn kích thước của chúng tôi hoặc liên hệ với chúng tôi để được hỗ trợ cá nhân."
      }
    },
    ja: {
      title: "お問い合わせ",
      subtitle: "ご連絡ください",
      description: "お客様からのお声をお聞かせください。メッセージをお送りいただければ、できるだけ早くお返事いたします。",
      form: {
        name: "お名前",
        email: "メールアドレス",
        subject: "件名",
        message: "メッセージ",
        submit: "メッセージを送信",
        submitting: "送信中...",
        success: "メッセージが正常に送信されました！"
      },
      info: {
        title: "連絡先情報",
        address: "〒123-4567 東京都渋谷区ファッション通り123",
        phone: "+81 3-1234-5678",
        email: "info@koshiro.com",
        hours: "月-金: 9:00-18:00 (JST)"
      },
      faq: {
        title: "よくある質問",
        shipping: "配送にはどのくらい時間がかかりますか？",
        shippingAnswer: "国際配送は通常7-14営業日かかります。",
        returns: "返品ポリシーはどうなっていますか？",
        returnsAnswer: "未使用の商品で元の包装の場合は30日間の返品を受け付けています。",
        sizing: "サイズの選び方は？",
        sizingAnswer: "サイズガイドをご確認いただくか、個別サポートのためにご連絡ください。"
      }
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: t.form.success,
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                src="/images/categories/hakama.jpg" 
                alt="Contact Us Banner"
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
              <p className="text-lg max-w-2xl mx-auto text-white/80">
                {t.description}
              </p>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                      <p className="text-muted-foreground mb-4">
                        Your message has been sent successfully. We'll get back to you soon.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t.form.name}
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t.form.email}
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t.form.subject}
                        </label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {t.form.message}
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          rows={5}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t.form.submitting}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t.form.submit}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Contact Information */}
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>{t.info.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{t.info.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{t.info.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{t.info.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-muted-foreground">{t.info.hours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.faq.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t.faq.shipping}</h4>
                    <p className="text-sm text-muted-foreground">{t.faq.shippingAnswer}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t.faq.returns}</h4>
                    <p className="text-sm text-muted-foreground">{t.faq.returnsAnswer}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t.faq.sizing}</h4>
                    <p className="text-sm text-muted-foreground">{t.faq.sizingAnswer}</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage; 