package com.example.Backend_CitizenSpeak.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PushNotificationService {

    @Value("${fcm.server.key:}")
    private String fcmServerKey;

    @Value("${fcm.url:https://fcm.googleapis.com/fcm/send}")
    private String fcmUrl;

    private final RestTemplate restTemplate;

    public PushNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendPushNotification(String deviceToken, String title, String body, String complaintId) {
        try {
            if (fcmServerKey == null || fcmServerKey.isEmpty()) {
                System.out.println("FCM server key not configured, skipping push notification");
                return;
            }

            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("body", body);
            notification.put("sound", "default");

            Map<String, Object> data = new HashMap<>();
            data.put("type", "notification");
            if (complaintId != null) {
                data.put("complaintId", complaintId);
            }

            Map<String, Object> message = new HashMap<>();
            message.put("to", deviceToken);
            message.put("notification", notification);
            message.put("data", data);
            message.put("priority", "high");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "key=" + fcmServerKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(message, headers);

            restTemplate.exchange(fcmUrl, HttpMethod.POST, entity, String.class);

            System.out.println("Push notification sent successfully to token: " + deviceToken.substring(0, 10) + "...");

        } catch (Exception e) {
            System.err.println("Error sending push notification: " + e.getMessage());
            throw new RuntimeException("Failed to send push notification", e);
        }
    }

}
