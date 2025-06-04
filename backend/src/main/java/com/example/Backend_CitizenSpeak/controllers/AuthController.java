package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.dto.LoginRequest;
import com.example.Backend_CitizenSpeak.dto.MobileLoginRequest;
import com.example.Backend_CitizenSpeak.dto.OtpVerificationRequest;
import com.example.Backend_CitizenSpeak.dto.SignupRequest;
import com.example.Backend_CitizenSpeak.models.User;
import com.example.Backend_CitizenSpeak.services.TokenService;
import com.example.Backend_CitizenSpeak.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final TokenService tokenService;

    @Autowired
    public AuthController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }


    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest request) {
        userService.registerUser(
                request.getEmail(),
                request.getPassword(),
                "citizen",
                request.getName(),
                request.getPhone(),
                request.getExtra()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registration successful. Please log in.");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/mobile-login")
    public ResponseEntity<Map<String, Object>> mobileLogin(@Valid @RequestBody MobileLoginRequest request) {
        userService.validateCredentials(request.getEmail(), request.getPassword());

        User user = userService.getUserByEmail(request.getEmail());

        String token = tokenService.generateToken(request.getEmail(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "role", user.getRole()
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping(value = {"/me", "/me/"})
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        try {
            System.out.println("=== Request for current user info ===");

            String authHeader = request.getHeader("Authorization");
            System.out.println("Authorization header: " + authHeader);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.err.println("No valid Authorization header found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            System.out.println("Extracted token: " + token.substring(0, Math.min(20, token.length())) + "...");

            String email = tokenService.extractEmailFromToken(token);
            System.out.println("Email from token: " + email);

            if (email == null || email.isEmpty()) {
                System.err.println("Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            User user = userService.getUserByEmail(email);

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getUserId());
            userInfo.put("userId", user.getUserId());
            userInfo.put("name", user.getName());
            userInfo.put("email", user.getEmail());
            userInfo.put("role", user.getRole());
            userInfo.put("phone", user.getPhone());

            System.out.println("✅ Returning user info for: " + user.getName() + " (Role: " + user.getRole() + ")");
            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            System.err.println("❌ Error getting current user info: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        String tempToken = userService.processLogin(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of(
                "message", "OTP has been sent to your email",
                "tempToken", tempToken
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        String email = userService.verifyOtp(request.getToken(), request.getOtp());
        String role = userService.getUserByEmail(email).getRole();
        String token = tokenService.generateToken(email, role);
        return ResponseEntity.ok(Map.of(
                "message", "OTP verified successfully. Login completed.",
                "token", token,
                "role", role
        ));
    }


    @PostMapping("/generate-backup-codes")
    public ResponseEntity<List<String>> generateBackupCodes(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        int count = (Integer) payload.getOrDefault("count", 5);
        List<String> codes = userService.generateBackupCodes(email, count);
        return ResponseEntity.ok(codes);
    }

    @PostMapping("/verify-backup-code")
    public ResponseEntity<Map<String, Object>> verifyBackupCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String backupCode = payload.get("backupCode");

        userService.verifyBackupCode(email, backupCode);
        String role = userService.getUserByEmail(email).getRole();
        String token = tokenService.generateToken(email, role);

        return ResponseEntity.ok(Map.of(
                "message", "Backup code verified successfully.",
                "token", token,
                "role", role
        ));
    }
}
