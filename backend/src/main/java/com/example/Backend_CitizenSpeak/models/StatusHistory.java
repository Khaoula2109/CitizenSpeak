package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Setter
@Getter
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

}