package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.repositories.AgentRepository;
import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AgentRepository agentRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalComplaints = complaintRepository.count();
        long resolvedComplaints = complaintRepository.countByStatus("résolue");
        long pendingComplaints = complaintRepository.countByStatus("en attente");
        long activeAgents = agentRepository.count(); // ou avec un filtre si nécessaire

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", totalComplaints);
        stats.put("resolved", resolvedComplaints);
        stats.put("pending", pendingComplaints);
        stats.put("agents", activeAgents);

        return ResponseEntity.ok(stats);
    }
}
