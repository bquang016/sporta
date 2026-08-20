package com.backend.sporta.dto;

import com.backend.sporta.enums.SupportTicketStatus;
import lombok.Data;

@Data
public class ProcessSupportTicketRequest {
    private SupportTicketStatus status; // APPROVED or REJECTED
    private String adminNote;
}
