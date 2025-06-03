package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.models.Department;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.repositories.AgentRepository;
import com.example.Backend_CitizenSpeak.repositories.UserRepository;
import com.example.Backend_CitizenSpeak.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentRepository agentRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        result.put("phone", user.getPhone());
        result.put("role", user.getRole());
        result.put("photo", user.getPhoto());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/update-name")
    public ResponseEntity<String> updateName(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");
        userService.updateUserProfile(email, name);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        userService.changePassword(email, currentPassword, newPassword);
        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/all")
    public List<Map<String,Object>> getAllUsers() {
        List<User> baseUsers = userRepository.findAll();
        List<Map<String,Object>> result = new ArrayList<>();

        for (User u : baseUsers) {
            Map<String,Object> m = new HashMap<>();
            m.put("userId", u.getUserId());
            m.put("name",   u.getName());
            m.put("email",  u.getEmail());
            m.put("phone",  u.getPhone());
            m.put("role",   u.getRole());
            m.put("active", u.isActive());

            if ("agent".equalsIgnoreCase(u.getRole())) {
                agentRepository.findByEmail(u.getEmail())
                        .ifPresent(ag -> {
                            m.put("service", ag.getService());
                            Department d = ag.getDepartment();
                            if (d != null) {
                                Map<String,String> dept = new HashMap<>();
                                dept.put("id",   d.getDepartmentId());
                                dept.put("name", d.getName());
                                m.put("department", dept);
                            }
                        });
            }

            result.add(m);
        }

        return result;
    }

    @PostMapping("/update-photo")
    public ResponseEntity<?> updatePhoto(@RequestParam("photo") MultipartFile file,
                                         @RequestParam("email") String email) {
        try {
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.badRequest().body("Utilisateur non trouvé avec cet email: " + email);
            }

            String uploadDir = "uploads/photos";
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath);

            String photoUrl = uploadDir + "/" + filename;
            user.setPhoto(photoUrl);
            userRepository.save(user);

            Map<String, String> response = new HashMap<>();
            response.put("photo", photoUrl);
            response.put("message", "Photo mise à jour avec succès");

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'upload de la photo: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}
