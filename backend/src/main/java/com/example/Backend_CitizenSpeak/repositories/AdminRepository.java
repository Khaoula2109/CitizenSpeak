package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Admin;
import com.example.Backend_CitizenSpeak.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;
public interface AdminRepository extends MongoRepository<Admin, String> {
    List<User> findByRole(String role);
    void deleteByEmail(String email);

    Optional<Admin> findByEmail(String email);
}
