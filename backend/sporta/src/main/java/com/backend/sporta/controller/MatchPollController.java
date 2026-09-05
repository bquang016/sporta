package com.backend.sporta.controller;

import com.backend.sporta.dto.CreateMatchPollRequest;
import com.backend.sporta.dto.MatchPollResponse;
import com.backend.sporta.dto.VotePollRequest;
import com.backend.sporta.service.MatchPollService;
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
public class MatchPollController {

    @Autowired
    private MatchPollService matchPollService;

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/{clubId}/match-polls")
    public ResponseEntity<MatchPollResponse> createPoll(
            @PathVariable Long clubId,
            @Valid @RequestBody CreateMatchPollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(matchPollService.createPoll(clubId, request, getCurrentUserEmail()));
    }

    @GetMapping("/{clubId}/match-polls")
    public ResponseEntity<List<MatchPollResponse>> getClubPolls(@PathVariable Long clubId) {
        return ResponseEntity.ok(matchPollService.getClubPolls(clubId, getCurrentUserEmail()));
    }

    @GetMapping("/match-polls/{pollId}")
    public ResponseEntity<MatchPollResponse> getPollDetail(@PathVariable Long pollId) {
        return ResponseEntity.ok(matchPollService.getPollDetail(pollId, getCurrentUserEmail()));
    }

    @PostMapping("/match-polls/{pollId}/vote")
    public ResponseEntity<MatchPollResponse> votePoll(
            @PathVariable Long pollId,
            @Valid @RequestBody VotePollRequest request) {
        return ResponseEntity.ok(matchPollService.votePoll(pollId, request, getCurrentUserEmail()));
    }

    @PostMapping("/match-polls/{pollId}/close")
    public ResponseEntity<MatchPollResponse> closePoll(@PathVariable Long pollId) {
        return ResponseEntity.ok(matchPollService.closePoll(pollId, getCurrentUserEmail()));
    }

    @PostMapping("/match-polls/{pollId}/split-teams")
    public ResponseEntity<MatchPollResponse> splitInternalTeams(@PathVariable Long pollId) {
        return ResponseEntity.ok(matchPollService.splitInternalTeams(pollId, getCurrentUserEmail()));
    }

    @PostMapping("/match-polls/{pollId}/form-gt")
    public ResponseEntity<MatchPollResponse> formMatchmakingLineup(@PathVariable Long pollId) {
        return ResponseEntity.ok(matchPollService.formMatchmakingLineup(pollId, getCurrentUserEmail()));
    }

    @DeleteMapping("/match-polls/{pollId}")
    public ResponseEntity<Void> deletePoll(@PathVariable Long pollId) {
        matchPollService.deletePoll(pollId, getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/match-polls/{pollId}/options")
    public ResponseEntity<MatchPollResponse> addCustomOption(
            @PathVariable Long pollId,
            @RequestBody Map<String, String> body) {
        String label = body.get("label");
        return ResponseEntity.ok(matchPollService.addCustomOption(pollId, label, getCurrentUserEmail()));
    }

    @PostMapping("/match-polls/{pollId}/dev-assign-votes")
    public ResponseEntity<MatchPollResponse> devAssignVotes(
            @PathVariable Long pollId,
            @RequestBody com.backend.sporta.dto.DevAssignVotesRequest request) {
        return ResponseEntity.ok(matchPollService.devAssignVotes(pollId, request, getCurrentUserEmail()));
    }
}
