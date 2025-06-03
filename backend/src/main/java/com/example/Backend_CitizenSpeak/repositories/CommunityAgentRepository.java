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
    List<CommunityAgent> findByActiveFalse();
    long countByActiveTrue();
    long countByActiveFalse();
    List<CommunityAgent> findByService(String service);
    long countByService(String service);
    @Query("{ 'department.$id' : ?0 }")
    List<CommunityAgent> findByDepartmentDepartmentId(String departmentId);

    @Query(value = "{ 'department.$id' : ?0 }", count = true)
    long countByDepartmentDepartmentId(String departmentId);
    List<CommunityAgent> findByRole(String role);
    long countByRole(String role);
    List<CommunityAgent> findByNameContainingIgnoreCase(String name);
    Optional<CommunityAgent> findByName(String name);
    List<CommunityAgent> findByServiceAndActiveTrue(String service);
    List<CommunityAgent> findByRoleAndActiveTrue(String role);
    List<CommunityAgent> findByServiceAndRole(String service, String role);
    Optional<CommunityAgent> findByPhone(String phone);
    boolean existsByPhone(String phone);
    Optional<CommunityAgent> findByUserId(String userId);
    boolean existsByUserId(String userId);
}