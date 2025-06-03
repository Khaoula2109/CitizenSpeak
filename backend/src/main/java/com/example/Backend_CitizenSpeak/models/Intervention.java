package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Setter
@Getter
@Document(collection = "interventions")
public class Intervention {
    @Id
    private String interventionId;
    private Date startDate;
    private Date endDate;
    private String status;
    private String description;

    @DBRef
    private List<CommunityAgent> agents;

    @DBRef
    private Complaint complaint;

    public Intervention() {}

    public Intervention(Date startDate,
                        String status,
                        String description,
                        List<CommunityAgent> agents,
                        Complaint complaint) {
        this.startDate = startDate;
        this.status = status;
        this.description = description;
        this.agents = agents;
        this.complaint = complaint;
    }

}
