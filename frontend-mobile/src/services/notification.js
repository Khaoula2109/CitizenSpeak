import API from './api';
import ErrorService from './error';
import { Platform } from 'react-native';

class NotificationService {
    async getNotifications() {
        try {
            const response = await API.get('/notifications');
            return response.data;
        } catch (error) {
            throw ErrorService.parseApiError(error);
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await API.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            throw ErrorService.parseApiError(error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await API.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            throw ErrorService.parseApiError(error);
        }
    }

    async deleteNotification(notificationId) {
        try {
            const response = await API.delete(`/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            throw ErrorService.parseApiError(error);
        }
    }

    async getUnreadCount() {
        try {
            const response = await API.get('/notifications/unread-count');
            return response.data.count;
        } catch (error) {
            throw ErrorService.parseApiError(error);
        }
    }

    async updateNotificationBadge() {
        try {
            const unreadCount = await this.getUnreadCount();

            if (Platform.OS === 'ios') {
                console.log('Updating iOS badge to:', unreadCount);
            }

            return unreadCount;
        } catch (error) {
            console.error('Error updating notification badge:', error);
            return 0;
        }
    }

    async requestNotificationPermission() {
        try {
            if (Platform.OS === 'android') {
                return true;
            } else if (Platform.OS === 'ios') {
                console.log('Requesting iOS notification permission');
                return true; // Implémentez la logique spécifique à iOS ici
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }
    async initialize() {
        try {
            const hasPermission = await this.requestNotificationPermission();

            if (hasPermission) {
                console.log('Notification service initialized');
                await this.updateNotificationBadge();
            }

            return hasPermission;
        } catch (error) {
            console.error('Error initializing notification service:', error);
            return false;
        }
    }
    cleanup() {
    }

    formatNotificationForDisplay(notification) {
        return {
            id: notification.id,
            title: notification.title,
            description: notification.description,
            date: notification.date,
            read: notification.read,
            type: notification.type,
            complaintId: notification.complaintId,
            timeAgo: this.getTimeAgo(notification.date),
            icon: this.getNotificationIcon(notification.type),
        };
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
            return `Il y a ${diffMinutes} min`;
        } else if (diffHours < 24) {
            return `Il y a ${diffHours}h`;
        } else if (diffDays === 1) {
            return 'Hier';
        } else if (diffDays < 7) {
            return `Il y a ${diffDays} jours`;
        } else {
            return date.toLocaleDateString();
        }
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'STATUS_UPDATE':
            case 'COMPLAINT_RESOLVED':
            case 'COMPLAINT_IN_PROGRESS':
                return 'clipboard-check';
            case 'NEW_COMMENT':
                return 'comment-text';
            case 'GENERAL':
                return 'bell';
            default:
                return 'bell';
        }
    }
}

export default new NotificationService();