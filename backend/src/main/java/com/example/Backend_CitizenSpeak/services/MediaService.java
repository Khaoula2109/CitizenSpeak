package com.example.Backend_CitizenSpeak.services;

import com.example.Backend_CitizenSpeak.exceptions.FileStorageException;
import com.example.Backend_CitizenSpeak.exceptions.ResourceNotFoundException;
import com.example.Backend_CitizenSpeak.models.Complaint;
import com.example.Backend_CitizenSpeak.models.Media;
import com.example.Backend_CitizenSpeak.repositories.MediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final Path fileStorageLocation;

    @Autowired
    public MediaService(MediaRepository mediaRepository,
                        @Value("${file.upload-dir:uploads}") String uploadDir) {
        this.mediaRepository = mediaRepository;

        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("Media storage directory created at: " + this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored", ex);
        }
    }

    public Media getMediaById(String id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + id));
    }

    public List<Media> saveMediaFiles(List<MultipartFile> files, Complaint complaint) {
        List<Media> savedMedia = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                System.out.println("Processing file: " + file.getOriginalFilename() +
                        ", size: " + file.getSize() +
                        ", content type: " + file.getContentType());

                String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String filename = UUID.randomUUID().toString() + fileExtension;

                System.out.println("Saving file as: " + filename);

                Path targetLocation = this.fileStorageLocation.resolve(filename);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                System.out.println("File saved to: " + targetLocation.toString());

                Media media = new Media();
                media.setMediaFile(filename);
                media.setComplaintId(complaint.getComplaintId());
                media.setCaptureDate(new Date());
                Media savedMediaEntity = mediaRepository.save(media);

                savedMedia.add(savedMediaEntity);
                System.out.println("Media entity saved with ID: " + savedMediaEntity.getMediaId());

            } catch (IOException ex) {
                System.err.println("Failed to store file: " + ex.getMessage());
                ex.printStackTrace();
                throw new FileStorageException("Could not store file. Please try again!", ex);
            }
        }

        return savedMedia;
    }

    public Resource loadFileAsResource(String filename) {
        try {


            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new ResourceNotFoundException("Accès non autorisé au fichier: " + filename);
            }
            Resource resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + filename, ex);
        }
    }

    public byte[] getMediaContent(String id) throws IOException {
        Media media = getMediaById(id);
        Path filePath = this.fileStorageLocation.resolve(media.getMediaFile()).normalize();

        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Physical file not found: " + filePath);
        }

        return Files.readAllBytes(filePath);
    }
    public void deleteMedia(String id) {
        Media media = getMediaById(id);

        try {
            Path filePath = this.fileStorageLocation.resolve(media.getMediaFile()).normalize();
            Files.deleteIfExists(filePath);
            System.out.println("Deleted file: " + filePath);
        } catch (IOException e) {
            System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
        }

        mediaRepository.delete(media);
    }

    public List<Media> getMediaByComplaintId(String complaintId) {
        return mediaRepository.findByComplaintId(complaintId);
    }
}