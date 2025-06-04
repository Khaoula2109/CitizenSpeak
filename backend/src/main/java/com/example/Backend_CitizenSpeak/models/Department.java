package com.example.Backend_CitizenSpeak.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document(collection = "departments")
public class Department {
    @Id
    private String departmentId;
    private String name;
    private String contactEmail;
    private String description;
    private String manager;
    private String phone;
    private int employeeCount;
    private float budget;
    private String status;

    @DBRef
    @JsonBackReference
    private Organization organization;

    public Department() {}

    public Department(String name,
                      String contactEmail,
                      String description,
                      String manager,
                      String phone,
                      int employeeCount,
                      float budget,
                      String status,
                      Organization organization) {
        this.name = name;
        this.contactEmail = contactEmail;
        this.description = description;
        this.manager = manager;
        this.phone = phone;
        this.employeeCount = employeeCount;
        this.budget = budget;
        this.status = status;
        this.organization = organization;
    }

}
