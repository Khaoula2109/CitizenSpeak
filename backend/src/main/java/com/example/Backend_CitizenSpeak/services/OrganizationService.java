package com.example.Backend_CitizenSpeak.services;

import java.util.List;

import com.example.Backend_CitizenSpeak.models.Department;
import com.example.Backend_CitizenSpeak.repositories.DepartmentRepository;
import org.springframework.stereotype.Service;
import com.example.Backend_CitizenSpeak.models.Organization;
import com.example.Backend_CitizenSpeak.repositories.OrganizationRepository;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;

@Service
public class OrganizationService {
    private final OrganizationRepository repo;
    private final DepartmentRepository departmentRepo;

    public OrganizationService(OrganizationRepository repo, DepartmentRepository departmentRepo) {
        this.repo = repo;
        this.departmentRepo = departmentRepo;
    }
    public List<Organization> findAll() {
        List<Organization> organizations = repo.findAll();

        for (Organization org : organizations) {
            List<Department> departments = departmentRepo.findByOrganizationOrganizationId(org.getOrganizationId());
            org.setDepartments(departments);

            System.out.println("Organization: " + org.getName() + " has " + departments.size() + " departments");
            for (Department dept : departments) {
                System.out.println("  - Department: " + dept.getName() + " (ID: " + dept.getDepartmentId() + ")");
            }
        }

        return organizations;
    }

    public Organization findById(String id) {
        Organization organization = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id " + id));

        List<Department> departments = departmentRepo.findByOrganizationOrganizationId(id);
        organization.setDepartments(departments);

        return organization;
    }

    public Organization create(Organization org) {
        return repo.save(org);
    }

    public Organization update(String id, Organization org) {
        Organization existing = findById(id);
        existing.setName(org.getName());
        existing.setDescription(org.getDescription());
        existing.setResponsible(org.getResponsible());
        existing.setPhone(org.getPhone());
        existing.setEmail(org.getEmail());
        existing.setAnnualBudget(org.getAnnualBudget());
        existing.setHeadquartersAddress(org.getHeadquartersAddress());
        existing.setActive(org.isActive());
        return repo.save(existing);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}
