package com.example.Backend_CitizenSpeak.dto;

import java.util.Date;
import java.util.List;
import java.util.Map;

public class InterventionResponse {
    private String interventionId;
    private Date startDate;
    private Date endDate;
    private String status;
    private String description;
    private List<String> resourcesNeeded;
    private List<Map<String, Object>> agents;
    private Map<String, Object> complaint;

    public InterventionResponse() {}

    public String getInterventionId() {
        return interventionId;
    }

    public void setInterventionId(String interventionId) {
        this.interventionId = interventionId;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getResourcesNeeded() {
        return resourcesNeeded;
    }

    public void setResourcesNeeded(List<String> resourcesNeeded) {
        this.resourcesNeeded = resourcesNeeded;
    }

    public List<Map<String, Object>> getAgents() {
        return agents;
    }

    public void setAgents(List<Map<String, Object>> agents) {
        this.agents = agents;
    }

    public Map<String, Object> getComplaint() {
        return complaint;
    }

    public void setComplaint(Map<String, Object> complaint) {
        this.complaint = complaint;
    }
}