package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class CommentRequest {
    private String description;

    public CommentRequest() {}

}