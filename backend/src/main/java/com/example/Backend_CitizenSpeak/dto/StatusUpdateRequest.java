package com.example.Backend_CitizenSpeak.dto;

public class StatusUpdateRequest {
    private String status;
    private String notes;

    public StatusUpdateRequest() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}