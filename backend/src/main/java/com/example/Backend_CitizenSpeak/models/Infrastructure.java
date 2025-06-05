package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document(collection = "infrastructures")
public class Infrastructure {
    @Id
    private String infrastructureId;
    private String type;
    private String reference;
    private String location;

    public Infrastructure() {}

    public Infrastructure(String type, String reference, String location) {
        this.type = type;
        this.reference = reference;
        this.location = location;
    }

}
