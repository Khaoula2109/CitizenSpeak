package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Setter
@Getter
public class ComplaintResponse {
    private String complaintId;
    private String title;
    private String description;
    private String status;
    private Date creationDate;
    private Date closureDate;
    private Double latitude;
    private Double longitude;
    private int priorityLevel;
    private Map<String, Object> category;
    private Map<String, Object> citizen;
    private List<Map<String, Object>> media;
    private List<CommentDTO> comments;
    private List<StatusHistoryDTO> statusHistory;
    private Map<String, Object> assignedTo;
    private String department;
    private int isVerified;

    private Map<String, Object> infrastructure;
    private List<Map<String, Object>> interventions;

    public ComplaintResponse() {}

    public String getPriority() {
        switch (priorityLevel) {
            case 1:
                return "high";
            case 2:
                return "medium";
            case 3:
            default:
                return "low";
        }
    }

    public String getLocation() {
        if (latitude != null && longitude != null) {
            return String.format("%.6f, %.6f", latitude, longitude);
        }
        return "Coordonnées non disponibles";
    }

    public int getCommentsCount() {
        return comments != null ? comments.size() : 0;
    }

    @Override
    public String toString() {
        return "ComplaintResponse{" +
                "complaintId='" + complaintId + '\'' +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", isVerified=" + isVerified +
                ", priorityLevel=" + priorityLevel +
                '}';
    }


}