import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Phone, Mail, Edit2, Save, X, ShoppingBag, Heart, Settings, CreditCard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import ProfileOrders from "@/components/ProfileOrders";
import ProfileAddresses from "@/components/ProfileAddresses";
import ProfilePayment from "@/components/ProfilePayment";
import ProfileNotifications from "@/components/ProfileNotifications";
import ProfileSettings from "@/components/ProfileSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { language } = useLanguage();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Vietnam"
  });
  const [editData, setEditData] = useState<ProfileData>(profileData);

  // Load user data when component mounts
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      const userData: ProfileData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: "",
        country: "Vietnam"
      };
      setProfileData(userData);
      setEditData(userData);
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-zen">
        <Header cartItemsCount={0} onSearch={() => {}} />
        <main className="py-16">
          <div className="container mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const translations = {
    en: {
      title: "Profile",
      personalInfo: "Personal Information",
      orderHistory: "Order History",
      settings: "Settings",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      city: "City",
      country: "Country",
      noOrders: "No orders yet",
      recentOrder: "Recent Order",
      orderDate: "Order Date",
      orderTotal: "Total"
    },
    vi: {
      title: "Hồ Sơ",
      personalInfo: "Thông Tin Cá Nhân",
      orderHistory: "Lịch Sử Đơn Hàng",
      settings: "Cài Đặt",
      edit: "Chỉnh Sửa",
      save: "Lưu",
      cancel: "Hủy",
      name: "Họ Tên",
      email: "Email",
      phone: "Số Điện Thoại",
      address: "Địa Chỉ",
      city: "Thành Phố",
      country: "Quốc Gia",
      noOrders: "Chưa có đơn hàng nào",
      recentOrder: "Đơn Hàng Gần Đây",
      orderDate: "Ngày Đặt",
      orderTotal: "Tổng Tiền"
    },
    ja: {
      title: "プロフィール",
      personalInfo: "個人情報",
      orderHistory: "注文履歴",
      settings: "設定",
      edit: "編集",
      save: "保存",
      cancel: "キャンセル",
      name: "氏名",
      email: "メール",
      phone: "電話番号",
      address: "住所",
      city: "都市",
      country: "国",
      noOrders: "注文はまだありません",
      recentOrder: "最近の注文",
      orderDate: "注文日",
      orderTotal: "合計"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update user profile via API
      const updateData = {
        name: editData.name,
        phone: editData.phone,
        address: editData.address
      };
      
      await api.updateProfile(updateData);
      
      setProfileData(editData);
      setIsEditing(false);
      refreshUser(); // Refresh user data after successful update
      
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin hồ sơ đã được cập nhật",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi cập nhật",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật hồ sơ",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header 
        cartItemsCount={0} 
        onSearch={() => {}} 
      />
      
      <main className="py-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <ProfileSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>

              {/* Profile Info */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t.personalInfo}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                    {isEditing ? t.cancel : t.edit}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t.name}</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profileData.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">{t.email}</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profileData.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">{t.phone}</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profileData.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">{t.address}</Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={editData.address}
                          onChange={(e) => setEditData({...editData, address: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profileData.address}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city">{t.city}</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={editData.city}
                          onChange={(e) => setEditData({...editData, city: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profileData.city}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="country">{t.country}</Label>
                      {isEditing ? (
                        <Input
                          id="country"
                          value={editData.country}
                          onChange={(e) => setEditData({...editData, country: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{profileData.country}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={handleCancel}>
                        {t.cancel}
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {t.save}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Sections based on activeSection */}
              <div className="space-y-6">
                {activeSection === "orders" && <ProfileOrders />}
                {activeSection === "addresses" && <ProfileAddresses />}
                {activeSection === "payment" && <ProfilePayment />}
                {activeSection === "notifications" && <ProfileNotifications />}
                {activeSection === "settings" && <ProfileSettings />}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}