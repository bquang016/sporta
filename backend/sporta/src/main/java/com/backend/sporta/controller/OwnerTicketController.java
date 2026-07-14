package com.backend.sporta.controller;

import com.backend.sporta.dto.*;
import com.backend.sporta.service.TicketSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner")
@CrossOrigin(origins = "*")
public class OwnerTicketController {

    @Autowired
    private TicketSessionService ticketSessionService;

    @GetMapping("/ticket-sessions/today")
    public ResponseEntity<List<TicketSessionResponse>> getTodayTicketSessions(
            @RequestParam("venueId") UUID venueId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TicketSessionResponse> response = ticketSessionService.getTodaySessions(venueId, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ticket-sessions")
    public ResponseEntity<TicketSessionResponse> createTicketSession(
            @Valid @RequestBody TicketSessionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        TicketSessionResponse response = ticketSessionService.createTicketSession(request, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tickets/check-in")
    public ResponseEntity<TicketCheckInResponse> checkInTicket(
            @Valid @RequestBody TicketCheckInRequest request) {
        TicketCheckInResponse response = ticketSessionService.checkInTicket(request.getToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ticket-sessions/{sessionId}/test-tickets")
    public ResponseEntity<List<TestTicketResponse>> getTestTickets(
            @PathVariable("sessionId") UUID sessionId) {
        List<TestTicketResponse> response = ticketSessionService.getTestTickets(sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ticket-sessions/{id}/cancel")
    public ResponseEntity<?> cancelTicketSession(@PathVariable("id") UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ticketSessionService.cancelTicketSession(id, email);
        return ResponseEntity.ok(java.util.Map.of("message", "Hủy ca xé vé thành công"));
    }
}
