import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../types/notification';
import { Bell, CheckCircle, AlertCircle, Clock, Info, User, BarChart, Calendar, MessageCircle, AlertTriangle, TrendingUp, FileText, RefreshCw, UserCheck } from 'lucide-react';

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
  
  return <IconComponent className={`h-6 w-6 ${getIconColor(priority)}`} />;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyles[priority] || badgeStyles.low}`}>
      {labels[priority] || labels.low}
    </span>
  );
};

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-priority'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { getNotificationsByFilter, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
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
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez toutes vos notifications
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Toutes ({notifications.length})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadNotifications}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Actualisation...' : 'Actualiser'}
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Marquer toutes comme lues
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'unread' ? 'Aucune notification non lue' : 
               filter === 'high-priority' ? 'Aucune notification urgente' : 
               'Aucune notification'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'Vous n\'avez aucune notification pour le moment.' :
               filter === 'unread' ? 'Toutes vos notifications ont été lues.' :
               'Aucune notification urgente en attente.'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                !notification.isRead 
                  ? 'border-l-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                  : 'border-l-gray-200 dark:border-l-gray-700'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.iconType, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.priority !== 'low' && (
                          <div>{getPriorityBadge(notification.priority)}</div>
                        )}
                        {!notification.isRead && (
                          <div className="h-3 w-3 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDate(notification.createdDate)}
                    </p>
                    
                    {(notification.relatedComplaint || notification.relatedIntervention) && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {notification.relatedComplaint && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Plainte:</span> {notification.relatedComplaint.title}
                          </p>
                        )}
                        {notification.relatedIntervention && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Intervention:</span> {notification.relatedIntervention.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;