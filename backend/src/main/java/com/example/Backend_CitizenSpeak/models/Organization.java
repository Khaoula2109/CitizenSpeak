package com.example.Backend_CitizenSpeak.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "organizations")
public class Organization {
    @Setter
    @Getter
    @Id
    private String organizationId;

    @Getter
    @Setter
    private String name;
    @Getter
    @Setter
    private String description;
    @Getter
    @Setter
    private String responsible;
    @Getter
    @Setter
    private String phone;
    @Getter
    @Setter
    private String email;
    @Getter
    @Setter
    private double annualBudget;
    @Setter
    @Getter
    private boolean active = true;

    @Setter
    @Getter
    private String headquartersAddress;

    @Setter
    @Getter
    private String createdBy;  // Nom de l'admin
    @Setter
    @Getter
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @DBRef
    private List<Department> departments;
    public Organization() {}

    public Organization(String name, String description, String responsible, String phone, String email,
                        double annualBudget, String organizationType, String headquartersAddress) {
        this.name = name;
        this.description = description;
        this.responsible = responsible;
        this.phone = phone;
        this.email = email;
        this.annualBudget = annualBudget;
        this.headquartersAddress = headquartersAddress;
    }

}
