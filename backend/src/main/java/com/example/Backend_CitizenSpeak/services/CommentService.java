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

    public List<Comment> getCommentsByComplaint(Complaint complaint) {
        try {
            return commentRepository.findByComplaintOrderByCommentDateDesc(complaint);
        } catch (Exception e) {
            try {
                return commentRepository.findByComplaintOrderByCommentDateAsc(complaint);
            } catch (Exception ex) {
                return new ArrayList<>();
            }
        }
    }

    public List<Comment> getCommentsByComplaintId(String complaintId) {
        try {
            System.out.println("Fetching comments for complaint ID: " + complaintId);
            List<Comment> comments = commentRepository.findByComplaintComplaintId(complaintId);
            System.out.println("Found " + comments.size() + " comments");
            return comments;
        } catch (Exception e) {
            System.err.println("Error fetching comments for complaint ID " + complaintId + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<Comment> getCommentsByComplaintGeneratedId(String complaintId) {
        try {
            System.out.println("Fetching comments for complaint ID: " + complaintId);

            Complaint complaint;
            try {
                complaint = complaintRepository.findByComplaintId(complaintId)
                        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
            } catch (Exception e) {
                return getCommentsByComplaintId(complaintId);
            }

            List<Comment> comments;
            try {
                comments = commentRepository.findByComplaintOrderByCommentDateAsc(complaint);
            } catch (Exception e) {
                try {
                    comments = commentRepository.findByComplaintOrderByCommentDateDesc(complaint);
                } catch (Exception ex) {
                    comments = commentRepository.findByComplaintComplaintId(complaintId);
                }
            }

            System.out.println("Found " + comments.size() + " comments (sorted by date)");
            return comments;
        } catch (Exception e) {
            System.err.println("Error fetching comments for complaint ID " + complaintId + ": " + e.getMessage());
            return new ArrayList<>();
        }
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

            try {
                if (complaint.getAssignedAgent() != null) {
                    notificationService.notifyAgentComment(
                            complaint.getAssignedAgent(),
                            complaint,
                            citizen.getName()
                    );
                }
            } catch (Exception e) {
                try {
                    notificationService.createCommentNotification(savedComment);
                } catch (Exception ex) {
                    System.err.println("Error creating notification: " + ex.getMessage());
                }
            }

            return savedComment;
        } catch (Exception e) {
            System.err.println("Error creating comment: " + e.getMessage());
            e.printStackTrace();
            throw e;
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

            try {
                notificationService.createCommentNotification(savedComment);
            } catch (Exception e) {
                try {
                    if (complaint.getAssignedAgent() != null) {
                        notificationService.notifyAgentComment(
                                complaint.getAssignedAgent(),
                                complaint,
                                citizen.getName()
                        );
                    }
                } catch (Exception ex) {
                    System.err.println("Error creating notification: " + ex.getMessage());
                }
            }

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

            try {
                notificationService.createCommentNotification(savedComment);
            } catch (Exception e) {
                System.err.println("Error creating notification: " + e.getMessage());
            }

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

    public Comment updateComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public void deleteComment(String commentId) {
        try {
            Comment comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Commentaire non trouvé avec l'ID: " + commentId));
            commentRepository.delete(comment);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            Comment comment = getCommentById(commentId);
            commentRepository.delete(comment);
        }
    }

    public boolean existsById(String commentId) {
        return commentRepository.existsById(commentId);
    }

    @Transactional
    public void deleteCommentsByComplaintId(String complaintId) {
        try {
            List<Comment> comments = getCommentsByComplaintId(complaintId);
            commentRepository.deleteAll(comments);
        } catch (Exception e) {
            try {
                List<Comment> comments = getCommentsByComplaintGeneratedId(complaintId);
                commentRepository.deleteAll(comments);
            } catch (Exception ex) {
                System.err.println("Error deleting comments for complaint ID " + complaintId + ": " + ex.getMessage());
            }
        }
    }
}