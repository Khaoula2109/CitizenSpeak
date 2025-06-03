package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Setter
@Getter
@Document(collection = "notifications")
public class Notification {
    @Id
    private String notificationId;
    private String notificationType;
    private Date sentDate;
    private String content;
    private boolean isRead;
    private String complaintId;

    @DBRef
    private User user;

    public Notification() {}

    public Notification(String notificationType, Date sentDate, String content, boolean isRead, User user) {
        this.notificationType = notificationType;
        this.sentDate = sentDate;
        this.content = content;
        this.isRead = isRead;
        this.user = user;
    }

}
