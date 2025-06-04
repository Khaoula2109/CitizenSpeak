package com.example.Backend_CitizenSpeak.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DeviceTokenRequest {
    private String token;
    private String deviceType;


    public DeviceTokenRequest(String token, String deviceType) {
        this.token = token;
        this.deviceType = deviceType;
    }

}

