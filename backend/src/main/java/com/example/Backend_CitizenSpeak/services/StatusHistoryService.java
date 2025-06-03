package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.StatusHistory;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.repositories.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class StatusHistoryService {

    private final StatusHistoryRepository statusHistoryRepository;

    @Autowired
    public StatusHistoryService(StatusHistoryRepository statusHistoryRepository) {
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public StatusHistory getStatusHistoryById(String id) {
        return statusHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Status history not found with id: " + id));
    }

    public List<StatusHistory> getStatusHistoryByComplaintGeneratedId(String complaintId) {
        try {
            System.out.println("Fetching status history for complaint ID: " + complaintId);

            List<StatusHistory> history = statusHistoryRepository.findByComplaintComplaintId(complaintId);

            System.out.println("Found " + history.size() + " status history entries");
            return history;
        } catch (Exception e) {
            System.err.println("Error fetching status history for complaint ID " + complaintId + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<StatusHistory> getStatusHistoryByComplaint(Complaint complaint) {
        return statusHistoryRepository.findByComplaintOrderByStatusDateAsc(complaint);
    }

    @Transactional
    public StatusHistory createStatusHistory(String status, String notes, Complaint complaint, User updatedBy) {
        try {
            System.out.println("Creating status history for complaint: " + complaint.getComplaintId());
            System.out.println("New status: " + status);
            System.out.println("Updated by: " + updatedBy.getName());

            StatusHistory statusHistory = new StatusHistory();
            statusHistory.setStatus(status);
            statusHistory.setStatusDate(new Date());
            statusHistory.setNotes(notes);
            statusHistory.setComplaint(complaint);
            statusHistory.setUpdatedBy(updatedBy);

            StatusHistory savedHistory = statusHistoryRepository.save(statusHistory);
            System.out.println("Status history created successfully with ID: " + savedHistory.getStatusHistoryId());

            return savedHistory;
        } catch (Exception e) {
            System.err.println("Error creating status history: " + e.getMessage());
            throw new RuntimeException("Failed to create status history: " + e.getMessage(), e);
        }
    }
}