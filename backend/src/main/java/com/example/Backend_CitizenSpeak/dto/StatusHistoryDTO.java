package com.example.Backend_CitizenSpeak.dto;

import java.util.Date;
import java.util.Map;

public class StatusHistoryDTO {
    private String id;
    private String status;
    private Date statusDate;
    private String notes;
    private Map<String, Object> updatedBy;

    public StatusHistoryDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public Map<String, Object> getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Map<String, Object> updatedBy) {
        this.updatedBy = updatedBy;
    }
}