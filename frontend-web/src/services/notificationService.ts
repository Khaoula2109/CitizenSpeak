import api from '../utils/api';
import { Notification } from '../types/notification';

interface UnreadCountResponse {
  unreadCount: number;
}

interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data.map((notif: any) => ({
        id: notif.id || notif.notificationId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        createdDate: notif.createdDate,
        isRead: notif.isRead,
        priority: notif.priority || 'medium',
        iconType: notif.iconType || 'bell',
        actionUrl: notif.actionUrl,
        relatedComplaint: notif.relatedComplaint,
        relatedIntervention: notif.relatedIntervention
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications/unread');
      return response.data.map((notif: any) => ({
        id: notif.id || notif.notificationId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        createdDate: notif.createdDate,
        isRead: notif.isRead,
        priority: notif.priority || 'medium',
        iconType: notif.iconType || 'bell',
        actionUrl: notif.actionUrl,
        relatedComplaint: notif.relatedComplaint,
        relatedIntervention: notif.relatedIntervention
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      throw error;
    }
  },

  getHighPriorityNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications/high-priority');
      return response.data.map((notif: any) => ({
        id: notif.id || notif.notificationId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        createdDate: notif.createdDate,
        isRead: notif.isRead,
        priority: notif.priority || 'medium',
        iconType: notif.iconType || 'bell',
        actionUrl: notif.actionUrl,
        relatedComplaint: notif.relatedComplaint,
        relatedIntervention: notif.relatedIntervention
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications haute priorité:', error);
      throw error;
    }
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      const response = await api.get('/notifications/count');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId: string): Promise<MarkAsReadResponse> => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<MarkAsReadResponse> => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
      throw error;
    }
  },

  getNotificationsByType: async (type: string): Promise<Notification[]> => {
    try {
      const response = await api.get(`/notifications/by-type/${type}`);
      return response.data.map((notif: any) => ({
        id: notif.id || notif.notificationId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        createdDate: notif.createdDate,
        isRead: notif.isRead,
        priority: notif.priority || 'medium',
        iconType: notif.iconType || 'bell',
        actionUrl: notif.actionUrl,
        relatedComplaint: notif.relatedComplaint,
        relatedIntervention: notif.relatedIntervention
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications par type:', error);
      throw error;
    }
  }
};