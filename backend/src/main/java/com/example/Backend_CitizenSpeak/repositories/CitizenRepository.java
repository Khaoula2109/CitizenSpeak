package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Citizen;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface CitizenRepository extends MongoRepository<Citizen, String> {
    Optional<Citizen> findByEmail(String email);
    void deleteByEmail(String email);
}