package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Analyst;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AnalystRepository extends MongoRepository<Analyst, String> {
    List<User> findByRole(String role);
    void deleteByEmail(String email);
    Optional<Analyst> findByEmail(String email);
}
