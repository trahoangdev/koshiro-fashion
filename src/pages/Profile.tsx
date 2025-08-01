import { useState } from "react";
import { User, MapPin, Phone, Mail, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export default function Profile() {
  const [language, setLanguage] = useState("vi");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "+84 123 456 789",
    address: "123 Đường ABC",
    city: "Hồ Chí Minh",
    country: "Việt Nam"
  });
  const [editData, setEditData] = useState<ProfileData>(profileData);

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

  const t = translations[language as keyof typeof translations] || translations.vi;

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemsCount={0} 
        onSearch={() => {}} 
        onLanguageChange={setLanguage}
        currentLanguage={language}
        onCartClick={() => {}}
        showCartPanel={false}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
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
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        {t.save}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t.orderHistory}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    {t.noOrders}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer currentLanguage={language} />
    </div>
  );
}