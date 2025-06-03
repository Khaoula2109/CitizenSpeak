package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@Document(collection = "notifications")
public class Notification {
    @Id
    private String notificationId;

    private String type;
    private String title;
    private String message;
    private Date createdDate;
    private boolean isRead = false;
    private String priority;

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

    public Notification() {
        this.createdDate = new Date();
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