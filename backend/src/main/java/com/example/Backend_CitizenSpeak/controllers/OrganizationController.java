package com.example.Backend_CitizenSpeak.controllers;

import java.time.LocalDateTime;
import java.util.List;

import com.example.Backend_CitizenSpeak.models.Department;
import com.example.Backend_CitizenSpeak.services.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.Backend_CitizenSpeak.models.Organization;
import com.example.Backend_CitizenSpeak.services.OrganizationService;

@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {

    private final OrganizationService service;
    private final UserService userService;

    public OrganizationController(OrganizationService orgService,
                                  UserService userService) {
        this.service  = orgService;
        this.userService = userService;
    }

    @GetMapping
    public List<Organization> getAll() {
        System.out.println("=== ORGANIZATIONS REQUEST DEBUG ===");
        List<Organization> organizations = service.findAll();

        System.out.println("Found " + organizations.size() + " organizations");
        for (Organization org : organizations) {
            System.out.println("Organization: " + org.getName() + " (ID: " + org.getOrganizationId() + ")");
            if (org.getDepartments() != null) {
                System.out.println("  Departments count: " + org.getDepartments().size());
                for (Department dept : org.getDepartments()) {
                    System.out.println("    - " + dept.getName() + " (ID: " + dept.getDepartmentId() + ")");
                }
            } else {
                System.out.println("  Departments: NULL");
            }
        }
        System.out.println("=== END ORGANIZATIONS DEBUG ===");

        return organizations;
    }

    @GetMapping("/{id}")
    public Organization getOne(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public Organization create(@RequestBody Organization org,
                               Authentication authentication) {
        String email = authentication.getName();
        String adminName = userService
                .getUserByEmail(email)
                .getName();

        org.setCreatedBy(adminName);
        org.setCreatedAt(LocalDateTime.now());
        return service.create(org);
    }

    @PutMapping("/{id}")
    public Organization update(@PathVariable String id, @RequestBody Organization org) {
        return service.update(id, org);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
