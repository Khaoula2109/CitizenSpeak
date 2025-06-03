package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.dto.ComplaintRequest;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Category;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.Comment;
import com.example.Backend_CitizenSpeak.models.Infrastructure;
import com.example.Backend_CitizenSpeak.models.StatusHistory;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import com.example.Backend_CitizenSpeak.repositories.InfrastructureRepository;
import com.example.Backend_CitizenSpeak.repositories.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final NotificationService notificationService;
    private final PriorityClassificationService priorityClassificationService;
    private final ComplaintIdGeneratorService complaintIdGeneratorService;

    private final CommentService commentService;
    private final StatusHistoryService statusHistoryService;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository,
                            InfrastructureRepository infrastructureRepository,
                            StatusHistoryRepository statusHistoryRepository,
                            NotificationService notificationService,
                            PriorityClassificationService priorityClassificationService,
                            ComplaintIdGeneratorService complaintIdGeneratorService,
                            CommentService commentService,
                            StatusHistoryService statusHistoryService) {
        this.complaintRepository = complaintRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.priorityClassificationService = priorityClassificationService;
        this.complaintIdGeneratorService = complaintIdGeneratorService;
        this.commentService = commentService;
        this.statusHistoryService = statusHistoryService;
    }


    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreationDateDesc();
    }

    public Complaint getComplaintByGeneratedId(String complaintId) {
        try {
            System.out.println("🔍 Fetching complaint with all relations for ID: " + complaintId);

            Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                    .orElseThrow(() -> new ResourceNotFoundException("Plainte non trouvée avec l'ID: " + complaintId));

            System.out.println("✅ Base complaint found: " + complaint.getTitle());

            System.out.println("🔍 Checking existing relations:");
            System.out.println("- Citizen: " + (complaint.getCitizen() != null ? complaint.getCitizen().getName() : "NULL"));
            System.out.println("- Category: " + (complaint.getCategory() != null ? complaint.getCategory().getLabel() : "NULL"));
            System.out.println("- Media: " + (complaint.getMedia() != null ? complaint.getMedia().size() + " items" : "NULL"));


            try {
                List<Comment> comments = commentService.getCommentsByComplaintGeneratedId(complaintId);
                complaint.setComments(comments);
                System.out.println("✅ Loaded " + comments.size() + " comments");
            } catch (Exception e) {
                System.err.println("⚠️ Error loading comments: " + e.getMessage());
                complaint.setComments(new ArrayList<>());
            }

            try {
                List<StatusHistory> statusHistory = statusHistoryService.getStatusHistoryByComplaintGeneratedId(complaintId);
                complaint.setStatusHistory(statusHistory);
                System.out.println("✅ Loaded " + statusHistory.size() + " status history entries");
            } catch (Exception e) {
                System.err.println("⚠️ Error loading status history: " + e.getMessage());
                complaint.setStatusHistory(new ArrayList<>());
            }

            System.out.println("🎯 Final verification:");
            System.out.println("- Title: " + complaint.getTitle());
            System.out.println("- Status: " + complaint.getStatus());
            System.out.println("- Citizen: " + (complaint.getCitizen() != null ? "✅ LOADED (" + complaint.getCitizen().getName() + ")" : "❌ NULL"));
            System.out.println("- Category: " + (complaint.getCategory() != null ? "✅ LOADED (" + complaint.getCategory().getLabel() + ")" : "❌ NULL"));
            System.out.println("- Comments: " + (complaint.getComments() != null ? "✅ LOADED (" + complaint.getComments().size() + ")" : "❌ NULL"));
            System.out.println("- StatusHistory: " + (complaint.getStatusHistory() != null ? "✅ LOADED (" + complaint.getStatusHistory().size() + ")" : "❌ NULL"));
            System.out.println("- Media: " + (complaint.getMedia() != null ? "✅ LOADED (" + complaint.getMedia().size() + ")" : "❌ NULL"));

            return complaint;

        } catch (Exception e) {
            System.err.println("❌ Error in getComplaintByGeneratedId: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Deprecated
    public Complaint getComplaintById(String id) {
        try {
            return getComplaintByGeneratedId(id);
        } catch (ResourceNotFoundException e) {
            return complaintRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        }
    }

    public List<Complaint> getComplaintsByCitizen(Citizen citizen) {
        return complaintRepository.findByCitizenOrderByCreationDateDesc(citizen);
    }

    public List<Complaint> getRecentComplaints() {
        return complaintRepository.findTop10ByOrderByCreationDateDesc();
    }

    public List<Complaint> getComplaintsByPriority(int priority) {
        return complaintRepository.findAllByOrderByCreationDateDesc()
                .stream()
                .filter(complaint -> complaint.getPriorityLevel() == priority)
                .collect(Collectors.toList());
    }

    @Transactional
    public Complaint createComplaint(ComplaintRequest request, Citizen citizen, Category category) {
        System.out.println("🤖 Début de la création de plainte avec IA");

        Complaint complaint = new Complaint();

        String generatedId = complaintIdGeneratorService.generateComplaintId();
        complaint.setComplaintId(generatedId);
        System.out.println("🆔 ID généré: " + generatedId);

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCreationDate(new Date());
        complaint.setStatus("New");
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setCitizen(citizen);
        complaint.setCategory(category);
        complaint.setClosureDate(null);

        try {
            System.out.println("🧠 Analyse IA en cours...");
            System.out.println("📝 Titre: " + request.getTitle());
            System.out.println("📄 Description: " + request.getDescription().substring(0, Math.min(100, request.getDescription().length())));
            System.out.println("🏷️ Catégorie: " + category.getLabel());

            int predictedPriority = priorityClassificationService.predictPriority(
                    request.getTitle(),
                    request.getDescription(),
                    category.getLabel()
            );

            complaint.setPriorityLevel(predictedPriority);

            String priorityText = switch (predictedPriority) {
                case 1 -> "HAUTE 🔴";
                case 2 -> "MOYENNE 🟡";
                case 3 -> "FAIBLE 🟢";
                default -> "NON DÉFINIE ⚪";
            };

            System.out.println("✅ Priorité prédite par IA: " + priorityText + " (niveau " + predictedPriority + ")");

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la prédiction IA: " + e.getMessage());
            complaint.setPriorityLevel(2);
            System.out.println("🔄 Utilisation de la priorité par défaut: MOYENNE");
        }

        if (request.getInfrastructureId() != null && !request.getInfrastructureId().isEmpty()) {
            Infrastructure infrastructure = infrastructureRepository.findById(request.getInfrastructureId())
                    .orElse(null);
            complaint.setInfrastructure(infrastructure);
        }

        Complaint savedComplaint = complaintRepository.save(complaint);
        System.out.println("💾 Plainte sauvegardée avec ID: " + savedComplaint.getComplaintId());

        StatusHistory initialStatus = new StatusHistory();
        initialStatus.setStatus("New");
        initialStatus.setStatusDate(new Date());
        initialStatus.setNotes("Plainte créée avec ID: " + savedComplaint.getComplaintId() +
                " - Priorité automatique: " +
                (savedComplaint.getPriorityLevel() == 1 ? "Haute" :
                        savedComplaint.getPriorityLevel() == 2 ? "Moyenne" : "Faible"));
        initialStatus.setComplaint(savedComplaint);
        initialStatus.setUpdatedBy(citizen);

        statusHistoryRepository.save(initialStatus);

        String notificationMessage = switch (savedComplaint.getPriorityLevel()) {
            case 1 -> "🚨 Votre signalement urgent " + savedComplaint.getComplaintId() + " a été reçu et sera traité en priorité. Merci de votre vigilance.";
            case 2 -> "📋 Votre signalement " + savedComplaint.getComplaintId() + " a été reçu et sera traité dans les meilleurs délais. Merci de votre participation.";
            case 3 -> "✉️ Votre suggestion " + savedComplaint.getComplaintId() + " a été reçue et sera étudiée par nos équipes. Merci pour votre contribution.";
            default -> "📨 Votre signalement " + savedComplaint.getComplaintId() + " a été reçu et sera traité selon sa priorité. Merci.";
        };

        notificationService.createGeneralNotification(notificationMessage, citizen);

        try {
            System.out.println("📈 Plainte ajoutée pour l'amélioration future du modèle");
        } catch (Exception e) {
            System.err.println("⚠️ Erreur lors de l'ajout aux données d'entraînement: " + e.getMessage());
        }

        System.out.println("🎉 Création de plainte terminée avec succès - ID: " + savedComplaint.getComplaintId());
        return savedComplaint;
    }

    @Transactional
    public void updateComplaintPriorityWithFeedback(String complaintId, int newPriority, String reason) {
        Complaint complaint = getComplaintByGeneratedId(complaintId);
        int oldPriority = complaint.getPriorityLevel();

        complaint.setPriorityLevel(newPriority);
        complaintRepository.save(complaint);

        String feedbackText = complaint.getTitle() + " " + complaint.getDescription();
        String categoryLabel = complaint.getCategory() != null ? complaint.getCategory().getLabel() : "";

        priorityClassificationService.addTrainingExample(feedbackText, categoryLabel, newPriority);

        System.out.println("🔄 Priorité mise à jour: " + oldPriority + " → " + newPriority +
                " (Raison: " + reason + ")");

        StatusHistory priorityUpdate = new StatusHistory();
        priorityUpdate.setStatus(complaint.getStatus());
        priorityUpdate.setStatusDate(new Date());
        priorityUpdate.setNotes("Priorité mise à jour de " + oldPriority + " vers " + newPriority +
                ". Raison: " + reason);
        priorityUpdate.setComplaint(complaint);
        priorityUpdate.setUpdatedBy(complaint.getCitizen());

        statusHistoryRepository.save(priorityUpdate);
    }

    @Transactional
    public Complaint updateComplaintStatus(Complaint complaint, String status, String notes, User updatedBy) {
        String previousStatus = complaint.getStatus();

        complaint.setStatus(status);

        if ("Resolved".equals(status)) {
            complaint.setClosureDate(new Date());
        }

        Complaint updatedComplaint = complaintRepository.save(complaint);

        StatusHistory statusHistory = new StatusHistory();
        statusHistory.setStatus(status);
        statusHistory.setStatusDate(new Date());
        statusHistory.setNotes(notes);
        statusHistory.setComplaint(updatedComplaint);
        statusHistory.setUpdatedBy(updatedBy);

        statusHistoryRepository.save(statusHistory);

        if (!previousStatus.equals(status)) {
            notificationService.createStatusUpdateNotification(updatedComplaint, status, notes);
        }

        return updatedComplaint;
    }
    public void updateComplaint(Complaint complaint) {
        complaintRepository.save(complaint);
    }

    public void deleteComplaintByGeneratedId(String complaintId) {
        Complaint complaint = getComplaintByGeneratedId(complaintId);
        complaintRepository.delete(complaint);
    }

    @Deprecated
    public void deleteComplaint(String id) {
        try {
            deleteComplaintByGeneratedId(id);
        } catch (ResourceNotFoundException e) {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
            complaintRepository.delete(complaint);
        }
    }

    public List<Complaint> getNearbyComplaints(Double latitude, Double longitude, Integer radiusKm) {
        System.out.println("Finding complaints near: " + latitude + ", " + longitude + " within " + radiusKm + "km");

        List<Complaint> allComplaints = complaintRepository.findAllByOrderByCreationDateDesc();

        List<Complaint> nearbyComplaints = allComplaints.stream()
                .filter(complaint -> {
                    if (complaint.getLatitude() == 0.0 || complaint.getLongitude() == 0.0) {
                        return false;
                    }

                    double distance = calculateDistance(
                            latitude, longitude,
                            complaint.getLatitude(), complaint.getLongitude()
                    );

                    return distance <= radiusKm;
                })
                .collect(Collectors.toList());

        System.out.println("Found " + nearbyComplaints.size() + " complaints within " + radiusKm + "km");
        return nearbyComplaints;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

}