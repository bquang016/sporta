package com.backend.sporta.controller;

import com.backend.sporta.dto.*;
import com.backend.sporta.service.ClubMatchHistoryService;
import com.backend.sporta.service.ClubMemberService;
import com.backend.sporta.service.ClubPollService;
import com.backend.sporta.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/clubs")
@CrossOrigin(origins = "*")
public class ClubController {

    @Autowired
    private ClubService clubService;

    @Autowired
    private ClubMemberService clubMemberService;

    @Autowired
    private ClubPollService clubPollService;

    @Autowired
    private ClubMatchHistoryService clubMatchHistoryService;
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // 1. Club Management
    @GetMapping
    public ResponseEntity<List<ClubResponse>> getAvailableClubs(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(clubService.getAvailableClubs(sportId, query, getCurrentUserEmail()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClubResponse>> getJoinedClubs(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(clubService.getJoinedClubs(sportId, query, getCurrentUserEmail()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponse> getClubById(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubById(id, getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<ClubResponse> createClub(@Valid @RequestBody ClubCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clubService.createClub(request, getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubResponse> updateClub(
            @PathVariable Long id,
            @Valid @RequestBody ClubUpdateRequest request) {
        return ResponseEntity.ok(clubService.updateClub(id, request, getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    // 2. Club Membership
    @GetMapping("/{id}/members")
    public ResponseEntity<List<ClubMemberResponse>> getClubMembers(@PathVariable Long id) {
        return ResponseEntity.ok(clubMemberService.getClubMembers(id, getCurrentUserEmail()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ClubMemberResponse> joinClub(@PathVariable Long id) {
        return ResponseEntity.ok(clubMemberService.joinClub(id, getCurrentUserEmail()));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveClub(@PathVariable Long id) {
        clubMemberService.leaveClub(id, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}/approve")
    public ResponseEntity<ClubMemberResponse> approveMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(clubMemberService.approveMember(id, userId, getCurrentUserEmail()));
    }

    @PostMapping("/{id}/members/{userId}/reject")
    public ResponseEntity<ClubMemberResponse> rejectMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(clubMemberService.rejectMember(id, userId, getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        clubMemberService.removeMember(id, userId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}/transfer")
    public ResponseEntity<Void> transferLeadership(
            @PathVariable Long id,
            @PathVariable Long userId) {
        clubMemberService.transferLeadership(id, userId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}/assign-subleader")
    public ResponseEntity<Void> assignSubLeader(
            @PathVariable Long id,
            @PathVariable Long userId) {
        clubMemberService.assignSubLeader(id, userId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members/{userId}/demote-subleader")
    public ResponseEntity<Void> demoteSubLeader(
            @PathVariable Long id,
            @PathVariable Long userId) {
        clubMemberService.demoteSubLeader(id, userId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    // 3. Club Polls
    @GetMapping("/{id}/polls/active")
    public ResponseEntity<ClubPollResponse> getActivePoll(@PathVariable Long id) {
        return ResponseEntity.ok(clubPollService.getActivePoll(id, getCurrentUserEmail()));
    }

    @PostMapping("/{id}/polls")
    public ResponseEntity<ClubPollResponse> createPoll(
            @PathVariable Long id,
            @Valid @RequestBody ClubPollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clubPollService.createPoll(id, request, getCurrentUserEmail()));
    }

    @PostMapping("/polls/{pollId}/vote")
    public ResponseEntity<ClubPollResponse> vote(
            @PathVariable Long pollId,
            @RequestParam String option) {
        return ResponseEntity.ok(clubPollService.vote(pollId, option, getCurrentUserEmail()));
    }

    @PostMapping("/polls/{pollId}/close")
    public ResponseEntity<ClubPollResponse> closePoll(@PathVariable Long pollId) {
        return ResponseEntity.ok(clubPollService.closePoll(pollId, getCurrentUserEmail()));
    }

    @DeleteMapping("/polls/{pollId}")
    public ResponseEntity<Void> deletePoll(@PathVariable Long pollId) {
        clubPollService.deletePoll(pollId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    // 4. Match History
    @GetMapping("/{id}/matches")
    public ResponseEntity<List<ClubMatchResponse>> getMatches(@PathVariable Long id) {
        return ResponseEntity.ok(clubMatchHistoryService.getMatches(id, getCurrentUserEmail()));
    }

    @PostMapping("/{id}/matches")
    public ResponseEntity<ClubMatchResponse> addMatch(
            @PathVariable Long id,
            @Valid @RequestBody ClubMatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clubMatchHistoryService.addMatch(id, request, getCurrentUserEmail()));
    }
}
