package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.CommentDTO;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Comment;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.services.CitizenService;
import com.example.Backend_CitizenSpeak.services.CommentService;
import com.example.Backend_CitizenSpeak.services.CommunityAgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final CitizenService citizenService;
    private final CommunityAgentService communityAgentService;

    @Autowired
    public CommentController(CommentService commentService,
                             CitizenService citizenService,
                             CommunityAgentService communityAgentService) {
        this.commentService = commentService;
        this.citizenService = citizenService;
        this.communityAgentService = communityAgentService;
    }

    @GetMapping(value = {"/{commentId}", "/{commentId}/"})
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable String commentId) {
        try {
            System.out.println("Request to get comment: " + commentId);

            Comment comment = commentService.getCommentById(commentId);
            CommentDTO commentDTO = convertToCommentDTO(comment);

            return ResponseEntity.ok(commentDTO);

        } catch (ResourceNotFoundException e) {
            System.err.println("Comment not found: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting comment: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error getting comment: " + e.getMessage(),
                    e
            );
        }
    }

    @PutMapping(value = {"/{commentId}", "/{commentId}/"})
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

    @DeleteMapping(value = {"/{commentId}", "/{commentId}/"})
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
            }

            Map<String, Object> agentMap = new HashMap<>();
            agentMap.put("id", comment.getAgent().getUserId());
            agentMap.put("name", comment.getAgent().getName());
            agentMap.put("email", comment.getAgent().getEmail());
            agentMap.put("role", "municipal_agent");
            agentMap.put("service", comment.getAgent().getService());
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

        dto.setAuthorType(authorMap.toString());

        return dto;
    }
}