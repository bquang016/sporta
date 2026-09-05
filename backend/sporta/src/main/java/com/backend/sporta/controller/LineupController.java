package com.backend.sporta.controller;

import com.backend.sporta.dto.LineupResponse;
import com.backend.sporta.dto.SwapLineupMembersRequest;
import com.backend.sporta.enums.LineupType;
import com.backend.sporta.service.LineupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clubs")
@CrossOrigin(origins = "*")
public class LineupController {

    @Autowired
    private LineupService lineupService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/{clubId}/lineups")
    public ResponseEntity<LineupResponse> createLineup(
            @PathVariable Long clubId,
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        String typeStr = body.getOrDefault("lineupType", "MATCHMAKING");
        LineupType type = LineupType.valueOf(typeStr);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lineupService.createLineup(clubId, name, type, getCurrentUserEmail()));
    }

    @GetMapping("/{clubId}/lineups")
    public ResponseEntity<List<LineupResponse>> getClubLineups(@PathVariable Long clubId) {
        return ResponseEntity.ok(lineupService.getClubLineups(clubId, getCurrentUserEmail()));
    }

    @GetMapping("/{clubId}/lineups/available")
    public ResponseEntity<List<LineupResponse>> getAvailableLineups(
            @PathVariable Long clubId,
            @RequestParam(required = false) Long sportId) {
        return ResponseEntity.ok(lineupService.getAvailableLineupsForMatch(clubId, sportId, getCurrentUserEmail()));
    }

    @GetMapping("/lineups/{lineupId}")
    public ResponseEntity<LineupResponse> getLineupDetail(@PathVariable Long lineupId) {
        return ResponseEntity.ok(lineupService.getLineupDetail(lineupId, getCurrentUserEmail()));
    }

    @PostMapping("/lineups/{lineupId}/members/{userId}")
    public ResponseEntity<LineupResponse> addMember(
            @PathVariable Long lineupId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(lineupService.addMember(lineupId, userId, getCurrentUserEmail()));
    }

    @DeleteMapping("/lineups/{lineupId}/members/{userId}")
    public ResponseEntity<LineupResponse> removeMember(
            @PathVariable Long lineupId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(lineupService.removeMember(lineupId, userId, getCurrentUserEmail()));
    }

    @PostMapping("/lineups/swap")
    public ResponseEntity<Void> swapMembers(@Valid @RequestBody SwapLineupMembersRequest request) {
        lineupService.swapMembers(request, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/lineups/{lineupId}")
    public ResponseEntity<Void> disbandLineup(@PathVariable Long lineupId) {
        lineupService.disbandLineup(lineupId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}
