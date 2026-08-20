package com.backend.sporta.dto;

import com.backend.sporta.enums.SupportTicketStatus;
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
public class SupportTicketResponse {
    private UUID id;
    private String ticketCode;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String ticketType;
    private String bookingCode;
    private String title;
    private String description;
    private String imageUrl;
    private SupportTicketStatus status;
    private String adminNote;
    private String processedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
}
