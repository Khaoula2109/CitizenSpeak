package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalystService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private InterventionRepository interventionRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PDFService pdfService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AnalystRepository analystRepository;

    private Date getYearStartDate(int year) {
        return Date.from(LocalDate.of(year, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Date getYearEndDate(int year) {
        return Date.from(LocalDate.of(year, 12, 31).atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
    }

    private List<Complaint> getComplaintsByYear(int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        System.out.println("=== FILTRAGE PAR ANNÉE ===");
        System.out.println("Année: " + year);
        System.out.println("Date début: " + startDate);
        System.out.println("Date fin: " + endDate);

        Query query = new Query();
        query.addCriteria(Criteria.where("creationDate").gte(startDate).lte(endDate));

        List<Complaint> complaints = mongoTemplate.find(query, Complaint.class);
        System.out.println("Nombre de plaintes trouvées pour " + year + ": " + complaints.size());

        return complaints;
    }

    public Map<String, Object> getDashboardStatsByYear(int year) {
        Map<String, Object> stats = new HashMap<>();

        System.out.println("=== CALCUL STATISTIQUES POUR " + year + " ===");

        List<Complaint> yearComplaints = getComplaintsByYear(year);

        long newComplaints = yearComplaints.stream()
                .filter(c -> "New".equals(c.getStatus()))
                .count();

        long resolvedComplaints = yearComplaints.stream()
                .filter(c -> "Resolved".equals(c.getStatus()))
                .count();

        long inProgressComplaints = yearComplaints.stream()
                .filter(c -> "In Progress".equals(c.getStatus()))
                .count();

        stats.put("totalComplaints", yearComplaints.size());
        stats.put("newComplaints", (int) newComplaints);
        stats.put("resolvedComplaints", (int) resolvedComplaints);
        stats.put("inProgressComplaints", (int) inProgressComplaints);

        double resolutionRate = yearComplaints.isEmpty() ? 0 :
                (double) resolvedComplaints / yearComplaints.size() * 100;
        stats.put("resolutionRate", Math.round(resolutionRate * 100.0) / 100.0);

        System.out.println("Statistiques calculées: " + stats);
        return stats;
    }

    public List<Map<String, Object>> getComplaintsByCategoryByYear(int year) {
        System.out.println("=== CALCUL CATÉGORIES POUR " + year + " ===");

        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                Aggregation.lookup("categories", "category.$id", "_id", "categoryInfo"),
                Aggregation.unwind("categoryInfo", true),

                Aggregation.group("categoryInfo._id")
                        .first("categoryInfo.categoryId").as("categoryId")
                        .first("categoryInfo.label").as("label")
                        .first("categoryInfo.description").as("description")
                        .count().as("count"),
                Aggregation.project("categoryId", "label", "description", "count")
        );

        List<Map> results = mongoTemplate.aggregate(aggregation, "complaints", Map.class).getMappedResults();

        List<Map<String, Object>> categoryData = new ArrayList<>();
        for (Map result : results) {
            Map<String, Object> category = new HashMap<>();
            category.put("categoryId", result.get("categoryId"));
            category.put("label", result.get("label"));
            category.put("count", result.get("count"));
            category.put("description", result.get("description"));
            categoryData.add(category);
        }

        System.out.println("Catégories calculées pour " + year + ": " + categoryData.size() + " catégories");
        return categoryData;
    }

    public List<Map<String, Object>> getMonthlyTrends(int year) {
        System.out.println("=== CALCUL TENDANCES MENSUELLES POUR " + year + " ===");

        List<Map<String, Object>> trends = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);

            Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date end = Date.from(endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
            Query query = new Query();
            query.addCriteria(Criteria.where("creationDate").gte(start).lte(end));
            List<Complaint> monthlyComplaints = mongoTemplate.find(query, Complaint.class);

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month);
            monthData.put("monthName", startDate.getMonth().toString());
            monthData.put("year", year);
            monthData.put("totalComplaints", monthlyComplaints.size());

            Map<String, Integer> categoryCount = new HashMap<>();

            List<Category> allCategories = categoryRepository.findAll();
            for (Category category : allCategories) {
                long count = monthlyComplaints.stream()
                        .filter(c -> c.getCategory() != null &&
                                category.getCategoryId().equals(c.getCategory().getCategoryId()))
                        .count();
                categoryCount.put(category.getLabel(), (int) count);
            }

            monthData.put("categories", categoryCount);
            trends.add(monthData);
        }

        System.out.println("Tendances calculées pour " + year + ": 12 mois");
        return trends;
    }

    public List<Map<String, Object>> getGeographicalDistributionByYear(int year) {
        System.out.println("=== CALCUL DISTRIBUTION GÉOGRAPHIQUE POUR " + year + " ===");

        List<Complaint> yearComplaints = getComplaintsByYear(year);
        List<Map<String, Object>> locations = new ArrayList<>();

        Map<String, List<Complaint>> zoneGroups = yearComplaints.stream()
                .filter(c -> c.getLatitude() != 0.0 && c.getLongitude() != 0.0)
                .collect(Collectors.groupingBy(this::getZoneFromCoordinates));

        for (Map.Entry<String, List<Complaint>> entry : zoneGroups.entrySet()) {
            List<Complaint> zoneComplaints = entry.getValue();
            if (!zoneComplaints.isEmpty()) {
                Map<String, Object> location = new HashMap<>();
                location.put("zone", entry.getKey());
                location.put("count", zoneComplaints.size());
                location.put("latitude", zoneComplaints.get(0).getLatitude());
                location.put("longitude", zoneComplaints.get(0).getLongitude());

                Map<String, Long> categoryCount = zoneComplaints.stream()
                        .filter(c -> c.getCategory() != null)
                        .collect(Collectors.groupingBy(
                                c -> c.getCategory().getLabel(),
                                Collectors.counting()
                        ));

                String dominantCategory = categoryCount.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse("Autre");

                location.put("dominantCategory", dominantCategory);
                locations.add(location);
            }
        }

        System.out.println("Distribution géographique pour " + year + ": " + locations.size() + " zones");
        return locations;
    }

    public List<Map<String, Object>> getResolutionTimeAnalysisByYear(int year) {
        System.out.println("=== CALCUL TEMPS DE RÉSOLUTION POUR " + year + " ===");

        List<Complaint> yearComplaints = getComplaintsByYear(year);
        List<Complaint> resolvedComplaints = yearComplaints.stream()
                .filter(c -> "Resolved".equals(c.getStatus()) && c.getClosureDate() != null)
                .collect(Collectors.toList());

        List<Map<String, Object>> analysis = new ArrayList<>();

        Map<String, List<Complaint>> categoryGroups = resolvedComplaints.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(c -> c.getCategory().getLabel()));

        for (Map.Entry<String, List<Complaint>> entry : categoryGroups.entrySet()) {
            List<Complaint> complaints = entry.getValue();
            List<Long> resolutionTimes = complaints.stream()
                    .map(c -> (c.getClosureDate().getTime() - c.getCreationDate().getTime()) / (1000 * 60 * 60 * 24))
                    .collect(Collectors.toList());

            if (!resolutionTimes.isEmpty()) {
                Map<String, Object> categoryAnalysis = new HashMap<>();
                categoryAnalysis.put("category", entry.getKey());
                categoryAnalysis.put("averageResolutionTime",
                        resolutionTimes.stream().mapToLong(Long::longValue).average().orElse(0.0));
                categoryAnalysis.put("minResolutionTime", Collections.min(resolutionTimes));
                categoryAnalysis.put("maxResolutionTime", Collections.max(resolutionTimes));
                categoryAnalysis.put("totalResolved", resolutionTimes.size());

                analysis.add(categoryAnalysis);
            }
        }

        System.out.println("Analyse résolution pour " + year + ": " + analysis.size() + " catégories");
        return analysis;
    }

    public Map<String, Object> getPriorityAnalysisByYear(int year) {
        System.out.println("=== CALCUL PRIORITÉS POUR " + year + " ===");

        List<Complaint> yearComplaints = getComplaintsByYear(year);
        Map<String, Object> priorityData = new HashMap<>();

        Map<String, Long> priorityCount = yearComplaints.stream()
                .collect(Collectors.groupingBy(
                        this::getPriorityString,
                        Collectors.counting()
                ));

        priorityData.put("high", priorityCount.getOrDefault("HIGH", 0L));
        priorityData.put("medium", priorityCount.getOrDefault("MEDIUM", 0L));
        priorityData.put("low", priorityCount.getOrDefault("LOW", 0L));

        Map<String, Map<String, Long>> categoryPriority = yearComplaints.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getCategory().getLabel(),
                        Collectors.groupingBy(
                                this::getPriorityString,
                                Collectors.counting()
                        )
                ));

        priorityData.put("categoryBreakdown", categoryPriority);

        System.out.println("Priorités calculées pour " + year + ": " + priorityData);
        return priorityData;
    }

    public List<Map<String, Object>> generateRecommendationsByYear(int year) {
        System.out.println("=== GÉNÉRATION RECOMMANDATIONS POUR " + year + " ===");

        List<Map<String, Object>> recommendations = new ArrayList<>();

        List<Map<String, Object>> categoryStats = getComplaintsByCategoryByYear(year);
        categoryStats.sort((a, b) ->
                Integer.compare((Integer) b.get("count"), (Integer) a.get("count")));

        if (!categoryStats.isEmpty()) {
            Map<String, Object> topCategory = categoryStats.get(0);
            if ((Integer) topCategory.get("count") > 0) {
                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("type", "PRIORITY_FOCUS");
                recommendation.put("title", "Prioriser la catégorie " + topCategory.get("label"));
                recommendation.put("description",
                        "Cette catégorie représente " + topCategory.get("count") +
                                " plaintes en " + year + ", soit la majorité des signalements. Recommandation d'allocation de ressources supplémentaires.");
                recommendation.put("priority", "HIGH");
                recommendations.add(recommendation);
            }
        }

        List<Map<String, Object>> resolutionAnalysis = getResolutionTimeAnalysisByYear(year);
        for (Map<String, Object> analysis : resolutionAnalysis) {
            double avgTime = (Double) analysis.get("averageResolutionTime");
            if (avgTime > 7) {
                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("type", "RESOLUTION_TIME");
                recommendation.put("title", "Améliorer les délais pour " + analysis.get("category"));
                recommendation.put("description",
                        "Le temps de résolution moyen est de " + Math.round(avgTime) +
                                " jours en " + year + ". Recommandation d'optimisation des processus.");
                recommendation.put("priority", "MEDIUM");
                recommendations.add(recommendation);
            }
        }

        System.out.println("Recommandations générées pour " + year + ": " + recommendations.size());
        return recommendations;
    }

    private String getZoneFromCoordinates(Complaint complaint) {
        double lat = complaint.getLatitude();
        double lng = complaint.getLongitude();

        if (lat > 33.6 && lng < -7.5) return "Zone Nord";
        if (lat > 33.5 && lng > -7.5) return "Zone Est";
        if (lat < 33.5 && lng > -7.5) return "Zone Sud";
        return "Zone Ouest";
    }

    private String getPriorityString(Complaint complaint) {
        int priority = complaint.getPriorityLevel();
        if (priority == 1) return "HIGH";
        if (priority == 2) return "MEDIUM";
        return "LOW";
    }

    public Map<String, Object> getReportData(Date startDate, Date endDate, int year) {
        List<Complaint> complaints;

        if (startDate != null && endDate != null) {
            Query query = new Query();
            query.addCriteria(Criteria.where("creationDate").gte(startDate).lte(endDate));
            complaints = mongoTemplate.find(query, Complaint.class);
        } else {
            complaints = getComplaintsByYear(year);
        }

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("period", Map.of(
                "startDate", startDate != null ? startDate : getYearStartDate(year),
                "endDate", endDate != null ? endDate : getYearEndDate(year),
                "year", year,
                "totalComplaints", complaints.size()
        ));

        reportData.put("statistics", getDashboardStatsByYear(year));
        reportData.put("categoryDistribution", getComplaintsByCategoryByYear(year));
        reportData.put("geographicalData", getGeographicalDistributionByYear(year));
        reportData.put("resolutionAnalysis", getResolutionTimeAnalysisByYear(year));
        reportData.put("priorityAnalysis", getPriorityAnalysisByYear(year));
        reportData.put("monthlyTrends", getMonthlyTrends(year));

        return reportData;
    }


    public byte[] generateReport(int year, boolean includeStats, boolean includeCategories,
                                 boolean includeTrends, boolean includeGeographical,
                                 boolean includeResolution, boolean includePriority,
                                 boolean includeRecommendations) {
        try {
            System.out.println("=== GÉNÉRATION RAPPORT PDF POUR " + year + " ===");

            Map<String, Object> reportData = new HashMap<>();
            reportData.put("title", "Rapport d'Analyse des Plaintes - " + year);
            reportData.put("generationDate", new Date());
            reportData.put("year", year);

            if (includeStats) {
                reportData.put("statistics", getDashboardStatsByYear(year));
            }
            if (includeCategories) {
                reportData.put("categoryDistribution", getComplaintsByCategoryByYear(year));
            }
            if (includeTrends) {
                reportData.put("monthlyTrends", getMonthlyTrends(year));
            }
            if (includeGeographical) {
                reportData.put("geographicalData", getGeographicalDistributionByYear(year));
            }
            if (includeResolution) {
                reportData.put("resolutionAnalysis", getResolutionTimeAnalysisByYear(year));
            }
            if (includePriority) {
                reportData.put("priorityAnalysis", getPriorityAnalysisByYear(year));
            }
            if (includeRecommendations) {
                reportData.put("recommendations", generateRecommendationsByYear(year));
            }

            byte[] reportBytes = pdfService.generateAnalysisReport(reportData);

            List<Analyst> analysts = analystRepository.findAll();
            for (Analyst analyst : analysts) {
                notificationService.notifyAnalystReportGenerated(analyst, "Rapport " + year);
            }

            return reportBytes;

        } catch (Exception e) {
            System.err.println("Erreur génération rapport PDF: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la génération du rapport PDF", e);
        }
    }

    public byte[] generateReportJson(int year, boolean includeStats, boolean includeCategories,
                                     boolean includeTrends, boolean includeGeographical,
                                     boolean includeResolution, boolean includePriority,
                                     boolean includeRecommendations) {
        try {
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("title", "Rapport d'Analyse des Plaintes - " + year);
            reportData.put("generationDate", new Date());
            reportData.put("year", year);

            if (includeStats) {
                reportData.put("statistics", getDashboardStatsByYear(year));
            }
            if (includeCategories) {
                reportData.put("categoryDistribution", getComplaintsByCategoryByYear(year));
            }
            if (includeTrends) {
                reportData.put("monthlyTrends", getMonthlyTrends(year));
            }
            if (includeGeographical) {
                reportData.put("geographicalData", getGeographicalDistributionByYear(year));
            }
            if (includeResolution) {
                reportData.put("resolutionAnalysis", getResolutionTimeAnalysisByYear(year));
            }
            if (includePriority) {
                reportData.put("priorityAnalysis", getPriorityAnalysisByYear(year));
            }
            if (includeRecommendations) {
                reportData.put("recommendations", generateRecommendationsByYear(year));
            }

            return objectMapper.writeValueAsBytes(reportData);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du rapport JSON", e);
        }
    }

    public Map<String, Object> getDashboardStats() {
        return getDashboardStatsByYear(2025);
    }

    public List<Map<String, Object>> getComplaintsByCategory() {
        return getComplaintsByCategoryByYear(2025);
    }

    public List<Map<String, Object>> getGeographicalDistribution() {
        return getGeographicalDistributionByYear(2025);
    }

    public List<Map<String, Object>> getResolutionTimeAnalysis() {
        return getResolutionTimeAnalysisByYear(2025);
    }

    public Map<String, Object> getPriorityAnalysis() {
        return getPriorityAnalysisByYear(2025);
    }

    public List<Map<String, Object>> generateRecommendations() {
        return generateRecommendationsByYear(2025);
    }

    public void analyzeAndGenerateAlerts(int year) {
        try {
            Map<String, Object> stats = getDashboardStatsByYear(year);
            List<Analyst> analysts = analystRepository.findAll();

            Object resolutionRateObj = stats.get("resolutionRate");
            if (resolutionRateObj instanceof Double) {
                double resolutionRate = (Double) resolutionRateObj;
                if (resolutionRate < 60.0) {
                    for (Analyst analyst : analysts) {
                        notificationService.notifyAnalystThresholdAlert(
                                analyst,
                                "Taux de résolution",
                                String.format("%.1f%% (< 60%%)", resolutionRate)
                        );
                    }
                }
            }

            Object totalComplaintsObj = stats.get("totalComplaints");
            if (totalComplaintsObj instanceof Integer) {
                int totalComplaints = (Integer) totalComplaintsObj;
                if (totalComplaints > 1000) {
                    for (Analyst analyst : analysts) {
                        notificationService.notifyAnalystThresholdAlert(
                                analyst,
                                "Nombre total de plaintes",
                                String.format("%d plaintes (> 1000)", totalComplaints)
                        );
                    }
                }
            }

            List<Map<String, Object>> trends = getMonthlyTrends(year);
            analyzeTrends(trends, analysts);

        } catch (Exception e) {
            System.err.println("Erreur lors de l'analyse des seuils: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void analyzeTrends(List<Map<String, Object>> trends, List<Analyst> analysts) {
        if (trends.size() >= 2) {
            Map<String, Object> currentMonth = trends.get(trends.size() - 1);
            Map<String, Object> previousMonth = trends.get(trends.size() - 2);

            int currentCount = (Integer) currentMonth.getOrDefault("totalComplaints", 0);
            int previousCount = (Integer) previousMonth.getOrDefault("totalComplaints", 0);

            if (previousCount > 0) {
                double growthRate = ((double) (currentCount - previousCount) / previousCount) * 100;

                if (growthRate > 20) {
                    String trendDescription = String.format(
                            "Augmentation de %.1f%% des plaintes ce mois (%d vs %d)",
                            growthRate, currentCount, previousCount
                    );

                    for (Analyst analyst : analysts) {
                        notificationService.notifyAnalystTrendAlert(analyst, trendDescription);
                    }
                }
            }
        }
    }

    public void performPeriodicAnalysis() {
        int currentYear = java.time.Year.now().getValue();

        List<Analyst> analysts = analystRepository.findAll();
        for (Analyst analyst : analysts) {
            notificationService.notifyAnalystNewData(analyst);
        }

        analyzeAndGenerateAlerts(currentYear);
    }
}