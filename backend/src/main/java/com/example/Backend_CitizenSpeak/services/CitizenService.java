package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.repositories.CitizenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CitizenService {

    private final CitizenRepository citizenRepository;

    @Autowired
    public CitizenService(CitizenRepository citizenRepository) {
        this.citizenRepository = citizenRepository;
    }

    public Citizen getCitizenByEmail(String email) {
        return citizenRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with email: " + email));
    }

}