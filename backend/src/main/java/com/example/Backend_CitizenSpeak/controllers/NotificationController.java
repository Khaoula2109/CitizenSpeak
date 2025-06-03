package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.models.Notification;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.repositories.NotificationRepository;
import com.example.Backend_CitizenSpeak.services.NotificationService;
import com.example.Backend_CitizenSpeak.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUserNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();

            User user = notificationService.getCorrectUserReference(email);

            System.out.println("=== GET NOTIFICATIONS ===");
            System.out.println("Email: " + email);
            System.out.println("User trouvé: " + user.getUserId() + " (classe: " + user.getClass().getSimpleName() + ")");

            List<Notification> notifications = notificationService.getNotificationsForUser(user);

            List<Map<String, Object>> notificationDTOs = notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            System.out.println("Notifications retournées: " + notificationDTOs.size());
            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            System.err.println("Erreur getUserNotifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Map<String, Object>>> getUnreadNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = notificationService.getCorrectUserReference(email);

            List<Notification> notifications = notificationService.getUnreadNotificationsForUser(user);

            List<Map<String, Object>> notificationDTOs = notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            System.err.println("Erreur getUnreadNotifications: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = notificationService.getCorrectUserReference(email);

            long unreadCount = notificationService.getUnreadCount(user);

            Map<String, Object> response = new HashMap<>();
            response.put("unreadCount", unreadCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Erreur getUnreadCount: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marquée comme lue");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            notificationService.markAllAsReadForUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Toutes les notifications ont été marquées comme lues");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<Map<String, Object>>> getNotificationsByType(
            @PathVariable String type,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            List<Notification> notifications = notificationService.getNotificationsByType(user, type);

            List<Map<String, Object>> notificationDTOs = notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/high-priority")
    public ResponseEntity<List<Map<String, Object>>> getHighPriorityNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            List<Notification> notifications = notificationService.getHighPriorityNotifications(user);

            List<Map<String, Object>> notificationDTOs = notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private Map<String, Object> convertToDTO(Notification notification) {
        Map<String, Object> dto = new HashMap<>();

        String notificationId = notification.getNotificationId();
        dto.put("id", notificationId);
        dto.put("notificationId", notificationId);

        dto.put("type", notification.getType());
        dto.put("title", notification.getTitle());
        dto.put("message", notification.getMessage());
        dto.put("createdDate", notification.getCreatedDate());
        dto.put("isRead", notification.isRead());
        String priority = notification.getPriority();
        if (priority == null || priority.isEmpty()) {
            priority = "medium";
        }
        dto.put("priority", priority);
        String iconType = notification.getIconType();
        if (iconType == null || iconType.isEmpty()) {
            iconType = "bell";
        }
        dto.put("iconType", iconType);

        dto.put("actionUrl", notification.getActionUrl());
        dto.put("relatedEntityId", notification.getRelatedEntityId());
        dto.put("relatedEntityType", notification.getRelatedEntityType());
        if (notification.getRelatedComplaint() != null) {
            Map<String, Object> complaintInfo = new HashMap<>();
            complaintInfo.put("id", notification.getRelatedComplaint().getComplaintId());
            complaintInfo.put("title", notification.getRelatedComplaint().getTitle());
            dto.put("relatedComplaint", complaintInfo);
        } else {
            dto.put("relatedComplaint", null);
        }
        if (notification.getRelatedIntervention() != null) {
            Map<String, Object> interventionInfo = new HashMap<>();
            interventionInfo.put("id", notification.getRelatedIntervention().getInterventionId());
            interventionInfo.put("description", notification.getRelatedIntervention().getDescription());
            dto.put("relatedIntervention", interventionInfo);
        } else {
            dto.put("relatedIntervention", null);
        }

        return dto;
    }

    @GetMapping("/debug-raw")
    public ResponseEntity<List<Notification>> getNotificationsRaw(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            List<Notification> notifications = notificationService.getNotificationsForUser(user);
            System.out.println("=== DEBUG NOTIFICATIONS RAW ===");
            System.out.println("User: " + user.getEmail());
            System.out.println("Notifications count: " + notifications.size());

            for (Notification notif : notifications) {
                System.out.println("ID: " + notif.getNotificationId());
                System.out.println("Title: " + notif.getTitle());
                System.out.println("Type: " + notif.getType());
                System.out.println("IsRead: " + notif.isRead());
                System.out.println("Priority: " + notif.getPriority());
                System.out.println("IconType: " + notif.getIconType());
                System.out.println("---");
            }

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Erreur debug raw: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/test-correct-user")
    public ResponseEntity<Map<String, Object>> testCorrectUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User correctUser = notificationService.getCorrectUserReference(email);

            System.out.println("=== TEST UTILISATEUR CORRECT ===");
            System.out.println("Email: " + email);
            System.out.println("User correct: " + correctUser.getUserId() + " (classe: " + correctUser.getClass().getSimpleName() + ")");

            Notification testNotif = new Notification();
            testNotif.setType("test_correct");
            testNotif.setTitle("Test utilisateur correct");
            testNotif.setMessage("Test avec le bon type d'utilisateur");
            testNotif.setRecipient(correctUser);
            testNotif.setPriority("medium");
            testNotif.setIconType("check-circle");
            testNotif.setRead(false);
            testNotif.setCreatedDate(new Date());
            Notification saved = notificationRepository.save(testNotif);
            List<Notification> check = notificationService.getNotificationsForUser(correctUser);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userType", correctUser.getClass().getSimpleName());
            response.put("userId", correctUser.getUserId());
            response.put("notificationId", saved.getNotificationId());
            response.put("verificationsFound", check.size());
            response.put("notification", convertToDTO(saved));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}