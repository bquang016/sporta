package com.backend.sporta.controller;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.service.matchmaking.CRPEngine;
import com.backend.sporta.service.matchmaking.ScoreAdapter;
import com.backend.sporta.service.matchmaking.ScoreAdapterRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/disputes")
@CrossOrigin(origins = "*")
public class AdminDisputeController {

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MatchRoomRepository matchRoomRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private CRPLedgerRepository crpLedgerRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CRPEngine crpEngine;

    @Autowired
    private ScoreAdapterRegistry scoreAdapterRegistry;

    @Autowired
    private MatchmakingConfig config;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User getCurrentAdminUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng admin", 404));
        if (user.getRole() != Role.ADMIN) {
            throw new CustomException("Quyền hạn Admin là bắt buộc", 403);
        }
        return user;
    }

    @GetMapping
    public ResponseEntity<List<Dispute>> getDisputes(@RequestParam(required = false) DisputeStatus status) {
        getCurrentAdminUser();
        if (status != null) {
            return ResponseEntity.ok(disputeRepository.findByStatus(status));
        }
        return ResponseEntity.ok(disputeRepository.findAll());
    }

    @Data
    public static class ResolveDisputeRequest {
        private String hostScore;
        private String guestScore;
        private String rawScoreDetails;
        private String resolutionNote;
    }

    @PostMapping("/{id}/resolve")
    @Transactional
    public ResponseEntity<Dispute> resolveDispute(
            @PathVariable UUID id,
            @RequestBody ResolveDisputeRequest request) {
        User admin = getCurrentAdminUser();
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy khiếu nại", 404));

        if (dispute.getStatus() == DisputeStatus.RESOLVED) {
            throw new CustomException("Khiếu nại này đã được xử lý", 400);
        }

        Match match = dispute.getMatch();
        Sport sport = match.getHostClub().getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        ScoreAdapter.ValidationResult val = adapter.validate(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());
        if (!val.isValid()) {
            throw new CustomException("Tỷ số phân xử không hợp lệ: " + val.getErrorMessage(), 400);
        }

        NormalizedOutcome outcome = adapter.normalize(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());
        double gFactor = adapter.calculateG(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
        long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                match.getHostClub().getId(), match.getGuestClub().getId(), MatchType.RANKED, sevenDaysAgo
        );

        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, outcome, gFactor, (int) recentRankedMatches);

        String scoreText = adapter.getCanonicalScoreText(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());
        String expJson = "";
        try {
            expJson = objectMapper.writeValueAsString(crpRes.getExplanation());
        } catch (Exception e) {
            expJson = "[]";
        }

        com.backend.sporta.entity.MatchResult result = com.backend.sporta.entity.MatchResult.builder()
                .match(match)
                .outcome(outcome)
                .finalScoreText(scoreText)
                .hostCrpBefore(crpRes.getHostCrpBefore())
                .hostCrpDelta(crpRes.getHostCrpDelta())
                .hostCrpAfter(crpRes.getHostCrpAfter())
                .guestCrpBefore(crpRes.getGuestCrpBefore())
                .guestCrpDelta(crpRes.getGuestCrpDelta())
                .guestCrpAfter(crpRes.getGuestCrpAfter())
                .isRankedEligible(crpRes.isRankedEligible())
                .explanationJson(expJson)
                .build();

        matchResultRepository.save(result);

        // Idempotent CRP ledger entry
        if (crpRes.isRankedEligible() && crpLedgerRepository.findByMatchIdAndClubId(match.getId(), match.getHostClub().getId()).isEmpty()) {
            CRPLedger hostLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(match.getHostClub().getId())
                    .beforeCrp(crpRes.getHostCrpBefore())
                    .deltaCrp(crpRes.getHostCrpDelta())
                    .afterCrp(crpRes.getHostCrpAfter())
                    .reason("Admin Phân xử Tranh chấp trận " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(hostLedger);

            CRPLedger guestLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(match.getGuestClub().getId())
                    .beforeCrp(crpRes.getGuestCrpBefore())
                    .deltaCrp(crpRes.getGuestCrpDelta())
                    .afterCrp(crpRes.getGuestCrpAfter())
                    .reason("Admin Phân xử Tranh chấp trận " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(guestLedger);

            Club hostClub = match.getHostClub();
            hostClub.setCrp(crpRes.getHostCrpAfter());
            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
            if (outcome == NormalizedOutcome.WIN_HOST) {
                hostClub.setRankedWins((hostClub.getRankedWins() != null ? hostClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(hostClub);

            Club guestClub = match.getGuestClub();
            guestClub.setCrp(crpRes.getGuestCrpAfter());
            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
            if (outcome == NormalizedOutcome.WIN_GUEST) {
                guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(guestClub);
        }

        match.setStatus(MatchStatus.RESULT_FINAL);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        room.setStatus(MatchStatus.RESULT_FINAL);
        matchRoomRepository.save(room);

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolvedByAdmin(admin);
        dispute.setResolutionNote(request.getResolutionNote());
        dispute.setResolvedResultJson(scoreText);
        dispute.setResolvedAt(LocalDateTime.now());

        return ResponseEntity.ok(disputeRepository.save(dispute));
    }
}
