package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Comment;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.repositories.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class CommentService {
    @Autowired
    private final CommentRepository commentRepository;
    @Autowired
    private NotificationService notificationService;

    @Autowired
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public Comment getCommentById(String id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    public List<Comment> getCommentsByComplaint(Complaint complaint) {
        return commentRepository.findByComplaintOrderByCommentDateDesc(complaint);
    }

    public List<Comment> getCommentsByComplaintId(String complaintId) {
        System.out.println("Fetching comments for complaint ID: " + complaintId);

        List<Comment> comments = commentRepository.findByComplaintComplaintId(complaintId);
        System.out.println("Found " + comments.size() + " comments");

        return comments;
    }

    @Transactional
    public Comment createComment(String description, Citizen citizen, Complaint complaint) {
        try {
            System.out.println("Creating comment with description: " + description);
            System.out.println("Citizen: " + citizen.getName() + " (ID: " + citizen.getUserId() + ")");
            System.out.println("Complaint: " + complaint.getTitle() + " (ID: " + complaint.getComplaintId() + ")");

            Comment comment = new Comment();
            comment.setDescription(description);
            comment.setCommentDate(new Date());
            comment.setAuthorType("CITIZEN");
            comment.setCitizen(citizen);
            comment.setComplaint(complaint);

            Comment savedComment = commentRepository.save(comment);
            System.out.println("Comment saved with ID: " + savedComment.getCommentId());

            if (complaint.getAssignedAgent() != null) {
                notificationService.notifyAgentComment(
                        complaint.getAssignedAgent(),
                        complaint,
                        citizen.getName()
                );
            }

            return savedComment;
        } catch (Exception e) {
            System.err.println("Error creating comment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Comment updateComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé avec l'ID: " + commentId));

        commentRepository.delete(comment);
    }

    public boolean existsById(String commentId) {
        return commentRepository.existsById(commentId);
    }

    @Transactional
    public void deleteCommentsByComplaintId(String complaintId) {
        List<Comment> comments = getCommentsByComplaintId(complaintId);
        commentRepository.deleteAll(comments);
    }

    @Transactional
    public Comment createCommentByAgent(String description, CommunityAgent agent, Complaint complaint) {
        try {
            Comment comment = new Comment();
            comment.setDescription(description);
            comment.setCommentDate(new Date());
            comment.setAuthorType("AGENT");
            comment.setAgent(agent);
            comment.setComplaint(complaint);

            Comment savedComment = commentRepository.save(comment);
            return savedComment;
        } catch (Exception e) {
            System.err.println("Error creating comment by agent: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Comment updateCommentDescription(String commentId, String newDescription) {
        try {
            System.out.println("Updating comment with ID: " + commentId);
            System.out.println("New description: " + newDescription);

            if (newDescription == null || newDescription.trim().isEmpty()) {
                throw new IllegalArgumentException("La description du commentaire ne peut pas être vide");
            }

            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé avec l'ID: " + commentId));

            comment.setDescription(newDescription.trim());

            Comment updatedComment = commentRepository.save(comment);

            System.out.println("Comment updated successfully with ID: " + updatedComment.getCommentId());

            return updatedComment;

        } catch (Exception e) {
            System.err.println("Error updating comment description: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}