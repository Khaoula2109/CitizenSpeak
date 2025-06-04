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

    public List<StatusHistory> getStatusHistoryByComplaint(Complaint complaint) {
        try {
            return statusHistoryRepository.findByComplaintOrderByStatusDateAsc(complaint);
        } catch (Exception e) {
            try {
                return statusHistoryRepository.findByComplaintOrderByStatusDateAsc(complaint);
            } catch (Exception ex) {
                System.err.println("Error getting status history by complaint: " + ex.getMessage());
                return new ArrayList<>();
            }
        }
    }

    public List<StatusHistory> getStatusHistoryByComplaintId(String complaintId) {
        try {
            return statusHistoryRepository.findByComplaintId(complaintId);
        } catch (Exception e) {
            return getStatusHistoryByComplaintGeneratedId(complaintId);
        }
    }

    public List<StatusHistory> getStatusHistoryByComplaintGeneratedId(String complaintId) {
        try {
            System.out.println("Fetching status history for complaint ID: " + complaintId);

            List<StatusHistory> history;
            try {
                history = statusHistoryRepository.findByComplaintComplaintId(complaintId);
            } catch (Exception e) {
                history = statusHistoryRepository.findByComplaintId(complaintId);
            }

            System.out.println("Found " + history.size() + " status history entries");
            return history;
        } catch (Exception e) {
            System.err.println("Error fetching status history for complaint ID " + complaintId + ": " + e.getMessage());
            return new ArrayList<>();
        }
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

    public StatusHistory createStatusHistory(StatusHistory statusHistory) {
        try {
            if (statusHistory.getStatusDate() == null) {
                statusHistory.setStatusDate(new Date());
            }
            return statusHistoryRepository.save(statusHistory);
        } catch (Exception e) {
            System.err.println("Error creating status history from object: " + e.getMessage());
            throw new RuntimeException("Failed to create status history: " + e.getMessage(), e);
        }
    }

    public StatusHistory updateStatusHistory(StatusHistory statusHistory) {
        try {
            return statusHistoryRepository.save(statusHistory);
        } catch (Exception e) {
            System.err.println("Error updating status history: " + e.getMessage());
            throw new RuntimeException("Failed to update status history: " + e.getMessage(), e);
        }
    }

    public void deleteStatusHistory(String id) {
        try {
            StatusHistory statusHistory = getStatusHistoryById(id);
            statusHistoryRepository.delete(statusHistory);
            System.out.println("Status history deleted successfully: " + id);
        } catch (Exception e) {
            System.err.println("Error deleting status history: " + e.getMessage());
            throw new RuntimeException("Failed to delete status history: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteByComplaintId(String complaintId) {
        try {
            List<StatusHistory> histories;
            try {
                histories = getStatusHistoryByComplaintId(complaintId);
            } catch (Exception e) {
                histories = getStatusHistoryByComplaintGeneratedId(complaintId);
            }

            if (!histories.isEmpty()) {
                statusHistoryRepository.deleteAll(histories);
                System.out.println("Deleted " + histories.size() + " status history entries for complaint: " + complaintId);
            }
        } catch (Exception e) {
            System.err.println("Error deleting status history for complaint " + complaintId + ": " + e.getMessage());
        }
    }

    public List<StatusHistory> getAllStatusHistories() {
        try {
            return statusHistoryRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error retrieving all status histories: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}