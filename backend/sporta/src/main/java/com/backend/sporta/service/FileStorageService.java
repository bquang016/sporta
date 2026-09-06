package com.backend.sporta.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private S3Client s3Client;

    @Autowired
    private S3Presigner s3Presigner;

    @Value("${r2.bucket}")
    private String bucketName;

    @Value("${r2.public-url}")
    private String publicUrl;

    public String uploadFile(MultipartFile file, String folder) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            String ct = file.getContentType();
            if (ct != null) {
                if (ct.contains("webp")) extension = ".webp";
                else if (ct.contains("png")) extension = ".png";
                else if (ct.contains("jpeg") || ct.contains("jpg")) extension = ".jpg";
                else if (ct.contains("gif")) extension = ".gif";
            }
            if (extension.isEmpty()) {
                extension = ".webp";
            }
        }

        String pathPrefix = folder;
        if (pathPrefix == null || pathPrefix.trim().isEmpty()) {
            pathPrefix = "general";
        }
        if (pathPrefix.endsWith("/")) {
            pathPrefix = pathPrefix.substring(0, pathPrefix.length() - 1);
        }

        String fileName = pathPrefix + "/" + UUID.randomUUID().toString() + extension;
        String contentType = file.getContentType() != null ? file.getContentType() : "image/webp";

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String baseUrl = publicUrl;
            if (!baseUrl.endsWith("/")) {
                baseUrl = baseUrl + "/";
            }
            return baseUrl + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tải ảnh lên Cloudflare R2: " + e.getMessage(), e);
        }
    }

    public java.util.Map<String, String> generatePresignedUrl(String folder, String extension, String contentType) {
        String pathPrefix = folder;
        if (pathPrefix == null || pathPrefix.trim().isEmpty()) {
            pathPrefix = "general";
        }
        if (pathPrefix.endsWith("/")) {
            pathPrefix = pathPrefix.substring(0, pathPrefix.length() - 1);
        }

        String fileName = pathPrefix + "/" + UUID.randomUUID().toString() + extension;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        String baseUrl = publicUrl;
        if (!baseUrl.endsWith("/")) {
            baseUrl = baseUrl + "/";
        }
        String filePublicUrl = baseUrl + fileName;

        java.util.Map<String, String> result = new java.util.HashMap<>();
        result.put("presignedUrl", presignedRequest.url().toString());
        result.put("publicUrl", filePublicUrl);
        
        return result;
    }
}
