package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AgentRepository extends MongoRepository<CommunityAgent, String> {
    void deleteByEmail(String email);
    Optional<CommunityAgent> findByEmail(String email);

}
