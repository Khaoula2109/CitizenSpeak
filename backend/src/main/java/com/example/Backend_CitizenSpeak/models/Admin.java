package com.example.Backend_CitizenSpeak.models;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "admins")
public class Admin extends User {
    public Admin() {
        super();
    }

    public Admin(String name, String email, String password, String phone) {
        super(name, email, password, phone, "Admin");
    }
}
