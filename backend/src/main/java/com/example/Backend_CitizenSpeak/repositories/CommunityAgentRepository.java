package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityAgentRepository extends MongoRepository<CommunityAgent, String> {

    Optional<CommunityAgent> findByEmail(String email);
    boolean existsByEmail(String email);

    List<CommunityAgent> findByActiveTrue();
    long countByActiveTrue();

    List<CommunityAgent> findByService(String service);
    long countByService(String service);

    @Query("{ 'department.$id' : ?0 }")
    List<CommunityAgent> findByDepartmentDepartmentId(String departmentId);

    List<CommunityAgent> findByRole(String role);

    List<CommunityAgent> findByNameContainingIgnoreCase(String name);

}