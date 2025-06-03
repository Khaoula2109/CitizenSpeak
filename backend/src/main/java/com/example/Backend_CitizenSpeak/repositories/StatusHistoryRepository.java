package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.StatusHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface StatusHistoryRepository extends MongoRepository<StatusHistory, String> {
    List<StatusHistory> findByComplaintOrderByStatusDateAsc(Complaint complaint);

    @Query("{ 'complaint.$id' : ?0 }")
    List<StatusHistory> findByComplaintId(String complaintId);
}