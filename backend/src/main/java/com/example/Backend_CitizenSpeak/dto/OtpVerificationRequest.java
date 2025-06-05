package com.example.Backend_CitizenSpeak.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class OtpVerificationRequest {

    @NotBlank(message = "Le token est obligatoire")
    private String token;
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "L'OTP est obligatoire")
    @Size(min = 6, max = 6, message = "L'OTP doit comporter 6 chiffres")
    private String otp;

}
