import { useState, useEffect } from "react";
import { 
  Settings,
  Save,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Palette,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from "@/components/AdminLayout";

interface SettingsData {
  websiteName: string;
  websiteDescription: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  enableDarkMode: boolean;
  maintenanceMode: boolean;
  debugMode: boolean;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData>({
    websiteName: "Koshiro Japan Style Fashion",
    websiteDescription: "Thời trang Nhật Bản truyền thống và hiện đại",
    contactEmail: "contact@koshiro-fashion.com",
    contactPhone: "+84 123 456 789",
    primaryColor: "#3b82f6",
    enableDarkMode: true,
    maintenanceMode: false,
    debugMode: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { language } = useLanguage();

  const translations = {
    vi: {
      title: "Cài đặt Hệ thống",
      subtitle: "Quản lý cài đặt website và hệ thống",
      save: "Lưu cài đặt",
      saved: "Đã lưu cài đặt thành công",
      error: "Lỗi khi lưu cài đặt",
      loading: "Đang tải...",
      website: "Website",
      appearance: "Giao diện",
      system: "Hệ thống",
      websiteName: "Tên website",
      websiteDescription: "Mô tả website",
      contactEmail: "Email liên hệ",
      contactPhone: "Số điện thoại",
      primaryColor: "Màu chủ đạo",
      enableDarkMode: "Bật chế độ tối",
      maintenanceMode: "Chế độ bảo trì",
      debugMode: "Chế độ debug"
    },
    en: {
      title: "System Settings",
      subtitle: "Manage website and system settings",
      save: "Save Settings",
      saved: "Settings saved successfully",
      error: "Error saving settings",
      loading: "Loading...",
      website: "Website",
      appearance: "Appearance",
      system: "System",
      websiteName: "Website Name",
      websiteDescription: "Website Description",
      contactEmail: "Contact Email",
      contactPhone: "Contact Phone",
      primaryColor: "Primary Color",
      enableDarkMode: "Enable Dark Mode",
      maintenanceMode: "Maintenance Mode",
      debugMode: "Debug Mode"
    },
    ja: {
      title: "システム設定",
      subtitle: "ウェブサイトとシステム設定を管理",
      save: "設定を保存",
      saved: "設定が正常に保存されました",
      error: "設定の保存中にエラーが発生しました",
      loading: "読み込み中...",
      website: "ウェブサイト",
      appearance: "外観",
      system: "システム",
      websiteName: "ウェブサイト名",
      websiteDescription: "ウェブサイトの説明",
      contactEmail: "連絡先メール",
      contactPhone: "連絡先電話番号",
      primaryColor: "プライマリカラー",
      enableDarkMode: "ダークモードを有効にする",
      maintenanceMode: "メンテナンスモード",
      debugMode: "デバッグモード"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;



  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Saving settings:', settings);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t.saved,
        description: "Cài đặt đã được cập nhật",
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t.error,
        description: "Không thể lưu cài đặt",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof SettingsData, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{t.loading}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t.save}
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="website" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.website}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t.appearance}
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t.system}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="website" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t.website}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="websiteName">{t.websiteName}</Label>
                    <Input
                      id="websiteName"
                      value={settings.websiteName}
                      onChange={(e) => handleInputChange('websiteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">{t.contactEmail}</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="websiteDescription">{t.websiteDescription}</Label>
                  <Textarea
                    id="websiteDescription"
                    value={settings.websiteDescription}
                    onChange={(e) => handleInputChange('websiteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">{t.contactPhone}</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t.appearance}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">{t.primaryColor}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    />
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.enableDarkMode}</Label>
                    <p className="text-sm text-muted-foreground">
                      Cho phép người dùng chuyển đổi chế độ tối
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableDarkMode}
                    onCheckedChange={(checked) => handleInputChange('enableDarkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t.system}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.maintenanceMode}</Label>
                    <p className="text-sm text-muted-foreground">
                      Tạm thời tắt website để bảo trì
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.debugMode}</Label>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị thông tin debug (chỉ cho admin)
                    </p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleInputChange('debugMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 