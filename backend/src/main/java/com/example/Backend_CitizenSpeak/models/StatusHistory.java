package com.example.Backend_CitizenSpeak.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "status_histories")
public class StatusHistory {
    @Id
    private String statusHistoryId;
    private String status;
    private Date statusDate;
    private String notes;

    @DBRef
    private Complaint complaint;

    @DBRef
    private User updatedBy;

    public StatusHistory() {}

    public StatusHistory(String status, Date statusDate, String notes, Complaint complaint, User updatedBy) {
        this.status = status;
        this.statusDate = statusDate;
        this.notes = notes;
        this.complaint = complaint;
        this.updatedBy = updatedBy;
    }

    public String getStatusHistoryId() {
        return statusHistoryId;
    }

    public void setStatusHistoryId(String statusHistoryId) {
        this.statusHistoryId = statusHistoryId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getStatusDate() {
        return statusDate;
    }

    public void setStatusDate(Date statusDate) {
        this.statusDate = statusDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }
}