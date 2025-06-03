package com.example.Backend_CitizenSpeak.models;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "citizens")
public class Citizen extends User {

    public Citizen() {
        super();
    }

    public Citizen(String name,
                   String email,
                   String password,
                   String phone) {
        super(name, email, password, phone, "Citizen");
    }
}
