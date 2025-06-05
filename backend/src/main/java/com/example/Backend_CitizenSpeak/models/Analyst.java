package com.example.Backend_CitizenSpeak.models;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "analysts")
public class Analyst extends User {

    public Analyst() {
        super();
    }

    public Analyst(String name, String email, String password, String phone) {
        super(name, email, password, phone, "Analyst");
    }
}
