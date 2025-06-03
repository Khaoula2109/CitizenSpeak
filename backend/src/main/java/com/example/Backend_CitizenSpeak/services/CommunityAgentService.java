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
        return communityAgentRepository.findByActiveTrue();
    }

    public List<CommunityAgent> getAgentsByService(String service) {
        return communityAgentRepository.findByService(service);
    }

    public List<CommunityAgent> getAgentsByDepartment(String departmentId) {
        return communityAgentRepository.findByDepartmentDepartmentId(departmentId);
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
        return communityAgentRepository.existsByEmail(email);
    }

    public boolean isAgentActive(String agentId) {
        CommunityAgent agent = getAgentById(agentId);
        return agent.isActive();
    }

    public List<CommunityAgent> searchAgentsByName(String name) {
        return communityAgentRepository.findByNameContainingIgnoreCase(name);
    }

    public List<CommunityAgent> getAgentsByRole(String role) {
        return communityAgentRepository.findByRole(role);
    }

    public long getTotalAgentsCount() {
        return communityAgentRepository.count();
    }

    public long getActiveAgentsCount() {
        return communityAgentRepository.countByActiveTrue();
    }

    public long getAgentsCountByService(String service) {
        return communityAgentRepository.countByService(service);
    }
}