package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class StatusUpdateRequest {
    private String status;
    private String notes;

    public StatusUpdateRequest() {}

}