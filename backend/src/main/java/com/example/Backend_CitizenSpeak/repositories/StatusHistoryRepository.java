package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.StatusHistory;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends MongoRepository<StatusHistory, String> {

    List<StatusHistory> findByComplaintOrderByStatusDateAsc(Complaint complaint);

    @Query("{ 'complaint.complaintId' : ?0 }")
    List<StatusHistory> findByComplaintComplaintId(String complaintId);

    @Query("{ 'complaint.$id' : ?0 }")
    List<StatusHistory> findByComplaintId(String complaintId);

    List<StatusHistory> findByStatusOrderByStatusDateDesc(String status);

    List<StatusHistory> findByUpdatedByOrderByStatusDateDesc(User user);

    @Query("{ 'complaint.complaintId' : ?0, 'status' : ?1 }")
    boolean existsByComplaintComplaintIdAndStatus(String complaintId, String status);

    long countByStatus(String status);

    List<StatusHistory> findByStatusDateBetweenOrderByStatusDateDesc(Date startDate, Date endDate);

    @Query(value = "{}", sort = "{ 'statusDate' : -1 }")
    List<StatusHistory> findAllOrderByStatusDateDesc();

    @Query(value = "{ 'complaint.complaintId' : ?0 }", count = true)
    long countByComplaintComplaintId(String complaintId);
}