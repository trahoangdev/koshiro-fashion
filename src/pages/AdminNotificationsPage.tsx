import { useState, useEffect } from "react";
import { 
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  MoreHorizontal,
  Clock,
  User,
  Package,
  ShoppingCart,
  CreditCard,
  Shield,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  orderNotifications: boolean;
  userNotifications: boolean;
  productNotifications: boolean;
  systemNotifications: boolean;
  alertNotifications: boolean;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    archiveNotification, 
    deleteNotification, 
    clearAll,
    refreshNotifications 
  } = useNotifications();
  
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sound: true,
    orderNotifications: true,
    userNotifications: true,
    productNotifications: true,
    systemNotifications: true,
    alertNotifications: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterPriority, filterStatus]);

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.sender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Filter by priority
    if (filterPriority !== "all") {
      filtered = filtered.filter(notification => notification.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(notification => notification.status === filterStatus);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    toast({
      title: language === 'vi' ? "Đã đánh dấu đã đọc" : 
             language === 'ja' ? "既読にマークされました" : 
             "Marked as read",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: language === 'vi' ? "Đã đánh dấu tất cả" : 
             language === 'ja' ? "すべて既読にしました" : 
             "Marked all as read",
    });
  };

  const handleArchiveNotification = (id: string) => {
    archiveNotification(id);
    toast({
      title: language === 'vi' ? "Đã lưu trữ thông báo" : 
             language === 'ja' ? "通知がアーカイブされました" : 
             "Notification archived",
    });
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    toast({
      title: language === 'vi' ? "Đã xóa thông báo" : 
             language === 'ja' ? "通知を削除しました" : 
             "Notification deleted",
    });
  };

  const handleClearAll = () => {
    clearAll();
    toast({
      title: language === 'vi' ? "Đã xóa tất cả" : 
             language === 'ja' ? "すべて削除しました" : 
             "Cleared all notifications",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return language === 'vi' ? 'Khẩn cấp' : language === 'ja' ? '緊急' : 'Urgent';
      case 'high': return language === 'vi' ? 'Cao' : language === 'ja' ? '高' : 'High';
      case 'medium': return language === 'vi' ? 'Trung bình' : language === 'ja' ? '中' : 'Medium';
      case 'low': return language === 'vi' ? 'Thấp' : language === 'ja' ? '低' : 'Low';
      default: return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order': return language === 'vi' ? 'Đơn hàng' : language === 'ja' ? '注文' : 'Order';
      case 'user': return language === 'vi' ? 'Người dùng' : language === 'ja' ? 'ユーザー' : 'User';
      case 'product': return language === 'vi' ? 'Sản phẩm' : language === 'ja' ? '商品' : 'Product';
      case 'system': return language === 'vi' ? 'Hệ thống' : language === 'ja' ? 'システム' : 'System';
      case 'alert': return language === 'vi' ? 'Cảnh báo' : language === 'ja' ? 'アラート' : 'Alert';
      default: return type;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return language === 'vi' ? 'Vừa xong' : language === 'ja' ? '今' : 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${language === 'vi' ? 'phút trước' : language === 'ja' ? '分前' : 'min ago'}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${language === 'vi' ? 'giờ trước' : language === 'ja' ? '時間前' : 'hours ago'}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${language === 'vi' ? 'ngày trước' : language === 'ja' ? '日前' : 'days ago'}`;
  };

  const translations = {
    en: {
      title: "Notifications",
      subtitle: "Real-time system notifications and alerts",
      search: "Search notifications...",
      filter: "Filter",
      markAllRead: "Mark All as Read",
      clearAll: "Clear All",
      settings: "Settings",
      all: "All",
      unread: "Unread",
      read: "Read",
      archived: "Archived",
      priority: "Priority",
      type: "Type",
      status: "Status",
      noNotifications: "No notifications found",
      loading: "Loading notifications...",
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      soundNotifications: "Sound Notifications",
      orderNotifications: "Order Notifications",
      userNotifications: "User Notifications",
      productNotifications: "Product Notifications",
      systemNotifications: "System Notifications",
      alertNotifications: "Alert Notifications",
      saveSettings: "Save Settings",
      settingsSaved: "Settings saved successfully"
    },
    vi: {
      title: "Thông Báo",
      subtitle: "Thông báo hệ thống thời gian thực và cảnh báo",
      search: "Tìm kiếm thông báo...",
      filter: "Lọc",
      markAllRead: "Đánh Dấu Tất Cả Đã Đọc",
      clearAll: "Xóa Tất Cả",
      settings: "Cài Đặt",
      all: "Tất Cả",
      unread: "Chưa Đọc",
      read: "Đã Đọc",
      archived: "Đã Lưu Trữ",
      priority: "Mức Độ Ưu Tiên",
      type: "Loại",
      status: "Trạng Thái",
      noNotifications: "Không tìm thấy thông báo",
      loading: "Đang tải thông báo...",
      emailNotifications: "Thông Báo Email",
      pushNotifications: "Thông Báo Push",
      soundNotifications: "Thông Báo Âm Thanh",
      orderNotifications: "Thông Báo Đơn Hàng",
      userNotifications: "Thông Báo Người Dùng",
      productNotifications: "Thông Báo Sản Phẩm",
      systemNotifications: "Thông Báo Hệ Thống",
      alertNotifications: "Thông Báo Cảnh Báo",
      saveSettings: "Lưu Cài Đặt",
      settingsSaved: "Đã lưu cài đặt thành công"
    },
    ja: {
      title: "通知",
      subtitle: "リアルタイムシステム通知とアラート",
      search: "通知を検索...",
      filter: "フィルター",
      markAllRead: "すべて既読にする",
      clearAll: "すべてクリア",
      settings: "設定",
      all: "すべて",
      unread: "未読",
      read: "既読",
      archived: "アーカイブ",
      priority: "優先度",
      type: "タイプ",
      status: "ステータス",
      noNotifications: "通知が見つかりません",
      loading: "通知を読み込み中...",
      emailNotifications: "メール通知",
      pushNotifications: "プッシュ通知",
      soundNotifications: "音声通知",
      orderNotifications: "注文通知",
      userNotifications: "ユーザー通知",
      productNotifications: "商品通知",
      systemNotifications: "システム通知",
      alertNotifications: "アラート通知",
      saveSettings: "設定を保存",
      settingsSaved: "設定が正常に保存されました"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t.markAllRead}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              {t.settings}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t.clearAll}
            </Button>
            <Button variant="outline" size="sm" onClick={refreshNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard - Moved to top */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</CardTitle>
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{notifications.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Unread</CardTitle>
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {unreadCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Today</CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {notifications.filter(n => {
                  const today = new Date();
                  const notificationDate = new Date(n.timestamp);
                  return notificationDate.toDateString() === today.toDateString();
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="order">{t.orderNotifications}</SelectItem>
                <SelectItem value="user">{t.userNotifications}</SelectItem>
                <SelectItem value="product">{t.productNotifications}</SelectItem>
                <SelectItem value="system">{t.systemNotifications}</SelectItem>
                <SelectItem value="alert">{t.alertNotifications}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="unread">{t.unread}</SelectItem>
                <SelectItem value="read">{t.read}</SelectItem>
                <SelectItem value="archived">{t.archived}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.settings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{t.emailNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.email}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>{t.pushNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.push}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>{t.soundNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sound: checked }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{t.orderNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.orderNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, orderNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{t.userNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.userNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, userNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{t.productNotifications}</span>
                    </div>
                    <Switch
                      checked={settings.productNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, productNotifications: checked }))}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => {
                  setShowSettings(false);
                  toast({
                    title: t.settingsSaved,
                  });
                }}>
                  {t.saveSettings}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`transition-all duration-200 ${
                notification.status === 'unread' 
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'border-l-4 border-l-transparent'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        notification.status === 'unread' 
                          ? 'bg-blue-100 dark:bg-blue-900/50' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-medium ${
                              notification.status === 'unread' 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {notification.title}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={`${getPriorityColor(notification.priority)} text-white text-xs`}
                            >
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                          <p className={`text-sm ${
                            notification.status === 'unread' 
                              ? 'text-blue-700 dark:text-blue-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(notification.timestamp)}
                            </span>
                            {notification.sender && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {notification.sender}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {notification.status === 'unread' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveNotification(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t.noNotifications}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
