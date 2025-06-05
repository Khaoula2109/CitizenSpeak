package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
public class ComplaintIdGeneratorService {
    private final ComplaintRepository complaintRepository;

    public ComplaintIdGeneratorService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public String generateComplaintId() {
        int year = Year.now().getValue();
        long count = complaintRepository.countByYear(year);
        String number = String.format("%03d", count + 1);
        return "#" + year + "-" + number;
    }
}
