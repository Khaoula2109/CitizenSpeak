package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.Infrastructure;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InfrastructureRepository extends MongoRepository<Infrastructure, String> {
}