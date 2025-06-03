package com.example.Backend_CitizenSpeak.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginRequest {

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    private Boolean rememberMe;

    public LoginRequest() { }

    public LoginRequest(String email, String password, Boolean rememberMe) {
        this.email      = email;
        this.password   = password;
        this.rememberMe = rememberMe;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(Boolean rememberMe) {
        this.rememberMe = rememberMe;
    }
}
