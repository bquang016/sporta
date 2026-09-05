package com.backend.sporta.controller;

import com.backend.sporta.dto.PurchaseTicketRequest;
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
     * Đặt mua vé xé (hỗ trợ mua 1 hoặc nhiều slot cùng lúc, chọn phương thức thanh toán, áp dụng voucher)
     */
    @PostMapping("/ticket-sessions/{id}/purchase")
    public ResponseEntity<UserTicketResponse> purchaseTicket(
            @PathVariable UUID id,
            @RequestBody(required = false) PurchaseTicketRequest request,
            @RequestParam(required = false) Integer quantity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        PurchaseTicketRequest finalRequest = request;
        if (finalRequest == null) {
            finalRequest = PurchaseTicketRequest.builder()
                    .quantity(quantity != null ? quantity : 1)
                    .paymentMethod("payos")
                    .build();
        } else if (quantity != null && finalRequest.getQuantity() <= 1) {
            finalRequest.setQuantity(quantity);
        }
        
        UserTicketResponse response = userTicketService.purchaseTicket(id, email, finalRequest);
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

    /**
     * GET /api/v1/ticket-sessions/{id}/participants
     * Danh sách người tham gia ca xé vé
     */
    @GetMapping("/ticket-sessions/{id}/participants")
    public ResponseEntity<List<UserTicketResponse>> getParticipants(@PathVariable UUID id) {
        List<UserTicketResponse> response = userTicketService.getParticipants(id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ticket-sessions/{id}/assign-team
     * Phân đội cho người chơi trong ca xé vé (Captain hoặc chủ vé)
     */
    @PostMapping("/ticket-sessions/{id}/assign-team")
    public ResponseEntity<UserTicketResponse> assignTeam(
            @PathVariable UUID id,
            @RequestBody com.backend.sporta.dto.AssignTeamRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserTicketResponse response = userTicketService.assignTeam(id, request, email);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ticket-sessions/{id}/declare-score
     * Trưởng ca (Captain) khai báo tỷ số trận đấu
     */
    @PostMapping("/ticket-sessions/{id}/declare-score")
    public ResponseEntity<TicketSessionResponse> declareScore(
            @PathVariable UUID id,
            @RequestBody com.backend.sporta.dto.DeclareScoreRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        TicketSessionResponse response = userTicketService.declareScore(id, request, email);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ticket-sessions/{id}/confirm-score
     * Người chơi xác nhận tỷ số trận đấu
     */
    @PostMapping("/ticket-sessions/{id}/confirm-score")
    public ResponseEntity<TicketSessionResponse> confirmTicketScore(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        TicketSessionResponse response = userTicketService.confirmTicketScore(id, email);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ticket-sessions/{id}/dispute
     * Khiếu nại tỷ số trận đấu trong ca xé vé
     */
    @PostMapping("/ticket-sessions/{id}/dispute")
    public ResponseEntity<TicketSessionResponse> flagDispute(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        TicketSessionResponse response = userTicketService.flagDispute(id, reason, email);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/ticket-sessions/dev/users
     * [DEV TEST ONLY] Lấy danh sách người dùng để phân đội ca xé vé
     */
    @GetMapping("/ticket-sessions/dev/users")
    public ResponseEntity<List<com.backend.sporta.dto.DevUserSummaryDto>> getDevUsers(
            @RequestParam(required = false) String keyword) {
        List<com.backend.sporta.dto.DevUserSummaryDto> response = userTicketService.getDevUsers(keyword);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/ticket-sessions/dev/{id}/force-finish
     * [DEV TEST ONLY] Thiết lập đội hình, nhập tỷ số tự do và kết thúc tính Elo ngay lập tức
     */
    @PostMapping("/ticket-sessions/dev/{id}/force-finish")
    public ResponseEntity<TicketSessionResponse> devForceFinishXeVe(
            @PathVariable UUID id,
            @RequestBody com.backend.sporta.dto.DevForceFinishXeVeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        TicketSessionResponse response = userTicketService.devForceFinishXeVe(id, request, email);
        return ResponseEntity.ok(response);
    }
}
