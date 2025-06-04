package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.models.Department;
import com.example.Backend_CitizenSpeak.services.DepartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @GetMapping("/departments")
    public List<Department> findAll() {
        return service.findAll();
    }

    @GetMapping("/organizations/{orgId}/departments")
    public List<Department> findByOrganization(@PathVariable String orgId) {
        return service.findByOrganizationId(orgId);
    }

    @PostMapping("/organizations/{orgId}/departments")
    public ResponseEntity<Department> create(
            @PathVariable String orgId,
            @RequestBody Department dept
    ) {
        Department created = service.create(orgId, dept);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @PutMapping("/organizations/{orgId}/departments/{deptId}")
    public Department update(
            @PathVariable String orgId,
            @PathVariable String deptId,
            @RequestBody Department dept
    ) {
        return service.update(orgId, deptId, dept);
    }
}
