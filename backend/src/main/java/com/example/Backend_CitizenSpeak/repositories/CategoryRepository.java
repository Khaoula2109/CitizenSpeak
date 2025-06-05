package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByLabel(String label);
    List<Category> findByDescriptionContainingIgnoreCase(String keyword);
    boolean existsByLabel(String label);
    List<Category> findAllByOrderByLabel();
}