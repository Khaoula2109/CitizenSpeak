package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class NotificationDTO {
    private String id;
    private String title;
    private String description;
    private Date date;
    private boolean read;
    private String type;
    private String complaintId;

    public NotificationDTO() {}

}