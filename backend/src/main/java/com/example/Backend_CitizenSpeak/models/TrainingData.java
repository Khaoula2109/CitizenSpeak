package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document(collection = "training_data")
public class TrainingData {
    @Id
    private String id;
    private String text;
    private String category;
    private int priority; // 1=Haute, 2=Moyenne, 3=Faible
    private String keywords;

    public TrainingData() {}

    public TrainingData(String text, String category, int priority, String keywords) {
        this.text = text;
        this.category = category;
        this.priority = priority;
        this.keywords = keywords;
    }

}