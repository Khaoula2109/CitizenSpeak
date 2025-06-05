package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.dto.ComplaintRequest;
import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import com.example.Backend_CitizenSpeak.repositories.InfrastructureRepository;
import com.example.Backend_CitizenSpeak.repositories.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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
    private final MediaService mediaService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository,
                            InfrastructureRepository infrastructureRepository,
                            StatusHistoryRepository statusHistoryRepository,
                            NotificationService notificationService,
                            PriorityClassificationService priorityClassificationService,
                            ComplaintIdGeneratorService complaintIdGeneratorService,
                            CommentService commentService,
                            StatusHistoryService statusHistoryService,
                            MediaService mediaService) {
        this.complaintRepository = complaintRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationService = notificationService;
        this.priorityClassificationService = priorityClassificationService;
        this.complaintIdGeneratorService = complaintIdGeneratorService;
        this.commentService = commentService;
        this.statusHistoryService = statusHistoryService;
        this.mediaService = mediaService;
    }

    public List<Complaint> getAllComplaints() {
        try {
            return complaintRepository.findAllByOrderByCreationDateDesc();
        } catch (Exception e) {
            List<Complaint> complaints = complaintRepository.findAll();
            complaints.sort((c1, c2) -> c2.getCreationDate().compareTo(c1.getCreationDate()));
            return complaints;
        }
    }

    public List<ComplaintResponse> getAllComplaintsResponse() {
        List<Complaint> complaints = getAllComplaints();
        return complaints.stream()
                .map(this::toComplaintResponse)
                .collect(Collectors.toList());
    }

    public List<Complaint> getAllComplaintsEntities() {
        try {
            List<Complaint> complaints = complaintRepository.findAll();
            complaints.sort((c1, c2) -> c2.getCreationDate().compareTo(c1.getCreationDate()));
            System.out.println("Found " + complaints.size() + " complaints (entities)");
            return complaints;
        } catch (Exception e) {
            System.err.println("Error retrieving all complaint entities: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error retrieving complaint entities", e);
        }
    }

    public Complaint getComplaintByGeneratedId(String complaintId) {
        try {
            System.out.println("Fetching complaint with all relations for ID: " + complaintId);

            Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                    .orElseThrow(() -> new ResourceNotFoundException("Plainte non trouvée avec l'ID: " + complaintId));

            System.out.println("Base complaint found: " + complaint.getTitle());

            System.out.println("Checking existing relations:");
            System.out.println("- Citizen: " + (complaint.getCitizen() != null ? complaint.getCitizen().getName() : "NULL"));
            System.out.println("- Category: " + (complaint.getCategory() != null ? complaint.getCategory().getLabel() : "NULL"));
            System.out.println("- Media: " + (complaint.getMedia() != null ? complaint.getMedia().size() + " items" : "NULL"));

            try {
                List<Comment> comments = commentService.getCommentsByComplaintGeneratedId(complaintId);
                complaint.setComments(comments);
                System.out.println("Loaded " + comments.size() + " comments");
            } catch (Exception e) {
                System.err.println("Error loading comments: " + e.getMessage());
                complaint.setComments(new ArrayList<>());
            }

            try {
                List<StatusHistory> statusHistory = statusHistoryService.getStatusHistoryByComplaintGeneratedId(complaintId);
                complaint.setStatusHistory(statusHistory);
                System.out.println("Loaded " + statusHistory.size() + " status history entries");
            } catch (Exception e) {
                System.err.println("Error loading status history: " + e.getMessage());
                complaint.setStatusHistory(new ArrayList<>());
            }

            System.out.println("Final verification:");
            System.out.println("- Title: " + complaint.getTitle());
            System.out.println("- Status: " + complaint.getStatus());
            System.out.println("- Citizen: " + (complaint.getCitizen() != null ? "LOADED (" + complaint.getCitizen().getName() + ")" : "NULL"));
            System.out.println("- Category: " + (complaint.getCategory() != null ? "LOADED (" + complaint.getCategory().getLabel() + ")" : "NULL"));
            System.out.println("- Comments: " + (complaint.getComments() != null ? "LOADED (" + complaint.getComments().size() + ")" : "NULL"));
            System.out.println("- StatusHistory: " + (complaint.getStatusHistory() != null ? "LOADED (" + complaint.getStatusHistory().size() + ")" : "NULL"));
            System.out.println("- Media: " + (complaint.getMedia() != null ? "LOADED (" + complaint.getMedia().size() + ")" : "NULL"));

            return complaint;

        } catch (Exception e) {
            System.err.println("Error in getComplaintByGeneratedId: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Complaint getComplaintById(String id) {
        try {
            return getComplaintByGeneratedId(id);
        } catch (ResourceNotFoundException e) {
            return complaintRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        }
    }

    public ComplaintResponse getComplaintByIdResponse(String id) {
        Complaint complaint = getComplaintEntityById(id);
        return toComplaintResponse(complaint);
    }

    public Complaint getComplaintEntityById(String id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    }

    public List<Complaint> getComplaintsByCitizen(Citizen citizen) {
        try {
            return complaintRepository.findByCitizenOrderByCreationDateDesc(citizen);
        } catch (Exception e) {
            return complaintRepository.findByCitizen(citizen);
        }
    }

    public List<Complaint> getRecentComplaints() {
        try {
            return complaintRepository.findTop10ByOrderByCreationDateDesc();
        } catch (Exception e) {
            List<Complaint> allComplaints = getAllComplaints();
            return allComplaints.stream()
                    .limit(10)
                    .collect(Collectors.toList());
        }
    }

    public List<Complaint> getComplaintsByPriority(int priority) {
        return getAllComplaints()
                .stream()
                .filter(complaint -> complaint.getPriorityLevel() == priority)
                .collect(Collectors.toList());
    }

    public List<Complaint> getComplaintsByAssignedAgent(CommunityAgent agent) {
        try {
            return complaintRepository.findByAssignedAgent(agent);
        } catch (Exception e) {
            return getAllComplaints().stream()
                    .filter(complaint -> agent.equals(complaint.getAssignedAgent()))
                    .collect(Collectors.toList());
        }
    }

    public List<Complaint> getComplaintsByAssignedAgentAndStatus(CommunityAgent agent, String status) {
        try {
            return complaintRepository.findByAssignedAgentAndStatus(agent, status);
        } catch (Exception e) {
            return getComplaintsByAssignedAgent(agent).stream()
                    .filter(complaint -> status.equals(complaint.getStatus()))
                    .collect(Collectors.toList());
        }
    }

    public List<Complaint> getComplaintsByAssignedDepartment(Department department) {
        try {
            return complaintRepository.findByAssignedDepartment(department);
        } catch (Exception e) {
            return getAllComplaints().stream()
                    .filter(complaint -> department.equals(complaint.getAssignedDepartment()))
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public Complaint createComplaint(ComplaintRequest request, Citizen citizen, Category category) {
        try {
            System.out.println("Début de la création de plainte avec IA");

            Complaint complaint = new Complaint();

            String generatedId;
            try {
                generatedId = complaintIdGeneratorService.generateComplaintId();
                complaint.setComplaintId(generatedId);
                System.out.println("ID généré: " + generatedId);
            } catch (Exception e) {
                System.out.println("Service ID generator non disponible, utilisation ID automatique");
            }

            complaint.setTitle(request.getTitle());
            complaint.setDescription(request.getDescription());
            complaint.setCreationDate(new Date());
            complaint.setStatus("New");
            complaint.setLatitude(request.getLatitude());
            complaint.setLongitude(request.getLongitude());
            complaint.setCitizen(citizen);
            complaint.setCategory(category);
            complaint.setClosureDate(null);
            complaint.setIsVerified(0);

            try {
                System.out.println("Analyse IA en cours...");
                System.out.println("Titre: " + request.getTitle());
                System.out.println("Description: " + request.getDescription().substring(0, Math.min(100, request.getDescription().length())));
                System.out.println("Catégorie: " + category.getLabel());

                int predictedPriority = priorityClassificationService.predictPriority(
                        request.getTitle(),
                        request.getDescription(),
                        category.getLabel()
                );

                complaint.setPriorityLevel(predictedPriority);

                String priorityText = switch (predictedPriority) {
                    case 1 -> "HAUTE";
                    case 2 -> "MOYENNE";
                    case 3 -> "FAIBLE";
                    default -> "NON DÉFINIE";
                };

                System.out.println("Priorité prédite par IA: " + priorityText + " (niveau " + predictedPriority + ")");

            } catch (Exception e) {
                System.err.println("Erreur lors de la prédiction IA: " + e.getMessage());
                complaint.setPriorityLevel(3);
                System.out.println("Utilisation de la priorité par défaut: FAIBLE");
            }

            try {
                if (request.getInfrastructureId() != null && !request.getInfrastructureId().isEmpty()) {
                    Infrastructure infrastructure = infrastructureRepository.findById(request.getInfrastructureId())
                            .orElse(null);
                    complaint.setInfrastructure(infrastructure);
                }
            } catch (Exception e) {
                System.err.println("Erreur lors du lien avec l'infrastructure: " + e.getMessage());
            }

            Complaint savedComplaint = complaintRepository.save(complaint);
            System.out.println("Plainte sauvegardée avec ID: " + savedComplaint.getComplaintId());

            StatusHistory initialStatus = new StatusHistory();
            initialStatus.setStatus("New");
            initialStatus.setStatusDate(new Date());
            initialStatus.setNotes("Plainte créée" +
                    (savedComplaint.getComplaintId() != null ? " avec ID: " + savedComplaint.getComplaintId() : "") +
                    " - Priorité automatique: " +
                    (savedComplaint.getPriorityLevel() == 1 ? "Haute" :
                            savedComplaint.getPriorityLevel() == 2 ? "Moyenne" : "Faible"));
            initialStatus.setComplaint(savedComplaint);
            initialStatus.setUpdatedBy(citizen);

            statusHistoryRepository.save(initialStatus);

            try {
                String notificationMessage = switch (savedComplaint.getPriorityLevel()) {
                    case 1 -> "Votre signalement urgent a été reçu et sera traité en priorité. Merci de votre vigilance.";
                    case 2 -> "Votre signalement a été reçu et sera traité dans les meilleurs délais. Merci de votre participation.";
                    case 3 -> "Votre suggestion a été reçue et sera étudiée par nos équipes. Merci pour votre contribution.";
                    default -> "Votre signalement a été reçu et sera traité selon sa priorité. Merci.";
                };

                notificationService.createGeneralNotification(notificationMessage, citizen);
            } catch (Exception e) {
                try {
                    notificationService.notifyAdminNewComplaint(savedComplaint);
                    if (savedComplaint.getPriorityLevel() == 1) {
                        notificationService.notifyAdminUrgentComplaint(savedComplaint);
                    }
                } catch (Exception ex) {
                    System.err.println("Erreur lors de la création des notifications: " + ex.getMessage());
                }
            }

            try {
                System.out.println("Plainte ajoutée pour l'amélioration future du modèle");
            } catch (Exception e) {
                System.err.println("Erreur lors de l'ajout aux données d'entraînement: " + e.getMessage());
            }

            System.out.println("Création de plainte terminée avec succès");
            return savedComplaint;

        } catch (Exception e) {
            System.err.println("Erreur lors de la création de plainte: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void updateComplaintPriorityWithFeedback(String complaintId, int newPriority, String reason) {
        Complaint complaint = getComplaintByGeneratedId(complaintId);
        int oldPriority = complaint.getPriorityLevel();

        complaint.setPriorityLevel(newPriority);
        complaintRepository.save(complaint);

        try {
            String feedbackText = complaint.getTitle() + " " + complaint.getDescription();
            String categoryLabel = complaint.getCategory() != null ? complaint.getCategory().getLabel() : "";

            priorityClassificationService.addTrainingExample(feedbackText, categoryLabel, newPriority);

            System.out.println("Priorité mise à jour: " + oldPriority + " → " + newPriority +
                    " (Raison: " + reason + ")");
        } catch (Exception e) {
            System.err.println("Erreur lors de l'ajout du feedback: " + e.getMessage());
        }

        StatusHistory priorityUpdate = new StatusHistory();
        priorityUpdate.setStatus(complaint.getStatus());
        priorityUpdate.setStatusDate(new Date());
        priorityUpdate.setNotes("Priorité mise à jour de " + oldPriority + " vers " + newPriority +
                ". Raison: " + reason);
        priorityUpdate.setComplaint(complaint);
        priorityUpdate.setUpdatedBy(complaint.getCitizen());

        statusHistoryRepository.save(priorityUpdate);
    }

    public Complaint updateComplaintDetails(Complaint complaint, ComplaintRequest request) {
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());

        return complaintRepository.save(complaint);
    }

    public void updateComplaint(Complaint complaint) {
        complaintRepository.save(complaint);
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

        try {
            if (!previousStatus.equals(status)) {
                notificationService.createStatusUpdateNotification(updatedComplaint, status, notes);
            }
        } catch (Exception e) {
            try {
                if ("Resolved".equals(status)) {
                    notificationService.notifyAdminComplaintResolved(updatedComplaint, updatedBy);
                }

                if (complaint.getAssignedAgent() != null && !status.equals(previousStatus)) {
                    notificationService.notifyAgentStatusUpdate(complaint.getAssignedAgent(), updatedComplaint, status);
                }
            } catch (Exception ex) {
                System.err.println("Erreur lors de la création des notifications: " + ex.getMessage());
            }
        }

        return updatedComplaint;
    }

    @Transactional
    public Complaint validateComplaintPriority(String complaintId,
                                               String priority,
                                               boolean accepted,
                                               String notes,
                                               User currentUser) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getIsVerified() == 1) {
            throw new IllegalStateException("Cette plainte a déjà été validée");
        }

        int newPriorityLevel = complaint.getPriorityLevel();
        if (!accepted) {
            newPriorityLevel = convertPriorityToLevel(priority);
        }
        complaint.setPriorityLevel(newPriorityLevel);
        complaint.setIsVerified(1);
        Complaint updatedComplaint = complaintRepository.save(complaint);

        StatusHistory history = new StatusHistory();
        history.setStatus(complaint.getStatus());
        history.setStatusDate(new Date());
        history.setComplaint(updatedComplaint);
        history.setUpdatedBy(currentUser);

        String action = accepted ? "Priorité acceptée" : "Priorité modifiée";
        history.setNotes(action + " : " + convertLevelToPriority(newPriorityLevel) +
                ((notes != null && !notes.trim().isEmpty()) ? " - " + notes : ""));

        statusHistoryService.createStatusHistory(history);

        return updatedComplaint;
    }

    @Transactional
    public Complaint assignComplaint(Complaint complaint, CommunityAgent agent, Department department, User assignedBy) {
        if (complaint.getIsVerified() != 1) {
            throw new IllegalStateException("La plainte doit être vérifiée avant d'être assignée");
        }

        complaint.setAssignedAgent(agent);
        complaint.setAssignedDepartment(department);
        complaint.setStatus("Assigned");

        Complaint updatedComplaint = complaintRepository.save(complaint);

        StatusHistory statusHistory = new StatusHistory();
        statusHistory.setStatus("Assigned");
        statusHistory.setStatusDate(new Date());
        statusHistory.setNotes("Plainte assignée à " + agent.getName() + " du département " + department.getName());
        statusHistory.setComplaint(updatedComplaint);
        statusHistory.setUpdatedBy(assignedBy);
        statusHistoryRepository.save(statusHistory);

        try {
            notificationService.notifyAgentAssignment(agent, updatedComplaint, assignedBy);
        } catch (Exception e) {
            System.err.println("Erreur lors de la notification d'assignation: " + e.getMessage());
        }

        return updatedComplaint;
    }

    public boolean requiresPrioritization(Complaint complaint) {
        return complaint.getIsVerified() == 0;
    }

    @Transactional
    public void deleteComplaint(String id) {
        try {
            deleteComplaintByGeneratedId(id);
        } catch (ResourceNotFoundException e) {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

            try {
                if (complaint.getMedia() != null && !complaint.getMedia().isEmpty()) {
                    for (Media mediaRef : complaint.getMedia()) {
                        try {
                            String mediaId = mediaRef.getMediaId();
                            mediaService.deleteMedia(mediaId);
                        } catch (Exception ex) {
                            System.err.println("Erreur lors de la suppression du média: " + ex.getMessage());
                        }
                    }
                }
            } catch (Exception e2) {
                System.err.println("Erreur lors de la suppression des médias: " + e2.getMessage());
            }

            try {
                commentService.deleteCommentsByComplaintId(id);
            } catch (Exception e3) {
                System.err.println("Erreur lors de la suppression des commentaires: " + e3.getMessage());
            }

            try {
                statusHistoryService.deleteByComplaintId(id);
            } catch (Exception e4) {
                System.err.println("Erreur lors de la suppression de l'historique: " + e4.getMessage());
            }

            complaintRepository.delete(complaint);
        }
    }

    public void deleteComplaintByGeneratedId(String complaintId) {
        Complaint complaint = getComplaintByGeneratedId(complaintId);
        complaintRepository.delete(complaint);
    }

    public List<Complaint> getNearbyComplaints(Double latitude, Double longitude, Integer radiusKm) {
        System.out.println("Finding complaints near: " + latitude + ", " + longitude + " within " + radiusKm + "km");

        List<Complaint> allComplaints = getAllComplaints();

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

    private void enrichMediaWithUrls(ComplaintResponse response, List<Media> mediaRefs) {
        if (mediaRefs != null && !mediaRefs.isEmpty()) {
            List<Map<String, Object>> enrichedMedia = new ArrayList<>();

            for (Media mediaRef : mediaRefs) {
                try {
                    String mediaId = mediaRef.getMediaId();
                    Media media = mediaService.getMediaById(mediaId);

                    Map<String, Object> mediaInfo = new HashMap<>();
                    mediaInfo.put("mediaId", media.getMediaId());
                    mediaInfo.put("mediaFile", media.getMediaFile());
                    mediaInfo.put("captureDate", media.getCaptureDate());
                    mediaInfo.put("url", baseUrl + "/api/media/filename/" + media.getMediaFile());

                    enrichedMedia.add(mediaInfo);

                    System.out.println("Media enrichi: " + media.getMediaFile());
                } catch (Exception e) {
                    System.err.println("Erreur lors de la récupération du média: " + e.getMessage());
                }
            }

            response.setMedia(enrichedMedia);
        }
    }

    public ComplaintResponse toComplaintResponse(Complaint complaint) {
        ComplaintResponse response = new ComplaintResponse();
        response.setComplaintId(complaint.getComplaintId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setStatus(complaint.getStatus());
        response.setCreationDate(complaint.getCreationDate());
        response.setLatitude(complaint.getLatitude());
        response.setLongitude(complaint.getLongitude());
        response.setPriorityLevel(complaint.getPriorityLevel());
        response.setIsVerified(complaint.getIsVerified());
        response.setClosureDate(complaint.getClosureDate());

        if (complaint.getCategory() != null) {
            response.setCategory(convertToMap(complaint.getCategory()));
        }
        if (complaint.getCitizen() != null) {
            response.setCitizen(convertToMap(complaint.getCitizen()));
        }
        if (complaint.getAssignedAgent() != null) {
            response.setAssignedTo(convertToMap(complaint.getAssignedAgent()));
        }
        if (complaint.getAssignedDepartment() != null) {
            response.setDepartment(complaint.getAssignedDepartment().getName());
        }

        try {
            enrichMediaWithUrls(response, complaint.getMedia());
        } catch (Exception e) {
            System.err.println("Erreur lors de l'enrichissement des médias: " + e.getMessage());
        }

        return response;
    }

    private Map<String, Object> convertToMap(Object obj) {
        Map<String, Object> map = new HashMap<>();

        if (obj instanceof Category) {
            Category category = (Category) obj;
            map.put("categoryId", category.getCategoryId());
            map.put("id", category.getCategoryId());
            map.put("name", category.getLabel());
            map.put("label", category.getLabel());
            map.put("description", category.getDescription());
        } else if (obj instanceof Citizen) {
            Citizen citizen = (Citizen) obj;
            map.put("citizenId", citizen.getUserId());
            map.put("id", citizen.getUserId());
            map.put("name", citizen.getName());
            map.put("email", citizen.getEmail());
            map.put("role", citizen.getRole());
        } else if (obj instanceof CommunityAgent) {
            CommunityAgent agent = (CommunityAgent) obj;
            map.put("agentId", agent.getUserId());
            map.put("id", agent.getUserId());
            map.put("name", agent.getName());
            map.put("email", agent.getEmail());
            map.put("role", "Agent");
            map.put("service", agent.getService());
        }

        return map;
    }
}