import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Home,
  Building,
  Check
} from "lucide-react";

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

const ProfileAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      _id: "1",
      name: "John Doe",
      phone: "+1 234 567 890",
      address: "123 Main Street",
      city: "New York",
      district: "Manhattan",
      isDefault: true,
      type: 'home'
    },
    {
      _id: "2",
      name: "John Doe",
      phone: "+1 234 567 890",
      address: "456 Business Ave",
      city: "New York",
      district: "Brooklyn",
      isDefault: false,
      type: 'work'
    }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    type: 'home' as 'home' | 'work' | 'other'
  });
  const { language } = useLanguage();
  const { toast } = useToast();

  const translations = {
    en: {
      title: "Shipping Addresses",
      subtitle: "Manage your delivery addresses",
      addAddress: "Add New Address",
      editAddress: "Edit Address",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      setDefault: "Set as Default",
      default: "Default",
      name: "Full Name",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      district: "District/State",
      type: "Address Type",
      home: "Home",
      work: "Work",
      other: "Other",
      noAddresses: "No addresses saved yet",
      noAddressesDesc: "Add your first shipping address to get started",
      addressAdded: "Address added successfully",
      addressUpdated: "Address updated successfully",
      addressDeleted: "Address deleted successfully",
      defaultSet: "Default address updated"
    },
    vi: {
      title: "Địa Chỉ Giao Hàng",
      subtitle: "Quản lý địa chỉ giao hàng của bạn",
      addAddress: "Thêm Địa Chỉ Mới",
      editAddress: "Chỉnh Sửa Địa Chỉ",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      setDefault: "Đặt Làm Mặc Định",
      default: "Mặc Định",
      name: "Họ Tên",
      phone: "Số Điện Thoại",
      address: "Địa Chỉ",
      city: "Thành Phố",
      district: "Quận/Huyện",
      type: "Loại Địa Chỉ",
      home: "Nhà",
      work: "Công Ty",
      other: "Khác",
      noAddresses: "Chưa có địa chỉ nào được lưu",
      noAddressesDesc: "Thêm địa chỉ giao hàng đầu tiên để bắt đầu",
      addressAdded: "Đã thêm địa chỉ thành công",
      addressUpdated: "Đã cập nhật địa chỉ thành công",
      addressDeleted: "Đã xóa địa chỉ thành công",
      defaultSet: "Đã cập nhật địa chỉ mặc định"
    },
    ja: {
      title: "配送先住所",
      subtitle: "配送先住所を管理",
      addAddress: "新しい住所を追加",
      editAddress: "住所を編集",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      setDefault: "デフォルトに設定",
      default: "デフォルト",
      name: "氏名",
      phone: "電話番号",
      address: "住所",
      city: "市区町村",
      district: "都道府県",
      type: "住所タイプ",
      home: "自宅",
      work: "会社",
      other: "その他",
      noAddresses: "保存された住所はありません",
      noAddressesDesc: "最初の配送先住所を追加して開始してください",
      addressAdded: "住所が正常に追加されました",
      addressUpdated: "住所が正常に更新されました",
      addressDeleted: "住所が正常に削除されました",
      defaultSet: "デフォルト住所が更新されました"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      type: 'home'
    });
  };

  const handleEdit = (address: Address) => {
    setEditingId(address._id);
    setIsAdding(false);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      type: address.type
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.district) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr._id === editingId 
          ? { ...addr, ...formData }
          : addr
      ));
      toast({
        title: "Thành công",
        description: t.addressUpdated,
      });
    } else {
      // Add new address
      const newAddress: Address = {
        _id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0
      };
      setAddresses(prev => [...prev, newAddress]);
      toast({
        title: "Thành công",
        description: t.addressAdded,
      });
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      type: 'home'
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      type: 'home'
    });
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr._id !== id));
    toast({
      title: "Thành công",
      description: t.addressDeleted,
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr._id === id
    })));
    toast({
      title: "Thành công",
      description: t.defaultSet,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addAddress}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? t.editAddress : t.addAddress}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">{t.address}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">{t.city}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="district">{t.district}</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">{t.type}</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'home' | 'work' | 'other'})}
                className="w-full p-2 border border-input rounded-md"
              >
                <option value="home">{t.home}</option>
                <option value="work">{t.work}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                {t.cancel}
              </Button>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                {t.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t.noAddresses}</h3>
          <p className="text-muted-foreground mb-8">{t.noAddressesDesc}</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addAddress}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address._id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(address.type)}
                    <span className="font-semibold">{address.name}</span>
                    {address.isDefault && (
                      <Badge variant="default" className="text-xs">
                        {t.default}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p>{address.phone}</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.district}</p>
                </div>
                
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleSetDefault(address._id)}
                  >
                    {t.setDefault}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileAddresses; 