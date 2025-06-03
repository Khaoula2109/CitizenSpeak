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
    private double latitude;
    private double longitude;
    private int priorityLevel;
    private Map<String, Object> category;
    private Map<String, Object> citizen;
    private List<Map<String, Object>> media;
    private List<CommentDTO> comments;
    private List<StatusHistoryDTO> statusHistory;

    public ComplaintResponse() {}

}