package com.backend.sporta.dto;

import com.backend.sporta.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueRevisionResponse {
    private UUID id;
    private UUID venueId;
    private String venueName;
    private String ownerEmail;
    private String pendingData; // JSON string containing new values
    private ApprovalStatus status;
    private LocalDateTime createdAt;
    
    // Khởi tạo thêm thông tin cũ để so sánh luôn trên Frontend (tiện cho Admin)
    private String oldName;
    private String oldLocation;
}
