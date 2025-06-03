package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Map;

@Setter
@Getter
public class CommentDTO {
    private String id;
    private Date commentDate;
    private String description;
    private String authorType;

    private Map<String, Object> citizen;

    private Map<String, Object> agent;
    private Map<String, Object> author;

    public CommentDTO() {}

}