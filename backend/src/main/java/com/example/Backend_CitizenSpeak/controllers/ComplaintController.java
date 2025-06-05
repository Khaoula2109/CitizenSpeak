package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.ComplaintRequest;
import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.dto.CommentDTO;
import com.example.Backend_CitizenSpeak.dto.StatusHistoryDTO;
import com.example.Backend_CitizenSpeak.dto.StatusUpdateRequest;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.AgentRepository;
import com.example.Backend_CitizenSpeak.repositories.DepartmentRepository;
import com.example.Backend_CitizenSpeak.services.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CitizenService citizenService;
    private final CategoryService categoryService;
    private final MediaService mediaService;
    private final CommentService commentService;
    private final StatusHistoryService statusHistoryService;
    private final CommunityAgentService communityAgentService;
    private final AgentRepository agentRepository;
    private final DepartmentRepository departmentRepository;
    private final UserService userService;

    @Autowired
    public ComplaintController(ComplaintService complaintService,
                               CitizenService citizenService,
                               CategoryService categoryService,
                               MediaService mediaService,
                               CommentService commentService,
                               StatusHistoryService statusHistoryService,
                               CommunityAgentService communityAgentService,
                               AgentRepository agentRepository,
                               DepartmentRepository departmentRepository,
                               UserService userService) {
        this.complaintService = complaintService;
        this.citizenService = citizenService;
        this.categoryService = categoryService;
        this.mediaService = mediaService;
        this.commentService = commentService;
        this.statusHistoryService = statusHistoryService;
        this.communityAgentService = communityAgentService;
        this.agentRepository = agentRepository;
        this.departmentRepository = departmentRepository;
        this.userService = userService;
    }

    @GetMapping(value = {"", "/"})
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(Authentication authentication) {
        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            List<Complaint> complaints = complaintService.getComplaintsByCitizen(citizen);
            List<ComplaintResponse> responseList = complaints.stream()
                    .map(this::convertToComplaintResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            System.err.println("Error retrieving user complaints: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving complaints: " + e.getMessage()
            );
        }
    }

    @GetMapping(value = {"/all", "/all/"})
    public ResponseEntity<List<ComplaintResponse>> getAllPublicComplaints() {
        try {
            System.out.println("Request for all public complaints received");

            List<Complaint> complaints;
            try {
                complaints = complaintService.getAllComplaints();
            } catch (Exception e) {
                complaints = complaintService.getAllComplaintsEntities();
            }

            List<ComplaintResponse> responseList = complaints.stream()
                    .map(this::convertToComplaintResponse)
                    .collect(Collectors.toList());

            System.out.println("Returning " + responseList.size() + " public complaints");
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            System.err.println("Error retrieving all complaints: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving all complaints: " + e.getMessage()
            );
        }
    }

    @GetMapping(value = {"/{complaintId}", "/{complaintId}/"})
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable String complaintId) {
        try {
            System.out.println("Récupération des détails pour ID: " + complaintId);

            Complaint complaint;
            List<Comment> comments;
            List<StatusHistory> statusHistories;

            try {
                complaint = complaintService.getComplaintByGeneratedId(complaintId);
                comments = commentService.getCommentsByComplaintGeneratedId(complaint.getComplaintId());
                statusHistories = statusHistoryService.getStatusHistoryByComplaintGeneratedId(complaint.getComplaintId());
            } catch (Exception e) {
                complaint = complaintService.getComplaintEntityById(complaintId);
                comments = commentService.getCommentsByComplaintId(complaintId);
                statusHistories = statusHistoryService.getStatusHistoryByComplaintId(complaintId);
            }

            ComplaintResponse response = convertToComplaintDetailResponse(complaint, comments, statusHistories);
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la récupération de la plainte", e);
        }
    }

    @GetMapping(value = {"/search/{complaintId}", "/search/{complaintId}/"})
    public ResponseEntity<ComplaintResponse> searchComplaintById(@PathVariable String complaintId) {
        try {
            System.out.println("Recherche de la plainte avec ID: " + complaintId);

            Complaint complaint;
            List<Comment> comments;
            List<StatusHistory> statusHistories;

            try {
                complaint = complaintService.getComplaintByGeneratedId(complaintId);
                comments = commentService.getCommentsByComplaintGeneratedId(complaint.getComplaintId());
                statusHistories = statusHistoryService.getStatusHistoryByComplaintGeneratedId(complaint.getComplaintId());
            } catch (Exception e) {
                complaint = complaintService.getComplaintEntityById(complaintId);
                comments = commentService.getCommentsByComplaintId(complaintId);
                statusHistories = statusHistoryService.getStatusHistoryByComplaintId(complaintId);
            }

            ComplaintResponse response = convertToComplaintDetailResponse(complaint, comments, statusHistories);

            System.out.println("Plainte trouvée: " + complaint.getTitle());
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException ex) {
            System.err.println("Plainte non trouvée: " + ex.getMessage());
            throw ex;
        } catch (Exception e) {
            System.err.println("Erreur inattendue lors de la recherche: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la recherche de la plainte", e);
        }
    }

    @PostMapping(value = {"", "/"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> createComplaint(
            @RequestPart("complaint") String complaintJson,
            @RequestPart(value = "media", required = false) List<MultipartFile> mediaFiles,
            Authentication authentication) {

        try {
            System.out.println("Received complaint submission request");
            System.out.println("Authentication: " + authentication.getName());
            System.out.println("Complaint JSON: " + complaintJson);
            System.out.println("Media files count: " + (mediaFiles != null ? mediaFiles.size() : 0));

            ObjectMapper objectMapper = new ObjectMapper();
            ComplaintRequest complaintRequest = objectMapper.readValue(complaintJson, ComplaintRequest.class);

            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            System.out.println("Creating complaint for citizen: " + citizen.getName() + " (" + email + ")");

            Complaint complaint = complaintService.createComplaint(
                    complaintRequest,
                    citizen,
                    categoryService.getCategoryById(complaintRequest.getCategoryId())
            );

            System.out.println("Complaint created with ID: " + complaint.getComplaintId());

            if (mediaFiles != null && !mediaFiles.isEmpty()) {
                System.out.println("Processing " + mediaFiles.size() + " media files");

                List<Media> savedMedia = mediaService.saveMediaFiles(mediaFiles, complaint);
                complaint.setMedia(savedMedia);
                complaintService.updateComplaint(complaint);

                System.out.println("Media processing complete. Saved " + savedMedia.size() + " files");
            }

            ComplaintResponse response = convertToComplaintResponse(complaint);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error processing complaint submission: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error processing complaint: " + e.getMessage(),
                    e
            );
        }
    }

    @PostMapping(value = {"/{complaintId}/comments", "/{complaintId}/comments/"})
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String complaintId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        try {
            System.out.println("Request to add comment received for complaint ID: " + complaintId);
            System.out.println("Authentication: " + authentication.getName());
            System.out.println("Payload: " + payload);

            String description = payload.get("description");
            if (description == null || description.trim().isEmpty()) {
                System.out.println("Comment description is empty");
                return ResponseEntity.badRequest().build();
            }

            String email = authentication.getName();
            Comment comment = null;

            try {
                Complaint complaint;
                try {
                    complaint = complaintService.getComplaintByGeneratedId(complaintId);
                } catch (Exception e) {
                    complaint = complaintService.getComplaintEntityById(complaintId);
                }

                System.out.println("Found complaint: " + complaint.getTitle());

                try {
                    Citizen citizen = citizenService.getCitizenByEmail(email);
                    System.out.println("Comment will be created by citizen: " + citizen.getName() + " (" + email + ")");
                    comment = commentService.createCommentByCitizen(description, citizen, complaint);
                } catch (Exception e) {
                    try {
                        CommunityAgent agent = communityAgentService.getAgentByEmail(email);
                        System.out.println("Comment will be created by agent: " + agent.getName() + " (" + email + ")");
                        comment = commentService.createCommentByAgent(description, agent, complaint);
                    } catch (Exception ex) {
                        System.err.println("User is neither a citizen nor an agent: " + email);
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                }
            } catch (Exception fallbackException) {
                try {
                    Citizen citizen = citizenService.getCitizenByEmail(email);
                    System.out.println("Comment will be created by citizen: " + citizen.getName() + " (" + email + ")");

                    Complaint complaint = complaintService.getComplaintEntityById(complaintId);
                    System.out.println("Found complaint: " + complaint.getTitle());

                    comment = commentService.createComment(description, citizen, complaint);
                } catch (Exception finalException) {
                    System.err.println("Error in fallback comment creation: " + finalException.getMessage());
                    throw new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Error adding comment: " + finalException.getMessage(),
                            finalException
                    );
                }
            }

            if (comment == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }

            System.out.println("Comment created with ID: " + comment.getCommentId());
            CommentDTO commentDTO = convertToCommentDTO(comment);

            return ResponseEntity.ok(commentDTO);

        } catch (Exception e) {
            System.err.println("Error adding comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error adding comment: " + e.getMessage(),
                    e
            );
        }
    }

    @PutMapping(value = {"/comments/{commentId}", "/comments/{commentId}/"})
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable String commentId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        try {
            System.out.println("Request to update comment: " + commentId);
            System.out.println("Authentication: " + authentication.getName());

            String newDescription = payload.get("description");
            if (newDescription == null || newDescription.trim().isEmpty()) {
                System.out.println("New description is empty");
                return ResponseEntity.badRequest().build();
            }

            String email = authentication.getName();
            Comment existingComment = commentService.getCommentById(commentId);

            boolean isAuthorized = false;

            if ("CITIZEN".equals(existingComment.getAuthorType())) {
                try {
                    Citizen currentUser = citizenService.getCitizenByEmail(email);
                    isAuthorized = existingComment.getCitizen() != null &&
                            existingComment.getCitizen().getUserId().equals(currentUser.getUserId());
                } catch (Exception e) {
                    System.out.println("User is not a citizen");
                }
            } else if ("AGENT".equals(existingComment.getAuthorType())) {
                try {
                    CommunityAgent currentAgent = communityAgentService.getAgentByEmail(email);
                    isAuthorized = existingComment.getAgent() != null &&
                            existingComment.getAgent().getUserId().equals(currentAgent.getUserId());
                } catch (Exception e) {
                    System.out.println("User is not an agent");
                }
            }

            if (!isAuthorized) {
                System.out.println("User is not the owner of this comment");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Comment updatedComment = commentService.updateCommentDescription(commentId, newDescription.trim());
            System.out.println("Comment updated successfully: " + commentId);

            CommentDTO commentDTO = convertToCommentDTO(updatedComment);
            return ResponseEntity.ok(commentDTO);

        } catch (ResourceNotFoundException e) {
            System.err.println("Comment not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error updating comment: " + e.getMessage(),
                    e
            );
        }
    }

    @DeleteMapping(value = {"/comments/{commentId}", "/comments/{commentId}/"})
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            Authentication authentication) {

        try {
            System.out.println("Request to delete comment: " + commentId);
            System.out.println("Authentication: " + authentication.getName());

            String email = authentication.getName();
            Comment existingComment = commentService.getCommentById(commentId);

            boolean isAuthorized = false;
            boolean isAdmin = false;

            if ("CITIZEN".equals(existingComment.getAuthorType())) {
                try {
                    Citizen currentUser = citizenService.getCitizenByEmail(email);
                    isAuthorized = existingComment.getCitizen() != null &&
                            existingComment.getCitizen().getUserId().equals(currentUser.getUserId());
                    isAdmin = "Admin".equals(currentUser.getRole()) || "Admin".equalsIgnoreCase(currentUser.getRole());
                } catch (Exception e) {
                    System.out.println("User is not a citizen");
                }
            } else if ("AGENT".equals(existingComment.getAuthorType())) {
                try {
                    CommunityAgent currentAgent = communityAgentService.getAgentByEmail(email);
                    isAuthorized = existingComment.getAgent() != null &&
                            existingComment.getAgent().getUserId().equals(currentAgent.getUserId());
                } catch (Exception e) {
                    System.out.println("User is not an agent");
                    try {
                        Citizen currentUser = citizenService.getCitizenByEmail(email);
                        isAdmin = "Admin".equals(currentUser.getRole()) || "Admin".equalsIgnoreCase(currentUser.getRole());
                    } catch (Exception ex) {
                        System.out.println("User is neither citizen nor agent");
                    }
                }
            }

            if (!isAuthorized && !isAdmin) {
                System.out.println("User is not authorized to delete this comment");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            commentService.deleteComment(commentId);
            System.out.println("Comment deleted successfully: " + commentId);

            return ResponseEntity.noContent().build();

        } catch (ResourceNotFoundException e) {
            System.err.println("Comment not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error deleting comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error deleting comment: " + e.getMessage(),
                    e
            );
        }
    }

    @DeleteMapping("/{complaintId}/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteCommentWithResponse(
            @PathVariable String complaintId,
            @PathVariable String commentId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Seuls les administrateurs peuvent supprimer des commentaires"));
            }

            commentService.deleteComment(commentId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Commentaire supprimé avec succès");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error deleting comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error deleting comment: " + e.getMessage()
            );
        }
    }

    @GetMapping(value = {"/{complaintId}/comments", "/{complaintId}/comments/"})
    public ResponseEntity<List<CommentDTO>> getComplaintComments(@PathVariable String complaintId) {
        try {
            System.out.println("Request to get comments for complaint: " + complaintId);

            List<Comment> comments;
            try {
                comments = commentService.getCommentsByComplaintGeneratedId(complaintId);
            } catch (Exception e) {
                comments = commentService.getCommentsByComplaintId(complaintId);
            }

            List<CommentDTO> commentDTOs = comments.stream()
                    .map(this::convertToCommentDTO)
                    .collect(Collectors.toList());

            System.out.println("Returning " + commentDTOs.size() + " comments");
            return ResponseEntity.ok(commentDTOs);

        } catch (ResourceNotFoundException e) {
            System.err.println("Complaint not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting comments: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error getting comments: " + e.getMessage(),
                    e
            );
        }
    }

    @PostMapping(value = {"/{complaintId}/status", "/{complaintId}/status/"})
    public ResponseEntity<StatusHistoryDTO> updateStatus(
            @PathVariable String complaintId,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        String status = request.getStatus();
        String notes = request.getNotes();

        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String email = authentication.getName();
            Citizen citizen = citizenService.getCitizenByEmail(email);

            if (!"Admin".equals(citizen.getRole()) && !"Admin".equalsIgnoreCase(citizen.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Complaint complaint;
            try {
                complaint = complaintService.getComplaintByGeneratedId(complaintId);
            } catch (Exception e) {
                complaint = complaintService.getComplaintEntityById(complaintId);
            }

            complaint = complaintService.updateComplaintStatus(complaint, status, notes, citizen);

            List<StatusHistory> history = statusHistoryService.getStatusHistoryByComplaint(complaint);
            StatusHistory latestStatus = history.get(history.size() - 1);
            StatusHistoryDTO statusHistoryDTO = convertToStatusHistoryDTO(latestStatus);

            return ResponseEntity.ok(statusHistoryDTO);
        } catch (Exception e) {
            System.err.println("Error updating status: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error updating status: " + e.getMessage(),
                    e
            );
        }
    }

    @GetMapping(value = {"/nearby", "/nearby/"})
    public ResponseEntity<List<ComplaintResponse>> getNearbyComplaints(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5") Integer radius) {

        try {
            System.out.println("Nearby complaints request received: lat=" + latitude +
                    ", lon=" + longitude + ", radius=" + radius);

            List<Complaint> complaints = complaintService.getNearbyComplaints(latitude, longitude, radius);

            List<ComplaintResponse> responseList = complaints.stream()
                    .map(this::convertToComplaintResponse)
                    .collect(Collectors.toList());

            System.out.println("Returning " + responseList.size() + " nearby complaints");
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            System.err.println("Error in getNearbyComplaints: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving nearby complaints: " + e.getMessage()
            );
        }
    }

    @GetMapping("/verification-status/{id}")
    public ResponseEntity<Map<String, Object>> getVerificationStatus(@PathVariable String id) {
        try {
            Complaint complaint = complaintService.getComplaintEntityById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("isVerified", complaint.getIsVerified());
            response.put("priorityLevel", complaint.getPriorityLevel());
            response.put("priority", convertLevelToPriority(complaint.getPriorityLevel()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error checking verification status: " + e.getMessage()
            );
        }
    }

    @PostMapping("/{id}/validate-priority")
    public ResponseEntity<Map<String, Object>> validatePriority(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            System.out.println("PRIORITY VALIDATION WITH ASSIGNMENT DEBUG");
            System.out.println("Received request for ID: " + id);
            System.out.println("Request body: " + request);

            String newPriority = (String) request.get("priority");
            Boolean accepted = (Boolean) request.get("accepted");
            String notes = (String) request.get("notes");
            String agentId = (String) request.get("agentId");
            String departmentId = (String) request.get("departmentId");

            System.out.println("Parsed values:");
            System.out.println("  - priority: " + newPriority);
            System.out.println("  - accepted: " + accepted);
            System.out.println("  - notes: " + notes);
            System.out.println("  - agentId: " + agentId);
            System.out.println("  - departmentId: " + departmentId);

            if (newPriority == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Priorité requise"));
            }

            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);
            String userRole = currentUser != null ? currentUser.getRole() : "";
            boolean isAdmin = "admin".equalsIgnoreCase(userRole);

            if (!isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Seuls les administrateurs peuvent valider les priorités"));
            }

            System.out.println("Step 1: Validating priority...");
            Complaint updatedComplaint = complaintService.validateComplaintPriority(
                    id, newPriority, accepted != null ? accepted : false, notes, currentUser
            );
            System.out.println("Priority validated. Status: " + updatedComplaint.getStatus());

            if (agentId != null && !agentId.trim().isEmpty() &&
                    departmentId != null && !departmentId.trim().isEmpty()) {

                System.out.println("Step 2: Assigning complaint...");
                System.out.println("  - Looking for agent: " + agentId);
                System.out.println("  - Looking for department: " + departmentId);

                CommunityAgent agent = agentRepository.findById(agentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));

                Department department = departmentRepository.findById(departmentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

                System.out.println("  - Found agent: " + agent.getName());
                System.out.println("  - Found department: " + department.getName());

                updatedComplaint = complaintService.assignComplaint(updatedComplaint, agent, department, currentUser);
                System.out.println("Assignment completed. Status: " + updatedComplaint.getStatus());
            } else {
                System.out.println("Step 2: No assignment requested");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Priorité validée avec succès");
            response.put("isVerified", updatedComplaint.getIsVerified());
            response.put("priorityLevel", updatedComplaint.getPriorityLevel());
            response.put("priority", convertLevelToPriority(updatedComplaint.getPriorityLevel()));
            response.put("status", updatedComplaint.getStatus());

            if (updatedComplaint.getAssignedAgent() != null) {
                Map<String, Object> assignedAgent = new HashMap<>();
                assignedAgent.put("id", updatedComplaint.getAssignedAgent().getUserId());
                assignedAgent.put("name", updatedComplaint.getAssignedAgent().getName());
                assignedAgent.put("service", updatedComplaint.getAssignedAgent().getService());
                assignedAgent.put("role", updatedComplaint.getAssignedAgent().getRole());
                response.put("assignedTo", assignedAgent);

                System.out.println("Response includes assignedTo: " + assignedAgent);
            } else {
                System.out.println("No assignedAgent in response");
            }

            if (updatedComplaint.getAssignedDepartment() != null) {
                response.put("department", updatedComplaint.getAssignedDepartment().getName());
                System.out.println("Response includes department: " + updatedComplaint.getAssignedDepartment().getName());
            } else {
                System.out.println("No assignedDepartment in response");
            }

            System.out.println("Sending response: " + response);
            System.out.println("END PRIORITY VALIDATION DEBUG");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("ERROR in validatePriority: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error validating priority: " + e.getMessage()
            );
        }
    }

    @GetMapping("/admin-dashboard")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsForAdminDashboard(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> complaints;
            try {
                complaints = complaintService.getAllComplaintsEntities();
            } catch (Exception e) {
                complaints = complaintService.getAllComplaints();
            }

            List<Complaint> unverifiedComplaints = complaints.stream()
                    .filter(c -> c.getIsVerified() == 0)
                    .sorted((c1, c2) -> c2.getCreationDate().compareTo(c1.getCreationDate()))
                    .collect(Collectors.toList());

            List<Complaint> verifiedComplaints = complaints.stream()
                    .filter(c -> c.getIsVerified() == 1)
                    .sorted((c1, c2) -> c2.getCreationDate().compareTo(c1.getCreationDate()))
                    .collect(Collectors.toList());

            List<Complaint> sortedComplaints = new ArrayList<>();
            sortedComplaints.addAll(unverifiedComplaints);
            sortedComplaints.addAll(verifiedComplaints);

            List<ComplaintResponse> responseList = sortedComplaints.stream()
                    .map(c -> {
                        if (c.getIsVerified() == 1) {
                            List<Comment> comments;
                            List<StatusHistory> statusHistories;
                            try {
                                comments = commentService.getCommentsByComplaintId(c.getComplaintId());
                                statusHistories = statusHistoryService.getStatusHistoryByComplaint(c);
                            } catch (Exception e) {
                                comments = commentService.getCommentsByComplaintGeneratedId(c.getComplaintId());
                                statusHistories = statusHistoryService.getStatusHistoryByComplaintGeneratedId(c.getComplaintId());
                            }
                            return convertToComplaintDetailResponse(c, comments, statusHistories);
                        } else {
                            return convertToComplaintResponseSimple(c);
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);

        } catch (Exception e) {
            System.err.println("Error retrieving complaints for admin dashboard: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving complaints for admin dashboard: " + e.getMessage()
            );
        }
    }

    @GetMapping("/all-admin")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaintsForAdmin() {
        try {
            List<Complaint> allComplaints;
            try {
                allComplaints = complaintService.getAllComplaintsEntities();
            } catch (Exception e) {
                allComplaints = complaintService.getAllComplaints();
            }

            if (allComplaints == null || allComplaints.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(Collections.emptyList());
            }

            List<ComplaintResponse> responseList = allComplaints.stream()
                    .map(this::convertToComplaintResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);

        } catch (ResourceNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucune plainte trouvée"
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la récupération des plaintes pour l'admin"
            );
        }
    }

    @GetMapping("/with-comments")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaintsWithComments() {
        List<Complaint> complaints;
        try {
            complaints = complaintService.getAllComplaintsEntities();
        } catch (Exception e) {
            complaints = complaintService.getAllComplaints();
        }

        List<ComplaintResponse> responseList = complaints.stream()
                .map(c -> {
                    List<Comment> comments;
                    List<StatusHistory> statusHistories;
                    try {
                        comments = commentService.getCommentsByComplaintId(c.getComplaintId());
                        statusHistories = statusHistoryService.getStatusHistoryByComplaint(c);
                    } catch (Exception e) {
                        comments = commentService.getCommentsByComplaintGeneratedId(c.getComplaintId());
                        statusHistories = statusHistoryService.getStatusHistoryByComplaintGeneratedId(c.getComplaintId());
                    }
                    return convertToComplaintDetailResponse(c, comments, statusHistories);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/{id}/priority")
    public ResponseEntity<Map<String, Object>> updatePriority(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        try {
            String priority = (String) request.get("priority");

            if (priority == null || priority.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Complaint complaint;
            try {
                complaint = complaintService.getComplaintEntityById(id);
            } catch (Exception e) {
                complaint = complaintService.getComplaintByGeneratedId(id);
            }

            int priorityLevel = convertPriorityToLevel(priority);
            complaint.setPriorityLevel(priorityLevel);
            complaintService.updateComplaint(complaint);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Priority updated successfully");
            response.put("priority", priority);
            response.put("priorityLevel", priorityLevel);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error updating priority: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error updating priority: " + e.getMessage(),
                    e
            );
        }
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Map<String, Object>> assignComplaint(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {
            String agentId = request.get("agentId");
            String departmentId = request.get("departmentId");

            if (agentId == null || departmentId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Agent ID et Department ID sont requis"));
            }

            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Seuls les administrateurs peuvent assigner des plaintes"));
            }

            Complaint complaint;
            try {
                complaint = complaintService.getComplaintEntityById(id);
            } catch (Exception e) {
                complaint = complaintService.getComplaintByGeneratedId(id);
            }

            if (complaint.getIsVerified() != 1) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "La plainte doit être vérifiée avant d'être assignée"));
            }

            CommunityAgent agent = agentRepository.findById(agentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));

            Department department = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));

            complaint = complaintService.assignComplaint(complaint, agent, department, currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Plainte assignée avec succès");
            response.put("assignedTo", Map.of(
                    "id", agent.getUserId(),
                    "name", agent.getName(),
                    "role", agent.getRole(),
                    "service", agent.getService()
            ));
            response.put("department", department.getName());
            response.put("status", complaint.getStatus());

            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error assigning complaint: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error assigning complaint: " + e.getMessage()
            );
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryDTO>> getComplaintHistory(@PathVariable String id) {
        try {
            List<StatusHistory> history;
            try {
                history = statusHistoryService.getStatusHistoryByComplaintId(id);
            } catch (Exception e) {
                history = statusHistoryService.getStatusHistoryByComplaintGeneratedId(id);
            }

            List<StatusHistoryDTO> historyDTOs = history.stream()
                    .map(this::convertToStatusHistoryDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(historyDTOs);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving complaint history: " + e.getMessage()
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteComplaint(
            @PathVariable String id,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Seuls les administrateurs peuvent supprimer des plaintes"));
            }

            complaintService.deleteComplaint(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Plainte supprimée avec succès");

            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Plainte non trouvée"));
        } catch (Exception e) {
            System.err.println("Error deleting complaint: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error deleting complaint: " + e.getMessage()
            );
        }
    }

    @GetMapping("/departments/{departmentId}/agents")
    public ResponseEntity<List<Map<String, Object>>> getAgentsByDepartment(@PathVariable String departmentId) {
        try {
            List<CommunityAgent> agents = agentRepository.findByDepartment_DepartmentId(departmentId);

            List<Map<String, Object>> agentsList = agents.stream()
                    .map(agent -> {
                        Map<String, Object> agentMap = new HashMap<>();
                        agentMap.put("id", agent.getUserId());
                        agentMap.put("name", agent.getName());
                        agentMap.put("email", agent.getEmail());
                        agentMap.put("service", agent.getService());
                        agentMap.put("phone", agent.getPhone());
                        return agentMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(agentsList);
        } catch (Exception e) {
            System.err.println("Error retrieving agents for department: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving agents: " + e.getMessage()
            );
        }
    }

    @GetMapping("/{id}/debug")
    public ResponseEntity<Map<String, Object>> debugComplaint(@PathVariable String id) {
        try {
            Complaint complaint;
            try {
                complaint = complaintService.getComplaintEntityById(id);
            } catch (Exception e) {
                complaint = complaintService.getComplaintByGeneratedId(id);
            }

            Map<String, Object> debug = new HashMap<>();
            debug.put("complaintId", complaint.getComplaintId());
            debug.put("title", complaint.getTitle());
            debug.put("status", complaint.getStatus());
            debug.put("isVerified", complaint.getIsVerified());
            debug.put("priorityLevel", complaint.getPriorityLevel());

            if (complaint.getAssignedAgent() != null) {
                Map<String, Object> agentMap = new HashMap<>();
                agentMap.put("id", complaint.getAssignedAgent().getUserId());
                agentMap.put("name", complaint.getAssignedAgent().getName());
                agentMap.put("service", complaint.getAssignedAgent().getService());
                debug.put("assignedAgent", agentMap);
            } else {
                debug.put("assignedAgent", "NULL");
            }

            if (complaint.getAssignedDepartment() != null) {
                Map<String, Object> deptMap = new HashMap<>();
                deptMap.put("id", complaint.getAssignedDepartment().getDepartmentId());
                deptMap.put("name", complaint.getAssignedDepartment().getName());
                debug.put("assignedDepartment", deptMap);
            } else {
                debug.put("assignedDepartment", "NULL");
            }

            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    private ComplaintResponse convertToComplaintResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();

        response.setComplaintId(complaint.getComplaintId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setStatus(complaint.getStatus());
        response.setCreationDate(complaint.getCreationDate());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());

        try {
            response.setPriorityLevel(complaint.getPriorityLevel());
        } catch (Exception e) {
            response.setPriorityLevel(3);
        }

        try {
            response.setIsVerified(complaint.getIsVerified());
        } catch (Exception e) {
            response.setIsVerified(0);
        }

        if (complaint.getCategory() != null) {
            Map<String, Object> categoryMap = new HashMap<>();
            categoryMap.put("id", complaint.getCategory().getCategoryId());
            categoryMap.put("label", complaint.getCategory().getLabel());
            response.setCategory(categoryMap);
        }

        if (complaint.getMedia() != null) {
            List<Map<String, Object>> mediaList = complaint.getMedia().stream()
                    .map(media -> {
                        Map<String, Object> mediaMap = new HashMap<>();
                        mediaMap.put("id", media.getMediaId());
                        String mediaUrl = "/api/media/" + media.getMediaId();
                        try {
                            if (media.getMediaFile() != null) {
                                mediaUrl = "http://localhost:8080/api/media/file/" + media.getMediaId();
                                mediaMap.put("filename", media.getMediaFile());
                            }
                        } catch (Exception e) {

                        }
                        mediaMap.put("url", mediaUrl);
                        mediaMap.put("captureDate", media.getCaptureDate());
                        return mediaMap;
                    })
                    .collect(Collectors.toList());
            response.setMedia(mediaList);
        }

        return response;
    }

    private ComplaintResponse convertToComplaintResponseSimple(Complaint complaint) {
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

        if (complaint.getAssignedAgent() != null) {
            Map<String, Object> assignedToMap = new HashMap<>();
            assignedToMap.put("id", complaint.getAssignedAgent().getUserId());
            assignedToMap.put("name", complaint.getAssignedAgent().getName());
            assignedToMap.put("email", complaint.getAssignedAgent().getEmail());
            assignedToMap.put("service", complaint.getAssignedAgent().getService());
            assignedToMap.put("role", complaint.getAssignedAgent().getRole());
            response.setAssignedTo(assignedToMap);

            System.out.println("Converting - AssignedAgent found: " + complaint.getAssignedAgent().getName());
        } else {
            System.out.println("Converting - No AssignedAgent");
        }

        if (complaint.getAssignedDepartment() != null) {
            response.setDepartment(complaint.getAssignedDepartment().getName());
            System.out.println("Converting - AssignedDepartment found: " + complaint.getAssignedDepartment().getName());
        } else {
            System.out.println("Converting - No AssignedDepartment");
        }

        if (complaint.getMedia() != null) {
            List<Map<String, Object>> mediaList = complaint.getMedia().stream()
                    .map(media -> {
                        Map<String, Object> mediaMap = new HashMap<>();
                        mediaMap.put("id", media.getMediaId());
                        mediaMap.put("url", "http://localhost:8080/api/media/file/" + media.getMediaId());
                        mediaMap.put("captureDate", media.getCaptureDate());
                        try {
                            mediaMap.put("filename", media.getMediaFile());
                        } catch (Exception e) {

                        }
                        return mediaMap;
                    })
                    .collect(Collectors.toList());
            response.setMedia(mediaList);
        }

        return response;
    }

    private ComplaintResponse convertToComplaintDetailResponse(
            Complaint complaint,
            List<Comment> comments,
            List<StatusHistory> statusHistories) {

        ComplaintResponse response = convertToComplaintResponse(complaint);

        if (complaint.getCitizen() != null) {
            Map<String, Object> citizenMap = new HashMap<>();
            citizenMap.put("id", complaint.getCitizen().getUserId());
            citizenMap.put("name", complaint.getCitizen().getName());
            citizenMap.put("email", complaint.getCitizen().getEmail());
            citizenMap.put("role", complaint.getCitizen().getRole());
            response.setCitizen(citizenMap);
        }

        response.setClosureDate(complaint.getClosureDate());

        try {
            if (complaint.getAssignedAgent() != null) {
                Map<String, Object> assignedToMap = new HashMap<>();
                assignedToMap.put("id", complaint.getAssignedAgent().getUserId());
                assignedToMap.put("name", complaint.getAssignedAgent().getName());
                assignedToMap.put("email", complaint.getAssignedAgent().getEmail());
                assignedToMap.put("service", complaint.getAssignedAgent().getService());
                assignedToMap.put("role", complaint.getAssignedAgent().getRole());
                response.setAssignedTo(assignedToMap);
            }

            if (complaint.getAssignedDepartment() != null) {
                response.setDepartment(complaint.getAssignedDepartment().getName());
            }
        } catch (Exception e) {

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

        return response;
    }

    private CommentDTO convertToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getCommentId());
        dto.setCommentDate(comment.getCommentDate());
        dto.setDescription(comment.getDescription());
        dto.setAuthorType(comment.getAuthorType());

        Map<String, Object> authorMap = new HashMap<>();

        if ("CITIZEN".equals(comment.getAuthorType()) && comment.getCitizen() != null) {
            authorMap.put("id", comment.getCitizen().getUserId());
            authorMap.put("name", comment.getCitizen().getName());
            authorMap.put("email", comment.getCitizen().getEmail());
            authorMap.put("role", comment.getCitizen().getRole());
            authorMap.put("type", "CITIZEN");
            dto.setCitizen(authorMap);

        } else if ("AGENT".equals(comment.getAuthorType()) && comment.getAgent() != null) {
            authorMap.put("id", comment.getAgent().getUserId());
            authorMap.put("name", comment.getAgent().getName());
            authorMap.put("email", comment.getAgent().getEmail());
            authorMap.put("role", "municipal_agent");
            authorMap.put("type", "AGENT");
            authorMap.put("service", comment.getAgent().getService());

            if (comment.getAgent().getDepartment() != null) {
                authorMap.put("department", comment.getAgent().getDepartment().getName());
                authorMap.put("departmentId", comment.getAgent().getDepartment().getDepartmentId());
            }

            Map<String, Object> agentMap = new HashMap<>();
            agentMap.put("id", comment.getAgent().getUserId());
            agentMap.put("name", comment.getAgent().getName());
            agentMap.put("email", comment.getAgent().getEmail());
            agentMap.put("role", "Agent Communal");
            agentMap.put("service", comment.getAgent().getService());
            if (comment.getAgent().getDepartment() != null) {
                agentMap.put("department", comment.getAgent().getDepartment().getName());
                agentMap.put("departmentId", comment.getAgent().getDepartment().getDepartmentId());
            }
            dto.setAgent(agentMap);
            dto.setCitizen(authorMap);

        } else {
            authorMap.put("id", "unknown");
            authorMap.put("name", "Utilisateur inconnu");
            authorMap.put("email", "");
            authorMap.put("role", "unknown");
            authorMap.put("type", "UNKNOWN");
            dto.setCitizen(authorMap);
        }

        dto.setAuthor(authorMap);
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

    private int convertPriorityToLevel(String priority) {
        switch (priority.toLowerCase()) {
            case "high":
                return 1;
            case "medium":
                return 2;
            case "low":
                return 3;
            default:
                return 3;
        }
    }

    private String convertLevelToPriority(int level) {
        switch (level) {
            case 1:
                return "high";
            case 2:
                return "medium";
            case 3:
            default:
                return "low";
        }
    }
}