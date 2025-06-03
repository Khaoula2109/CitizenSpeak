export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdDate: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  iconType: string;
  actionUrl?: string;
  relatedComplaint?: {
    id: string;
    title: string;
  };
  relatedIntervention?: {
    id: string;
    description: string;
  };
}

export interface NotificationFilter {
  type: 'all' | 'unread' | 'high-priority';
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getNotificationsByFilter: (filter: NotificationFilter['type']) => Promise<Notification[]>;
}