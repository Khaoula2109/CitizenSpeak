package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.NotificationRepository;
import com.example.Backend_CitizenSpeak.repositories.DeviceTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               DeviceTokenRepository deviceTokenRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Notification> getNotificationsByUser(User user) {
        return notificationRepository.findByUserOrderBySentDateDesc(user);
    }

    public Notification getNotificationById(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }


    @Transactional
    public Notification markAsRead(String notificationId, User user) {
        Notification notification = getNotificationById(notificationId);

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderBySentDateDesc(user);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteNotification(String notificationId, User user) {
        Notification notification = getNotificationById(notificationId);

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void registerDeviceToken(User user, String token, String deviceType) {
        DeviceToken existingToken = deviceTokenRepository.findByUserAndToken(user, token);

        if (existingToken == null) {
            DeviceToken deviceToken = new DeviceToken();
            deviceToken.setUser(user);
            deviceToken.setToken(token);
            deviceToken.setDeviceType(deviceType);
            deviceToken.setRegistrationDate(new Date());
            deviceToken.setActive(true);

            deviceTokenRepository.save(deviceToken);
        } else {
            existingToken.setRegistrationDate(new Date());
            existingToken.setActive(true);
            deviceTokenRepository.save(existingToken);
        }
    }

    @Transactional
    public void createStatusUpdateNotification(Complaint complaint, String newStatus, String notes) {
        try {
            System.out.println("Creating status update notification for complaint: " + complaint.getComplaintId());

            String notificationType = getNotificationTypeForStatus(newStatus);
            String content = createStatusUpdateContent(complaint, newStatus, notes);

            Notification notification = new Notification();
            notification.setNotificationType(notificationType);
            notification.setSentDate(new Date());
            notification.setContent(content);
            notification.setRead(false);
            notification.setUser(complaint.getCitizen());
            notification.setComplaintId(complaint.getComplaintId());

            notificationRepository.save(notification);

            eventPublisher.publishEvent(new NotificationEvent(notification));

            System.out.println("Status update notification created successfully");
        } catch (Exception e) {
            System.err.println("Error creating status update notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void createCommentNotification(Comment comment) {
        try {
            System.out.println("Creating comment notification for complaint: " + comment.getComplaint().getComplaintId());

            String commentAuthorId = null;
            String commentAuthorName = null;

            if ("CITIZEN".equals(comment.getAuthorType()) && comment.getCitizen() != null) {
                commentAuthorId = comment.getCitizen().getUserId();
                commentAuthorName = comment.getCitizen().getName();
            } else if ("AGENT".equals(comment.getAuthorType()) && comment.getAgent() != null) {
                commentAuthorId = comment.getAgent().getUserId();
                commentAuthorName = comment.getAgent().getName();
            }

            String complaintOwnerId = comment.getComplaint().getCitizen().getUserId();

            if (commentAuthorId != null && commentAuthorId.equals(complaintOwnerId)) {
                System.out.println("Skipping notification - comment author is complaint owner");
                return;
            }

            String content = createCommentContent(comment);

            Notification notification = new Notification();
            notification.setNotificationType("NEW_COMMENT");
            notification.setSentDate(new Date());
            notification.setContent(content);
            notification.setRead(false);
            notification.setUser(comment.getComplaint().getCitizen());
            notification.setComplaintId(comment.getComplaint().getComplaintId());

            notificationRepository.save(notification);

            eventPublisher.publishEvent(new NotificationEvent(notification));

            System.out.println("Comment notification created successfully");
        } catch (Exception e) {
            System.err.println("Error creating comment notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void createGeneralNotification(String content, User user) {
        try {
            Notification notification = new Notification();
            notification.setNotificationType("GENERAL");
            notification.setSentDate(new Date());
            notification.setContent(content);
            notification.setRead(false);
            notification.setUser(user);

            notificationRepository.save(notification);

            eventPublisher.publishEvent(new NotificationEvent(notification));
        } catch (Exception e) {
            System.err.println("Error creating general notification: " + e.getMessage());
            e.printStackTrace();
        }
    }


    private String getNotificationTypeForStatus(String status) {
        switch (status.toLowerCase()) {
            case "resolved":
                return "COMPLAINT_RESOLVED";
            case "in progress":
            case "en cours":
                return "COMPLAINT_IN_PROGRESS";
            default:
                return "STATUS_UPDATE";
        }
    }

    private String createStatusUpdateContent(Complaint complaint, String newStatus, String notes) {
        String statusText = getStatusDisplayText(newStatus);
        String content = String.format("Votre signalement '%s' a été marqué comme \"%s\".",
                complaint.getTitle(), statusText);

        if (notes != null && !notes.trim().isEmpty()) {
            content += " Note: " + notes;
        }

        return content;
    }

    private String createCommentContent(Comment comment) {
        String commenterName = "Utilisateur inconnu";
        String commenterRole = "unknown";
        String service = null;

        if ("CITIZEN".equals(comment.getAuthorType()) && comment.getCitizen() != null) {
            commenterName = comment.getCitizen().getName();
            commenterRole = comment.getCitizen().getRole();
        } else if ("AGENT".equals(comment.getAuthorType()) && comment.getAgent() != null) {
            commenterName = comment.getAgent().getName();
            commenterRole = "municipal_agent";
            service = comment.getAgent().getService();
        }

        if ("Admin".equals(commenterRole)) {
            commenterName = "Service Technique";
        } else if ("municipal_agent".equals(commenterRole)) {
            if (service != null && !service.trim().isEmpty()) {
                commenterName = "Agent Municipal (" + service + ")";
            } else {
                commenterName = "Agent Municipal";
            }
        }

        return String.format("%s: \"%s\"", commenterName, comment.getDescription());
    }

    private String getStatusDisplayText(String status) {
        switch (status.toLowerCase()) {
            case "new":
                return "Nouveau";
            case "in progress":
                return "En cours";
            case "resolved":
                return "Résolu";
            case "rejected":
                return "Rejeté";
            default:
                return status;
        }
    }
}