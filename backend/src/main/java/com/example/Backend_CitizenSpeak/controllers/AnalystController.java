package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analyst")
@CrossOrigin(origins = "*")
public class AnalystController {

    @Autowired
    private AnalystService analystService;
    private final ComplaintService complaintService;
    private final CategoryService categoryService;
    private final DepartmentService departmentService;
    private final UserService userService;

    public AnalystController(ComplaintService complaintService,
                             CategoryService categoryService,
                             DepartmentService departmentService,
                             UserService userService) {
        this.complaintService = complaintService;
        this.categoryService = categoryService;
        this.departmentService = departmentService;
        this.userService = userService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam(defaultValue = "2025") int year) {
        try {
            Map<String, Object> stats = analystService.getDashboardStatsByYear(year);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Erreur getDashboardStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/complaints/by-category")
    public ResponseEntity<List<Map<String, Object>>> getComplaintsByCategory(
            @RequestParam(defaultValue = "2025") int year) {
        try {
            List<Map<String, Object>> data = analystService.getComplaintsByCategoryByYear(year);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.err.println("Erreur getComplaintsByCategory: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trends/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrends(
            @RequestParam(defaultValue = "2025") int year) {
        try {
            List<Map<String, Object>> trends = analystService.getMonthlyTrends(year);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            System.err.println("Erreur getMonthlyTrends: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/geographical-distribution")
    public ResponseEntity<List<Map<String, Object>>> getGeographicalDistribution(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> complaints = complaintService.getAllComplaintsEntities();

            Map<String, List<Complaint>> complaintsByZone = groupComplaintsByZone(complaints);

            List<Map<String, Object>> geoDistribution = complaintsByZone.entrySet().stream()
                    .map(entry -> {
                        String zone = entry.getKey();
                        List<Complaint> zoneComplaints = entry.getValue();

                        double avgLat = zoneComplaints.stream()
                                .mapToDouble(Complaint::getLatitude)
                                .average()
                                .orElse(0.0);

                        double avgLng = zoneComplaints.stream()
                                .mapToDouble(Complaint::getLongitude)
                                .average()
                                .orElse(0.0);

                        String dominantCategory = findDominantCategory(zoneComplaints);

                        Map<String, Object> zoneData = new HashMap<>();
                        zoneData.put("zone", zone);
                        zoneData.put("count", zoneComplaints.size());
                        zoneData.put("latitude", avgLat);
                        zoneData.put("longitude", avgLng);
                        zoneData.put("dominantCategory", dominantCategory);

                        return zoneData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(geoDistribution);

        } catch (Exception e) {
            System.err.println("Error in getGeographicalDistribution: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving geographical distribution: " + e.getMessage()
            );
        }
    }
    @GetMapping("/analysis/resolution-time")
    public ResponseEntity<List<Map<String, Object>>> getResolutionTimeAnalysis(
            @RequestParam(defaultValue = "2025") int year) {
        try {
            List<Map<String, Object>> analysis = analystService.getResolutionTimeAnalysisByYear(year);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            System.err.println("Erreur getResolutionTimeAnalysis: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/analysis/priority")
    public ResponseEntity<Map<String, Object>> getPriorityAnalysis(
            @RequestParam(defaultValue = "2025") int year) {
        try {
            Map<String, Object> analysis = analystService.getPriorityAnalysisByYear(year);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            System.err.println("Erreur getPriorityAnalysis: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(
            @RequestParam(defaultValue = "2025") int year) {
        try {
            List<Map<String, Object>> recommendations = analystService.generateRecommendationsByYear(year);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            System.err.println("Erreur getRecommendations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/report/data")
    public ResponseEntity<Map<String, Object>> getReportData(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(defaultValue = "2025") int year) {
        try {
            Map<String, Object> reportData = analystService.getReportData(startDate, endDate, year);
            return ResponseEntity.ok(reportData);
        } catch (Exception e) {
            System.err.println("Erreur getReportData: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/report/generate")
    public ResponseEntity<byte[]> generateReport(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== GÉNÉRATION RAPPORT PDF ===");
            System.out.println("Requête reçue: " + request);

            Object yearObj = request.getOrDefault("year", 2025);
            int year = yearObj instanceof Integer ? (Integer) yearObj : Integer.parseInt(yearObj.toString());

            Object includeStatsObj = request.getOrDefault("includeStats", true);
            boolean includeStats = includeStatsObj instanceof Boolean ? (Boolean) includeStatsObj : Boolean.parseBoolean(includeStatsObj.toString());

            Object includeCategoriesObj = request.getOrDefault("includeCategories", true);
            boolean includeCategories = includeCategoriesObj instanceof Boolean ? (Boolean) includeCategoriesObj : Boolean.parseBoolean(includeCategoriesObj.toString());

            Object includeTrendsObj = request.getOrDefault("includeTrends", true);
            boolean includeTrends = includeTrendsObj instanceof Boolean ? (Boolean) includeTrendsObj : Boolean.parseBoolean(includeTrendsObj.toString());

            Object includeGeographicalObj = request.getOrDefault("includeGeographical", true);
            boolean includeGeographical = includeGeographicalObj instanceof Boolean ? (Boolean) includeGeographicalObj : Boolean.parseBoolean(includeGeographicalObj.toString());

            Object includeResolutionObj = request.getOrDefault("includeResolution", true);
            boolean includeResolution = includeResolutionObj instanceof Boolean ? (Boolean) includeResolutionObj : Boolean.parseBoolean(includeResolutionObj.toString());

            Object includePriorityObj = request.getOrDefault("includePriority", true);
            boolean includePriority = includePriorityObj instanceof Boolean ? (Boolean) includePriorityObj : Boolean.parseBoolean(includePriorityObj.toString());

            Object includeRecommendationsObj = request.getOrDefault("includeRecommendations", true);
            boolean includeRecommendations = includeRecommendationsObj instanceof Boolean ? (Boolean) includeRecommendationsObj : Boolean.parseBoolean(includeRecommendationsObj.toString());

            String format = request.getOrDefault("format", "pdf").toString();

            System.out.println("Paramètres extraits:");
            System.out.println("  - Année: " + year);
            System.out.println("  - Format: " + format);
            System.out.println("  - Sections incluses: stats=" + includeStats + ", categories=" + includeCategories +
                    ", trends=" + includeTrends + ", geo=" + includeGeographical +
                    ", resolution=" + includeResolution + ", priority=" + includePriority +
                    ", recommendations=" + includeRecommendations);

            byte[] reportData = analystService.generateReport(year, includeStats, includeCategories,
                    includeTrends, includeGeographical, includeResolution, includePriority, includeRecommendations);

            System.out.println("Rapport généré, taille: " + reportData.length + " bytes");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Rapport_Analyse_Plaintes_" + year + ".pdf");
            headers.setContentLength(reportData.length);

            System.out.println("Headers configurés, envoi de la réponse");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reportData);

        } catch (Exception e) {
            System.err.println("Erreur lors de la génération du rapport PDF:");
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .header("Content-Type", "application/json")
                    .body(("{\"error\":\"Erreur lors de la génération du rapport: " + e.getMessage() + "\"}").getBytes());
        }
    }

    @PostMapping("/report/generate-json")
    public ResponseEntity<byte[]> generateReportJson(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== GÉNÉRATION RAPPORT JSON DEBUG ===");

            Object yearObj = request.getOrDefault("year", 2025);
            int year = yearObj instanceof Integer ? (Integer) yearObj : Integer.parseInt(yearObj.toString());

            Object includeStatsObj = request.getOrDefault("includeStats", true);
            boolean includeStats = includeStatsObj instanceof Boolean ? (Boolean) includeStatsObj : Boolean.parseBoolean(includeStatsObj.toString());

            Object includeCategoriesObj = request.getOrDefault("includeCategories", true);
            boolean includeCategories = includeCategoriesObj instanceof Boolean ? (Boolean) includeCategoriesObj : Boolean.parseBoolean(includeCategoriesObj.toString());

            Object includeTrendsObj = request.getOrDefault("includeTrends", true);
            boolean includeTrends = includeTrendsObj instanceof Boolean ? (Boolean) includeTrendsObj : Boolean.parseBoolean(includeTrendsObj.toString());

            Object includeGeographicalObj = request.getOrDefault("includeGeographical", true);
            boolean includeGeographical = includeGeographicalObj instanceof Boolean ? (Boolean) includeGeographicalObj : Boolean.parseBoolean(includeGeographicalObj.toString());

            Object includeResolutionObj = request.getOrDefault("includeResolution", true);
            boolean includeResolution = includeResolutionObj instanceof Boolean ? (Boolean) includeResolutionObj : Boolean.parseBoolean(includeResolutionObj.toString());

            Object includePriorityObj = request.getOrDefault("includePriority", true);
            boolean includePriority = includePriorityObj instanceof Boolean ? (Boolean) includePriorityObj : Boolean.parseBoolean(includePriorityObj.toString());

            Object includeRecommendationsObj = request.getOrDefault("includeRecommendations", true);
            boolean includeRecommendations = includeRecommendationsObj instanceof Boolean ? (Boolean) includeRecommendationsObj : Boolean.parseBoolean(includeRecommendationsObj.toString());

            byte[] reportData = analystService.generateReportJson(year, includeStats, includeCategories,
                    includeTrends, includeGeographical, includeResolution, includePriority, includeRecommendations);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", "Rapport_Debug_" + year + ".json");
            headers.setContentLength(reportData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reportData);

        } catch (Exception e) {
            System.err.println("Erreur lors de la génération du rapport JSON:");
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats/period")
    public ResponseEntity<Map<String, Object>> getPeriodStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        try {
            Map<String, Object> stats = analystService.getReportData(startDate, endDate, 2025);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Erreur getPeriodStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date endDate,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> allComplaints = complaintService.getAllComplaintsEntities();

            List<Complaint> filteredComplaints;
            if (startDate != null && endDate != null) {
                filteredComplaints = allComplaints.stream()
                        .filter(c -> c.getCreationDate() != null &&
                                !c.getCreationDate().before(startDate) &&
                                !c.getCreationDate().after(endDate))
                        .collect(Collectors.toList());
            } else {
                filteredComplaints = allComplaints;
            }

            Map<String, Object> analytics = new HashMap<>();

            analytics.put("totalComplaints", filteredComplaints.size());
            analytics.put("resolvedComplaints", filteredComplaints.stream()
                    .mapToInt(c -> (c.getStatus().equals("Resolved") || c.getStatus().equals("Closed")) ? 1 : 0)
                    .sum());
            analytics.put("pendingComplaints", filteredComplaints.stream()
                    .mapToInt(c -> (!c.getStatus().equals("Resolved") && !c.getStatus().equals("Closed")) ? 1 : 0)
                    .sum());

            Map<String, Long> categoryStats = filteredComplaints.stream()
                    .collect(Collectors.groupingBy(
                            c -> c.getCategory() != null ? c.getCategory().getLabel() : "Non classé",
                            Collectors.counting()
                    ));

            List<Map<String, Object>> complaintsByCategory = categoryStats.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> categoryData = new HashMap<>();
                        categoryData.put("category", entry.getKey());
                        categoryData.put("count", entry.getValue());
                        categoryData.put("percentage", (entry.getValue() * 100.0) / filteredComplaints.size());
                        return categoryData;
                    })
                    .collect(Collectors.toList());

            analytics.put("complaintsByCategory", complaintsByCategory);

            Map<String, Long> statusStats = filteredComplaints.stream()
                    .collect(Collectors.groupingBy(Complaint::getStatus, Collectors.counting()));

            List<Map<String, Object>> complaintsByStatus = statusStats.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> statusData = new HashMap<>();
                        statusData.put("status", entry.getKey());
                        statusData.put("count", entry.getValue());
                        statusData.put("percentage", (entry.getValue() * 100.0) / filteredComplaints.size());
                        return statusData;
                    })
                    .collect(Collectors.toList());

            analytics.put("complaintsByStatus", complaintsByStatus);

            Map<String, Long> priorityStats = filteredComplaints.stream()
                    .collect(Collectors.groupingBy(
                            c -> convertPriorityLevelToString(c.getPriorityLevel()),
                            Collectors.counting()
                    ));

            List<Map<String, Object>> complaintsByPriority = priorityStats.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> priorityData = new HashMap<>();
                        priorityData.put("priority", entry.getKey());
                        priorityData.put("count", entry.getValue());
                        priorityData.put("percentage", (entry.getValue() * 100.0) / filteredComplaints.size());
                        return priorityData;
                    })
                    .collect(Collectors.toList());

            analytics.put("complaintsByPriority", complaintsByPriority);

            List<Map<String, Object>> monthlyTrends = generateMonthlyTrends(filteredComplaints);
            analytics.put("monthlyTrends", monthlyTrends);

            double averageResolutionTime = calculateAverageResolutionTime(filteredComplaints);
            analytics.put("averageResolutionTime", averageResolutionTime);

            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            System.err.println("Error in getAnalytics: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving analytics: " + e.getMessage()
            );
        }
    }

    @GetMapping("/urgent-complaints")
    public ResponseEntity<List<ComplaintResponse>> getUrgentComplaints(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> allComplaints = complaintService.getAllComplaintsEntities();

            List<Complaint> urgentComplaints = allComplaints.stream()
                    .filter(c -> c.getPriorityLevel() == 1)
                    .filter(c -> !c.getStatus().equals("Resolved") && !c.getStatus().equals("Closed"))
                    .sorted((c1, c2) -> c2.getCreationDate().compareTo(c1.getCreationDate()))
                    .collect(Collectors.toList());

            List<ComplaintResponse> responseList = urgentComplaints.stream()
                    .map(complaintService::toComplaintResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responseList);

        } catch (Exception e) {
            System.err.println("Error in getUrgentComplaints: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving urgent complaints: " + e.getMessage()
            );
        }
    }

    @GetMapping("/department-performance")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentPerformance(Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> allComplaints = complaintService.getAllComplaintsEntities();

            Map<String, List<Complaint>> complaintsByDepartment = allComplaints.stream()
                    .filter(c -> c.getAssignedDepartment() != null)
                    .collect(Collectors.groupingBy(c -> c.getAssignedDepartment().getName()));

            List<Map<String, Object>> departmentPerformance = complaintsByDepartment.entrySet().stream()
                    .map(entry -> {
                        String departmentName = entry.getKey();
                        List<Complaint> complaints = entry.getValue();

                        long totalComplaints = complaints.size();
                        long resolvedComplaints = complaints.stream()
                                .mapToLong(c -> (c.getStatus().equals("Resolved") || c.getStatus().equals("Closed")) ? 1 : 0)
                                .sum();

                        double resolutionRate = totalComplaints > 0 ? (resolvedComplaints * 100.0) / totalComplaints : 0;
                        double avgResolutionTime = calculateAverageResolutionTime(complaints);

                        Map<String, Object> performance = new HashMap<>();
                        performance.put("department", departmentName);
                        performance.put("totalComplaints", totalComplaints);
                        performance.put("resolvedComplaints", resolvedComplaints);
                        performance.put("resolutionRate", resolutionRate);
                        performance.put("averageResolutionTime", avgResolutionTime);

                        return performance;
                    })
                    .sorted((p1, p2) -> Double.compare((Double) p2.get("resolutionRate"), (Double) p1.get("resolutionRate")))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(departmentPerformance);

        } catch (Exception e) {
            System.err.println("Error in getDepartmentPerformance: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving department performance: " + e.getMessage()
            );
        }
    }

    @PostMapping("/generate-report")
    public ResponseEntity<Map<String, Object>> generateReport(
            @RequestBody Map<String, Object> reportParams,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Rapport généré avec succès");
            response.put("reportId", UUID.randomUUID().toString());
            response.put("downloadUrl", "/api/analyst/download-report/" + UUID.randomUUID().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in generateReport: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error generating report: " + e.getMessage()
            );
        }
    }

    private Map<String, List<Complaint>> groupComplaintsByZone(List<Complaint> complaints) {

        Map<String, List<Complaint>> zones = new HashMap<>();

        for (Complaint complaint : complaints) {
            if (complaint.getLatitude() != 0.0 && complaint.getLongitude() != 0.0) {
                String zone = determineZone(complaint.getLatitude(), complaint.getLongitude());
                zones.computeIfAbsent(zone, k -> new ArrayList<>()).add(complaint);
            }
        }

        return zones;
    }

    private String determineZone(double latitude, double longitude) {

        if (latitude > 33.970 && longitude > -6.850) {
            return "Centre-ville";
        } else if (latitude > 33.960 && longitude < -6.850) {
            return "Zone Ouest";
        } else if (latitude > 33.950) {
            return "Zone Nord";
        } else if (latitude > 33.940) {
            return "Zone Sud";
        } else {
            return "Périphérie";
        }
    }

    private String findDominantCategory(List<Complaint> complaints) {
        Map<String, Long> categoryCount = complaints.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategory() != null ? c.getCategory().getLabel() : "Non classé",
                        Collectors.counting()
                ));

        return categoryCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Non défini");
    }

    private String convertPriorityLevelToString(int priorityLevel) {
        switch (priorityLevel) {
            case 1:
                return "high";
            case 2:
                return "medium";
            case 3:
            default:
                return "low";
        }
    }

    private List<Map<String, Object>> generateMonthlyTrends(List<Complaint> complaints) {
        List<Map<String, Object>> trends = new ArrayList<>();
        Calendar cal = Calendar.getInstance();

        for (int i = 5; i >= 0; i--) {
            cal.add(Calendar.MONTH, -i);
            String monthName = getMonthName(cal.get(Calendar.MONTH));
            int month = cal.get(Calendar.MONTH);
            int year = cal.get(Calendar.YEAR);

            long monthComplaints = complaints.stream()
                    .filter(c -> {
                        Calendar complaintCal = Calendar.getInstance();
                        complaintCal.setTime(c.getCreationDate());
                        return complaintCal.get(Calendar.MONTH) == month &&
                                complaintCal.get(Calendar.YEAR) == year;
                    })
                    .count();

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("count", monthComplaints);
            trends.add(monthData);

            cal = Calendar.getInstance();
        }

        return trends;
    }

    private String getMonthName(int month) {
        String[] months = {"Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"};
        return months[month];
    }

    private double calculateAverageResolutionTime(List<Complaint> complaints) {
        List<Complaint> resolvedComplaints = complaints.stream()
                .filter(c -> (c.getStatus().equals("Resolved") || c.getStatus().equals("Closed")) &&
                        c.getClosureDate() != null)
                .collect(Collectors.toList());

        if (resolvedComplaints.isEmpty()) {
            return 0.0;
        }

        double totalDays = resolvedComplaints.stream()
                .mapToDouble(c -> {
                    long diffInMillis = c.getClosureDate().getTime() - c.getCreationDate().getTime();
                    return diffInMillis / (1000.0 * 60 * 60 * 24);
                })
                .sum();

        return totalDays / resolvedComplaints.size();
    }

    @GetMapping("/complaints/map")
    public ResponseEntity<List<Map<String, Object>>> getComplaintsForMap(
            @RequestParam(defaultValue = "2025") int year,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> allComplaints = complaintService.getAllComplaintsEntities();

            List<Complaint> filteredComplaints = allComplaints.stream()
                    .filter(c -> {
                        if (c.getCreationDate() == null) return false;
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(c.getCreationDate());
                        return cal.get(Calendar.YEAR) == year;
                    })
                    .filter(c -> c.getLatitude() != 0.0 && c.getLongitude() != 0.0)
                    .collect(Collectors.toList());

            List<Map<String, Object>> complaintData = filteredComplaints.stream()
                    .map(complaint -> {
                        Map<String, Object> data = new HashMap<>();
                        data.put("complaintId", complaint.getComplaintId());
                        data.put("title", complaint.getTitle());
                        data.put("description", complaint.getDescription());
                        data.put("latitude", complaint.getLatitude());
                        data.put("longitude", complaint.getLongitude());
                        data.put("status", complaint.getStatus());
                        data.put("priority", convertPriorityLevelToString(complaint.getPriorityLevel()));
                        data.put("priorityLevel", complaint.getPriorityLevel());
                        data.put("isVerified", complaint.getIsVerified());
                        data.put("creationDate", complaint.getCreationDate());

                        if (complaint.getCategory() != null) {
                            Map<String, Object> category = new HashMap<>();
                            category.put("id", complaint.getCategory().getCategoryId());
                            category.put("label", complaint.getCategory().getLabel());
                            data.put("category", category);
                        }

                        if (complaint.getCitizen() != null) {
                            Map<String, Object> citizen = new HashMap<>();
                            citizen.put("name", complaint.getCitizen().getName());
                            citizen.put("email", complaint.getCitizen().getEmail());
                            data.put("citizen", citizen);
                        }

                        if (complaint.getAssignedAgent() != null) {
                            Map<String, Object> assignedTo = new HashMap<>();
                            assignedTo.put("name", complaint.getAssignedAgent().getName());
                            assignedTo.put("service", complaint.getAssignedAgent().getService());
                            data.put("assignedTo", assignedTo);
                        }

                        if (complaint.getAssignedDepartment() != null) {
                            data.put("department", complaint.getAssignedDepartment().getName());
                        }

                        return data;
                    })
                    .collect(Collectors.toList());

            System.out.println("Returning " + complaintData.size() + " complaints for map (year: " + year + ")");
            return ResponseEntity.ok(complaintData);

        } catch (Exception e) {
            System.err.println("Error in getComplaintsForMap: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving complaints for map: " + e.getMessage()
            );
        }
    }

    @GetMapping("/complaints/geographical")
    public ResponseEntity<List<Map<String, Object>>> getGeographicalDistributionByYear(
            @RequestParam(defaultValue = "2025") int year,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User currentUser = userService.getUserByEmail(email);

            if (!"Analyst".equalsIgnoreCase(currentUser.getRole()) && !"Admin".equalsIgnoreCase(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<Complaint> allComplaints = complaintService.getAllComplaintsEntities();

            List<Complaint> filteredComplaints = allComplaints.stream()
                    .filter(c -> {
                        if (c.getCreationDate() == null) return false;
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(c.getCreationDate());
                        return cal.get(Calendar.YEAR) == year;
                    })
                    .collect(Collectors.toList());

            Map<String, List<Complaint>> complaintsByZone = groupComplaintsByZone(filteredComplaints);

            List<Map<String, Object>> geoDistribution = complaintsByZone.entrySet().stream()
                    .map(entry -> {
                        String zone = entry.getKey();
                        List<Complaint> zoneComplaints = entry.getValue();

                        double avgLat = zoneComplaints.stream()
                                .mapToDouble(Complaint::getLatitude)
                                .average()
                                .orElse(0.0);

                        double avgLng = zoneComplaints.stream()
                                .mapToDouble(Complaint::getLongitude)
                                .average()
                                .orElse(0.0);

                        String dominantCategory = findDominantCategory(zoneComplaints);

                        Map<String, Object> zoneData = new HashMap<>();
                        zoneData.put("zone", zone);
                        zoneData.put("count", zoneComplaints.size());
                        zoneData.put("latitude", avgLat);
                        zoneData.put("longitude", avgLng);
                        zoneData.put("dominantCategory", dominantCategory);

                        return zoneData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(geoDistribution);

        } catch (Exception e) {
            System.err.println("Error in getGeographicalDistributionByYear: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error retrieving geographical distribution: " + e.getMessage()
            );
        }
    }
}