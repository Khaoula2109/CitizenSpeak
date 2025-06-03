package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.repositories.CommunityAgentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommunityAgentService {

    private final CommunityAgentRepository communityAgentRepository;

    @Autowired
    public CommunityAgentService(CommunityAgentRepository communityAgentRepository) {
        this.communityAgentRepository = communityAgentRepository;
    }

    public CommunityAgent getAgentByEmail(String email) {
        return communityAgentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Community agent not found with email: " + email));
    }

}