package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.dto.ProfileDto;
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

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class UserService {

    private final Map<String, String> tempTokenStorage = new HashMap<>();

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
                try {
                    Citizen citizen = new Citizen(name, email, encodedPassword, phone, extra);
                    citizenRepository.save(citizen);
                } catch (Exception e) {
                    Citizen citizen = new Citizen(name, email, encodedPassword, phone);
                    citizenRepository.save(citizen);
                }
            }
            default -> throw new IllegalArgumentException("Unknown role: " + role);
        }
    }

    public String processLogin(String email, String password) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));

            if (!user.isActive()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Votre compte est inactif.");
            }

            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("Mot de passe incorrect");
            }

            String otp = String.format("%06d", new Random().nextInt(1000000));
            try {
                user.setOtp(otp);
                userRepository.save(user);
                sendOtpEmail(user.getEmail(), otp);
            } catch (Exception e) {
                System.err.println("OTP feature not available: " + e.getMessage());
            }

            String tempToken = UUID.randomUUID().toString();
            tempTokenStorage.put(tempToken, email);

            return tempToken;
        } catch (Exception e) {
            System.err.println("Error in processLogin: " + e.getMessage());
            throw e;
        }
    }

    private void sendOtpEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Votre code OTP");
            message.setText("Bonjour,\n\nVotre code OTP est : " + otp + "\n\nIl est valable 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending OTP email: " + e.getMessage());
        }
    }

    public String verifyOtp(String tempToken, String otp) {
        try {
            System.out.println("Token reçu: " + tempToken);
            System.out.println("TempTokenStorage: " + tempTokenStorage);
            String email = tempTokenStorage.get(tempToken);
            if (email == null) {
                throw new IllegalArgumentException("Token temporaire invalide ou expiré");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));

            try {
                if (!otp.equals(user.getOtp())) {
                    throw new IllegalArgumentException("OTP invalide");
                }

                user.setOtp(null);
                userRepository.save(user);
            } catch (Exception e) {
                System.err.println("OTP verification error: " + e.getMessage());
                throw new IllegalArgumentException("OTP invalide");
            }

            tempTokenStorage.remove(tempToken);
            return email;
        } catch (Exception e) {
            System.err.println("Error in verifyOtp: " + e.getMessage());
            throw e;
        }
    }

    public List<String> generateBackupCodes(String email, int count) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));

            List<String> codes = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                codes.add(UUID.randomUUID().toString().substring(0, 8));
            }

            try {
                userRepository.save(user);
            } catch (Exception e) {
                System.err.println("Backup codes feature not available: " + e.getMessage());
            }

            return codes;
        } catch (Exception e) {
            System.err.println("Error generating backup codes: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public void verifyBackupCode(String email, String code) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));

            try {
                if (user.getBackupCodes() == null || !user.getBackupCodes().contains(code)) {
                    throw new IllegalArgumentException("Code de secours invalide");
                }

                user.getBackupCodes().remove(code);
                userRepository.save(user);
            } catch (Exception e) {
                System.err.println("Backup codes verification error: " + e.getMessage());
                throw new IllegalArgumentException("Code de secours invalide");
            }
        } catch (Exception e) {
            System.err.println("Error in verifyBackupCode: " + e.getMessage());
            throw e;
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

    public void updateInternalUser(String email,
                                   String newName,
                                   String newPhone,
                                   String newRole,
                                   String extra) {
        try {
            User u = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));
            u.setName(newName);
            u.setPhone(newPhone);
            u.setRole(newRole);
            userRepository.save(u);

            switch (newRole.toLowerCase()) {
                case "admin" -> {
                    try {
                        Admin adm = adminRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("Admin introuvable"));
                        adm.setName(newName);
                        adm.setPhone(newPhone);
                        adminRepository.save(adm);
                    } catch (Exception e) {
                        System.err.println("Error updating admin: " + e.getMessage());
                    }
                }
                case "analyst" -> {
                    try {
                        Analyst anl = analystRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("Analyst introuvable"));
                        anl.setName(newName);
                        anl.setPhone(newPhone);
                        analystRepository.save(anl);
                    } catch (Exception e) {
                        System.err.println("Error updating analyst: " + e.getMessage());
                    }
                }
                case "agent" -> {
                    try {
                        CommunityAgent ag = agentRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("Agent introuvable"));
                        ag.setName(newName);
                        ag.setPhone(newPhone);
                        ag.setService(extra);
                        agentRepository.save(ag);
                    } catch (Exception e) {
                        System.err.println("Error updating agent: " + e.getMessage());
                    }
                }
                case "citizen" -> {
                    try {
                        Citizen cit = citizenRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("Citizen introuvable"));
                        cit.setName(newName);
                        cit.setPhone(newPhone);
                        citizenRepository.save(cit);
                    } catch (Exception e) {
                        System.err.println("Error updating citizen: " + e.getMessage());
                    }
                }
                default -> throw new IllegalArgumentException("Role inconnu: " + newRole);
            }
        } catch (Exception e) {
            System.err.println("Error in updateInternalUser: " + e.getMessage());
            throw e;
        }
    }

    public void deleteUser(String email) {
        try {
            User u = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur introuvable"));
            String role = u.getRole().toLowerCase();

            switch (role) {
                case "admin" -> {
                    try {
                        adminRepository.deleteByEmail(email);
                    } catch (Exception e) {
                        System.err.println("Error deleting admin: " + e.getMessage());
                    }
                }
                case "analyst" -> {
                    try {
                        analystRepository.deleteByEmail(email);
                    } catch (Exception e) {
                        System.err.println("Error deleting analyst: " + e.getMessage());
                    }
                }
                case "agent" -> {
                    try {
                        agentRepository.deleteByEmail(email);
                    } catch (Exception e) {
                        System.err.println("Error deleting agent: " + e.getMessage());
                    }
                }
                case "citizen" -> {
                    try {
                        citizenRepository.deleteByEmail(email);
                    } catch (Exception e) {
                        System.err.println("Error deleting citizen: " + e.getMessage());
                    }
                }
                default -> {
                    System.out.println("Unknown role for deletion: " + role);
                }
            }
            userRepository.deleteByEmail(email);
        } catch (Exception e) {
            System.err.println("Error in deleteUser: " + e.getMessage());
            throw e;
        }
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
        try {
            User user = userRepository.findByEmail(email)
                    .orElse(null);
            if (user == null) {
                return;
            }

            String resetToken = UUID.randomUUID().toString();

            try {
                user.setResetToken(resetToken);
                user.setResetTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
                userRepository.save(user);
            } catch (Exception e) {
                System.err.println("Reset token feature not available: " + e.getMessage());
                return;
            }

            sendPasswordResetEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            System.err.println("Error in sendPasswordResetToken: " + e.getMessage());
        }
    }

    private void sendPasswordResetEmail(String email, String resetToken) {
        try {
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
        } catch (Exception e) {
            System.err.println("Error sending password reset email: " + e.getMessage());
        }
    }

    public void resetPassword(String token, String newPassword) {
        try {
            User user = userRepository.findByResetToken(token)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

            try {
                if (user.getResetTokenExpiry().isBefore(Instant.now())) {
                    throw new IllegalArgumentException("Token has expired");
                }
            } catch (Exception e) {
                System.err.println("Reset token expiry check failed: " + e.getMessage());
                throw new IllegalArgumentException("Invalid or expired token");
            }

            user.setPassword(passwordEncoder.encode(newPassword));

            try {
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
            } catch (Exception e) {
                System.err.println("Error clearing reset token: " + e.getMessage());
            }

            userRepository.save(user);
        } catch (Exception e) {
            System.err.println("Error in resetPassword: " + e.getMessage());
            throw e;
        }
    }

    public User saveUser(User user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            System.err.println("Error saving user: " + e.getMessage());
            throw e;
        }
    }

    public ProfileDto getProfileByEmail(String email) {
        try {
            User u = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur non trouvé"));

            String deptId = "";
            String deptName = "";
            String service = "";

            if ("agent".equalsIgnoreCase(u.getRole())) {
                try {
                    CommunityAgent ag = agentRepository.findByEmail(email)
                            .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Agent introuvable"));

                    if (ag.getDepartment() != null) {
                        deptId = ag.getDepartment().getDepartmentId();
                        deptName = ag.getDepartment().getName();
                    }
                    service = ag.getService();
                } catch (Exception e) {
                    System.err.println("Error getting agent profile: " + e.getMessage());
                }
            }

            return new ProfileDto(
                    u.getName(),
                    u.getEmail(),
                    u.getPhone(),
                    u.getRole(),
                    u.getPhoto(),
                    deptId,
                    deptName,
                    service
            );
        } catch (Exception e) {
            System.err.println("Error in getProfileByEmail: " + e.getMessage());
            throw e;
        }
    }

    public List<User> getAllUsers() {
        try {
            return userRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error getting all users: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public boolean existsByEmail(String email) {
        try {
            return userRepository.findByEmail(email).isPresent();
        } catch (Exception e) {
            System.err.println("Error checking user existence: " + e.getMessage());
            return false;
        }
    }

    public long getTotalUsersCount() {
        try {
            return userRepository.count();
        } catch (Exception e) {
            System.err.println("Error counting users: " + e.getMessage());
            return 0;
        }
    }

    public Map<String, String> getTempTokenStorage() {
        return tempTokenStorage;
    }

    public void clearExpiredTempTokens() {
        try {
            tempTokenStorage.clear();
        } catch (Exception e) {
            System.err.println("Error clearing temp tokens: " + e.getMessage());
        }
    }
}