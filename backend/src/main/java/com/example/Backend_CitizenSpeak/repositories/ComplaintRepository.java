package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.dto.ComplaintResponse;
import com.example.Backend_CitizenSpeak.models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    long countByStatus(String status);
    List<Complaint> findByCitizen(Citizen citizen);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByCategory(Category category);
    List<Complaint> findByPriorityLevel(int priorityLevel);
    List<Complaint> findByIsVerified(int isVerified);
    long countByCategory(Category category);

    List<Complaint> findAllByOrderByCreationDateDesc();
    List<Complaint> findByCitizenOrderByCreationDateDesc(Citizen citizen);
    List<Complaint> findByStatusOrderByCreationDateDesc(String status);
    List<Complaint> findTop10ByOrderByCreationDateDesc();

    Optional<Complaint> findByComplaintId(String complaintId);

    List<Complaint> findByAssignedAgent(CommunityAgent agent);
    List<Complaint> findByAssignedAgentAndStatus(CommunityAgent agent, String status);
    List<Complaint> findByAssignedAgentOrderByCreationDateDesc(CommunityAgent agent);
    long countByAssignedAgent(CommunityAgent agent);
    long countByAssignedAgentAndStatus(CommunityAgent agent, String status);

    List<Complaint> findByAssignedDepartment(Department department);
    List<Complaint> findByAssignedDepartmentAndStatus(Department department, String status);
    long countByAssignedDepartment(Department department);

    List<Complaint> findByCreationDateBetween(Date startDate, Date endDate);
    long countByCreationDateBetween(Date startDate, Date endDate);
    List<Complaint> findByStatusAndCreationDateBetween(String status, Date startDate, Date endDate);
    long countByStatusAndCreationDateBetween(String status, Date startDate, Date endDate);
    List<Complaint> findByCategoryAndCreationDateBetween(Category category, Date startDate, Date endDate);

    @Query("{ 'creationDate': { $gte: ?0 } }")
    List<Complaint> findRecentComplaints(Date fromDate);

    @Query("{ 'creationDate': { $gte: ?0 }, 'priorityLevel': ?1 }")
    List<Complaint> findRecentComplaintsByPriority(Date fromDate, int priorityLevel);

    @Query("{ 'status': 'Resolved', 'closureDate': { $ne: null } }")
    List<Complaint> findResolvedComplaintsWithClosureDate();

    @Query("{ 'latitude': { $ne: 0.0 }, 'longitude': { $ne: 0.0 } }")
    List<Complaint> findComplaintsWithCoordinates();

    @Query("{ 'latitude': { $gte: ?0, $lte: ?1 }, 'longitude': { $gte: ?2, $lte: ?3 } }")
    List<Complaint> findComplaintsInArea(double minLat, double maxLat, double minLng, double maxLng);

    List<Complaint> findByStatusAndCategory(String status, Category category);

    @Query("{ 'assignedAgent': { $ne: null }, 'assignedDepartment': { $ne: null } }")
    List<Complaint> findAssignedComplaints();

    @Query("{ $or: [ { 'assignedAgent': null }, { 'assignedDepartment': null } ] }")
    List<Complaint> findUnassignedComplaints();

    @Query(value = "{ 'creationDate': { $gte: ?0, $lt: ?1 } }", count = true)
    long countByYearRange(Date start, Date end);

    @Query(value = "{ 'creationDate': { $gte: ?0, $lt: ?1 } }", sort = "{ 'creationDate': -1 }")
    List<Complaint> findByYearRangeOrderByDateDesc(Date start, Date end);

    default long countByYear(int year) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, Calendar.JANUARY, 1, 0, 0, 0);
        Date start = cal.getTime();
        cal.set(year + 1, Calendar.JANUARY, 1, 0, 0, 0);
        Date end = cal.getTime();
        return countByYearRange(start, end);
    }

    default List<Complaint> findByYearSorted(int year) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, Calendar.JANUARY, 1, 0, 0, 0);
        Date start = cal.getTime();
        cal.set(year + 1, Calendar.JANUARY, 1, 0, 0, 0);
        Date end = cal.getTime();
        return findByYearRangeOrderByDateDesc(start, end);
    }

    @Query("{ 'creationDate': { $gte: ?0, $lt: ?1 } }")
    List<Complaint> findByMonthAndYear(Date startOfMonth, Date startOfNextMonth);

    @Query("{'status': 'Resolved', 'closureDate': {$gte: ?0, $lte: ?1}}")
    List<Complaint> findResolvedComplaintsByClosureDateBetween(Date startDate, Date endDate);

    @Query("{'creationDate': {$gte: ?0, $lte: ?1}, 'latitude': {$ne: 0.0}, 'longitude': {$ne: 0.0}}")
    List<Complaint> findComplaintsWithLocationBetweenDates(Date startDate, Date endDate);

    @Query("{'priorityLevel': ?0, 'creationDate': {$gte: ?1, $lte: ?2}}")
    List<Complaint> findByPriorityLevelAndCreationDateBetween(int priorityLevel, Date startDate, Date endDate);

    @Query(value = "{'creationDate': {$gte: ?0, $lte: ?1}}", fields = "{'creationDate': 1, 'status': 1, 'category': 1}")
    List<Complaint> findComplaintsSummaryByDateRange(Date startDate, Date endDate);

    @Query("{'assignedAgent.$id': ?0}")
    List<Complaint> findByAssignedAgentUserId(String agentUserId);

    @Query("{'assignedAgent.$id': ?0, 'status': ?1}")
    List<Complaint> findByAssignedAgentUserIdAndStatus(String agentUserId, String status);

    @Query(value = "{'assignedAgent.$id': ?0}", count = true)
    long countByAssignedAgentUserId(String agentUserId);

    @Query(value = "{'assignedAgent.$id': ?0, 'status': ?1}", count = true)
    long countByAssignedAgentUserIdAndStatus(String agentUserId, String status);

    @Query("{'creationDate': {$lt: ?0}, 'status': {$nin: ['Resolved', 'Closed']}}")
    List<Complaint> findOverdueComplaints(Date beforeDate);

    @Query("{'assignedAgent': {$ne: null}, 'lastUpdated': {$gte: ?0}}")
    List<Complaint> findRecentlyAssignedComplaints(Date since);

    @Query(value = "{'creationDate': {$gte: ?0, $lte: ?1}}")
    List<Complaint> findComplaintsByDateRangeForStats(Date startDate, Date endDate);
}