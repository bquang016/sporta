package com.backend.sporta.service;

import com.backend.sporta.dto.CreateSupportTicketRequest;
import com.backend.sporta.dto.ProcessSupportTicketRequest;
import com.backend.sporta.dto.SupportTicketResponse;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.SupportTicketStatus;

import java.util.List;
import java.util.UUID;

import com.backend.sporta.dto.RespondSupportTicketRequest;

public interface SupportTicketService {
    SupportTicketResponse createTicket(User user, CreateSupportTicketRequest request);
    List<SupportTicketResponse> getUserTickets(Long userId);
    List<SupportTicketResponse> getAllTickets(SupportTicketStatus status, String search);
    SupportTicketResponse processTicket(UUID ticketId, ProcessSupportTicketRequest request, String adminEmail);
    SupportTicketResponse confirmResolvedTicket(UUID ticketId, User user);
    SupportTicketResponse reopenTicket(UUID ticketId, User user, String reason);
    SupportTicketResponse cancelTicket(UUID ticketId, User user);
    SupportTicketResponse respondToTicket(UUID ticketId, User user, RespondSupportTicketRequest request);
}
