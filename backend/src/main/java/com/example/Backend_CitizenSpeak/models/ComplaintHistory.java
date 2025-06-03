package com.example.Backend_CitizenSpeak.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

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

    public String getHistoryId() {
        return historyId;
    }

    public void setHistoryId(String historyId) {
        this.historyId = historyId;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }
}
