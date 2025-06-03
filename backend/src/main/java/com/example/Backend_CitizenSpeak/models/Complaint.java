package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Setter
@Getter
@Document(collection = "complaints")
public class Complaint {
    @Id
    private String complaintId;
    private String title;
    private String description;
    private Date creationDate;
    private String status;
    private double latitude;
    private double longitude;
    private Date closureDate;
    private int priorityLevel;

    @DBRef
    private Citizen citizen;

    @DBRef
    private Category category;

    @DBRef
    private Infrastructure infrastructure;

    @DBRef
    private List<Media> media;

    @DBRef
    private List<StatusHistory> statusHistory;

    @DBRef
    private List<Comment> comments;
    public Complaint() {}

    public Complaint(String title,
                     String description,
                     Date creationDate,
                     String status,
                     double latitude,
                     double longitude,
                     Citizen citizen,
                     Category category,
                     Infrastructure infrastructure) {
        this.title = title;
        this.description = description;
        this.creationDate = creationDate;
        this.status = status;
        this.latitude = latitude;
        this.longitude = longitude;
        this.citizen = citizen;
        this.category = category;
        this.infrastructure = infrastructure;
    }

}
