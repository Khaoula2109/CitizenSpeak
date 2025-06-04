package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Getter
@Document(collection = "users")
public class User {
    @Setter
    @Id
    private String userId;
    @Setter
    private String name;
    @Setter
    private String email;
    @Setter
    private String password;
    @Setter
    private String phone;
    @Setter
    private String role;
    @Setter
    private boolean active = true;

    @Setter
    private String otp;
    private List<String> backupCodes;

    @Setter
    private String resetToken;
    @Setter
    private Instant resetTokenExpiry;

    @Setter
    private String photo;

    public User() {}

    public User(String name, String email, String password, String phone, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
    }
    public User(String name, String email, String password, String phone, String role, String photo) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.photo = photo;
    }
}
