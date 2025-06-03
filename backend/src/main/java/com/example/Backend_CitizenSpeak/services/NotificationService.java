package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private NotificationRepository notificationRepository;

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

    public List<Notification> getNotificationsForUser(User user) {
        try {
            System.out.println("=== RECHERCHE NOTIFICATIONS INTELLIGENTE ===");
            System.out.println("User ID: " + user.getUserId());
            System.out.println("User Email: " + user.getEmail());
            System.out.println("User Class: " + user.getClass().getSimpleName());

            List<Notification> directResult = notificationRepository.findByRecipientOrderByCreatedDateDesc(user);
            System.out.println("Recherche directe: " + directResult.size());

            if (!directResult.isEmpty()) {
                return directResult;
            }

            String email = user.getEmail();
            List<Notification> allNotifications = notificationRepository.findAll();

            List<Notification> emailMatches = allNotifications.stream()
                    .filter(notif -> notif.getRecipient() != null &&
                            email.equals(notif.getRecipient().getEmail()))
                    .sorted((n1, n2) -> n2.getCreatedDate().compareTo(n1.getCreatedDate()))
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
            List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedDateDesc(user);
            System.out.println("Notifications non lues trouvées: " + unreadNotifications.size());
            return unreadNotifications;
        } catch (Exception e) {
            System.err.println("Erreur notifications non lues: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public long getUnreadCount(User user) {
        try {
            long count = notificationRepository.countByRecipientAndIsReadFalse(user);
            System.out.println("Compteur non lues pour " + user.getEmail() + ": " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Erreur compteur: " + e.getMessage());
            e.printStackTrace();
            return 0;
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
    public void markAllAsReadForUser(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedDateDesc(user);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void notifyAdminNewComplaint(Complaint complaint) {
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
    }

    @Transactional
    public void notifyAdminComplaintResolved(Complaint complaint, User resolvedBy) {
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
    }

    @Transactional
    public void notifyAdminUrgentComplaint(Complaint complaint) {
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
    }

    @Transactional
    public void notifyAgentNewIntervention(CommunityAgent agent, Intervention intervention) {
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
    }

    @Transactional
    public void notifyAgentComment(CommunityAgent agent, Complaint complaint, String commenterName) {
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
    }

    @Transactional
    public void notifyAnalystNewData(User analyst) {
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
    }

    @Transactional
    public void notifyAnalystReportGenerated(User analyst, String reportType) {
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
    }

    @Transactional
    public void notifyAnalystThresholdAlert(User analyst, String metric, String threshold) {
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
    }

    @Transactional
    public void notifyAnalystTrendAlert(User analyst, String trendDescription) {
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
    }

    @Transactional
    public void cleanOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Date cutoffDate = Date.from(thirtyDaysAgo.atZone(ZoneId.systemDefault()).toInstant());
        notificationRepository.deleteOldNotifications(cutoffDate);
    }

    public List<Notification> getNotificationsByType(User user, String type) {
        return notificationRepository.findByRecipientAndTypeOrderByCreatedDateDesc(user, type);
    }

    public List<Notification> getHighPriorityNotifications(User user) {
        return notificationRepository.findByRecipientAndPriorityOrderByCreatedDateDesc(user, "high");
    }

    public User getCorrectUserReference(String email) {
        try {
            Optional<User> directUser = userRepository.findByEmail(email);
            if (directUser.isPresent()) {
                System.out.println("User trouvé directement: " + directUser.get().getUserId());
                return directUser.get();
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
}