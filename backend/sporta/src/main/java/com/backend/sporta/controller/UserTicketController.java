package com.backend.sporta.controller;

import com.backend.sporta.dto.TicketSessionResponse;
import com.backend.sporta.dto.UserTicketResponse;
import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.service.UserTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class UserTicketController {

    @Autowired
    private UserTicketService userTicketService;

    /**
     * GET /api/v1/ticket-sessions
     * Lấy danh sách ca xé vé khả dụng với bộ lọc
     */
    @GetMapping("/ticket-sessions")
    public ResponseEntity<List<TicketSessionResponse>> getAvailableSessions(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Integer radiusKm,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) SportLevel sportLevel,
            @RequestParam(required = false) String keyword) {
        List<TicketSessionResponse> response = userTicketService.getAvailableSessions(lat, lng, radiusKm, timeSlot, sportLevel, keyword);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/ticket-sessions/{id}
     * Chi tiết ca xé vé
     */
    @GetMapping("/ticket-sessions/{id}")
    public ResponseEntity<TicketSessionResponse> getSessionDetail(@PathVariable UUID id) {
        TicketSessionResponse response = userTicketService.getSessionDetail(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ticket-sessions/{id}/purchase
     * Đặt mua vé xé (hỗ trợ mua 1 hoặc nhiều slot cùng lúc cho bạn bè)
     */
    @PostMapping("/ticket-sessions/{id}/purchase")
    public ResponseEntity<UserTicketResponse> purchaseTicket(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "1") int quantity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserTicketResponse response = userTicketService.purchaseTicket(id, email, quantity);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/user/tickets
     * Danh sách vé của tôi (My Tickets)
     */
    @GetMapping("/user/tickets")
    public ResponseEntity<List<UserTicketResponse>> getMyTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<UserTicketResponse> response = userTicketService.getUserTickets(email);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/user/tickets/{id}
     * Chi tiết mã QR và thông tin vé điện tử
     */
    @GetMapping("/user/tickets/{id}")
    public ResponseEntity<UserTicketResponse> getTicketDetail(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserTicketResponse response = userTicketService.getTicketDetail(id, email);
        return ResponseEntity.ok(response);
    }
}
