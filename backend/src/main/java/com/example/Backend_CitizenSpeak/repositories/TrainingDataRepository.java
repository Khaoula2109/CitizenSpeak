package com.example.Backend_CitizenSpeak.repositories;

import com.example.Backend_CitizenSpeak.models.TrainingData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingDataRepository extends MongoRepository<TrainingData, String> {
}