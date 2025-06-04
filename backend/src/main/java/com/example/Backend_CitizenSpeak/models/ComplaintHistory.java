package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Setter
@Getter
@Document(collection = "complaint_history")
public class ComplaintHistory {
    @Id
    private String historyId;
    private Date eventDate;
    private String description;

    @DBRef
    private Complaint complaint;

    public ComplaintHistory() {}

    public ComplaintHistory(Date eventDate, String description, Complaint complaint) {
        this.eventDate = eventDate;
        this.description = description;
        this.complaint = complaint;
    }

}
