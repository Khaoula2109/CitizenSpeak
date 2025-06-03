package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
public interface AdminRepository extends MongoRepository<Admin, String> {
    void deleteByEmail(String email);

    Optional<Admin> findByEmail(String email);
}
