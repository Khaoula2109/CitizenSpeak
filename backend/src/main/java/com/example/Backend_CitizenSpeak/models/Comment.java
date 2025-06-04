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
        this.authorType = "CITIZEN";
    }

    public Comment(Date commentDate, String description, CommunityAgent agent, Complaint complaint) {
        this.commentDate = commentDate;
        this.description = description;
        this.agent = agent;
        this.complaint = complaint;
        this.authorType = "AGENT";
    }

    public String getAuthorName() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getName();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return agent.getName();
        }
        return "Utilisateur inconnu";
    }

    public String getAuthorEmail() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getEmail();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return agent.getEmail();
        }
        return null;
    }

    public String getAuthorId() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getUserId();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return agent.getUserId(); // CommunityAgent hérite de User
        }
        return null;
    }

    public String getAuthorRole() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getRole();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return "municipal_agent"; // ou agent.getRole() si vous préférez
        }
        return "unknown";
    }
}