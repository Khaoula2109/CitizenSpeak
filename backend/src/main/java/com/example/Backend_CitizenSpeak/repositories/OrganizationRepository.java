package com.example.Backend_CitizenSpeak.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.Backend_CitizenSpeak.models.Organization;

public interface OrganizationRepository extends MongoRepository<Organization, String> {
}
