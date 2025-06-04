package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Map;
@Getter
@Setter
public class CommentDTO {
    private String id;
    private Date commentDate;
    private String description;
    private Map<String, Object> citizen;
    private Map<String, Object> agent;
    private Map<String, Object> author;

    private boolean isFromCurrentUser;
    private String authorType;

    public CommentDTO() {}

    public boolean isFromCurrentUser() {
        return isFromCurrentUser;
    }

    public void setFromCurrentUser(boolean fromCurrentUser) {
        isFromCurrentUser = fromCurrentUser;
    }
}