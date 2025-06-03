package com.example.Backend_CitizenSpeak.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "organizations")
public class Organization {
    @Id
    private String organizationId;

    private String name;
    private String description;
    private String responsible;
    private String phone;
    private String email;
    private double annualBudget;
    private boolean active = true;

    private String headquartersAddress;

    private String createdBy;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @DBRef
    @JsonManagedReference
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

    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public double getAnnualBudget() { return annualBudget; }
    public void setAnnualBudget(double annualBudget) { this.annualBudget = annualBudget; }


    public String getHeadquartersAddress() { return headquartersAddress; }
    public void setHeadquartersAddress(String headquartersAddress) { this.headquartersAddress = headquartersAddress; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isActive() {
        return active;
    }
    public void setActive(boolean active) {
        this.active = active;
    }

    public List<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(List<Department> departments) {
        this.departments = departments;
    }
}
