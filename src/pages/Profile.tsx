import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Phone, Mail, Edit2, Save, X, ShoppingBag, Heart, Settings, CreditCard, Bell, User as UserIcon } from "lucide-react";
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
import { api, User as UserType } from "@/lib/api";

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
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Vietnam"
  });
  const [editData, setEditData] = useState<ProfileData>(profileData);

  // Handle URL parameters for active section
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['profile', 'orders', 'addresses', 'payment', 'notifications', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

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

  // Load cart items count
  useEffect(() => {
    const loadCartCount = async () => {
      if (!isAuthenticated) return;
      
      try {
        const cartResponse = await api.getCart();
        const count = cartResponse.items?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartItemsCount(count);
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartItemsCount(0);
      }
    };

    loadCartCount();
  }, [isAuthenticated]);

  // Redirect if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-zen">
        <Header cartItemsCount={cartItemsCount} onSearch={() => {}} />
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
      orderTotal: "Total",
      totalOrders: "Total Orders",
      completedOrders: "Completed Orders",
      totalSpent: "Total Spent",
      accountStatus: "Account Status",
      memberSince: "Member Since",
      notProvided: "Not provided",
      notAvailable: "Not available",
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
      unknown: "Unknown"
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
      orderTotal: "Tổng Tiền",
      totalOrders: "Tổng Đơn Hàng",
      completedOrders: "Đơn Hoàn Thành",
      totalSpent: "Tổng Chi Tiêu",
      accountStatus: "Trạng Thái Tài Khoản",
      memberSince: "Thành Viên Từ",
      notProvided: "Chưa cung cấp",
      notAvailable: "Không có sẵn",
      active: "Hoạt động",
      inactive: "Ngừng hoạt động",
      blocked: "Bị khóa",
      unknown: "Không rõ"
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
      orderTotal: "合計",
      totalOrders: "注文総数",
      completedOrders: "完了した注文",
      totalSpent: "総支出額",
      accountStatus: "アカウント状態",
      memberSince: "登録日",
      notProvided: "未入力",
      notAvailable: "利用不可",
      active: "アクティブ",
      inactive: "非アクティブ",
      blocked: "ブロック済み",
      unknown: "不明"
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

  const refreshSidebarCounts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <Header 
        cartItemsCount={cartItemsCount} 
        onSearch={() => {}} 
      />
      
      <main className="py-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <ProfileSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              refreshTrigger={refreshTrigger}
            />

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>

              {/* Profile Info Section - Only show when profile tab is active */}
              {activeSection === "profile" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                                      <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
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
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-center mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xl font-semibold">
                          {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold text-foreground">{(user as unknown as UserType)?.totalOrders || 0}</div>
                        <div className="text-sm text-muted-foreground">{t.totalOrders}</div>
                      </div>
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Heart className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold text-foreground">{(user as unknown as UserType)?.orderCount || 0}</div>
                        <div className="text-sm text-muted-foreground">{t.completedOrders}</div>
                      </div>
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <div className="text-2xl font-bold text-foreground">{(user as unknown as UserType)?.totalSpent ? new Intl.NumberFormat().format((user as unknown as UserType).totalSpent) : 0}₫</div>
                        <div className="text-sm text-muted-foreground">{t.totalSpent}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">{t.name}</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 py-2">{profileData.name || t.notProvided}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">{t.email}</Label>
                        <div className="mt-1 py-2">
                          <p className="text-sm text-muted-foreground">{profileData.email}</p>
                          {!isEditing && (
                            <Badge variant="secondary" className="mt-1">
                              {user?.role === 'admin' ? 'Admin' : 'Customer'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">{t.phone}</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            className="mt-1"
                            placeholder="Nhập số điện thoại"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 py-2">{profileData.phone || t.notProvided}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address">{t.address}</Label>
                        {isEditing ? (
                          <Input
                            id="address"
                            value={editData.address}
                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                            className="mt-1"
                            placeholder="Nhập địa chỉ"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 py-2">{profileData.address || t.notProvided}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="status">{t.accountStatus}</Label>
                        <div className="text-sm mt-1 py-2">
                          <Badge variant={(user as unknown as UserType)?.status === 'active' ? 'default' : (user as unknown as UserType)?.status === 'blocked' ? 'destructive' : 'secondary'}>
                            {(user as unknown as UserType)?.status === 'active' ? t.active : 
                             (user as unknown as UserType)?.status === 'blocked' ? t.blocked : 
                             (user as unknown as UserType)?.status === 'inactive' ? t.inactive : t.unknown}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="joinDate">{t.memberSince}</Label>
                        <p className="text-sm text-muted-foreground mt-1 py-2">
                          {(user as unknown as UserType)?.createdAt ? new Date((user as unknown as UserType).createdAt).toLocaleDateString('vi-VN') : t.notAvailable}
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-6 border-t">
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          {t.cancel}
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                          {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          {t.save}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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