package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Department;
import com.example.Backend_CitizenSpeak.repositories.DepartmentRepository;
import org.springframework.stereotype.Service;
import com.example.Backend_CitizenSpeak.services.OrganizationService;
import com.example.Backend_CitizenSpeak.models.Organization;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository repo;
    private final OrganizationService orgService;

    public DepartmentService(DepartmentRepository repo, OrganizationService orgService) {
        this.repo = repo;
        this.orgService = orgService;
    }

    public List<Department> findByOrganizationId(String orgId) {
        return repo.findByOrganizationOrganizationId(orgId);
    }

    public Department create(String orgId, Department dept) {
        Organization org = orgService.findById(orgId);
        dept.setOrganization(org);
        return repo.save(dept);
    }

    public Department update(String orgId, String deptId, Department deptData) {
        Organization org = orgService.findById(orgId);
        Department existing = repo.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException("Dept not found: " + deptId));
        existing.setName(deptData.getName());
        existing.setContactEmail(deptData.getContactEmail());
        existing.setDescription(deptData.getDescription());
        existing.setManager(deptData.getManager());
        existing.setPhone(deptData.getPhone());
        existing.setEmployeeCount(deptData.getEmployeeCount());
        existing.setBudget(deptData.getBudget());
        existing.setStatus(deptData.getStatus());
        existing.setOrganization(org);
        return repo.save(existing);
    }

    public List<Department> findAll() {
        return repo.findAll();
    }
}
