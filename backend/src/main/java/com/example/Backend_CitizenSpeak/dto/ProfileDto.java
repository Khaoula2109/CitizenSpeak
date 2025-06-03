package com.example.Backend_CitizenSpeak.dto;

public record ProfileDto(
        String fullName,
        String email,
        String phone,
        String role,
        String photo,
        String departmentId,
        String departmentName,
        String service
) {}
