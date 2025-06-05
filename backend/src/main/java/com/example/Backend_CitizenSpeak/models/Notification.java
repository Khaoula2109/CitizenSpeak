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
    private String type;
    private String title;
    private String message;
    private Date createdDate;
    private String priority;

    @DBRef
    private User user;
    @DBRef
    private User recipient;
    @DBRef
    private Complaint relatedComplaint;

    @DBRef
    private Intervention relatedIntervention;

    private String relatedEntityId;
    private String relatedEntityType;

    private String actionUrl;
    private String iconType;

    public Notification() {}

    public Notification(String notificationType, Date sentDate, String content, boolean isRead, User user) {
        this.notificationType = notificationType;
        this.sentDate = sentDate;
        this.content = content;
        this.isRead = isRead;
        this.user = user;
    }
    public Notification(String type, String title, String message, User recipient) {
        this();
        this.type = type;
        this.title = title;
        this.message = message;
        this.recipient = recipient;
    }

    public Notification(String type, String title, String message, User recipient,
                        Complaint relatedComplaint, String priority) {
        this(type, title, message, recipient);
        this.relatedComplaint = relatedComplaint;
        this.relatedEntityId = relatedComplaint.getComplaintId();
        this.relatedEntityType = "complaint";
        this.priority = priority;
    }

    public boolean isRead() {
        return this.isRead;
    }

    public void setRead(boolean read) {
        this.isRead = read;
    }

}
