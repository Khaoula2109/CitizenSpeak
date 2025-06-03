package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import java.util.Date;
@Getter
@Setter
public class Media {
    @Id
    private String mediaId;
    private String mediaFile;
    private Date captureDate;
    private String complaintId;

    public Media() {}

    public Media(String mediaFile, Date captureDate) {
        this.mediaFile = mediaFile;
        this.captureDate = captureDate;
    }


}
