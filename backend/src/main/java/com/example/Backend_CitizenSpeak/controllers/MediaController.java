package com.example.Backend_CitizenSpeak.controllers;

import com.example.Backend_CitizenSpeak.services.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/media")
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
}