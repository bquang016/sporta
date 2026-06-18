package com.backend.sporta.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private S3Client s3Client;

    @Value("${r2.bucket}")
    private String bucketName;

    @Value("${r2.public-url}")
    private String publicUrl;

    public String uploadFile(MultipartFile file, String folder) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String pathPrefix = folder;
        if (pathPrefix == null || pathPrefix.trim().isEmpty()) {
            pathPrefix = "general";
        }
        if (pathPrefix.endsWith("/")) {
            pathPrefix = pathPrefix.substring(0, pathPrefix.length() - 1);
        }

        String fileName = pathPrefix + "/" + UUID.randomUUID().toString() + extension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
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
}
