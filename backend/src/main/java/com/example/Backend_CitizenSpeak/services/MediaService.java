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

    public List<Media> getMediaByComplaintId(String complaintId) {
        try {
            return mediaRepository.findByComplaintId(complaintId);
        } catch (Exception e) {
            System.err.println("Error retrieving media by complaint ID: " + e.getMessage());
            return new ArrayList<>();
        }
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
                media.setCaptureDate(new Date());

                try {
                    media.setComplaintId(complaint.getComplaintId());
                } catch (Exception e) {
                    System.out.println("ComplaintId not available, continuing without it");
                }

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

            try {
                if (!filePath.startsWith(this.fileStorageLocation)) {
                    throw new ResourceNotFoundException("Accès non autorisé au fichier: " + filename);
                }
            } catch (Exception e) {
                System.out.println("Security check not available, proceeding with file access");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + filename, ex);
        }
    }

    public byte[] getMediaContent(String id) throws IOException {
        try {
            Media media = getMediaById(id);
            Path filePath = this.fileStorageLocation.resolve(media.getMediaFile()).normalize();

            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("Physical file not found: " + filePath);
            }

            return Files.readAllBytes(filePath);
        } catch (Exception e) {
            System.err.println("Error reading media content: " + e.getMessage());
            throw new IOException("Could not read media content", e);
        }
    }

    public void deleteMedia(String id) {
        try {
            Media media = getMediaById(id);

            try {
                Path filePath = this.fileStorageLocation.resolve(media.getMediaFile()).normalize();
                Files.deleteIfExists(filePath);
                System.out.println("Deleted file: " + filePath);
            } catch (IOException e) {
                System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
            }

            mediaRepository.delete(media);
            System.out.println("Media entity deleted with ID: " + id);

        } catch (ResourceNotFoundException e) {
            System.err.println("Media not found for deletion: " + id);
            throw e;
        } catch (Exception e) {
            System.err.println("Error deleting media: " + e.getMessage());
            throw new RuntimeException("Error deleting media", e);
        }
    }

    public boolean existsById(String mediaId) {
        try {
            return mediaRepository.existsById(mediaId);
        } catch (Exception e) {
            return mediaRepository.findById(mediaId).isPresent();
        }
    }

    public List<Media> getAllMedia() {
        try {
            return mediaRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error retrieving all media: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public void deleteMediaByComplaintId(String complaintId) {
        try {
            List<Media> mediaList = getMediaByComplaintId(complaintId);
            for (Media media : mediaList) {
                deleteMedia(media.getMediaId());
            }
            System.out.println("Deleted " + mediaList.size() + " media files for complaint: " + complaintId);
        } catch (Exception e) {
            System.err.println("Error deleting media for complaint " + complaintId + ": " + e.getMessage());
        }
    }

    public String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return "";
    }

    public String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + extension;
    }

    public boolean isValidFileType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return extension.matches("\\.(jpg|jpeg|png|gif|webp|mp4|avi|mov)");
    }

    public long getFileSize(String mediaId) {
        try {
            Media media = getMediaById(mediaId);
            Path filePath = this.fileStorageLocation.resolve(media.getMediaFile()).normalize();

            if (Files.exists(filePath)) {
                return Files.size(filePath);
            }
            return 0;
        } catch (Exception e) {
            System.err.println("Error getting file size: " + e.getMessage());
            return 0;
        }
    }

    public String getContentType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();

        switch (extension) {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".webp":
                return "image/webp";
            case ".mp4":
                return "video/mp4";
            case ".avi":
                return "video/avi";
            case ".mov":
                return "video/quicktime";
            default:
                return "application/octet-stream";
        }
    }
}