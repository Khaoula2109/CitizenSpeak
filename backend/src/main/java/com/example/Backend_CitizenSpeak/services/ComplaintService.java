package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.dto.ComplaintRequest;
import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.models.Complaint;

import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import com.example.Backend_CitizenSpeak.repositories.StatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private StatusHistoryService statusHistoryService;
    @Autowired
    private MediaService mediaService;
    @Autowired
    private CommentService commentService;
    @Autowired
    private NotificationService notificationService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    public ComplaintService(ComplaintRepository complaintRepository,
                            StatusHistoryRepository statusHistoryRepository) {
        this.complaintRepository = complaintRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    public List<ComplaintResponse> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAll();
        return complaints.stream()
                .map(this::toComplaintResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(String id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        return toComplaintResponse(complaint);
    }

    public List<Complaint> getComplaintsByCitizen(Citizen citizen) {
        return complaintRepository.findByCitizen(citizen);
    }

    @Transactional
    public Complaint createComplaint(ComplaintRequest request, Citizen citizen, Category category) {
        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCreationDate(new Date());
        complaint.setStatus("New");
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setCitizen(citizen);
        complaint.setCategory(category);
        complaint.setIsVerified(0);
        complaint.setPriorityLevel(3);
        complaint.setClosureDate(null);

        Complaint savedComplaint = complaintRepository.save(complaint);

        StatusHistory initialStatus = new StatusHistory();
        initialStatus.setStatus("New");
        initialStatus.setStatusDate(new Date());
        initialStatus.setNotes("Plainte créée");
        initialStatus.setComplaint(savedComplaint);
        initialStatus.setUpdatedBy(citizen);
        statusHistoryRepository.save(initialStatus);

        notificationService.notifyAdminNewComplaint(savedComplaint);

        if (savedComplaint.getPriorityLevel() == 1) {
            notificationService.notifyAdminUrgentComplaint(savedComplaint);
        }

        return savedComplaint;
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

            notificationService.notifyAdminComplaintResolved(complaint, updatedBy);
        }

        Complaint updatedComplaint = complaintRepository.save(complaint);

        StatusHistory statusHistory = new StatusHistory();
        statusHistory.setStatus(status);
        statusHistory.setStatusDate(new Date());
        statusHistory.setNotes(notes);
        statusHistory.setComplaint(updatedComplaint);
        statusHistory.setUpdatedBy(updatedBy);
        statusHistoryRepository.save(statusHistory);

        if (complaint.getAssignedAgent() != null && !status.equals(previousStatus)) {
            notificationService.notifyAgentStatusUpdate(complaint.getAssignedAgent(), complaint, status);
        }

        return updatedComplaint;
    }

    @Transactional
    public void deleteComplaint(String id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (complaint.getMedia() != null && !complaint.getMedia().isEmpty()) {
            for (Media mediaRef : complaint.getMedia()) {
                String mediaId = mediaRef.getClass().toString();
                mediaService.deleteMedia(mediaId);
            }
        }
        commentService.deleteCommentsByComplaintId(id);
        statusHistoryService.deleteByComplaintId(id);
        complaintRepository.delete(complaint);
    }

    public List<Complaint> getNearbyComplaints(Double latitude, Double longitude, Integer radiusKm) {
        System.out.println("Finding complaints near: " + latitude + ", " + longitude + " within " + radiusKm + "km");

        List<Complaint> allComplaints = complaintRepository.findAll();

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

    public boolean requiresPrioritization(Complaint complaint) {
        return complaint.getIsVerified() == 0;
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

        notificationService.notifyAgentAssignment(agent, updatedComplaint, assignedBy);

        return updatedComplaint;
    }
    public List<Complaint> getComplaintsByAssignedAgent(CommunityAgent agent) {
        return complaintRepository.findByAssignedAgent(agent);
    }

    public List<Complaint> getComplaintsByAssignedAgentAndStatus(CommunityAgent agent, String status) {
        return complaintRepository.findByAssignedAgentAndStatus(agent, status);
    }

    public List<Complaint> getComplaintsByAssignedDepartment(Department department) {
        return complaintRepository.findByAssignedDepartment(department);
    }

    private void enrichMediaWithUrls(ComplaintResponse response, List<Media> mediaRefs) {
        if (mediaRefs != null && !mediaRefs.isEmpty()) {
            List<Map<String, Object>> enrichedMedia = new ArrayList<>();

            for (Media mediaRef : mediaRefs) {
                try {
                    String mediaId = mediaRef.getClass().toString();
                    Media media = mediaService.getMediaById(mediaId);

                    Map<String, Object> mediaInfo = new HashMap<>();
                    mediaInfo.put("mediaId", media.getMediaId());
                    mediaInfo.put("mediaFile", media.getMediaFile());
                    mediaInfo.put("captureDate", media.getCaptureDate());
                    mediaInfo.put("url", baseUrl + "/api/media/filename/" + media.getMediaFile());

                    enrichedMedia.add(mediaInfo);

                    System.out.println(" Media enrichi: " + media.getMediaFile());
                } catch (Exception e) {
                    System.err.println(" Erreur lors de la récupération du média: " + e.getMessage());
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
        enrichMediaWithUrls(response, complaint.getMedia());
        return response;
    }

    private Map<String, Object> convertToMap(Object obj) {
        Map<String, Object> map = new HashMap<>();

        if (obj instanceof Category) {
            Category category = (Category) obj;
            map.put("categoryId", category.getCategoryId());
            map.put("name", category.getLabel());
            map.put("description", category.getDescription());
        } else if (obj instanceof Citizen) {
            Citizen citizen = (Citizen) obj;
            map.put("citizenId", citizen.getUserId());
            map.put("name", citizen.getName());
            map.put("email", citizen.getEmail());
        } else if (obj instanceof CommunityAgent) {
            CommunityAgent agent = (CommunityAgent) obj;
            map.put("agentId", agent.getUserId());
            map.put("name", agent.getName());
            map.put("email", agent.getEmail());
            map.put("role", "Agent");
        }

        return map;
    }

    public Complaint getComplaintEntityById(String id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
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
}