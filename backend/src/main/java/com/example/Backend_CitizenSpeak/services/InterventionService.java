package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.dto.InterventionRequest;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.InterventionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Service
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final StatusHistoryService statusHistoryService;
    @Autowired
    private NotificationService notificationService;

    @Autowired
    public InterventionService(InterventionRepository interventionRepository,
                               StatusHistoryService statusHistoryService) {
        this.interventionRepository = interventionRepository;
        this.statusHistoryService = statusHistoryService;
    }

    public Intervention getInterventionById(String id) {
        return interventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention not found with id: " + id));
    }

    public List<Intervention> getInterventionsByComplaint(Complaint complaint) {
        return interventionRepository.findByComplaintOrderByStartDateDesc(complaint);
    }

    public List<Intervention> getInterventionsByAgent(CommunityAgent agent) {
        return interventionRepository.findByAgentsContainingOrderByStartDateDesc(agent);
    }

    @Transactional
    public Intervention createIntervention(InterventionRequest request, CommunityAgent agent, Complaint complaint) {
        Intervention intervention = new Intervention();
        intervention.setStartDate(request.getStartDate() != null ? request.getStartDate() : new Date());
        intervention.setEndDate(request.getEndDate());
        intervention.setStatus(request.getStatus() != null ? request.getStatus() : "Planned");
        intervention.setDescription(request.getDescription());
        intervention.setResourcesNeeded(request.getResourcesNeeded());
        intervention.setAgents(Arrays.asList(agent));
        intervention.setComplaint(complaint);

        Intervention savedIntervention = interventionRepository.save(intervention);

        String notes = "Intervention planifiée: " + request.getDescription();
        statusHistoryService.createStatusHistory("Intervention Scheduled", notes, complaint, agent);
        notificationService.notifyAgentNewIntervention(agent, savedIntervention);
        if (savedIntervention.getAgents() != null && savedIntervention.getAgents().size() > 1) {
            for (CommunityAgent otherAgent : savedIntervention.getAgents()) {
                if (!otherAgent.getUserId().equals(agent.getUserId())) {
                    notificationService.notifyAgentNewIntervention(otherAgent, savedIntervention);
                }
            }
        }

        return savedIntervention;
    }

    @Transactional
    public Intervention updateIntervention(Intervention intervention, InterventionRequest request) {
        String previousStatus = intervention.getStatus();

        if (request.getStartDate() != null) {
            intervention.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            intervention.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            intervention.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            intervention.setDescription(request.getDescription());
        }
        if (request.getResourcesNeeded() != null) {
            intervention.setResourcesNeeded(request.getResourcesNeeded());
        }

        Intervention savedIntervention = interventionRepository.save(intervention);

        String notes = "Intervention mise à jour: " + request.getDescription();
        if (intervention.getAgents() != null && !intervention.getAgents().isEmpty()) {
            statusHistoryService.createStatusHistory("Intervention Updated", notes, intervention.getComplaint(), intervention.getAgents().get(0));
        }

        if (request.getStatus() != null && !request.getStatus().equals(previousStatus)) {
            if (savedIntervention.getAgents() != null) {
                for (CommunityAgent agent : savedIntervention.getAgents()) {
                }
            }
        }

        return savedIntervention;
    }

    @Transactional
    public void deleteIntervention(String id) {
        Intervention intervention = getInterventionById(id);
        interventionRepository.delete(intervention);
    }

    public List<Intervention> getInterventionsByStatus(String status) {
        return interventionRepository.findByStatusOrderByStartDateDesc(status);
    }

    public List<Intervention> getInterventionsByDateRange(Date startDate, Date endDate) {
        return interventionRepository.findByStartDateBetweenOrderByStartDateDesc(startDate, endDate);
    }

}