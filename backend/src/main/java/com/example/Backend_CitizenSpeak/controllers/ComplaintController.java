package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.ComplaintRequest;
import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.dto.CommentDTO;
import com.example.Backend_CitizenSpeak.dto.StatusHistoryDTO;
import com.example.Backend_CitizenSpeak.dto.StatusUpdateRequest;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.Media;
import com.example.Backend_CitizenSpeak.models.Comment;
import com.example.Backend_CitizenSpeak.models.StatusHistory;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.services.CategoryService;
import com.example.Backend_CitizenSpeak.services.CitizenService;
import com.example.Backend_CitizenSpeak.services.ComplaintService;
import com.example.Backend_CitizenSpeak.services.MediaService;
import com.example.Backend_CitizenSpeak.services.CommentService;
import com.example.Backend_CitizenSpeak.services.StatusHistoryService;
import com.example.Backend_CitizenSpeak.services.CommunityAgentService;
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

    @Autowired
    public ComplaintController(ComplaintService complaintService,
                               CitizenService citizenService,
                               CategoryService categoryService,
                               MediaService mediaService,
                               CommentService commentService,
                               StatusHistoryService statusHistoryService,
                               CommunityAgentService communityAgentService) {
        this.complaintService = complaintService;
        this.citizenService = citizenService;
        this.categoryService = categoryService;
        this.mediaService = mediaService;
        this.commentService = commentService;
        this.statusHistoryService = statusHistoryService;
        this.communityAgentService = communityAgentService;
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

            List<Complaint> complaints = complaintService.getAllComplaints();
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
            System.out.println("📋 Récupération des détails pour ID: " + complaintId);

            Complaint complaint = complaintService.getComplaintByGeneratedId(complaintId);

            List<Comment> comments = commentService.getCommentsByComplaintGeneratedId(complaint.getComplaintId());
            List<StatusHistory> statusHistories = statusHistoryService.getStatusHistoryByComplaintGeneratedId(complaint.getComplaintId());

            ComplaintResponse response = convertToComplaintDetailResponse(complaint, comments, statusHistories);

            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException ex) {
            throw ex;

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la récupération de la plainte", e);
        }
    }

    @GetMapping(value = {"/search/{complaintId}", "/search/{complaintId}/"})
    public ResponseEntity<ComplaintResponse> searchComplaintById(@PathVariable String complaintId) {
        try {
            System.out.println("🔍 Recherche de la plainte avec ID: " + complaintId);

            Complaint complaint = complaintService.getComplaintByGeneratedId(complaintId);

            List<Comment> comments = commentService.getCommentsByComplaintGeneratedId(complaint.getComplaintId());
            List<StatusHistory> statusHistories = statusHistoryService.getStatusHistoryByComplaintGeneratedId(complaint.getComplaintId());

            ComplaintResponse response = convertToComplaintDetailResponse(complaint, comments, statusHistories);

            System.out.println("✅ Plainte trouvée: " + complaint.getTitle());
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException ex) {
            System.err.println("❌ Plainte non trouvée: " + ex.getMessage());
            throw ex; // Cette exception sera capturée par @ExceptionHandler(ResourceNotFoundException.class)

        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue lors de la recherche: " + e.getMessage());
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

            Complaint complaint = complaintService.getComplaintByGeneratedId(complaintId);
            System.out.println("Found complaint: " + complaint.getTitle());

            Comment comment = null;

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
                    isAdmin = "Admin".equals(currentUser.getRole());
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
                        isAdmin = "Admin".equals(currentUser.getRole());
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

    @GetMapping(value = {"/{complaintId}/comments", "/{complaintId}/comments/"})
    public ResponseEntity<List<CommentDTO>> getComplaintComments(@PathVariable String complaintId) {
        try {
            System.out.println("Request to get comments for complaint: " + complaintId);

            List<Comment> comments = commentService.getCommentsByComplaintGeneratedId(complaintId);
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

            if (!"Admin".equals(citizen.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Complaint complaint = complaintService.getComplaintByGeneratedId(complaintId);

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


    private ComplaintResponse convertToComplaintResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();

        response.setComplaintId(complaint.getComplaintId());

        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setStatus(complaint.getStatus());
        response.setCreationDate(complaint.getCreationDate());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setPriorityLevel(complaint.getPriorityLevel());

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
                        mediaMap.put("url", "/api/media/" + media.getMediaId());
                        mediaMap.put("captureDate", media.getCaptureDate());
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
            agentMap.put("role", "municipal_agent");
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
}