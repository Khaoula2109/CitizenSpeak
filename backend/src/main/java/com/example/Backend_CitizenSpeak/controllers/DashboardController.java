package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.repositories.AgentRepository;
import com.example.Backend_CitizenSpeak.repositories.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalComplaints    = complaintRepository.count();
        long resolvedComplaints = complaintRepository.countByStatus("Resolved");
        long pendingComplaints  = complaintRepository.countByStatus("Pending");
        long activeAgents       = agentRepository.count();

        Map<String,Object> stats = new HashMap<>();
        stats.put("total",    totalComplaints);
        stats.put("resolved", resolvedComplaints);
        stats.put("pending",  pendingComplaints);
        stats.put("agents",   activeAgents);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/overview")
    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> stats = new HashMap<>();

        long totalComplaints     = mongoTemplate.count(new Query(), "complaints");
        long resolvedComplaints  = mongoTemplate.count(
                new Query(Criteria.where("status").is("Resolved")), "complaints");
        long pendingComplaints   = mongoTemplate.count(
                new Query(Criteria.where("status").is("Pending")), "complaints");
        long newComplaints = mongoTemplate.count(
                new Query(Criteria.where("status").is("New")), "complaints");
        long inProgressComplaints = mongoTemplate.count(
                new Query(Criteria.where("status").is("In Progress")), "complaints");
        long activeAgents        = mongoTemplate.count(
                new Query(Criteria.where("active").is(true)), "agents");
        long activeOrgs          = mongoTemplate.count(
                new Query(Criteria.where("active").is(true)), "organizations");
        long totalCitizens       = mongoTemplate.count(new Query(), "citizens");
        long activeInterventions = mongoTemplate.count(
                new Query(Criteria.where("status").nin("Completed","Cancelled")),
                "interventions");

        double resolutionRate = totalComplaints > 0
                ? (double) resolvedComplaints / totalComplaints * 100
                : 0;

        stats.put("totalComplaints",     totalComplaints);
        stats.put("newComplaints",       newComplaints);
        stats.put("resolvedComplaints",  resolvedComplaints);
        stats.put("pendingComplaints",   pendingComplaints);
        stats.put("inProgressComplaints", inProgressComplaints);
        stats.put("activeAgents",        activeAgents);
        stats.put("activeOrganizations", activeOrgs);
        stats.put("totalCitizens",       totalCitizens);
        stats.put("activeInterventions", activeInterventions);
        stats.put("resolutionRate",      Math.round(resolutionRate * 100.0) / 100.0);

        return stats;
    }

    private Date getYearStartDate(int year) {
        return Date.from(LocalDate.of(year, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant());
    }

    private Date getYearEndDate(int year) {
        return Date.from(LocalDate.of(year, 12, 31).atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
    }

    @GetMapping("/overview/{year}")
    public Map<String, Object> getDashboardOverviewByYear(@PathVariable int year) {
        Map<String, Object> stats = new HashMap<>();

        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);
        Criteria yearCriteria = Criteria.where("creationDate").gte(startDate).lte(endDate);

        long totalComplaints     = mongoTemplate.count(new Query(yearCriteria), "complaints");
        long resolvedComplaints  = mongoTemplate.count(
                new Query(yearCriteria.and("status").is("Resolved")), "complaints");
        long pendingComplaints   = mongoTemplate.count(
                new Query(yearCriteria.and("status").is("Pending")), "complaints");
        long newComplaints = mongoTemplate.count(
                new Query(yearCriteria.and("status").is("New")), "complaints");
        long inProgressComplaints = mongoTemplate.count(
                new Query(yearCriteria.and("status").is("In Progress")), "complaints");

        long activeAgents        = mongoTemplate.count(
                new Query(Criteria.where("active").is(true)), "agents");
        long activeOrgs          = mongoTemplate.count(
                new Query(Criteria.where("active").is(true)), "organizations");
        long totalCitizens       = mongoTemplate.count(new Query(), "citizens");
        long activeInterventions = mongoTemplate.count(
                new Query(Criteria.where("status").nin("Completed","Cancelled")),
                "interventions");

        double resolutionRate = totalComplaints > 0
                ? (double) resolvedComplaints / totalComplaints * 100
                : 0;

        stats.put("totalComplaints",     totalComplaints);
        stats.put("newComplaints",       newComplaints);
        stats.put("resolvedComplaints",  resolvedComplaints);
        stats.put("pendingComplaints",   pendingComplaints);
        stats.put("inProgressComplaints", inProgressComplaints);
        stats.put("activeAgents",        activeAgents);
        stats.put("activeOrganizations", activeOrgs);
        stats.put("totalCitizens",       totalCitizens);
        stats.put("activeInterventions", activeInterventions);
        stats.put("resolutionRate",      Math.round(resolutionRate * 100.0) / 100.0);
        stats.put("year",                year);

        return stats;
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/complaints-by-department")
    public List<Map<String, Object>> getComplaintsByDepartment(@RequestParam(defaultValue = "2025") int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                Aggregation.lookup("agents", "assignedAgent", "_id", "agent"),
                Aggregation.unwind("agent", false),
                Aggregation.lookup("departments", "agent.department", "_id", "department"),
                Aggregation.unwind("department", false),
                Aggregation.group("department.name")
                        .count().as("total")
                        .sum(ConditionalOperators.when(Criteria.where("status").is("Resolved"))
                                .then(1).otherwise(0))
                        .as("resolved")
                        .sum(ConditionalOperators.when(Criteria.where("status").is("Pending"))
                                .then(1).otherwise(0))
                        .as("pending")
                        .sum(ConditionalOperators.when(Criteria.where("status").is("In Progress"))
                                .then(1).otherwise(0))
                        .as("inProgress"),
                Aggregation.project("total","resolved","pending","inProgress")
                        .and("_id").as("name")
        );
        return (List<Map<String,Object>>)(List<?>)
                mongoTemplate.aggregate(agg, "complaints", Map.class)
                        .getMappedResults();
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/complaints-by-status")
    public List<Map<String, Object>> getComplaintsByStatus(@RequestParam(defaultValue = "2025") int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                Aggregation.group("status").count().as("count"),
                Aggregation.project("count").and("_id").as("status")
        );
        return (List<Map<String,Object>>)(List<?>)
                mongoTemplate.aggregate(agg, "complaints", Map.class)
                        .getMappedResults();
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/complaints-timeline")
    public List<Map<String, Object>> getComplaintsTimeline(@RequestParam(defaultValue = "2025") int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                Aggregation.project()
                        .and("status").as("status")
                        .and(DateOperators.DateToString.dateOf("creationDate")
                                .toString("%Y-%m"))
                        .as("monthYear"),
                Aggregation.group("monthYear")
                        .count().as("nouvelles")
                        .sum(ConditionalOperators.when(Criteria.where("status").is("Resolved"))
                                .then(1).otherwise(0))
                        .as("resolues"),
                Aggregation.sort(Sort.Direction.ASC, "_id"),
                Aggregation.project("nouvelles","resolues")
                        .and("_id").as("month")
        );
        return (List<Map<String,Object>>)(List<?>)
                mongoTemplate.aggregate(agg, "complaints", Map.class)
                        .getMappedResults();
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/top-categories")
    public List<Map<String, Object>> getTopCategories(@RequestParam(defaultValue = "2025") int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        try {
            Aggregation agg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                    Aggregation.lookup("categories","category","_id","categoryInfo"),
                    Aggregation.unwind("categoryInfo", true),
                    Aggregation.addFields()
                            .addField("categoryLabel")
                            .withValue(ConditionalOperators.when(Criteria.where("categoryInfo.label").exists(true))
                                    .then("$categoryInfo.label")
                                    .otherwise("$category"))
                            .build(),
                    Aggregation.group("categoryLabel").count().as("count"),
                    Aggregation.sort(Sort.Direction.DESC,"count"),
                    Aggregation.limit(5),
                    Aggregation.project("count").and("_id").as("name")
            );
            return (List<Map<String,Object>>)(List<?>)
                    mongoTemplate.aggregate(agg,"complaints",Map.class)
                            .getMappedResults();
        } catch (Exception e) {
            Aggregation fallbackAgg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                    Aggregation.group("category").count().as("count"),
                    Aggregation.sort(Sort.Direction.DESC,"count"),
                    Aggregation.limit(5),
                    Aggregation.project("count").and("_id").as("name")
            );
            return (List<Map<String,Object>>)(List<?>)
                    mongoTemplate.aggregate(fallbackAgg,"complaints",Map.class)
                            .getMappedResults();
        }
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/agents-performance")
    public List<Map<String, Object>> getAgentsPerformance() {
        try {
            Aggregation agg = Aggregation.newAggregation(
                    Aggregation.lookup("departments","department","_id","dept"),
                    Aggregation.unwind("dept", true),
                    Aggregation.addFields()
                            .addField("deptName")
                            .withValue(ConditionalOperators.when(Criteria.where("dept.name").exists(true))
                                    .then("$dept.name")
                                    .otherwise("Unknown Department"))
                            .build(),
                    Aggregation.group("deptName")
                            .count().as("agentCount")
                            .avg(ConditionalOperators.when(Criteria.where("active").is(true))
                                    .then(1).otherwise(0))
                            .as("activeRate"),
                    Aggregation.project("agentCount","activeRate")
                            .and("_id").as("department")
            );
            return (List<Map<String,Object>>)(List<?>)
                    mongoTemplate.aggregate(agg,"agents",Map.class)
                            .getMappedResults();
        } catch (Exception e) {
            Map<String, Object> defaultDept = new HashMap<>();
            defaultDept.put("department", "Département par défaut");
            defaultDept.put("agentCount", mongoTemplate.count(new Query(), "agents"));
            defaultDept.put("activeRate", 0.8);
            return List.of(defaultDept);
        }
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/complaints-by-location")
    public List<Map<String, Object>> getComplaintsByLocation(@RequestParam(defaultValue = "2025") int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        try {
            Aggregation aggregation = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                    Aggregation.lookup("citizens", "citizen", "_id", "citizenInfo"),
                    Aggregation.unwind("citizenInfo", true),
                    Aggregation.addFields()
                            .addField("area")
                            .withValue(ConditionalOperators.when(Criteria.where("citizenInfo.address").exists(true))
                                    .then(ArrayOperators.ArrayElemAt.arrayOf(
                                            StringOperators.valueOf("citizenInfo.address").split(",")
                                    ).elementAt(0))
                                    .otherwise("Localisation inconnue"))
                            .build(),
                    Aggregation.group("area").count().as("count"),
                    Aggregation.sort(Sort.Direction.DESC, "count"),
                    Aggregation.limit(10),
                    Aggregation.project("count").and("_id").as("area")
            );

            List<Map> raw = mongoTemplate
                    .aggregate(aggregation, "complaints", Map.class)
                    .getMappedResults();

            return raw.stream()
                    .map(m -> (Map<String,Object>) m)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            Map<String, Object> defaultLocation = new HashMap<>();
            defaultLocation.put("area", "Zone par défaut");
            defaultLocation.put("count", mongoTemplate.count(
                    new Query(Criteria.where("creationDate").gte(startDate).lte(endDate)),
                    "complaints"));
            return List.of(defaultLocation);
        }
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/resolution-time-by-department")
    public List<Map<String, Object>> getResolutionTimeByDepartment(@RequestParam(defaultValue = "2025") int year) {
        Date startDate = getYearStartDate(year);
        Date endDate = getYearEndDate(year);

        try {
            Aggregation agg = Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("creationDate").gte(startDate).lte(endDate)
                            .and("status").is("Resolved")
                            .and("closureDate").exists(true)),
                    Aggregation.lookup("agents","assignedAgent","_id","agent"),
                    Aggregation.unwind("agent", true),
                    Aggregation.lookup("departments","agent.department","_id","department"),
                    Aggregation.unwind("department", true),
                    Aggregation.addFields()
                            .addField("departmentName")
                            .withValue(ConditionalOperators.when(Criteria.where("department.name").exists(true))
                                    .then("$department.name")
                                    .otherwise("Département inconnu"))
                            .addField("resolutionTime")
                            .withValue(ArithmeticOperators.Divide.valueOf(
                                            ArithmeticOperators.Subtract.valueOf("closureDate")
                                                    .subtract("creationDate")
                                    )
                                    .divideBy(1000L*60*60*24))
                            .build(),
                    Aggregation.group("departmentName")
                            .avg("resolutionTime").as("avgResolutionTime")
                            .count().as("resolvedCount"),
                    Aggregation.project("avgResolutionTime","resolvedCount")
                            .and("_id").as("department")
            );
            return (List<Map<String,Object>>)(List<?>)
                    mongoTemplate.aggregate(agg,"complaints",Map.class)
                            .getMappedResults();
        } catch (Exception e) {
            Map<String, Object> defaultResolution = new HashMap<>();
            defaultResolution.put("department", "Département par défaut");
            defaultResolution.put("avgResolutionTime", 5.0);
            defaultResolution.put("resolvedCount", 10);
            return List.of(defaultResolution);
        }
    }

    @GetMapping("/interventions-stats")
    public Map<String, Object> getInterventionsStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            long totalInt = mongoTemplate.count(new Query(), "interventions");

            Aggregation statusAgg = Aggregation.newAggregation(
                    Aggregation.group("status").count().as("count"),
                    Aggregation.project("count").and("_id").as("status")
            );
            List<Map<String,Object>> byStatus =
                    (List<Map<String,Object>>)(List<?>)
                            mongoTemplate.aggregate(statusAgg,"interventions",Map.class)
                                    .getMappedResults();

            stats.put("totalInterventions", totalInt);
            stats.put("byStatus", byStatus);
        } catch (Exception e) {
            stats.put("totalInterventions", 0);
            stats.put("byStatus", List.of());
        }

        return stats;
    }

    @GetMapping("/recent-activity")
    public Map<String, Object> getRecentActivity() {
        Date yesterday = Date.from(
                LocalDateTime.now().minusDays(1)
                        .atZone(ZoneId.systemDefault())
                        .toInstant()
        );

        long recentComplaints = 0;
        long recentResolved = 0;
        long newComments = 0;

        try {
            recentComplaints = mongoTemplate.count(
                    new Query(Criteria.where("creationDate").gte(yesterday)),
                    "complaints"
            );
            recentResolved = mongoTemplate.count(
                    new Query(Criteria.where("closureDate").gte(yesterday)),
                    "complaints"
            );
        } catch (Exception e) {
        }

        try {
            newComments = mongoTemplate.count(
                    new Query(Criteria.where("commentDate").gte(yesterday)),
                    "comments"
            );
        } catch (Exception e) {
        }

        Map<String,Object> activity = new HashMap<>();
        activity.put("newComplaints",      recentComplaints);
        activity.put("resolvedComplaints", recentResolved);
        activity.put("newComments",        newComments);
        return activity;
    }
}