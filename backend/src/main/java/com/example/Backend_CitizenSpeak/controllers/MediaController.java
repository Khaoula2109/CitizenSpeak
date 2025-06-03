package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Media;
import com.example.Backend_CitizenSpeak.services.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

    private final MediaService mediaService;
    private final Path fileStorageLocation;

    @Autowired
    public MediaController(MediaService mediaService,
                           @Value("${file.upload-dir:uploads}") String uploadDir) {
        this.mediaService = mediaService;
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> getMediaFile(@PathVariable String id) {
        try {
            com.example.Backend_CitizenSpeak.models.Media media = mediaService.getMediaById(id);
            String filename = media.getMediaFile();

            Resource resource = mediaService.loadFileAsResource(filename);

            String contentType = null;
            try {
                Path filePath = this.fileStorageLocation.resolve(filename).normalize();
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/filename/{filename:.+}")
    public ResponseEntity<Resource> getMediaByFilename(@PathVariable String filename) {
        try {
            System.out.println("=== GETTING FILE BY FILENAME ===");
            System.out.println("Requested filename: " + filename);

            Path filePath = fileStorageLocation.resolve(filename).normalize();
            System.out.println("Full file path: " + filePath);

            if (!Files.exists(filePath)) {
                System.out.println("ERROR: File not found at: " + filePath);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                System.out.println("ERROR: Resource not accessible");
                return ResponseEntity.notFound().build();
            }

            String contentType = null;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                contentType = "application/octet-stream";
            }

            if (contentType == null) {
                String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
                switch (extension) {
                    case "jpg":
                    case "jpeg":
                        contentType = "image/jpeg";
                        break;
                    case "png":
                        contentType = "image/png";
                        break;
                    case "gif":
                        contentType = "image/gif";
                        break;
                    case "webp":
                        contentType = "image/webp";
                        break;
                    default:
                        contentType = "application/octet-stream";
                }
            }

            System.out.println("SUCCESS: Returning file " + filename + " (" + contentType + ")");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, POST, PUT, DELETE, OPTIONS")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Authorization, Content-Type")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("ERROR in getMediaByFilename: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .build();
        }
    }

    @GetMapping("/file/{id}")
    @PreAuthorize("permitAll")
    public ResponseEntity<Resource> getMediaFile2(@PathVariable String id) {
        try {
            System.out.println("=== MEDIA FILE REQUEST BY ID ===");
            System.out.println("Requested media ID: " + id);

            Media media;
            try {
                media = mediaService.getMediaById(id);
            } catch (ResourceNotFoundException e) {
                System.out.println("ERROR: Media not found in database for ID: " + id);
                return ResponseEntity.notFound().build();
            }

            String filename = media.getMediaFile();
            System.out.println("Found media file: " + filename);

            return loadFileDirectly(filename);

        } catch (Exception e) {
            System.err.println("ERROR in getMediaFile2: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .build();
        }
    }
    @GetMapping("/{id}/info")
    public ResponseEntity<Media> getMediaInfo(@PathVariable String id) {
        try {
            Media media = mediaService.getMediaById(id);
            return ResponseEntity.ok(media);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Media not found"
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedia(@PathVariable String id) {
        try {
            mediaService.deleteMedia(id);
            return ResponseEntity.ok("Media deleted successfully");
        } catch (Exception e) {
            System.err.println("Error deleting media: " + e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error deleting media"
            );
        }
    }

    private ResponseEntity<Resource> loadFileDirectly(String filename) {
        try {
            Path filePath = fileStorageLocation.resolve(filename).normalize();

            if (!Files.exists(filePath)) {
                System.out.println("ERROR: File not found at: " + filePath);
                return ResponseEntity.notFound()
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound()
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
                switch (extension) {
                    case "jpg":
                    case "jpeg":
                        contentType = "image/jpeg";
                        break;
                    case "png":
                        contentType = "image/png";
                        break;
                    case "gif":
                        contentType = "image/gif";
                        break;
                    case "webp":
                        contentType = "image/webp";
                        break;
                    default:
                        contentType = "application/octet-stream";
                }
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, POST, PUT, DELETE, OPTIONS")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Authorization, Content-Type")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                    .body(resource);

        } catch (Exception e) {
            System.err.println("ERROR loading file directly: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .build();
        }
    }

    @RequestMapping(method = RequestMethod.OPTIONS, value = "/**")
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity.ok()
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, POST, PUT, DELETE, OPTIONS")
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Authorization, Content-Type, Accept")
                .header(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600")
                .build();
    }
}