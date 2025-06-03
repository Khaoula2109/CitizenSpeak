package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "citizens")
public class Citizen extends User {
    private String address;

    public Citizen() {
        super();
    }

    public Citizen(String name,
                   String email,
                   String password,
                   String phone,
                   String address) {
        super(name, email, password, phone, "Citizen");
        this.address = address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
