package com.example.Backend_CitizenSpeak.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

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

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(int employeeCount) {
        this.employeeCount = employeeCount;
    }

    public float getBudget() {
        return budget;
    }

    public void setBudget(float budget) {
        this.budget = budget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }
}
