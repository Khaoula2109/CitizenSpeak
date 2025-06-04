package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.*;
import com.example.Backend_CitizenSpeak.exceptions.FileStorageException;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.*;
import com.example.Backend_CitizenSpeak.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AnalystRepository analystRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam(required = false) String email, Authentication authentication) {
        try {
            System.out.println("Début de getProfile()");

            if (email != null && !email.trim().isEmpty()) {
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

            if (authentication == null || !authentication.isAuthenticated()) {
                System.err.println("Authentication est null ou non authentifié");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Non authentifié"));
            }

            String extractedEmail = extractEmailFromAuthentication(authentication);

            if (extractedEmail == null || extractedEmail.trim().isEmpty()) {
                System.err.println("Impossible d'extraire l'email du token");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email invalide dans le token"));
            }

            try {
                ProfileDto profile = userService.getProfileByEmail(extractedEmail);
                System.out.println("ProfileDto récupéré avec succès");
                return ResponseEntity.ok(profile);
            } catch (Exception e) {
                User user = userRepository.findByEmail(extractedEmail)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Map<String, Object> result = new HashMap<>();
                result.put("name", user.getName());
                result.put("email", user.getEmail());
                result.put("phone", user.getPhone());
                result.put("role", user.getRole());
                result.put("photo", user.getPhoto());

                return ResponseEntity.ok(result);
            }

        } catch (Exception e) {
            System.err.println("Erreur dans getProfile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Erreur interne",
                            "message", e.getMessage()
                    ));
        }
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

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> p) {
        String email = p.get("email");
        String role = p.get("role");
        String name = p.get("name");
        userService.registerUser(
                email,
                p.get("password"),
                role,
                name,
                p.get("phone"),
                p.getOrDefault("extra", "")
        );

        User u = userService.getUserByEmail(email);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", u.getUserId());
        result.put("name", u.getName());
        result.put("email", u.getEmail());
        result.put("phone", u.getPhone());
        result.put("role", u.getRole());

        if ("agent".equalsIgnoreCase(role)) {
            CommunityAgent ag = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Agent introuvable"));

            ag.setService(p.getOrDefault("extra", ""));

            String deptId = p.get("departmentId");
            if (deptId != null && !deptId.isBlank()) {
                Department dept = departmentRepository.findById(deptId)
                        .orElseThrow(() -> new RuntimeException("Département introuvable: " + deptId));
                ag.setDepartment(dept);
            }

            agentRepository.save(ag);

            result.put("service", ag.getService());
            if (ag.getDepartment() != null) {
                Map<String, String> deptMap = new HashMap<>();
                deptMap.put("id", ag.getDepartment().getDepartmentId());
                deptMap.put("name", ag.getDepartment().getName());
                result.put("department", deptMap);
            }
        }

        result.put("isActive", true);
        result.put("createdAt", Instant.now().toString());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUser(@RequestBody Map<String, Object> p) {
        String email = (String) p.get("email");
        String name = (String) p.get("name");
        String phone = (String) p.get("phone");
        String role = (String) p.get("role");
        Boolean isActive = (Boolean) p.getOrDefault("active", true);

        userService.updateInternalUser(
                email,
                name,
                phone,
                role,
                (String) p.getOrDefault("extra", "")
        );

        User u = userService.getUserByEmail(email);
        u.setActive(isActive);
        userRepository.save(u);

        if ("agent".equalsIgnoreCase(role)) {
            CommunityAgent ag = agentRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Agent introuvable"));

            ag.setService((String) p.getOrDefault("extra", ""));

            String deptId = (String) p.get("departmentId");
            if (deptId != null && !deptId.isBlank()) {
                Department dept = departmentRepository.findById(deptId)
                        .orElseThrow(() -> new RuntimeException("Département introuvable: " + deptId));
                ag.setDepartment(dept);
            }

            agentRepository.save(ag);
        }

        return ResponseEntity.ok("Utilisateur mis à jour");
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@RequestParam String email) {
        userService.deleteUser(email);
        return ResponseEntity.ok("Utilisateur supprimé");
    }

    @GetMapping("/all")
    public List<Map<String, Object>> getAllUsers() {
        List<User> baseUsers = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : baseUsers) {
            Map<String, Object> m = new HashMap<>();
            m.put("userId", u.getUserId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("role", u.getRole());
            m.put("active", u.isActive());

            if ("agent".equalsIgnoreCase(u.getRole())) {
                agentRepository.findByEmail(u.getEmail())
                        .ifPresent(ag -> {
                            m.put("service", ag.getService());
                            Department d = ag.getDepartment();
                            if (d != null) {
                                Map<String, String> dept = new HashMap<>();
                                dept.put("id", d.getDepartmentId());
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

    @PutMapping("/update-profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        String email = extractEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        if (payload.containsKey("fullName")) user.setName(payload.get("fullName"));
        if (payload.containsKey("phone")) user.setPhone(payload.get("phone"));
        userRepository.save(user);

        String role = user.getRole().toLowerCase();
        switch (role) {
            case "agent" -> agentRepository.findByEmail(email).ifPresent(agent -> {
                if (payload.containsKey("fullName")) agent.setName(payload.get("fullName"));
                if (payload.containsKey("phone")) agent.setPhone(payload.get("phone"));
                if (payload.containsKey("service")) agent.setService(payload.get("service"));
                if (payload.containsKey("departmentId")) {
                    departmentRepository.findById(payload.get("departmentId"))
                            .ifPresent(agent::setDepartment);
                }
                agentRepository.save(agent);
            });

            case "analyst" -> analystRepository.findByEmail(email).ifPresent(analyst -> {
                if (payload.containsKey("fullName")) analyst.setName(payload.get("fullName"));
                if (payload.containsKey("phone")) analyst.setPhone(payload.get("phone"));
                analystRepository.save(analyst);
            });

            case "admin" -> adminRepository.findByEmail(email).ifPresent(admin -> {
                if (payload.containsKey("fullName")) admin.setName(payload.get("fullName"));
                if (payload.containsKey("phone")) admin.setPhone(payload.get("phone"));
                adminRepository.save(admin);
            });

            default -> {
            }
        }

        return ResponseEntity.ok(Map.of("message", "Profil mis à jour avec succès"));
    }

    @PostMapping("/upload-profile-photo")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(
            Authentication authentication,
            @RequestParam("photo") MultipartFile file
    ) {
        String email = extractEmailFromAuthentication(authentication);

        User user = userService.getUserByEmail(email);

        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        if (original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + ext;
        Path uploadDir = Paths.get("uploads/photos").toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new FileStorageException("Impossible de stocker la photo", e);
        }

        String photoUrl = "/uploads/photos/" + filename;
        user.setPhoto(photoUrl);
        userRepository.save(user);

        String role = user.getRole().toLowerCase();
        switch (role) {
            case "agent" -> agentRepository.findByEmail(email).ifPresent(agent -> {
                agent.setPhoto(photoUrl);
                agentRepository.save(agent);
            });
            case "analyst" -> analystRepository.findByEmail(email).ifPresent(analyst -> {
                analyst.setPhoto(photoUrl);
                analystRepository.save(analyst);
            });
            case "admin" -> adminRepository.findByEmail(email).ifPresent(admin -> {
                admin.setPhoto(photoUrl);
                adminRepository.save(admin);
            });
            default -> {
            }
        }

        Map<String, String> resp = new HashMap<>();
        resp.put("photoUrl", photoUrl);
        return ResponseEntity.ok(resp);
    }

    private String extractEmailFromAuthentication(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();

            System.out.println("JWT CLAIMS");
            jwt.getClaims().forEach((k, v) -> System.out.println(k + " → " + v));
            System.out.println("END CLAIMS");

            String email = jwt.getClaimAsString("email");

            if (email == null || email.isBlank()) {
                email = jwt.getClaimAsString("preferred_username");
            }

            if (email == null || email.isBlank()) {
                email = jwt.getClaimAsString("sub");
            }

            if (email != null && !email.isBlank()) return email;
        }
        return authentication.getName();
    }
}