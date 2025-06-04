package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class AssignmentService {

    private final ComplaintRepository complaintRepository;
    private final AgentRepository agentRepository;
    private final DepartmentRepository departmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    @Autowired
    public AssignmentService(ComplaintRepository complaintRepository,
                             AgentRepository agentRepository,
                             DepartmentRepository departmentRepository,
                             StatusHistoryRepository statusHistoryRepository) {
        this.complaintRepository = complaintRepository;
        this.agentRepository = agentRepository;
        this.departmentRepository = departmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Transactional
    public Complaint assignComplaintToAgent(String complaintId, String agentId, String departmentId, User assignedBy) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        CommunityAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        complaint.setStatus("Assigned");

        Complaint savedComplaint = complaintRepository.save(complaint);

        StatusHistory statusHistory = new StatusHistory();
        statusHistory.setStatus("Assigned");
        statusHistory.setStatusDate(new Date());
        statusHistory.setNotes("Plainte assignée à " + agent.getName() + " du département " + department.getName());
        statusHistory.setComplaint(savedComplaint);
        statusHistory.setUpdatedBy(assignedBy);

        statusHistoryRepository.save(statusHistory);

        return savedComplaint;
    }

    @Transactional
    public Complaint updateComplaintStatus(String complaintId, String newStatus, String notes, User updatedBy) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(newStatus);

        if ("Resolved".equals(newStatus)) {
            complaint.setClosureDate(new Date());
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        StatusHistory statusHistory = new StatusHistory();
        statusHistory.setStatus(newStatus);
        statusHistory.setStatusDate(new Date());
        statusHistory.setNotes(notes);
        statusHistory.setComplaint(savedComplaint);
        statusHistory.setUpdatedBy(updatedBy);

        statusHistoryRepository.save(statusHistory);

        return savedComplaint;
    }
}