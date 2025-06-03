import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getNotificationsByFilter: (filter: 'all' | 'unread' | 'high-priority') => Promise<Notification[]>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const [allNotifications, countData] = await Promise.all([
        notificationService.getAllNotifications(),
        notificationService.getUnreadCount()
      ]);
      
      console.log('Notifications récupérées:', allNotifications); 
      console.log('Compteur non lues:', countData); 
      
      setNotifications(allNotifications);
      setUnreadCount(countData.unreadCount);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
            setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  };

  const getNotificationsByFilter = async (filter: 'all' | 'unread' | 'high-priority'): Promise<Notification[]> => {
    try {
      let result: Notification[];
      
      switch (filter) {
        case 'unread':
          result = await notificationService.getUnreadNotifications();
          break;
        case 'high-priority':
          result = await notificationService.getHighPriorityNotifications();
          break;
        case 'all':
        default:
          result = await notificationService.getAllNotifications();
          break;
      }
      
      console.log(`Notifications filtrées (${filter}):`, result); 
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications filtrées:', error);
      return [];
    }
  };

  useEffect(() => {
    console.log('Initialisation du NotificationProvider'); 
    refreshNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const countData = await notificationService.getUnreadCount();
        setUnreadCount(countData.unreadCount);
        console.log('Compteur mis à jour:', countData.unreadCount); 
      } catch (error) {
        console.error('Erreur lors de la mise à jour du compteur:', error);
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationsByFilter
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};