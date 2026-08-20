package com.backend.sporta.service;

import com.backend.sporta.dto.CreateSupportTicketRequest;
import com.backend.sporta.dto.ProcessSupportTicketRequest;
import com.backend.sporta.dto.RespondSupportTicketRequest;
import com.backend.sporta.dto.SupportTicketResponse;
import com.backend.sporta.entity.SupportTicket;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.SupportTicketStatus;
import com.backend.sporta.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    @Override
    @Transactional
    public SupportTicketResponse createTicket(User user, CreateSupportTicketRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .ticketType(request.getTicketType())
                .bookingCode(request.getBookingCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(SupportTicketStatus.NEW)
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getUserTickets(Long userId) {
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getAllTickets(SupportTicketStatus status, String search) {
        List<SupportTicket> list;
        if (status != null) {
            list = supportTicketRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            list = supportTicketRepository.findAllByOrderByCreatedAtDesc();
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerQuery = search.trim().toLowerCase();
            list = list.stream().filter(t ->
                    (t.getTicketCode() != null && t.getTicketCode().toLowerCase().contains(lowerQuery)) ||
                    (t.getTitle() != null && t.getTitle().toLowerCase().contains(lowerQuery)) ||
                    (t.getBookingCode() != null && t.getBookingCode().toLowerCase().contains(lowerQuery)) ||
                    (t.getUser() != null && t.getUser().getFullName() != null && t.getUser().getFullName().toLowerCase().contains(lowerQuery)) ||
                    (t.getUser() != null && t.getUser().getEmail() != null && t.getUser().getEmail().toLowerCase().contains(lowerQuery))
            ).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportTicketResponse processTicket(UUID ticketId, ProcessSupportTicketRequest request, String adminEmail) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hỗ trợ với ID: " + ticketId));

        if (request.getStatus() != null) {
            ticket.setStatus(request.getStatus());
            if (request.getStatus() == SupportTicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
            if (request.getStatus() == SupportTicketStatus.CLOSED && ticket.getClosedAt() == null) {
                ticket.setClosedAt(LocalDateTime.now());
            }
        }

        if (request.getAdminNote() != null) {
            ticket.setAdminNote(request.getAdminNote());
        }
        ticket.setProcessedBy(adminEmail != null ? adminEmail : "Admin");

        SupportTicket updated = supportTicketRepository.save(ticket);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public SupportTicketResponse confirmResolvedTicket(UUID ticketId, User user) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hỗ trợ với ID: " + ticketId));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên yêu cầu hỗ trợ này.");
        }

        ticket.setStatus(SupportTicketStatus.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());
        String currentNote = ticket.getAdminNote() != null ? ticket.getAdminNote() + "\n" : "";
        ticket.setAdminNote(currentNote + "[User]: Đã xác nhận hài lòng và đóng ticket.");

        SupportTicket updated = supportTicketRepository.save(ticket);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public SupportTicketResponse reopenTicket(UUID ticketId, User user, String reason) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hỗ trợ với ID: " + ticketId));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên yêu cầu hỗ trợ này.");
        }

        ticket.setStatus(SupportTicketStatus.IN_PROGRESS);
        ticket.setResolvedAt(null);
        String currentNote = ticket.getAdminNote() != null ? ticket.getAdminNote() + "\n" : "";
        String userReason = (reason != null && !reason.trim().isEmpty()) ? ": " + reason.trim() : ".";
        ticket.setAdminNote(currentNote + "[User]: Yêu cầu mở lại ticket vì chưa hài lòng" + userReason);

        SupportTicket updated = supportTicketRepository.save(ticket);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public SupportTicketResponse cancelTicket(UUID ticketId, User user) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hỗ trợ với ID: " + ticketId));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên yêu cầu hỗ trợ này.");
        }

        ticket.setStatus(SupportTicketStatus.REJECTED);
        ticket.setAdminNote("[User]: Đã chủ động hủy yêu cầu hỗ trợ này.");

        SupportTicket updated = supportTicketRepository.save(ticket);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public SupportTicketResponse respondToTicket(UUID ticketId, User user, RespondSupportTicketRequest request) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hỗ trợ với ID: " + ticketId));

        if (!ticket.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên yêu cầu hỗ trợ này.");
        }

        // Auto transition status back to IN_PROGRESS (Đang xử lý)
        ticket.setStatus(SupportTicketStatus.IN_PROGRESS);

        // Append user response text to adminNote
        if (request != null && request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
            String currentNote = ticket.getAdminNote() != null ? ticket.getAdminNote() + "\n" : "";
            ticket.setAdminNote(currentNote + "[User Phản Hồi]: " + request.getMessage().trim());
        }

        // Append new proof images
        if (request != null && request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            String currentImages = ticket.getImageUrl();
            if (currentImages != null && !currentImages.trim().isEmpty()) {
                ticket.setImageUrl(currentImages.trim() + "," + request.getImageUrl().trim());
            } else {
                ticket.setImageUrl(request.getImageUrl().trim());
            }
        }

        SupportTicket updated = supportTicketRepository.save(ticket);
        return mapToResponse(updated);
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        User user = ticket.getUser();
        SupportTicketStatus status = ticket.getStatus();
        if (status == SupportTicketStatus.PENDING) {
            status = SupportTicketStatus.IN_PROGRESS;
        } else if (status == SupportTicketStatus.APPROVED) {
            status = SupportTicketStatus.RESOLVED;
        }

        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getFullName() : "N/A")
                .userEmail(user != null ? user.getEmail() : "N/A")
                .userPhone(user != null ? user.getPhoneNumber() : null)
                .ticketType(ticket.getTicketType())
                .bookingCode(ticket.getBookingCode())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .imageUrl(ticket.getImageUrl())
                .status(status)
                .adminNote(ticket.getAdminNote())
                .processedBy(ticket.getProcessedBy())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .build();
    }
}
