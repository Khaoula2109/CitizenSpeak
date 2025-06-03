package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.AuthenticationException;
import com.example.Backend_CitizenSpeak.exceptions.UserAlreadyExistsException;
import com.example.Backend_CitizenSpeak.exceptions.UserNotFoundException;
import com.example.Backend_CitizenSpeak.models.*;
import com.example.Backend_CitizenSpeak.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final AdminRepository adminRepository;
    private final AnalystRepository analystRepository;
    private final CitizenRepository citizenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Autowired
    public UserService(UserRepository userRepository,
                       AgentRepository agentRepository,
                       AdminRepository adminRepository,
                       AnalystRepository analystRepository,
                       CitizenRepository citizenRepository,
                       PasswordEncoder passwordEncoder,
                       JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.adminRepository = adminRepository;
        this.analystRepository = analystRepository;
        this.citizenRepository = citizenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    public void registerUser(String email, String password, String role, String name, String phone, String extra) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new UserAlreadyExistsException("Email existe déjà.");
        }

        String encodedPassword = passwordEncoder.encode(password);
        User baseUser = new User(name, email, encodedPassword, phone, role);
        userRepository.save(baseUser);

        switch (role.toLowerCase()) {
            case "agent" -> {
                CommunityAgent agent = new CommunityAgent(name, email, encodedPassword, phone, "Agent");
                agent.setService(extra);
                agentRepository.save(agent);
            }
            case "admin" -> {
                Admin admin = new Admin(name, email, encodedPassword, phone);
                adminRepository.save(admin);
            }
            case "analyst" -> {
                Analyst analyst = new Analyst(name, email, encodedPassword, phone);
                analystRepository.save(analyst);
            }
            case "citizen" -> {
                Citizen citizen = new Citizen(name, email, encodedPassword, phone);
                citizenRepository.save(citizen);
            }
            default -> throw new IllegalArgumentException("Unknown role: " + role);
        }
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void updateUserProfile(String email, String name) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));

        user.setName(name);
        userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));
    }

    public void validateCredentials(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is inactive");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthenticationException("Invalid credentials");
        }
    }

    public void sendPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return;
        }

        String resetToken = UUID.randomUUID().toString();

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        userRepository.save(user);

        sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    private void sendPasswordResetEmail(String email, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Réinitialisation de votre mot de passe");
        message.setText("Bonjour,\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe. " +
                "Cliquez sur le lien suivant pour définir un nouveau mot de passe :\n\n" +
                "http://your-app-url/reset-password?token=" + resetToken + "\n\n" +
                "Ce lien expirera dans 30 minutes.\n\n" +
                "Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.");

        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);
    }

}
