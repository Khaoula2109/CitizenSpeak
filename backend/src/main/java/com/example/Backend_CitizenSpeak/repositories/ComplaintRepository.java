package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.models.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {

    long countByStatus(String status);

    List<Complaint> findAllByOrderByCreationDateDesc();

    List<Complaint> findByCitizenOrderByCreationDateDesc(Citizen citizen);

    List<Complaint> findByStatusOrderByCreationDateDesc(String status);

    List<Complaint> findTop10ByOrderByCreationDateDesc();

    Optional<Complaint> findByComplaintId(String complaintId);

    @Query("{ 'creationDate': { $gte: ?0 } }")
    List<Complaint> findRecentComplaints(Date fromDate);

    @Query("{ 'creationDate': { $gte: ?0 }, 'priorityLevel': ?1 }")
    List<Complaint> findRecentComplaintsByPriority(Date fromDate, int priorityLevel);

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

}