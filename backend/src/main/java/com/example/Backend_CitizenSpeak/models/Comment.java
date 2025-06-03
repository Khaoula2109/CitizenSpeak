package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
@Setter
@Getter
@Document(collection = "comments")
public class Comment {
    @Id
    private String commentId;
    private Date commentDate;
    private String description;
    private String authorType;

    @DBRef
    private Citizen citizen;

    @DBRef
    private CommunityAgent agent;


    @DBRef
    private Complaint complaint;

    public Comment() {}

    public Comment(Date commentDate, String description, Citizen citizen, Complaint complaint) {
        this.commentDate = commentDate;
        this.description = description;
        this.citizen = citizen;
        this.complaint = complaint;
    }

}
