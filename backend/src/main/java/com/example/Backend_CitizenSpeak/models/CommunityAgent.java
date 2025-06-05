package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
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

}
