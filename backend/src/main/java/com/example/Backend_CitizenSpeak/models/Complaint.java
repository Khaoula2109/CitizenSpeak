package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.Objects;

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
    private int isVerified = 0;
    private int priorityLevel;
    private Date lastUpdated;

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
    @DBRef
    private CommunityAgent assignedAgent;

    @DBRef
    private Department assignedDepartment;
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
        this.isVerified = 0;
    }

    public CommunityAgent getAssignedAgent() {
        if (this.assignedAgent == null) return null;

        CommunityAgent genericAgent = new CommunityAgent();
        genericAgent.setUserId(this.assignedAgent.getUserId());
        genericAgent.setName(this.assignedAgent.getName());
        genericAgent.setEmail(this.assignedAgent.getEmail());
        genericAgent.setRole(this.assignedAgent.getRole());
        genericAgent.setActive(this.assignedAgent.isActive());

        return genericAgent;
    }

    public void setAssignedAgent(CommunityAgent agent) {
        if (agent == null) {
            this.assignedAgent = null;
            return;
        }

        if (agent instanceof CommunityAgent) {
            this.assignedAgent = (CommunityAgent) agent;
        } else {
            CommunityAgent communityAgent = new CommunityAgent();
            communityAgent.setUserId(agent.getUserId());
            communityAgent.setName(agent.getName());
            communityAgent.setEmail(agent.getEmail());
            communityAgent.setRole(agent.getRole());
            communityAgent.setActive(agent.isActive());
            this.assignedAgent = communityAgent;
        }

        updateLastModified();

        if (this.assignedAgent != null && "New".equals(this.status)) {
            this.status = "In Progress";
        }
    }

    public void changeStatus(String status) {
        this.status = status;
        updateLastModified();
    }

    public boolean isVerified() {
        return this.isVerified == 1;
    }

    public boolean isAssigned() {
        return this.assignedAgent != null && this.assignedDepartment != null;
    }

    public void setStatus(String status) {
        this.status = status;
        updateLastModified();

        if (("Resolved".equals(status) || "Closed".equals(status)) && this.closureDate == null) {
            this.closureDate = new Date();
        }
    }

    public void setClosureDate(Date closureDate) {
        this.closureDate = closureDate;
        updateLastModified();
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
        if (this.lastUpdated == null) {
            this.lastUpdated = creationDate;
        }
        updateLastModified();
    }

    public void setPriorityLevel(int priorityLevel) {
        this.priorityLevel = Math.max(1, Math.min(3, priorityLevel));
        updateLastModified();
    }

    private void updateLastModified() {
        this.lastUpdated = new Date();
    }

    public boolean isClosed() {
        return "Resolved".equals(this.status) || "Closed".equals(this.status);
    }
    public String getPriorityString() {
        switch (this.priorityLevel) {
            case 1:
                return "HIGH";
            case 2:
                return "MEDIUM";
            case 3:
            default:
                return "LOW";
        }
    }

    public boolean isResolved() {
        return "Resolved".equals(this.status) || "Closed".equals(this.status);
    }

    public long getResolutionTimeInDays() {
        if (this.creationDate == null || this.closureDate == null) return 0;
        long diffInMillis = this.closureDate.getTime() - this.creationDate.getTime();
        return diffInMillis / (1000 * 60 * 60 * 24);
    }

    public long getDaysSinceCreation() {
        if (this.creationDate == null) return 0;
        long diffInMillis = new Date().getTime() - this.creationDate.getTime();
        return diffInMillis / (1000 * 60 * 60 * 24);
    }

    public void setPriorityFromString(String priority) {
        switch (priority.toLowerCase()) {
            case "high":
                this.priorityLevel = 1;
                break;
            case "medium":
                this.priorityLevel = 2;
                break;
            case "low":
            default:
                this.priorityLevel = 3;
                break;
        }
        updateLastModified();
    }

    public String getInternalNotes() {
        return null;
    }

    public void setInternalNotes(String internalNotes) {
        updateLastModified();
    }

    @Override
    public String toString() {
        return "Complaint{" +
                "complaintId='" + complaintId + '\'' +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", priorityLevel=" + priorityLevel +
                ", creationDate=" + creationDate +
                ", assignedAgent=" + (assignedAgent != null ? assignedAgent.getName() : "Non assigné") +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Complaint complaint = (Complaint) o;
        return Objects.equals(complaintId, complaint.complaintId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(complaintId);
    }
}
