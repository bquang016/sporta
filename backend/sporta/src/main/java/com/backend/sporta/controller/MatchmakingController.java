package com.backend.sporta.controller;

import com.backend.sporta.dto.*;
import com.backend.sporta.enums.MatchType;
import com.backend.sporta.service.MatchmakingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matchmaking")
@CrossOrigin(origins = "*")
public class MatchmakingController {

    @Autowired
    private MatchmakingService matchmakingService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<MatchRoomResponse>> getRooms(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) MatchType matchType,
            @RequestParam(required = false) String timeFilter,
            @RequestParam(required = false) String levelFilter,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(matchmakingService.getRooms(sportId, matchType, timeFilter, levelFilter, sort, getCurrentUserEmail()));
    }

    @PostMapping("/rooms")
    public ResponseEntity<MatchRoomResponse> createRoom(@Valid @RequestBody CreateMatchRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchmakingService.createRoom(request, getCurrentUserEmail()));
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<MatchRoomResponse> getRoomDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(matchmakingService.getRoomDetail(id, getCurrentUserEmail()));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<MatchRoomResponse> updateRoom(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMatchRoomRequest request) {
        return ResponseEntity.ok(matchmakingService.updateRoom(id, request, getCurrentUserEmail()));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> cancelRoom(@PathVariable UUID id) {
        matchmakingService.cancelRoom(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rooms/{id}/join-requests")
    public ResponseEntity<JoinRequestResponse> createJoinRequest(
            @PathVariable UUID id,
            @Valid @RequestBody CreateJoinRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchmakingService.createJoinRequest(id, request, getCurrentUserEmail()));
    }

    @DeleteMapping("/join-requests/{id}")
    public ResponseEntity<Void> withdrawJoinRequest(@PathVariable UUID id) {
        matchmakingService.withdrawJoinRequest(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join-requests/{id}/reject")
    public ResponseEntity<Void> rejectJoinRequest(@PathVariable UUID id) {
        matchmakingService.rejectJoinRequest(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join-requests/{id}/accept")
    public ResponseEntity<MatchRoomResponse> acceptJoinRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(matchmakingService.acceptJoinRequest(id, getCurrentUserEmail()));
    }

    @PostMapping("/matches/{matchId}/score")
    public ResponseEntity<MatchRoomResponse> submitScore(
            @PathVariable UUID matchId,
            @Valid @RequestBody SubmitScoreRequest request) {
        return ResponseEntity.ok(matchmakingService.submitScore(matchId, request, getCurrentUserEmail()));
    }

    @PostMapping("/matches/{matchId}/confirm-score")
    public ResponseEntity<MatchRoomResponse> confirmScore(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchmakingService.confirmScore(matchId, getCurrentUserEmail()));
    }

    @PostMapping("/matches/{matchId}/disagree-score")
    public ResponseEntity<MatchRoomResponse> disagreeScore(
            @PathVariable UUID matchId,
            @Valid @RequestBody OpenDisputeRequest request) {
        return ResponseEntity.ok(matchmakingService.disagreeScore(matchId, request, getCurrentUserEmail()));
    }

    @PostMapping("/matches/{matchId}/propose-draw")
    public ResponseEntity<MatchRoomResponse> proposeDraw(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchmakingService.proposeDraw(matchId, getCurrentUserEmail()));
    }

    @PostMapping("/matches/{matchId}/accept-draw")
    public ResponseEntity<MatchRoomResponse> acceptDraw(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchmakingService.acceptDraw(matchId, getCurrentUserEmail()));
    }

    @PostMapping("/matches/{matchId}/dispute")
    public ResponseEntity<Void> openDispute(
            @PathVariable UUID matchId,
            @Valid @RequestBody OpenDisputeRequest request) {
        matchmakingService.openDispute(matchId, request, getCurrentUserEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/matches/{matchId}/preview-ranking")
    public ResponseEntity<RankingPreviewResponse> previewRanking(
            @PathVariable UUID matchId,
            @RequestParam String hostScore,
            @RequestParam String guestScore,
            @RequestParam(required = false) String rawScoreDetails) {
        return ResponseEntity.ok(matchmakingService.previewRanking(matchId, hostScore, guestScore, rawScoreDetails));
    }
}
