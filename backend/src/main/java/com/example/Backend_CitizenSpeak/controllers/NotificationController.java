package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.NotificationDTO;
import com.example.Backend_CitizenSpeak.dto.DeviceTokenRequest;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Notification;
import com.example.Backend_CitizenSpeak.services.CitizenService;
import com.example.Backend_CitizenSpeak.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CitizenService citizenService;

    @Autowired
    public NotificationController(NotificationService notificationService,
                                  CitizenService citizenService) {
        this.notificationService = notificationService;
        this.citizenService = citizenService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(Authentication authentication) {
        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            List<Notification> notifications = notificationService.getNotificationsByUser(citizen);
            List<NotificationDTO> notificationDTOs = notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(notificationDTOs);
        } catch (Exception e) {
            System.err.println("Error retrieving notifications: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving notifications: " + e.getMessage()
            );
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable String notificationId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            Notification notification = notificationService.markAsRead(notificationId, citizen);
            return ResponseEntity.ok(convertToDTO(notification));
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
            Citizen citizen = citizenService.getCitizenByEmail(email);

            notificationService.markAllAsRead(citizen);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error marking all notifications as read: " + e.getMessage()
            );
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

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            long unreadCount = notificationService.getUnreadCount(citizen);
            return ResponseEntity.ok(Map.of("count", unreadCount));
        } catch (Exception e) {
            System.err.println("Error getting unread count: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error getting unread count: " + e.getMessage()
            );
        }
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getNotificationId());
        dto.setTitle(getNotificationTitle(notification.getNotificationType()));
        dto.setDescription(notification.getContent());
        dto.setDate(notification.getSentDate());
        dto.setRead(notification.isRead());
        dto.setType(notification.getNotificationType());

        if (notification.getComplaintId() != null) {
            dto.setComplaintId(notification.getComplaintId());
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