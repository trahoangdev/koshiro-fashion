import { useState, useEffect } from "react";
import { 
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface AdminNotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function AdminNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh
}: AdminNotificationsProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const translations = {
    en: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      markAllRead: 'Mark all as read',
      filterAll: 'All',
      filterUnread: 'Unread',
      filterRead: 'Read',
      markAsRead: 'Mark as read',
      delete: 'Delete',
      refresh: 'Refresh'
    },
    vi: {
      title: 'Thông báo',
      noNotifications: 'Không có thông báo',
      markAllRead: 'Đánh dấu tất cả đã đọc',
      filterAll: 'Tất cả',
      filterUnread: 'Chưa đọc',
      filterRead: 'Đã đọc',
      markAsRead: 'Đánh dấu đã đọc',
      delete: 'Xóa',
      refresh: 'Làm mới'
    },
    ja: {
      title: '通知',
      noNotifications: '通知がありません',
      markAllRead: 'すべて既読にする',
      filterAll: 'すべて',
      filterUnread: '未読',
      filterRead: '既読',
      markAsRead: '既読にする',
      delete: '削除',
      refresh: '更新'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t.title}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  {t.filterAll}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  {t.filterUnread}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')}>
                  {t.filterRead}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            className="w-full"
          >
            {t.markAllRead}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {t.noNotifications}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium leading-none">
                              {notification.title}
                            </p>
                            {getNotificationBadge(notification.type)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.timestamp).toLocaleDateString()}
                            </span>
                            {notification.action && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => window.open(notification.action!.url, '_blank')}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                                {t.markAsRead}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onDelete(notification.id)}>
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 