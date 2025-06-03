package com.example.Backend_CitizenSpeak.dto;

import java.util.Date;

public class CommentRequest {
    private String description;

    public CommentRequest() {}

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}