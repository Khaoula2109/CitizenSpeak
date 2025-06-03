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

    // Type d'auteur : "CITIZEN" ou "AGENT"
    private String authorType;

    @DBRef
    private Citizen citizen;

    @DBRef
    private CommunityAgent agent;

    @DBRef
    private Complaint complaint;

    public Comment() {}

    // Constructeur pour citoyen
    public Comment(Date commentDate, String description, Citizen citizen, Complaint complaint) {
        this.commentDate = commentDate;
        this.description = description;
        this.citizen = citizen;
        this.complaint = complaint;
        this.authorType = "CITIZEN";
    }

    // Constructeur pour agent communal
    public Comment(Date commentDate, String description, CommunityAgent agent, Complaint complaint) {
        this.commentDate = commentDate;
        this.description = description;
        this.agent = agent;
        this.complaint = complaint;
        this.authorType = "AGENT";
    }

    // Méthode utilitaire pour obtenir le nom de l'auteur
    public String getAuthorName() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getName();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return agent.getName();
        }
        return "Utilisateur inconnu";
    }

    // Méthode utilitaire pour obtenir l'email de l'auteur
    public String getAuthorEmail() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getEmail();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return agent.getEmail();
        }
        return null;
    }

    // Méthode utilitaire pour obtenir l'ID de l'auteur
    public String getAuthorId() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getUserId();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return agent.getUserId(); // CommunityAgent hérite de User
        }
        return null;
    }

    // Méthode utilitaire pour obtenir le rôle de l'auteur
    public String getAuthorRole() {
        if ("CITIZEN".equals(authorType) && citizen != null) {
            return citizen.getRole();
        } else if ("AGENT".equals(authorType) && agent != null) {
            return "municipal_agent"; // ou agent.getRole() si vous préférez
        }
        return "unknown";
    }
}