package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Comment;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.repositories.CommentRepository;
import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final ComplaintRepository complaintRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository,
                          NotificationService notificationService,
                          ComplaintRepository complaintRepository) {
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.complaintRepository = complaintRepository;
    }


    public Comment getCommentById(String id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    public List<Comment> getCommentsByComplaintGeneratedId(String complaintId) {
        try {
            System.out.println("Fetching comments for complaint ID: " + complaintId);

            Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

            List<Comment> comments = commentRepository.findByComplaintOrderByCommentDateAsc(complaint);

            System.out.println("Found " + comments.size() + " comments (sorted by date asc)");
            return comments;
        } catch (Exception e) {
            System.err.println("Error fetching comments for complaint ID " + complaintId + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }


    @Transactional
    public Comment createCommentByCitizen(String description, Citizen citizen, Complaint complaint) {
        try {
            System.out.println("Creating comment by citizen: " + citizen.getName());

            Comment comment = new Comment();
            comment.setDescription(description);
            comment.setCommentDate(new Date());
            comment.setCitizen(citizen);
            comment.setComplaint(complaint);
            comment.setAuthorType("CITIZEN");

            Comment savedComment = commentRepository.save(comment);
            System.out.println("Comment saved with ID: " + savedComment.getCommentId());

            notificationService.createCommentNotification(savedComment);

            return savedComment;
        } catch (Exception e) {
            System.err.println("Error creating comment by citizen: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Comment createCommentByAgent(String description, CommunityAgent agent, Complaint complaint) {
        try {
            System.out.println("Creating comment by agent: " + agent.getName());

            Comment comment = new Comment();
            comment.setDescription(description);
            comment.setCommentDate(new Date());
            comment.setAgent(agent);
            comment.setComplaint(complaint);
            comment.setAuthorType("AGENT");

            Comment savedComment = commentRepository.save(comment);
            System.out.println("Comment saved with ID: " + savedComment.getCommentId());

            notificationService.createCommentNotification(savedComment);

            return savedComment;
        } catch (Exception e) {
            System.err.println("Error creating comment by agent: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }


    @Transactional
    public Comment updateCommentDescription(String commentId, String newDescription) {
        Comment comment = getCommentById(commentId);
        comment.setDescription(newDescription);
        Comment updatedComment = commentRepository.save(comment);
        System.out.println("Comment description updated: " + commentId);
        return updatedComment;
    }

    public void deleteComment(String id) {
        Comment comment = getCommentById(id);
        commentRepository.delete(comment);
    }
}