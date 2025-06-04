package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.Intervention;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Date;
import java.util.List;

public interface InterventionRepository extends MongoRepository<Intervention, String> {

    List<Intervention> findByComplaintOrderByStartDateDesc(Complaint complaint);
    List<Intervention> findByAgentsContainingOrderByStartDateDesc(CommunityAgent agent);
    List<Intervention> findByStatusOrderByStartDateDesc(String status);
    List<Intervention> findByStartDateBetweenOrderByStartDateDesc(Date startDate, Date endDate);
    List<Intervention> findByComplaintComplaintIdOrderByStartDateDesc(String complaintId);
    long countByStatus(String status);
    List<Intervention> findByStatus(String status);
    long countByAgentsContaining(CommunityAgent agent);
}