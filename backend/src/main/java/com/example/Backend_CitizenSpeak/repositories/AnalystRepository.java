package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Analyst;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AnalystRepository extends MongoRepository<Analyst, String> {
    void deleteByEmail(String email);
    Optional<Analyst> findByEmail(String email);
}
