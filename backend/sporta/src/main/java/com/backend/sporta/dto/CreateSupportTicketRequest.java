package com.backend.sporta.dto;

import lombok.Data;

@Data
public class CreateSupportTicketRequest {
    private String ticketType;
    private String bookingCode;
    private String title;
    private String description;
    private String imageUrl;
}
