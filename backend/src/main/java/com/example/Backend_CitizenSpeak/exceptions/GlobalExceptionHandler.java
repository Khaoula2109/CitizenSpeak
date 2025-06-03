package com.example.Backend_CitizenSpeak.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> resourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        System.err.println("🔍 GlobalExceptionHandler - ResourceNotFoundException: " + ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("error", "Resource Not Found");
        response.put("message", ex.getMessage());
        response.put("path", request.getDescription(false).replace("uri=", ""));

        if (ex.getMessage().contains("Plainte non trouvée")) {
            String complaintId = extractComplaintId(ex.getMessage());
            response.put("userMessage", String.format(
                    "Aucune plainte trouvée avec l'ID %s. Vérifiez l'ID et réessayez.",
                    complaintId
            ));
        } else {
            response.put("userMessage", "La ressource demandée n'a pas été trouvée.");
        }

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> authenticationException(AuthenticationException ex, WebRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("error", "Authentication Failed");
        response.put("message", ex.getMessage() != null ? ex.getMessage() : "Identifiants invalides");
        response.put("userMessage", "Votre session a expiré. Veuillez vous reconnecter.");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> userAlreadyExistsException(UserAlreadyExistsException ex, WebRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("error", "User Already Exists");
        response.put("message", ex.getMessage());
        response.put("userMessage", "Un utilisateur avec ces informations existe déjà.");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> userNotFoundException(UserNotFoundException ex, WebRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("error", "User Not Found");
        response.put("message", ex.getMessage());
        response.put("userMessage", "Utilisateur non trouvé.");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<Map<String, Object>> fileStorageException(FileStorageException ex, WebRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "File Storage Error");
        response.put("message", ex.getMessage());
        response.put("userMessage", "Erreur lors du stockage des fichiers. Veuillez réessayer.");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> responseStatusException(ResponseStatusException ex, WebRequest request) {
        System.err.println("⚠️ GlobalExceptionHandler - ResponseStatusException: " + ex.getMessage());

        HttpStatus httpStatus = HttpStatus.valueOf(ex.getStatusCode().value());

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", ex.getStatusCode().value());
        response.put("error", httpStatus.getReasonPhrase());
        response.put("message", ex.getReason());
        response.put("path", request.getDescription(false).replace("uri=", ""));

        if (ex.getReason() != null && ex.getReason().contains("Plainte non trouvée")) {
            String complaintId = extractComplaintId(ex.getReason());
            response.put("userMessage", String.format(
                    "Aucune plainte trouvée avec l'ID %s. Vérifiez l'ID et réessayez.",
                    complaintId
            ));
            response.put("status", HttpStatus.NOT_FOUND.value());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        response.put("userMessage", "Une erreur s'est produite. Veuillez réessayer.");
        return new ResponseEntity<>(response, httpStatus);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> runtimeException(RuntimeException ex, WebRequest request) {
        System.err.println("❌ GlobalExceptionHandler - RuntimeException: " + ex.getMessage());
        ex.printStackTrace();

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Runtime Error");
        response.put("message", ex.getMessage());
        response.put("path", request.getDescription(false).replace("uri=", ""));

        if (ex.getMessage() != null && ex.getMessage().contains("plainte")) {
            response.put("userMessage", "Erreur lors de la recherche de la plainte. Veuillez réessayer.");
        } else {
            response.put("userMessage", "Une erreur temporaire s'est produite. Veuillez réessayer dans quelques instants.");
        }

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> globalExceptionHandler(Exception ex, WebRequest request) {
        System.err.println("🔥 GlobalExceptionHandler - Exception: " + ex.getMessage());
        ex.printStackTrace();

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", new Date());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("error", "Internal Server Error");
        response.put("message", "Une erreur interne s'est produite");
        response.put("userMessage", "Une erreur temporaire s'est produite. Veuillez réessayer dans quelques instants.");
        response.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String extractComplaintId(String message) {
        if (message == null) return "spécifié";

        Pattern pattern = Pattern.compile("#\\d{4}-\\d{3}");
        Matcher matcher = pattern.matcher(message);

        if (matcher.find()) {
            return matcher.group();
        }

        return "spécifié";
    }
}