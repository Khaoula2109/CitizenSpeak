package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.services.PriorityClassificationService;
import com.example.Backend_CitizenSpeak.services.ComplaintService;
import com.example.Backend_CitizenSpeak.models.TrainingData;
import com.example.Backend_CitizenSpeak.repositories.TrainingDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIManagementController {

    @Autowired
    private PriorityClassificationService priorityClassificationService;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private TrainingDataRepository trainingDataRepository;

    @GetMapping("/model/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Map<String, Object>> getModelStatistics() {
        Map<String, Object> stats = priorityClassificationService.getModelStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/predict")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Map<String, Object>> testPrediction(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String description = request.get("description");
        String category = request.get("category");

        if (title == null || description == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title and description are required"));
        }

        int predictedPriority = priorityClassificationService.predictPriority(title, description, category);

        String priorityText = switch (predictedPriority) {
            case 1 -> "Haute priorité";
            case 2 -> "Moyenne priorité";
            case 3 -> "Faible priorité";
            default -> "Non définie";
        };

        Map<String, Object> response = new HashMap<>();
        response.put("predictedPriority", predictedPriority);
        response.put("priorityText", priorityText);
        response.put("confidence", "Estimation basée sur ML");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/training/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> addTrainingData(@RequestBody Map<String, Object> request) {
        try {
            String text = (String) request.get("text");
            String category = (String) request.get("category");
            Integer priority = (Integer) request.get("priority");

            if (text == null || priority == null || priority < 1 || priority > 3) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid input data"));
            }

            priorityClassificationService.addTrainingExample(text, category, priority);

            return ResponseEntity.ok(Map.of("message", "Training data added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error adding training data: " + e.getMessage()));
        }
    }

    @PostMapping("/model/retrain")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> retrainModel() {
        try {
            priorityClassificationService.trainModel();
            return ResponseEntity.ok(Map.of("message", "Model retrained successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error retraining model: " + e.getMessage()));
        }
    }

    @GetMapping("/training/data")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<List<TrainingData>> getTrainingData() {
        List<TrainingData> trainingData = trainingDataRepository.findAll();
        return ResponseEntity.ok(trainingData);
    }

    @PostMapping("/complaints/{id}/priority/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Map<String, String>> updateComplaintPriority(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {

        try {
            Integer newPriority = (Integer) request.get("priority");
            String reason = (String) request.getOrDefault("reason", "Manual correction");

            if (newPriority == null || newPriority < 1 || newPriority > 3) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid priority level"));
            }

            complaintService.updateComplaintPriorityWithFeedback(id, newPriority, reason);

            return ResponseEntity.ok(Map.of("message", "Priority updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating priority: " + e.getMessage()));
        }
    }

    @GetMapping("/complaints/priority/{priority}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT') or hasRole('ANALYST')")
    public ResponseEntity<List<Map<String, Object>>> getComplaintsByPriority(@PathVariable int priority) {
        if (priority < 1 || priority > 3) {
            return ResponseEntity.badRequest().build();
        }

        var complaints = complaintService.getComplaintsByPriority(priority);

        List<Map<String, Object>> response = complaints.stream()
                .map(complaint -> {
                    Map<String, Object> complaintMap = new HashMap<>();
                    complaintMap.put("id", complaint.getComplaintId());
                    complaintMap.put("title", complaint.getTitle());
                    complaintMap.put("description", complaint.getDescription());
                    complaintMap.put("status", complaint.getStatus());
                    complaintMap.put("priority", complaint.getPriorityLevel());
                    complaintMap.put("creationDate", complaint.getCreationDate());
                    if (complaint.getCategory() != null) {
                        complaintMap.put("category", complaint.getCategory().getLabel());
                    }
                    return complaintMap;
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAIDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("modelStats", priorityClassificationService.getModelStatistics());

        var recentComplaints = complaintService.getRecentComplaints();
        Map<Integer, Long> priorityDistribution = recentComplaints.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        complaint -> complaint.getPriorityLevel(),
                        java.util.stream.Collectors.counting()
                ));
        dashboard.put("recentPriorityDistribution", priorityDistribution);

        dashboard.put("totalRecentComplaints", recentComplaints.size());

        return ResponseEntity.ok(dashboard);
    }
}