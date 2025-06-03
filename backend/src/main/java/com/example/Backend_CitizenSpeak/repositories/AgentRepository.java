package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AgentRepository extends MongoRepository<CommunityAgent, String> {
    List<User> findByRole(String role);
    void deleteByEmail(String email);
    Optional<CommunityAgent> findByEmail(String email);
    List<CommunityAgent> findByService(String service);
    List<CommunityAgent> findByDepartment_DepartmentId(String departmentId);
    Optional<CommunityAgent> findById(String id);
}
