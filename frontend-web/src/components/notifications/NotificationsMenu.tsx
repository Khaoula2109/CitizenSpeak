import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Clock, Info, Bell, User, BarChart, Calendar, MessageCircle, AlertTriangle, TrendingUp, FileText, RefreshCw, UserCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../types/notification';

const getNotificationIcon = (iconType: string, priority: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'check-circle': CheckCircle,
    'alert-circle': AlertCircle,
    'alert-triangle': AlertTriangle,
    'clock': Clock,
    'info': Info,
    'user-check': UserCheck,
    'refresh-cw': RefreshCw,
    'calendar': Calendar,
    'message-circle': MessageCircle,
    'bar-chart': BarChart,
    'file-text': FileText,
    'trending-up': TrendingUp,
    'bell': Bell,
    'user': User
  };
  
  const IconComponent = iconMap[iconType] || Bell;
  
  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  return <IconComponent className={`h-5 w-5 ${getIconColor(priority)}`} />;
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
};

const getPriorityBadge = (priority: string) => {
  const badgeStyles: Record<string, string> = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  };
  
  const labels: Record<string, string> = {
    high: 'Urgente',
    medium: 'Moyenne',
    low: 'Faible'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeStyles[priority] || badgeStyles.low}`}>
      {labels[priority] || labels.low}
    </span>
  );
};

interface NotificationsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ isOpen, onClose, buttonRef }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-priority'>('all');
  
  const { unreadCount, markAsRead, markAllAsRead, getNotificationsByFilter } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotificationsByFilter(filter);
      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    onClose();
  };

  if (!isOpen) return null;

  const calculatePosition = () => {
    if (!buttonRef.current) return { top: 0, right: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const { top, right } = calculatePosition();

  const menuContent = (
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className="fixed w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        style={{ top: `${top}px`, right: `${right}px` }}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Fermer les notifications"
            >
              <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Toutes
            </button>
          </div>
          
          {unreadCount > 0 && (
            <div className="mt-3">
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Marquer toutes comme lues
              </button>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[480px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' ? 'Aucune notification non lue' : 
                 filter === 'high-priority' ? 'Aucune notification urgente' : 
                 'Aucune notification'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.iconType, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-600 dark:bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTimeAgo(notification.createdDate)}
                      </p>
                      
                      {notification.priority && notification.priority !== 'low' && (
                        <div className="ml-2">
                          {getPriorityBadge(notification.priority)}
                        </div>
                      )}
                    </div>
                    
                    {notification.relatedComplaint && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          Plainte: {notification.relatedComplaint.title}
                        </span>
                      </div>
                    )}
                    
                    {notification.relatedIntervention && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          Intervention: {notification.relatedIntervention.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button 
              onClick={() => {
                window.location.href = '/notifications';
                onClose();
              }}
              className="w-full px-4 py-2 text-sm text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Voir toutes les notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
};