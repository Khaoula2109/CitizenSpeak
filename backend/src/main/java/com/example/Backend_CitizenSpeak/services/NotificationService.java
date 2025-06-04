package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private AgentRepository agentRepository;
    @Autowired
    private AnalystRepository analystRepository;
    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               DeviceTokenRepository deviceTokenRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<Notification> getNotificationsByUser(User user) {
        try {
            return notificationRepository.findByUserOrderBySentDateDesc(user);
        } catch (Exception e) {
            return getNotificationsForUser(user);
        }
    }

    public List<Notification> getNotificationsForUser(User user) {
        try {
            System.out.println("=== RECHERCHE NOTIFICATIONS INTELLIGENTE ===");
            System.out.println("User ID: " + user.getUserId());
            System.out.println("User Email: " + user.getEmail());
            System.out.println("User Class: " + user.getClass().getSimpleName());

            try {
                List<Notification> directResult = notificationRepository.findByRecipientOrderByCreatedDateDesc(user);
                System.out.println("Recherche directe: " + directResult.size());
                if (!directResult.isEmpty()) {
                    return directResult;
                }
            } catch (Exception e) {
                System.out.println("Méthode directe non disponible, fallback vers ancienne méthode");
            }

            try {
                List<Notification> legacyResult = notificationRepository.findByUserOrderBySentDateDesc(user);
                System.out.println("Recherche legacy: " + legacyResult.size());
                if (!legacyResult.isEmpty()) {
                    return legacyResult;
                }
            } catch (Exception e) {
                System.out.println("Méthode legacy non disponible");
            }

            String email = user.getEmail();
            List<Notification> allNotifications = notificationRepository.findAll();

            List<Notification> emailMatches = allNotifications.stream()
                    .filter(notif -> {
                        try {
                            return notif.getRecipient() != null &&
                                    email.equals(notif.getRecipient().getEmail());
                        } catch (Exception e) {
                            try {
                                return notif.getUser() != null &&
                                        email.equals(notif.getUser().getEmail());
                            } catch (Exception ex) {
                                return false;
                            }
                        }
                    })
                    .sorted((n1, n2) -> {
                        try {
                            return n2.getCreatedDate().compareTo(n1.getCreatedDate());
                        } catch (Exception e) {
                            try {
                                return n2.getSentDate().compareTo(n1.getSentDate());
                            } catch (Exception ex) {
                                return 0;
                            }
                        }
                    })
                    .collect(Collectors.toList());

            System.out.println("Recherche par email: " + emailMatches.size());
            return emailMatches;

        } catch (Exception e) {
            System.err.println("Erreur récupération notifications: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<Notification> getUnreadNotificationsForUser(User user) {
        try {
            System.out.println("=== RECUPERATION NOTIFICATIONS NON LUES ===");

            try {
                List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedDateDesc(user);
                System.out.println("Notifications non lues trouvées: " + unreadNotifications.size());
                return unreadNotifications;
            } catch (Exception e) {
                try {
                    List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderBySentDateDesc(user);
                    System.out.println("Notifications non lues (legacy): " + unreadNotifications.size());
                    return unreadNotifications;
                } catch (Exception ex) {
                    return getNotificationsForUser(user).stream()
                            .filter(notif -> !notif.isRead())
                            .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur notifications non lues: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Notification getNotificationById(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
    }

    public long getUnreadCount(User user) {
        try {
            try {
                long count = notificationRepository.countByRecipientAndIsReadFalse(user);
                System.out.println("Compteur non lues pour " + user.getEmail() + ": " + count);
                return count;
            } catch (Exception e) {
                try {
                    long count = notificationRepository.countByUserAndIsReadFalse(user);
                    System.out.println("Compteur non lues (legacy): " + count);
                    return count;
                } catch (Exception ex) {
                    return getUnreadNotificationsForUser(user).size();
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur compteur: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    @Transactional
    public Notification markAsRead(String notificationId, User user) {
        try {
            Notification notification = getNotificationById(notificationId);

            try {
                if (!notification.getUser().getUserId().equals(user.getUserId())) {
                    throw new RuntimeException("Unauthorized access to notification");
                }
            } catch (Exception e) {
                try {
                    if (!notification.getRecipient().getUserId().equals(user.getUserId())) {
                        throw new RuntimeException("Unauthorized access to notification");
                    }
                } catch (Exception ex) {
                    System.out.println("Skipping authorization check");
                }
            }

            notification.setRead(true);
            return notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error in markAsRead with user: " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void markAsRead(String notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent()) {
            notification.get().setRead(true);
            notificationRepository.save(notification.get());
        }
    }

    @Transactional
    public void markAllAsRead(User user) {
        try {
            try {
                List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadFalseOrderBySentDateDesc(user);
                unreadNotifications.forEach(notification -> notification.setRead(true));
                notificationRepository.saveAll(unreadNotifications);
            } catch (Exception e) {
                markAllAsReadForUser(user);
            }
        } catch (Exception e) {
            System.err.println("Error marking all as read: " + e.getMessage());
        }
    }

    @Transactional
    public void markAllAsReadForUser(User user) {
        try {
            List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedDateDesc(user);
            unreadNotifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
        } catch (Exception e) {
            List<Notification> unreadNotifications = getUnreadNotificationsForUser(user);
            unreadNotifications.forEach(notification -> notification.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
        }
    }

    @Transactional
    public void deleteNotification(String notificationId, User user) {
        Notification notification = getNotificationById(notificationId);

        try {
            if (!notification.getUser().getUserId().equals(user.getUserId())) {
                throw new RuntimeException("Unauthorized access to notification");
            }
        } catch (Exception e) {
            try {
                if (!notification.getRecipient().getUserId().equals(user.getUserId())) {
                    throw new RuntimeException("Unauthorized access to notification");
                }
            } catch (Exception ex) {
                System.out.println("Skipping authorization check for deletion");
            }
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void registerDeviceToken(User user, String token, String deviceType) {
        try {
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
        } catch (Exception e) {
            System.err.println("Error registering device token: " + e.getMessage());
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

            try {
                notification.setUser(complaint.getCitizen());
            } catch (Exception e) {
                notification.setRecipient(complaint.getCitizen());
            }

            try {
                notification.setComplaintId(complaint.getComplaintId());
            } catch (Exception e) {
                System.out.println("ComplaintId field not available");
            }

            notificationRepository.save(notification);

            try {
                eventPublisher.publishEvent(new NotificationEvent(notification));
            } catch (Exception e) {
                System.out.println("Event publisher not available");
            }

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

            try {
                notification.setUser(comment.getComplaint().getCitizen());
            } catch (Exception e) {
                notification.setRecipient(comment.getComplaint().getCitizen());
            }

            try {
                notification.setComplaintId(comment.getComplaint().getComplaintId());
            } catch (Exception e) {
                System.out.println("ComplaintId field not available");
            }

            notificationRepository.save(notification);

            try {
                eventPublisher.publishEvent(new NotificationEvent(notification));
            } catch (Exception e) {
                System.out.println("Event publisher not available");
            }

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

            try {
                notification.setUser(user);
            } catch (Exception e) {
                notification.setRecipient(user);
            }

            notificationRepository.save(notification);

            try {
                eventPublisher.publishEvent(new NotificationEvent(notification));
            } catch (Exception e) {
                System.out.println("Event publisher not available");
            }
        } catch (Exception e) {
            System.err.println("Error creating general notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void notifyAdminNewComplaint(Complaint complaint) {
        try {
            List<Admin> admins = adminRepository.findAll();
            for (Admin admin : admins) {
                Notification notification = new Notification(
                        "new_complaint",
                        "Nouvelle plainte soumise",
                        String.format("Une nouvelle plainte '%s' a été soumise par %s",
                                complaint.getTitle(), complaint.getCitizen().getName()),
                        admin,
                        complaint,
                        "medium"
                );
                notification.setIconType("alert-circle");
                notification.setActionUrl("/admin/complaints/" + complaint.getComplaintId());
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying admin new complaint: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAdminComplaintResolved(Complaint complaint, User resolvedBy) {
        try {
            List<Admin> admins = adminRepository.findAll();
            for (Admin admin : admins) {
                Notification notification = new Notification(
                        "complaint_resolved",
                        "Plainte résolue",
                        String.format("La plainte '%s' a été marquée comme résolue par %s",
                                complaint.getTitle(), resolvedBy.getName()),
                        admin,
                        complaint,
                        "low"
                );
                notification.setIconType("check-circle");
                notification.setActionUrl("/admin/complaints/" + complaint.getComplaintId());
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying admin complaint resolved: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAdminUrgentComplaint(Complaint complaint) {
        try {
            List<Admin> admins = adminRepository.findAll();
            for (Admin admin : admins) {
                Notification notification = new Notification(
                        "urgent_complaint",
                        "Plainte urgente",
                        String.format("Une plainte urgente '%s' nécessite une attention immédiate",
                                complaint.getTitle()),
                        admin,
                        complaint,
                        "high"
                );
                notification.setIconType("alert-triangle");
                notification.setActionUrl("/admin/complaints/" + complaint.getComplaintId());
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying admin urgent complaint: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAgentAssignment(CommunityAgent agent, Complaint complaint, User assignedBy) {
        try {
            System.out.println("=== CREATION NOTIFICATION ASSIGNMENT ===");
            System.out.println("Agent email: " + agent.getEmail());
            System.out.println("Agent ID: " + agent.getUserId());

            Notification notification = new Notification(
                    "complaint_assigned",
                    "Nouvelle assignation",
                    String.format("La plainte '%s' vous a été assignée par %s",
                            complaint.getTitle(), assignedBy.getName()),
                    agent,
                    complaint,
                    "high"
            );

            notification.setIconType("user-check");
            notification.setActionUrl("/agent/complaints/" + complaint.getComplaintId());

            Notification saved = notificationRepository.save(notification);
            System.out.println("Notification créée avec ID: " + saved.getNotificationId());

            List<Notification> check = getNotificationsForUser(agent);
            System.out.println("Vérification: " + check.size() + " notifications trouvées pour l'agent");

        } catch (Exception e) {
            System.err.println("Erreur création notification assignment: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void notifyAgentStatusUpdate(CommunityAgent agent, Complaint complaint, String newStatus) {
        try {
            Notification notification = new Notification(
                    "status_update",
                    "Mise à jour de statut",
                    String.format("Le statut de la plainte '%s' a été modifié : %s",
                            complaint.getTitle(), newStatus),
                    agent,
                    complaint,
                    "medium"
            );
            notification.setIconType("refresh-cw");
            notification.setActionUrl("/agent/complaints/" + complaint.getComplaintId());
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying agent status update: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAgentComment(CommunityAgent agent, Complaint complaint, String commenterName) {
        try {
            Notification notification = new Notification(
                    "new_comment",
                    "Nouveau commentaire",
                    String.format("Un nouveau commentaire a été ajouté à la plainte '%s' par %s",
                            complaint.getTitle(), commenterName),
                    agent,
                    complaint,
                    "low"
            );
            notification.setIconType("message-circle");
            notification.setActionUrl("/agent/complaints/" + complaint.getComplaintId());
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying agent comment: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAgentNewIntervention(CommunityAgent agent, Intervention intervention) {
        try {
            Notification notification = new Notification(
                    "new_intervention",
                    "Nouvelle intervention planifiée",
                    String.format("Une intervention a été planifiée : %s",
                            intervention.getDescription()),
                    agent
            );
            notification.setRelatedIntervention(intervention);
            notification.setRelatedEntityId(intervention.getInterventionId());
            notification.setRelatedEntityType("intervention");
            notification.setIconType("calendar");
            notification.setPriority("medium");
            notification.setActionUrl("/agent/interventions/" + intervention.getInterventionId());
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying agent new intervention: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAnalystNewData(User analyst) {
        try {
            Notification notification = new Notification(
                    "data_update",
                    "Nouvelles données disponibles",
                    "De nouvelles données sont disponibles pour l'analyse",
                    analyst
            );
            notification.setIconType("bar-chart");
            notification.setPriority("medium");
            notification.setActionUrl("/analyst/dashboard");
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying analyst new data: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAnalystReportGenerated(User analyst, String reportType) {
        try {
            Notification notification = new Notification(
                    "report_ready",
                    "Rapport généré",
                    String.format("Le rapport %s a été généré avec succès", reportType),
                    analyst
            );
            notification.setIconType("file-text");
            notification.setPriority("low");
            notification.setActionUrl("/analyst/reports");
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying analyst report generated: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAnalystThresholdAlert(User analyst, String metric, String threshold) {
        try {
            Notification notification = new Notification(
                    "threshold_alert",
                    "Seuil d'alerte atteint",
                    String.format("Le seuil d'alerte pour %s a été dépassé : %s", metric, threshold),
                    analyst
            );
            notification.setIconType("alert-triangle");
            notification.setPriority("high");
            notification.setActionUrl("/analyst/alerts");
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying analyst threshold alert: " + e.getMessage());
        }
    }

    @Transactional
    public void notifyAnalystTrendAlert(User analyst, String trendDescription) {
        try {
            Notification notification = new Notification(
                    "trend_alert",
                    "Tendance détectée",
                    String.format("Nouvelle tendance détectée : %s", trendDescription),
                    analyst
            );
            notification.setIconType("trending-up");
            notification.setPriority("medium");
            notification.setActionUrl("/analyst/trends");
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error notifying analyst trend alert: " + e.getMessage());
        }
    }

    public List<Notification> getNotificationsByType(User user, String type) {
        try {
            return notificationRepository.findByRecipientAndTypeOrderByCreatedDateDesc(user, type);
        } catch (Exception e) {
            return getNotificationsForUser(user).stream()
                    .filter(notif -> type.equals(notif.getType()))
                    .collect(Collectors.toList());
        }
    }

    public List<Notification> getHighPriorityNotifications(User user) {
        try {
            return notificationRepository.findByRecipientAndPriorityOrderByCreatedDateDesc(user, "high");
        } catch (Exception e) {
            return getNotificationsForUser(user).stream()
                    .filter(notif -> "high".equals(notif.getPriority()))
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public void cleanOldNotifications() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            Date cutoffDate = Date.from(thirtyDaysAgo.atZone(ZoneId.systemDefault()).toInstant());
            notificationRepository.deleteOldNotifications(cutoffDate);
        } catch (Exception e) {
            System.err.println("Error cleaning old notifications: " + e.getMessage());
        }
    }

    public User getCorrectUserReference(String email) {
        try {
            try {
                Optional<User> directUser = userRepository.findByEmail(email);
                if (directUser.isPresent()) {
                    System.out.println("User trouvé directement: " + directUser.get().getUserId());
                    return directUser.get();
                }
            } catch (Exception e) {
                System.out.println("UserRepository non disponible");
            }

            try {
                CommunityAgent agent = agentRepository.findByEmail(email)
                        .orElse(null);
                if (agent != null) {
                    System.out.println("Agent trouvé: " + agent.getUserId());
                    return agent;
                }
            } catch (Exception e) {
                System.out.println("Pas un agent: " + e.getMessage());
            }

            try {
                Citizen citizen = citizenRepository.findByEmail(email)
                        .orElse(null);
                if (citizen != null) {
                    System.out.println("Citizen trouvé: " + citizen.getUserId());
                    return citizen;
                }
            } catch (Exception e) {
                System.out.println("Pas un citizen: " + e.getMessage());
            }

            throw new RuntimeException("Utilisateur non trouvé: " + email);
        } catch (Exception e) {
            System.err.println("Erreur récupération utilisateur correct: " + e.getMessage());
            e.printStackTrace();
            throw e;
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