package com.backend.sporta.controller;

import com.backend.sporta.dto.matchmaking.*;
import com.backend.sporta.service.MatchmakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    @PostMapping("/rooms")
    public ResponseEntity<MatchRoomDTO> createMatchRoom(
            @RequestBody CreateMatchRoomRequest req,
            @RequestParam Long userId) {
        return ResponseEntity.ok(matchmakingService.createMatchRoom(req, userId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<MatchRoomDTO>> getOpenMatchRooms() {
        return ResponseEntity.ok(matchmakingService.getOpenMatchRooms());
    }

    @GetMapping("/used-booking-ids")
    public ResponseEntity<List<java.util.UUID>> getUsedBookingIds() {
        return ResponseEntity.ok(matchmakingService.getUsedBookingIds());
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<MatchRoomDTO> getMatchRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(matchmakingService.getMatchRoomById(id));
    }

    @PostMapping("/rooms/{id}/apply")
    public ResponseEntity<MatchApplicationDTO> applyToMatchRoom(
            @PathVariable Long id,
            @RequestParam Long clubId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(matchmakingService.applyToMatchRoom(id, clubId, userId));
    }

    @GetMapping("/rooms/{id}/applications")
    public ResponseEntity<List<MatchApplicationDTO>> getApplicationsForRoom(@PathVariable Long id) {
        return ResponseEntity.ok(matchmakingService.getApplicationsForRoom(id));
    }

    @PostMapping("/rooms/{id}/accept")
    public ResponseEntity<MatchRoomDTO> acceptApplication(
            @PathVariable Long id,
            @RequestParam Long applicationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(matchmakingService.acceptApplication(id, applicationId, userId));
    }

    @PostMapping("/rooms/{id}/select-venue")
    public ResponseEntity<MatchRoomDTO> selectVenue(
            @PathVariable Long id,
            @RequestBody SelectVenueRequest req,
            @RequestParam Long userId) {
        return ResponseEntity.ok(matchmakingService.selectVenue(id, req, userId));
    }

    @PostMapping("/rooms/{id}/cancel")
    public ResponseEntity<MatchRoomDTO> cancelMatchRoom(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(matchmakingService.cancelMatchRoom(id, userId));
    }

    @PostMapping("/rooms/{id}/poll")
    public ResponseEntity<MatchPollDTO> voteInternalPoll(
            @PathVariable Long id,
            @RequestParam Long clubId,
            @RequestParam Long userId,
            @RequestParam boolean isAttending) {
        return ResponseEntity.ok(matchmakingService.voteInternalPoll(id, clubId, userId, isAttending));
    }

    @PostMapping("/rooms/{id}/report")
    public ResponseEntity<MatchRoomDTO> reportMatchResult(
            @PathVariable Long id,
            @RequestBody ReportMatchResultRequest req,
            @RequestParam Long userId) {
        req.setMatchRoomId(id);
        return ResponseEntity.ok(matchmakingService.reportMatchResult(req, userId));
    }
}
