package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document(collection = "categories")
public class Category {
    @Id
    private String categoryId;
    private String label;
    private String description;

    public Category() {}

    public Category(String label, String description) {
        this.label = label;
        this.description = description;
    }

}
