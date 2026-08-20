package com.backend.sporta.controller;

import com.backend.sporta.dto.CreateSupportTicketRequest;
import com.backend.sporta.dto.ProcessSupportTicketRequest;
import com.backend.sporta.dto.ReopenTicketRequest;
import com.backend.sporta.dto.RespondSupportTicketRequest;
import com.backend.sporta.dto.SupportTicketResponse;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.SupportTicketStatus;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;
    private final UserRepository userRepository;

    /**
     * POST /api/v1/support-tickets
     * Mobile User tạo yêu cầu hỗ trợ mới
     */
    @PostMapping("/api/v1/support-tickets")
    public ResponseEntity<SupportTicketResponse> createTicket(@RequestBody CreateSupportTicketRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng: " + email));

        SupportTicketResponse response = supportTicketService.createTicket(user, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/support-tickets/my
     * Mobile User lấy danh sách yêu cầu hỗ trợ của mình
     */
    @GetMapping("/api/v1/support-tickets/my")
    public ResponseEntity<List<SupportTicketResponse>> getMyTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng: " + email));

        List<SupportTicketResponse> response = supportTicketService.getUserTickets(user.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/support-tickets/{id}/confirm-resolved
     * Mobile User xác nhận ticket đã giải quyết (chuyển thành CLOSED)
     */
    @PostMapping("/api/v1/support-tickets/{id}/confirm-resolved")
    public ResponseEntity<SupportTicketResponse> confirmResolvedTicket(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng: " + email));

        SupportTicketResponse response = supportTicketService.confirmResolvedTicket(id, user);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/support-tickets/{id}/reopen
     * Mobile User yêu cầu mở lại ticket khi chưa hài lòng (chuyển thành IN_PROGRESS)
     */
    @PostMapping("/api/v1/support-tickets/{id}/reopen")
    public ResponseEntity<SupportTicketResponse> reopenTicket(
            @PathVariable UUID id,
            @RequestBody(required = false) ReopenTicketRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng: " + email));

        String reason = request != null ? request.getReason() : null;
        SupportTicketResponse response = supportTicketService.reopenTicket(id, user, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/support-tickets/{id}/cancel
     * Mobile User chủ động hủy yêu cầu hỗ trợ (chuyển thành REJECTED)
     */
    @PostMapping("/api/v1/support-tickets/{id}/cancel")
    public ResponseEntity<SupportTicketResponse> cancelTicket(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng: " + email));

        SupportTicketResponse response = supportTicketService.cancelTicket(id, user);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/support-tickets/{id}/reply
     * Mobile User gửi bổ sung thông tin/bằng chứng khi ticket đang PENDING_CUSTOMER
     */
    @PostMapping("/api/v1/support-tickets/{id}/reply")
    public ResponseEntity<SupportTicketResponse> replyTicket(
            @PathVariable UUID id,
            @RequestBody RespondSupportTicketRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng: " + email));

        SupportTicketResponse response = supportTicketService.respondToTicket(id, user, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/admin/support-tickets
     * Web Admin lấy tất cả danh sách yêu cầu hỗ trợ của người dùng
     */
    @GetMapping("/api/v1/admin/support-tickets")
    public ResponseEntity<List<SupportTicketResponse>> getAllTickets(
            @RequestParam(required = false) SupportTicketStatus status,
            @RequestParam(required = false) String search) {
        List<SupportTicketResponse> response = supportTicketService.getAllTickets(status, search);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/v1/admin/support-tickets/{id}/process
     * Web Admin xử lý chuyển đổi trạng thái ticket (NEW, IN_PROGRESS, PENDING_CUSTOMER, RESOLVED, CLOSED, REJECTED)
     */
    @PutMapping("/api/v1/admin/support-tickets/{id}/process")
    public ResponseEntity<SupportTicketResponse> processTicket(
            @PathVariable UUID id,
            @RequestBody ProcessSupportTicketRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        SupportTicketResponse response = supportTicketService.processTicket(id, request, adminEmail);
        return ResponseEntity.ok(response);
    }
}
