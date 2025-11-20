import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/Notification';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

/**
 * Trang hiển thị tất cả thông báo
 */
const Notifications = () => {
  const navigate = useNavigate();
  
  // Lấy danh sách thông báo từ hook
  const { notifications, unreadCount, loading } = useNotifications();
  
  // State để filter: 'all' hoặc 'unread'
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  // Lọc thông báo theo filter
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  /**
   * Lấy icon theo loại thông báo
   */
  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    
    if (type.includes('CANCEL')) {
      return <Bell className={cn(iconClass, "text-red-500")} />;
    }
    if (type.includes('CONFIRMED')) {
      return <CheckCheck className={cn(iconClass, "text-green-500")} />;
    }
    if (type.includes('REMINDER')) {
      return <Bell className={cn(iconClass, "text-blue-500")} />;
    }
    if (type.includes('MESSAGE')) {
      return <Bell className={cn(iconClass, "text-purple-500")} />;
    }
    if (type.includes('COMPLETED') || type.includes('APPROVED')) {
      return <Check className={cn(iconClass, "text-green-500")} />;
    }
    
    return <Bell className={cn(iconClass, "text-gray-500")} />;
  };

  /**
   * Xử lý khi click vào thông báo
   */
  const handleNotificationClick = (notification: Notification) => {
    // Nếu có link thì chuyển đến trang đó
    if (notification.primaryActionUrl) {
      navigate(notification.primaryActionUrl);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header - Tiêu đề và badge số lượng unread */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your learning activities
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {/* Filters - Nút All và Unread */}
          <div className="flex gap-2">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={activeFilter === 'unread' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
          </div>
        </div>

        {/* Danh sách thông báo */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            // Không có thông báo
            <Card className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                {activeFilter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </Card>
          ) : (
            // Hiển thị từng thông báo
            filteredNotifications.map((notification) => (
              <Card
                key={notification.notificationId}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  // Thông báo chưa đọc có màu xanh nhạt
                  !notification.isRead && "bg-blue-50/50 border-blue-200"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      {/* Chấm xanh cho thông báo chưa đọc */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">
                      {notification.content}
                    </p>
                    
                    {/* Thời gian và loại */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true 
                        })}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {notification.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
