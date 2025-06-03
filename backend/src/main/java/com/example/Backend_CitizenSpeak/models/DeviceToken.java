package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Setter
@Getter
@Document(collection = "device_tokens")
public class DeviceToken {
    @Id
    private String tokenId;
    private String token;
    private String deviceType;
    private Date registrationDate;
    private boolean active;

    @DBRef
    private User user;

    public DeviceToken() {}

    public DeviceToken(String token, String deviceType, Date registrationDate, boolean active, User user) {
        this.token = token;
        this.deviceType = deviceType;
        this.registrationDate = registrationDate;
        this.active = active;
        this.user = user;
    }

}
