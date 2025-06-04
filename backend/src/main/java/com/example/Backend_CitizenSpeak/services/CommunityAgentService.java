package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.CommunityAgent;
import com.example.Backend_CitizenSpeak.repositories.CommunityAgentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommunityAgentService {

    private final CommunityAgentRepository communityAgentRepository;

    @Autowired
    public CommunityAgentService(CommunityAgentRepository communityAgentRepository) {
        this.communityAgentRepository = communityAgentRepository;
    }

    public CommunityAgent getAgentById(String agentId) {
        return communityAgentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Community agent not found with id: " + agentId));
    }

    public CommunityAgent getAgentByEmail(String email) {
        return communityAgentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Community agent not found with email: " + email));
    }

    public Optional<CommunityAgent> findAgentByEmail(String email) {
        return communityAgentRepository.findByEmail(email);
    }

    public List<CommunityAgent> getAllAgents() {
        return communityAgentRepository.findAll();
    }

    public List<CommunityAgent> getActiveAgents() {
        try {
            return communityAgentRepository.findByActiveTrue();
        } catch (Exception e) {
            return communityAgentRepository.findAll();
        }
    }

    public List<CommunityAgent> getAgentsByService(String service) {
        try {
            return communityAgentRepository.findByService(service);
        } catch (Exception e) {
            return getAllAgents().stream()
                    .filter(agent -> service.equals(agent.getService()))
                    .toList();
        }
    }

    public CommunityAgent createAgent(CommunityAgent agent) {
        return communityAgentRepository.save(agent);
    }

    public CommunityAgent updateAgent(CommunityAgent agent) {
        return communityAgentRepository.save(agent);
    }

    public void deleteAgent(String agentId) {
        CommunityAgent agent = getAgentById(agentId);
        communityAgentRepository.delete(agent);
    }

    public boolean existsByEmail(String email) {
        try {
            return communityAgentRepository.existsByEmail(email);
        } catch (Exception e) {
            return findAgentByEmail(email).isPresent();
        }
    }

    public boolean isAgentActive(String agentId) {
        try {
            CommunityAgent agent = getAgentById(agentId);
            return agent.isActive();
        } catch (Exception e) {
            return false;
        }
    }

    public List<CommunityAgent> searchAgentsByName(String name) {
        try {
            return communityAgentRepository.findByNameContainingIgnoreCase(name);
        } catch (Exception e) {
            return getAllAgents().stream()
                    .filter(agent -> agent.getName() != null &&
                            agent.getName().toLowerCase().contains(name.toLowerCase()))
                    .toList();
        }
    }

    public List<CommunityAgent> getAgentsByRole(String role) {
        try {
            return communityAgentRepository.findByRole(role);
        } catch (Exception e) {
            return getAllAgents().stream()
                    .filter(agent -> role.equals(agent.getRole()))
                    .toList();
        }
    }

    public long getTotalAgentsCount() {
        try {
            return communityAgentRepository.count();
        } catch (Exception e) {
            return getAllAgents().size();
        }
    }

    public long getActiveAgentsCount() {
        try {
            return communityAgentRepository.countByActiveTrue();
        } catch (Exception e) {
            return getAllAgents().stream()
                    .filter(CommunityAgent::isActive)
                    .count();
        }
    }

    public long getAgentsCountByService(String service) {
        try {
            return communityAgentRepository.countByService(service);
        } catch (Exception e) {
            return getAllAgents().stream()
                    .filter(agent -> service.equals(agent.getService()))
                    .count();
        }
    }
}