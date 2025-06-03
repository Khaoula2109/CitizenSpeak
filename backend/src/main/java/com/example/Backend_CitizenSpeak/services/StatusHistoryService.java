package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.StatusHistory;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.repositories.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return statusHistoryRepository.findByComplaintOrderByStatusDateAsc(complaint);
    }

    public List<StatusHistory> getStatusHistoryByComplaintId(String complaintId) {
        return statusHistoryRepository.findByComplaintId(complaintId);
    }

    public StatusHistory createStatusHistory(String status, String notes, Complaint complaint, User updatedBy) {
        StatusHistory statusHistory = new StatusHistory();
        statusHistory.setStatus(status);
        statusHistory.setStatusDate(new Date());
        statusHistory.setNotes(notes);
        statusHistory.setComplaint(complaint);
        statusHistory.setUpdatedBy(updatedBy);
        return statusHistoryRepository.save(statusHistory);
    }

    public StatusHistory updateStatusHistory(StatusHistory statusHistory) {
        return statusHistoryRepository.save(statusHistory);
    }

    public void deleteStatusHistory(String id) {
        StatusHistory statusHistory = getStatusHistoryById(id);
        statusHistoryRepository.delete(statusHistory);
    }

    @Transactional
    public void deleteByComplaintId(String complaintId) {
        List<StatusHistory> histories = getStatusHistoryByComplaintId(complaintId);
        statusHistoryRepository.deleteAll(histories);
    }

    public StatusHistory createStatusHistory(StatusHistory statusHistory) {
        if (statusHistory.getStatusDate() == null) {
            statusHistory.setStatusDate(new Date());
        }
        return statusHistoryRepository.save(statusHistory);
    }


}