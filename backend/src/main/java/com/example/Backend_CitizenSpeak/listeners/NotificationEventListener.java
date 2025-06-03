package com.example.Backend_CitizenSpeak.listeners;

import com.example.Backend_CitizenSpeak.models.NotificationEvent;
import com.example.Backend_CitizenSpeak.models.Notification;
import com.example.Backend_CitizenSpeak.models.DeviceToken;
import com.example.Backend_CitizenSpeak.repositories.DeviceTokenRepository;
import com.example.Backend_CitizenSpeak.services.PushNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotificationEventListener {

    private final PushNotificationService pushNotificationService;
    private final DeviceTokenRepository deviceTokenRepository;

    @Autowired
    public NotificationEventListener(PushNotificationService pushNotificationService,
                                     DeviceTokenRepository deviceTokenRepository) {
        this.pushNotificationService = pushNotificationService;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    @EventListener
    @Async
    public void handleNotificationEvent(NotificationEvent event) {
        try {
            Notification notification = event.getNotification();
            System.out.println("Processing notification event for user: " + notification.getUser().getUserId());

            List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserAndActiveTrue(notification.getUser());

            if (deviceTokens.isEmpty()) {
                System.out.println("No active device tokens found for user: " + notification.getUser().getUserId());
                return;
            }

            for (DeviceToken deviceToken : deviceTokens) {
                try {
                    pushNotificationService.sendPushNotification(
                            deviceToken.getToken(),
                            getNotificationTitle(notification.getNotificationType()),
                            notification.getContent(),
                            notification.getComplaintId()
                    );

                    System.out.println("Push notification sent to device: " + deviceToken.getTokenId());
                } catch (Exception e) {
                    System.err.println("Failed to send push notification to device " +
                            deviceToken.getTokenId() + ": " + e.getMessage());

                    if (e.getMessage().contains("invalid token") || e.getMessage().contains("not registered")) {
                        deviceToken.setActive(false);
                        deviceTokenRepository.save(deviceToken);
                        System.out.println("Marked device token as inactive: " + deviceToken.getTokenId());
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("Error handling notification event: " + e.getMessage());
            e.printStackTrace();
        }
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
                return "Notification";
            default:
                return "CitizenSpeak";
        }
    }
}

