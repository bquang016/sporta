package com.backend.sporta.controller;

import com.backend.sporta.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
@CrossOrigin(origins = "*")
public class ImageUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false, defaultValue = "general") String type) {

        String folder;
        switch (type.toLowerCase()) {
            case "avatar":
                folder = "avatars";
                break;
            case "court_cover":
                folder = "courts/covers";
                break;
            case "court_detail":
                folder = "courts/details";
                break;
            default:
                folder = "general";
                break;
        }

        String imageUrl = fileStorageService.uploadFile(file, folder);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @GetMapping("/presigned-url")
    public ResponseEntity<?> getPresignedUrl(
            @RequestParam(value = "type", required = false, defaultValue = "general") String type,
            @RequestParam(value = "extension", required = false, defaultValue = ".webp") String extension,
            @RequestParam(value = "contentType", required = false, defaultValue = "image/webp") String contentType) {
        
        String folder;
        switch (type.toLowerCase()) {
            case "avatar":
                folder = "avatars";
                break;
            case "court_cover":
                folder = "courts/covers";
                break;
            case "court_detail":
                folder = "courts/details";
                break;
            case "post":
                folder = "posts";
                break;
            default:
                folder = "general";
                break;
        }

        Map<String, String> urls = fileStorageService.generatePresignedUrl(folder, extension, contentType);
        return ResponseEntity.ok(urls);
    }
}
