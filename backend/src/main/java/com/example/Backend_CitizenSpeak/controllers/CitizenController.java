package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.models.Citizen;
import com.example.Backend_CitizenSpeak.repositories.CitizenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citizens")
public class CitizenController {

    private final CitizenRepository citizenRepository;

    @Autowired
    public CitizenController(CitizenRepository citizenRepository) {
        this.citizenRepository = citizenRepository;
    }

    @PostMapping
    public ResponseEntity<Citizen> createCitizen(@RequestBody Citizen citizen) {
        return ResponseEntity.ok(citizenRepository.save(citizen));
    }
}
