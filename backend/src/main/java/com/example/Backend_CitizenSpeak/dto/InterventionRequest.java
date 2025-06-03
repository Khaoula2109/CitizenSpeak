package com.example.Backend_CitizenSpeak.dto;

import java.util.Date;
import java.util.List;
import java.util.Map;

public class InterventionRequest {
    private Date startDate;
    private Date endDate;
    private String status;
    private String description;
    private List<String> resourcesNeeded;

    public InterventionRequest() {}

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
}

