package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.NotificationDTO;
import com.example.Backend_CitizenSpeak.dto.DeviceTokenRequest;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Notification;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.repositories.NotificationRepository;
import com.example.Backend_CitizenSpeak.services.CitizenService;
import com.example.Backend_CitizenSpeak.services.NotificationService;
import com.example.Backend_CitizenSpeak.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final CitizenService citizenService;
    private final UserService userService;
    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationController(NotificationService notificationService,
                                  CitizenService citizenService,
                                  UserService userService,
                                  NotificationRepository notificationRepository) {
        this.notificationService = notificationService;
        this.citizenService = citizenService;
        this.userService = userService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = notificationService.getCorrectUserReference(email);
                System.out.println("GET NOTIFICATIONS");
                System.out.println("Email: " + email);
                System.out.println("User trouvé: " + user.getUserId() + " (classe: " + user.getClass().getSimpleName() + ")");

                List<Notification> notifications = notificationService.getNotificationsForUser(user);
                List<Map<String, Object>> notificationDTOs = notifications.stream()
                        .map(this::convertToDTOAdvanced)
                        .collect(Collectors.toList());

                System.out.println("Notifications retournées: " + notificationDTOs.size());
                return ResponseEntity.ok(notificationDTOs);
            } catch (Exception e) {
                Citizen citizen = citizenService.getCitizenByEmail(email);
                List<Notification> notifications = notificationService.getNotificationsByUser(citizen);
                List<Map<String, Object>> notificationDTOs = notifications.stream()
                        .map(this::convertToDTOSimple)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(notificationDTOs);
            }
        } catch (Exception e) {
            System.err.println("Error retrieving notifications: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving notifications: " + e.getMessage()
            );
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Map<String, Object>>> getUnreadNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = notificationService.getCorrectUserReference(email);
                List<Notification> notifications = notificationService.getUnreadNotificationsForUser(user);
                List<Map<String, Object>> notificationDTOs = notifications.stream()
                        .map(this::convertToDTOAdvanced)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(notificationDTOs);
            } catch (Exception e) {
                Citizen citizen = citizenService.getCitizenByEmail(email);
                List<Notification> notifications = notificationService.getNotificationsByUser(citizen);
                List<Map<String, Object>> notificationDTOs = notifications.stream()
                        .filter(dto -> {
                            Map<String, Object> map = convertToDTOSimple((Notification) dto);
                            return !(Boolean) map.get("isRead");
                        })
                        .map(this::convertToDTOSimple)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(notificationDTOs);
            }
        } catch (Exception e) {
            System.err.println("Erreur getUnreadNotifications: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = notificationService.getCorrectUserReference(email);
                long unreadCount = notificationService.getUnreadCount(user);
                Map<String, Object> response = new HashMap<>();
                response.put("unreadCount", unreadCount);
                response.put("count", unreadCount);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Citizen citizen = citizenService.getCitizenByEmail(email);
                long unreadCount = notificationService.getUnreadCount(citizen);
                Map<String, Object> response = new HashMap<>();
                response.put("unreadCount", unreadCount);
                response.put("count", unreadCount);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error getting unread count: " + e.getMessage()
            );
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCountLegacy(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = notificationService.getCorrectUserReference(email);
                long unreadCount = notificationService.getUnreadCount(user);
                return ResponseEntity.ok(Map.of("count", unreadCount));
            } catch (Exception e) {
                Citizen citizen = citizenService.getCitizenByEmail(email);
                long unreadCount = notificationService.getUnreadCount(citizen);
                return ResponseEntity.ok(Map.of("count", unreadCount));
            }
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error getting unread count: " + e.getMessage()
            );
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable String notificationId,
            Authentication authentication) {
        try {
            try {
                notificationService.markAsRead(notificationId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Notification marquée comme lue");
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                String email = authentication.getName();
                Citizen citizen = citizenService.getCitizenByEmail(email);
                Notification notification = notificationService.markAsRead(notificationId, citizen);
                Map<String, Object> response = convertToDTOSimple(notification);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error marking notification as read: " + e.getMessage()
            );
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = userService.getUserByEmail(email);
                notificationService.markAllAsReadForUser(user);
                return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
            } catch (Exception e) {
                Citizen citizen = citizenService.getCitizenByEmail(email);
                notificationService.markAllAsRead(citizen);
                return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
            }
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error marking all notifications as read: " + e.getMessage()
            );
        }
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsReadAdvanced(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = userService.getUserByEmail(email);
                notificationService.markAllAsReadForUser(user);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Toutes les notifications ont été marquées comme lues");
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Citizen citizen = citizenService.getCitizenByEmail(email);
                notificationService.markAllAsRead(citizen);
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Toutes les notifications ont été marquées comme lues");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable String notificationId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            notificationService.deleteNotification(notificationId, citizen);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error deleting notification: " + e.getMessage()
            );
        }
    }

    @PostMapping("/device-token")
    public ResponseEntity<Map<String, String>> registerDeviceToken(
            @RequestBody DeviceTokenRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            notificationService.registerDeviceToken(citizen, request.getToken(), request.getDeviceType());
            return ResponseEntity.ok(Map.of("message", "Device token registered successfully"));
        } catch (Exception e) {
            System.err.println("Error registering device token: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error registering device token: " + e.getMessage()
            );
        }
    }

    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<Map<String, Object>>> getNotificationsByType(
            @PathVariable String type,
            Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = userService.getUserByEmail(email);
                List<Notification> notifications = notificationService.getNotificationsByType(user, type);
                List<Map<String, Object>> notificationDTOs = notifications.stream()
                        .map(this::convertToDTOAdvanced)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(notificationDTOs);
            } catch (Exception e) {
                return ResponseEntity.ok(List.of());
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/high-priority")
    public ResponseEntity<List<Map<String, Object>>> getHighPriorityNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = userService.getUserByEmail(email);
                List<Notification> notifications = notificationService.getHighPriorityNotifications(user);
                List<Map<String, Object>> notificationDTOs = notifications.stream()
                        .map(this::convertToDTOAdvanced)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(notificationDTOs);
            } catch (Exception e) {
                return ResponseEntity.ok(List.of());
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/debug-raw")
    public ResponseEntity<List<Notification>> getNotificationsRaw(Authentication authentication) {
        try {
            String email = authentication.getName();

            try {
                User user = userService.getUserByEmail(email);
                List<Notification> notifications = notificationService.getNotificationsForUser(user);
                System.out.println("DEBUG NOTIFICATIONS RAW");
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
                return ResponseEntity.ok(List.of());
            }
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

            try {
                User correctUser = notificationService.getCorrectUserReference(email);

                System.out.println("TEST UTILISATEUR CORRECT");
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
                response.put("notification", convertToDTOAdvanced(saved));

                return ResponseEntity.ok(response);
            } catch (Exception e) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Service not available: " + e.getMessage());
                return ResponseEntity.ok(error);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private Map<String, Object> convertToDTOAdvanced(Notification notification) {
        Map<String, Object> dto = new HashMap<>();

        String notificationId = notification.getNotificationId();
        dto.put("id", notificationId);
        dto.put("notificationId", notificationId);

        dto.put("type", notification.getType());
        dto.put("title", notification.getTitle());
        dto.put("message", notification.getMessage());
        dto.put("createdDate", notification.getCreatedDate());
        dto.put("date", notification.getCreatedDate());
        dto.put("isRead", notification.isRead());
        dto.put("read", notification.isRead());

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
            dto.put("complaintId", notification.getRelatedComplaint().getComplaintId());
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

    private Map<String, Object> convertToDTOSimple(Notification notification) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", notification.getNotificationId());
        dto.put("title", getNotificationTitle(notification.getNotificationType()));
        dto.put("description", notification.getContent());
        dto.put("date", notification.getSentDate());
        dto.put("isRead", notification.isRead());
        dto.put("read", notification.isRead());
        dto.put("type", notification.getNotificationType());

        if (notification.getComplaintId() != null) {
            dto.put("complaintId", notification.getComplaintId());
        }

        return dto;
    }

    private String getNotificationTitle(String notificationType) {
        switch (notificationType) {
            case "STATUS_UPDATE":
                return "Plainte mise à jour";
            case "NEW_COMMENT":
                return "Nouveau commentaire";
            case "COMPLAINT_RESOLVED":
                return "Plainte résolue";
            case "COMPLAINT_IN_PROGRESS":
                return "Plainte en cours";
            case "GENERAL":
                return "Notification générale";
            default:
                return "Notification";
        }
    }
}