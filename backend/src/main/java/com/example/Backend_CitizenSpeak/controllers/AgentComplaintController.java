package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.dto.CommentDTO;
import com.example.Backend_CitizenSpeak.dto.StatusHistoryDTO;
import com.example.Backend_CitizenSpeak.dto.InterventionRequest;
import com.example.Backend_CitizenSpeak.dto.InterventionResponse;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.AgentRepository;
import com.example.Backend_CitizenSpeak.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agent/complaints")
public class AgentComplaintController {

    private final ComplaintService complaintService;
    private final CommentService commentService;
    private final StatusHistoryService statusHistoryService;
    private final InterventionService interventionService;
    private final UserService userService;
    private final AgentRepository agentRepository;

    @Autowired
    public AgentComplaintController(ComplaintService complaintService,
                                    CommentService commentService,
                                    StatusHistoryService statusHistoryService,
                                    InterventionService interventionService,
                                    UserService userService,
                                    AgentRepository agentRepository) {
        this.complaintService = complaintService;
        this.commentService = commentService;
        this.statusHistoryService = statusHistoryService;
        this.interventionService = interventionService;
        this.userService = userService;
        this.agentRepository = agentRepository;
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(Authentication authentication) {
        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            List<Complaint> assignedComplaints = complaintService.getComplaintsByAssignedAgent(agent);

            List<ComplaintResponse> responseList = assignedComplaints.stream()
                    .map(this::convertToComplaintDetailResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            System.err.println("Error retrieving assigned complaints: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving assigned complaints: " + e.getMessage()
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintDetails(@PathVariable String id, Authentication authentication) {
        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            Complaint complaintResponse = complaintService.getComplaintById(id);

            Complaint complaint = complaintService.getComplaintEntityById(id);

            if (complaint.getAssignedAgent() == null ||
                    !complaint.getAssignedAgent().getUserId().equals(agent.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Comment> comments = commentService.getCommentsByComplaintId(id);
            List<StatusHistory> statusHistories = statusHistoryService.getStatusHistoryByComplaintId(id);
            List<Intervention> interventions = interventionService.getInterventionsByComplaint(complaint);

            ComplaintResponse response = convertToComplaintDetailResponse(complaint, comments, statusHistories, interventions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error retrieving complaint details: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving complaint details: " + e.getMessage()
            );
        }
    }
    @PostMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateComplaintStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            String newStatus = request.get("status");
            String notes = request.get("notes");

            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required"));
            }

            Complaint complaint = complaintService.getComplaintEntityById(id);

            if (complaint.getAssignedAgent() == null ||
                    !complaint.getAssignedAgent().getUserId().equals(agent.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only update complaints assigned to you"));
            }

            Complaint updatedComplaint = complaintService.updateComplaintStatus(complaint, newStatus, notes, agent);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Status updated successfully");
            response.put("status", updatedComplaint.getStatus());
            response.put("closureDate", updatedComplaint.getClosureDate());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating complaint status: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error updating complaint status: " + e.getMessage()
            );
        }
    }
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            String description = payload.get("description");
            if (description == null || description.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment description is required");
            }
            Complaint complaint = complaintService.getComplaintEntityById(id);
            if (complaint.getAssignedAgent() == null ||
                    !complaint.getAssignedAgent().getUserId().equals(agent.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You can only comment on complaints assigned to you");
            }

            Comment comment = commentService.createCommentByAgent(description, agent, complaint);
            CommentDTO commentDTO = convertToCommentDTO(comment);

            return ResponseEntity.ok(commentDTO);
        } catch (Exception e) {
            System.err.println("Error adding comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error adding comment: " + e.getMessage()
            );
        }
    }
    @PostMapping("/{id}/interventions")
    public ResponseEntity<InterventionResponse> createIntervention(
            @PathVariable String id,
            @RequestBody InterventionRequest request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            Complaint complaint = complaintService.getComplaintEntityById(id);

            if (complaint.getAssignedAgent() == null ||
                    !complaint.getAssignedAgent().getUserId().equals(agent.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Intervention intervention = interventionService.createIntervention(request, agent, complaint);
            InterventionResponse response = convertToInterventionResponse(intervention);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating intervention: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error creating intervention: " + e.getMessage()
            );
        }
    }
    @GetMapping("/{id}/interventions")
    public ResponseEntity<List<InterventionResponse>> getInterventions(@PathVariable String id, Authentication authentication) {
        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            Complaint complaint = complaintService.getComplaintEntityById(id);

            if (complaint.getAssignedAgent() == null ||
                    !complaint.getAssignedAgent().getUserId().equals(agent.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Intervention> interventions = interventionService.getInterventionsByComplaint(complaint);
            List<InterventionResponse> responseList = interventions.stream()
                    .map(this::convertToInterventionResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            System.err.println("Error retrieving interventions: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving interventions: " + e.getMessage()
            );
        }
    }
    @PutMapping("/interventions/{interventionId}")
    public ResponseEntity<InterventionResponse> updateIntervention(
            @PathVariable String interventionId,
            @RequestBody InterventionRequest request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            Intervention intervention = interventionService.getInterventionById(interventionId);

            if (!intervention.getAgents().contains(agent)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Intervention updatedIntervention = interventionService.updateIntervention(intervention, request);
            InterventionResponse response = convertToInterventionResponse(updatedIntervention);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating intervention: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error updating intervention: " + e.getMessage()
            );
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAgentStatistics(Authentication authentication) {
        try {
            String email = authentication.getName();
            CommunityAgent agent = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

            List<Complaint> assignedComplaints = complaintService.getComplaintsByAssignedAgent(agent);

            Map<String, Long> statusCounts = assignedComplaints.stream()
                    .collect(Collectors.groupingBy(Complaint::getStatus, Collectors.counting()));

            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalAssigned", assignedComplaints.size());
            statistics.put("inProgress", statusCounts.getOrDefault("In Progress", 0L));
            statistics.put("resolved", statusCounts.getOrDefault("Resolved", 0L));
            statistics.put("assigned", statusCounts.getOrDefault("Assigned", 0L));
            statistics.put("statusBreakdown", statusCounts);

            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            System.err.println("Error retrieving agent statistics: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving agent statistics: " + e.getMessage()
            );
        }
    }


    private ComplaintResponse convertToComplaintDetailResponse(Complaint complaint) {
        List<Comment> comments = commentService.getCommentsByComplaintId(complaint.getComplaintId());
        List<StatusHistory> statusHistories = statusHistoryService.getStatusHistoryByComplaintId(complaint.getComplaintId());
        List<Intervention> interventions = interventionService.getInterventionsByComplaint(complaint);

        return convertToComplaintDetailResponse(complaint, comments, statusHistories, interventions);
    }

    private ComplaintResponse convertToComplaintDetailResponse(Complaint complaint, List<Comment> comments, List<StatusHistory> statusHistories, List<Intervention> interventions) {
        ComplaintResponse response = new ComplaintResponse();
        response.setComplaintId(complaint.getComplaintId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setStatus(complaint.getStatus());
        response.setCreationDate(complaint.getCreationDate());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setIsVerified(complaint.getIsVerified());
        response.setPriorityLevel(complaint.getPriorityLevel());
        response.setClosureDate(complaint.getClosureDate());

        if (complaint.getCategory() != null) {
            Map<String, Object> categoryMap = new HashMap<>();
            categoryMap.put("id", complaint.getCategory().getCategoryId());
            categoryMap.put("label", complaint.getCategory().getLabel());
            response.setCategory(categoryMap);
        }

        if (complaint.getCitizen() != null) {
            Map<String, Object> citizenMap = new HashMap<>();
            citizenMap.put("id", complaint.getCitizen().getUserId());
            citizenMap.put("name", complaint.getCitizen().getName());
            citizenMap.put("email", complaint.getCitizen().getEmail());
            citizenMap.put("role", complaint.getCitizen().getRole());
            response.setCitizen(citizenMap);
        }

        CommunityAgent assignedAgent = complaint.getAssignedAgent();
        if (assignedAgent != null) {
            Map<String, Object> assignedToMap = new HashMap<>();
            assignedToMap.put("id", assignedAgent.getUserId());
            assignedToMap.put("name", assignedAgent.getName());
            assignedToMap.put("email", assignedAgent.getEmail());
            assignedToMap.put("service", assignedAgent.getService());
            assignedToMap.put("role", assignedAgent.getRole());
            response.setAssignedTo(assignedToMap);
        }

        if (complaint.getAssignedDepartment() != null) {
            response.setDepartment(complaint.getAssignedDepartment().getName());
        }

        if (complaint.getMedia() != null && !complaint.getMedia().isEmpty()) {
            List<Map<String,Object>> mediaList = complaint.getMedia().stream()
                    .map(media -> {
                        Map<String,Object> mediaMap = new HashMap<>();
                        mediaMap.put("id", media.getMediaId());
                        mediaMap.put("url", "http://localhost:8080/api/media/file/" + media.getMediaId());
                        mediaMap.put("captureDate", media.getCaptureDate());
                        mediaMap.put("filename", media.getMediaFile());
                        return mediaMap;
                    })
                    .collect(Collectors.toList());
            response.setMedia(mediaList);
        }

        if (comments != null && !comments.isEmpty()) {
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(this::convertToCommentDTO)
                    .collect(Collectors.toList());
            response.setComments(commentDTOs);
        }

        if (statusHistories != null && !statusHistories.isEmpty()) {
            List<StatusHistoryDTO> statusHistoryDTOs = statusHistories.stream()
                    .map(this::convertToStatusHistoryDTO)
                    .collect(Collectors.toList());
            response.setStatusHistory(statusHistoryDTOs);
        }

        if (interventions != null && !interventions.isEmpty()) {
            List<Map<String, Object>> interventionsList = interventions.stream()
                    .map(intervention -> {
                        Map<String, Object> interventionMap = new HashMap<>();
                        interventionMap.put("interventionId", intervention.getInterventionId());
                        interventionMap.put("startDate", intervention.getStartDate());
                        interventionMap.put("endDate", intervention.getEndDate());
                        interventionMap.put("status", intervention.getStatus());
                        interventionMap.put("description", intervention.getDescription());
                        interventionMap.put("resourcesNeeded", intervention.getResourcesNeeded());
                        return interventionMap;
                    })
                    .collect(Collectors.toList());
            response.setInterventions(interventionsList);
        }

        return response;
    }

    private CommentDTO convertToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getCommentId());
        dto.setCommentDate(comment.getCommentDate());
        dto.setDescription(comment.getDescription());
        dto.setAuthorType(comment.getAuthorType());

        if ("AGENT".equals(comment.getAuthorType()) && comment.getAgent() != null) {
            Map<String, Object> agentMap = new HashMap<>();
            agentMap.put("id", comment.getAgent().getUserId());
            agentMap.put("name", comment.getAgent().getName());
            agentMap.put("email", comment.getAgent().getEmail());
            agentMap.put("role", comment.getAgent().getRole());
            agentMap.put("service", comment.getAgent().getService());
            dto.setAgent(agentMap);
        } else if ("CITIZEN".equals(comment.getAuthorType()) && comment.getCitizen() != null) {
            Map<String, Object> citizenMap = new HashMap<>();
            citizenMap.put("id", comment.getCitizen().getUserId());
            citizenMap.put("name", comment.getCitizen().getName());
            citizenMap.put("email", comment.getCitizen().getEmail());
            citizenMap.put("role", comment.getCitizen().getRole());
            dto.setCitizen(citizenMap);
        }

        return dto;
    }

    private StatusHistoryDTO convertToStatusHistoryDTO(StatusHistory statusHistory) {
        StatusHistoryDTO dto = new StatusHistoryDTO();
        dto.setId(statusHistory.getStatusHistoryId());
        dto.setStatus(statusHistory.getStatus());
        dto.setStatusDate(statusHistory.getStatusDate());
        dto.setNotes(statusHistory.getNotes());

        if (statusHistory.getUpdatedBy() != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", statusHistory.getUpdatedBy().getUserId());
            userMap.put("name", statusHistory.getUpdatedBy().getName());
            userMap.put("email", statusHistory.getUpdatedBy().getEmail());
            userMap.put("role", statusHistory.getUpdatedBy().getRole());
            dto.setUpdatedBy(userMap);
        }

        return dto;
    }

    private InterventionResponse convertToInterventionResponse(Intervention intervention) {
        InterventionResponse response = new InterventionResponse();
        response.setInterventionId(intervention.getInterventionId());
        response.setStartDate(intervention.getStartDate());
        response.setEndDate(intervention.getEndDate());
        response.setStatus(intervention.getStatus());
        response.setDescription(intervention.getDescription());

        if (intervention.getAgents() != null && !intervention.getAgents().isEmpty()) {
            List<Map<String, Object>> agentsList = intervention.getAgents().stream()
                    .map(agent -> {
                        Map<String, Object> agentMap = new HashMap<>();
                        agentMap.put("id", agent.getUserId());
                        agentMap.put("name", agent.getName());
                        agentMap.put("service", agent.getService());
                        return agentMap;
                    })
                    .collect(Collectors.toList());
            response.setAgents(agentsList);
        }

        if (intervention.getComplaint() != null) {
            Map<String, Object> complaintMap = new HashMap<>();
            complaintMap.put("id", intervention.getComplaint().getComplaintId());
            complaintMap.put("title", intervention.getComplaint().getTitle());
            response.setComplaint(complaintMap);
        }

        return response;
    }
}