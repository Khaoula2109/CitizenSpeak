package com.example.Backend_CitizenSpeak.models;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "agents")
public class CommunityAgent extends User {
    private String service;

    @DBRef(lazy = false)
    private Department department;

    public CommunityAgent() {
        super();
    }

    public CommunityAgent(String name, String email, String password, String phone, String service) {
        super(name, email, password, phone, "Agent");
        this.service = service;
    }

    public CommunityAgent(String name, String email, String password, String phone, String service, Department department) {
        super(name, email, password, phone, "Agent");
        this.service = service;
        this.department = department;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}
