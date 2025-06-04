package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Map;

@Setter
@Getter
public class StatusHistoryDTO {
    private String id;
    private String status;
    private Date statusDate;
    private String notes;
    private Map<String, Object> updatedBy;

    public StatusHistoryDTO() {}

}