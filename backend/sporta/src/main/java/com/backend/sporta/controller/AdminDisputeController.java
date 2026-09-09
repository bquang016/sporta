package com.backend.sporta.controller;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.dto.DisputeDetailResponse;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.event.NotificationEvent;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.service.MatchmakingService;
import com.backend.sporta.service.matchmaking.CRPEngine;
import com.backend.sporta.service.matchmaking.ScoreAdapter;
import com.backend.sporta.service.matchmaking.ScoreAdapterRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
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
    private DisputeEvidenceRepository disputeEvidenceRepository;

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
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private ScoreSubmissionRepository scoreSubmissionRepository;

    @Autowired
    private CRPEngine crpEngine;

    @Autowired
    private ScoreAdapterRegistry scoreAdapterRegistry;

    @Autowired
    private MatchmakingConfig config;

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User getCurrentAdminUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng admin", 404));
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
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

    @GetMapping("/{id}/detail")
    public ResponseEntity<DisputeDetailResponse> getDisputeDetailById(@PathVariable UUID id) {
        User admin = getCurrentAdminUser();
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy khiếu nại", 404));
        return ResponseEntity.ok(matchmakingService.getDisputeDetail(dispute.getMatch().getId(), admin.getEmail()));
    }

    @GetMapping("/by-match/{matchId}")
    public ResponseEntity<DisputeDetailResponse> getDisputeDetailByMatchId(@PathVariable UUID matchId) {
        User admin = getCurrentAdminUser();
        return ResponseEntity.ok(matchmakingService.getDisputeDetail(matchId, admin.getEmail()));
    }

    @GetMapping("/by-ticket/{ticketId}")
    public ResponseEntity<DisputeDetailResponse> getDisputeDetailByTicketId(@PathVariable UUID ticketId) {
        User admin = getCurrentAdminUser();
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu hỗ trợ", 404));

        UUID matchId = null;
        String searchStr = (ticket.getAdminNote() != null ? ticket.getAdminNote() : "") + " " + (ticket.getDescription() != null ? ticket.getDescription() : "");
        if (searchStr.contains("MatchId:")) {
            try {
                String matchIdPart = searchStr.split("MatchId:")[1].trim().split("[\\s|\\n\\)\\.\"]+")[0].trim();
                matchId = UUID.fromString(matchIdPart.replaceAll("[^a-zA-Z0-9-]", ""));
            } catch (Exception ignored) {}
        }
        if (matchId == null && searchStr.contains("Mã trận:")) {
            try {
                String matchIdPart = searchStr.split("Mã trận:")[1].trim().split("[\\s|\\n\\)\\.\"]+")[0].trim();
                matchId = UUID.fromString(matchIdPart.replaceAll("[^a-zA-Z0-9-]", ""));
            } catch (Exception ignored) {}
        }
        if (matchId == null && searchStr.contains("DisputeId:")) {
            try {
                String disputeIdPart = searchStr.split("DisputeId:")[1].trim().split("[\\s|\\n\\)\\.\"]+")[0].trim();
                UUID dispId = UUID.fromString(disputeIdPart.replaceAll("[^a-zA-Z0-9-]", ""));
                Dispute d = disputeRepository.findById(dispId).orElse(null);
                if (d != null && d.getMatch() != null) {
                    matchId = d.getMatch().getId();
                }
            } catch (Exception ignored) {}
        }

        if (matchId == null) {
            throw new CustomException("Ticket này không liên kết với trận đấu nào", 400);
        }

        return ResponseEntity.ok(matchmakingService.getDisputeDetail(matchId, admin.getEmail()));
    }

    @Data
    public static class ResolveDisputeRequest {
        private String ruling; // "WIN_A" (Host thắng 3-0) hoặc "WIN_B" (Guest thắng 0-3) hoặc custom
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
            throw new CustomException("Khiếu nại này đã được xử lý trước đó", 400);
        }

        Match match = dispute.getMatch();
        Club hostClub = match.getHostClub();
        Club guestClub = match.getGuestClub();

        String effectiveHostScore = request.getHostScore();
        String effectiveGuestScore = request.getGuestScore();
        String effectiveRaw = request.getRawScoreDetails();
        String ruling = request.getRuling();

        // 1-Click ruling resolution logic
        if ("WIN_A".equalsIgnoreCase(ruling)) {
            effectiveHostScore = "3";
            effectiveGuestScore = "0";
            effectiveRaw = "Admin xử lý: Bên A (Host) thắng 3-0";
        } else if ("WIN_B".equalsIgnoreCase(ruling)) {
            effectiveHostScore = "0";
            effectiveGuestScore = "3";
            effectiveRaw = "Admin xử lý: Bên B (Guest) thắng 3-0";
        } else if ("DRAW".equalsIgnoreCase(ruling) || "TIE".equalsIgnoreCase(ruling)) {
            effectiveHostScore = "0";
            effectiveGuestScore = "0";
            effectiveRaw = "Admin xử lý: Kết quả hòa 0-0";
        }

        if (effectiveHostScore == null || effectiveGuestScore == null) {
            throw new CustomException("Tỷ số xử lý hoặc quyết định phán quyết (WIN_A / WIN_B / DRAW) là bắt buộc", 400);
        }

        Sport sport = hostClub.getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        ScoreAdapter.ValidationResult val = adapter.validate(effectiveHostScore, effectiveGuestScore, effectiveRaw);
        if (!val.isValid()) {
            throw new CustomException("Tỷ số xử lý không hợp lệ: " + val.getErrorMessage(), 400);
        }

        NormalizedOutcome outcome = adapter.normalize(effectiveHostScore, effectiveGuestScore, effectiveRaw);
        double gFactor = adapter.calculateG(effectiveHostScore, effectiveGuestScore, effectiveRaw);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
        long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                hostClub.getId(), guestClub.getId(), MatchType.RANKED, sevenDaysAgo
        );

        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, outcome, gFactor, (int) recentRankedMatches);

        String scoreText = adapter.getCanonicalScoreText(effectiveHostScore, effectiveGuestScore, effectiveRaw);
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
                .confirmedAt(LocalDateTime.now())
                .build();

        matchResultRepository.save(result);

        // Save official resolved ScoreSubmission so all room views and summaries reflect final scores
        ScoreSubmission lastSub = scoreSubmissionRepository.findFirstByMatchIdOrderByVersionDesc(match.getId()).orElse(null);
        ScoreSubmission resolvedSubmission = ScoreSubmission.builder()
                .match(match)
                .submittedByClub(hostClub)
                .hostScore(effectiveHostScore)
                .guestScore(effectiveGuestScore)
                .rawScoreDetails(effectiveRaw)
                .outcome(outcome)
                .version((lastSub != null && lastSub.getVersion() != null ? lastSub.getVersion() : 0) + 1)
                .submittedAt(LocalDateTime.now())
                .build();
        scoreSubmissionRepository.save(resolvedSubmission);

        // Record standard CRP & apply CRP penalty (-10 CRP) to the losing/violating club (if WIN_A or WIN_B)
        int penaltyCrp = 10;
        if (crpRes.isRankedEligible() && crpLedgerRepository.findByMatchIdAndClubId(match.getId(), hostClub.getId()).isEmpty()) {
            // Standard Match CRP Entry for Host
            CRPLedger hostLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(hostClub.getId())
                    .beforeCrp(crpRes.getHostCrpBefore())
                    .deltaCrp(crpRes.getHostCrpDelta())
                    .afterCrp(crpRes.getHostCrpAfter())
                    .reason("Admin xử lý tranh chấp trận " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(hostLedger);

            // Standard Match CRP Entry for Guest
            CRPLedger guestLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(guestClub.getId())
                    .beforeCrp(crpRes.getGuestCrpBefore())
                    .deltaCrp(crpRes.getGuestCrpDelta())
                    .afterCrp(crpRes.getGuestCrpAfter())
                    .reason("Admin xử lý tranh chấp trận " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(guestLedger);

            int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
            int newHostCrp = Math.max(0, currentHostCrp + crpRes.getHostCrpDelta());

            int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
            int newGuestCrp = Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta());

            // Apply -10 CRP Penalty to the violating party only when WIN_A or WIN_B (not for DRAW)
            if ("WIN_A".equalsIgnoreCase(ruling) || (outcome == NormalizedOutcome.WIN_HOST && !"DRAW".equalsIgnoreCase(ruling))) {
                // Guest club was in the wrong -> -10 CRP penalty
                int afterPenalty = Math.max(0, newGuestCrp - penaltyCrp);
                CRPLedger penaltyLedger = CRPLedger.builder()
                        .matchId(match.getId())
                        .clubId(guestClub.getId())
                        .beforeCrp(newGuestCrp)
                        .deltaCrp(-penaltyCrp)
                        .afterCrp(afterPenalty)
                        .reason("Phạt vi phạm: Khiếu nại không hợp lệ (Tranh chấp trận " + match.getId() + ")")
                        .algorithmVersion(config.getAlgorithmVersion())
                        .build();
                crpLedgerRepository.save(penaltyLedger);
                newGuestCrp = afterPenalty;
            } else if ("WIN_B".equalsIgnoreCase(ruling) || (outcome == NormalizedOutcome.WIN_GUEST && !"DRAW".equalsIgnoreCase(ruling))) {
                // Host club was in the wrong -> -10 CRP penalty
                int afterPenalty = Math.max(0, newHostCrp - penaltyCrp);
                CRPLedger penaltyLedger = CRPLedger.builder()
                        .matchId(match.getId())
                        .clubId(hostClub.getId())
                        .beforeCrp(newHostCrp)
                        .deltaCrp(-penaltyCrp)
                        .afterCrp(afterPenalty)
                        .reason("Phạt vi phạm: Khai báo sai tỷ số trận đấu (Tranh chấp trận " + match.getId() + ")")
                        .algorithmVersion(config.getAlgorithmVersion())
                        .build();
                crpLedgerRepository.save(penaltyLedger);
                newHostCrp = afterPenalty;
            }

            hostClub.setCrp(newHostCrp);
            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
            if (outcome == NormalizedOutcome.WIN_HOST) {
                hostClub.setRankedWins((hostClub.getRankedWins() != null ? hostClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(hostClub);

            guestClub.setCrp(newGuestCrp);
            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
            if (outcome == NormalizedOutcome.WIN_GUEST) {
                guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(guestClub);

            matchmakingService.updatePlayerElos(match, outcome);
        }

        match.setStatus(MatchStatus.RESULT_FINAL);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        if (room != null) {
            room.setStatus(MatchStatus.RESULT_FINAL);
            matchRoomRepository.save(room);
        }

        String note = (request.getResolutionNote() != null && !request.getResolutionNote().isBlank())
                ? request.getResolutionNote()
                : ("Admin xử lý kết quả: " + scoreText);

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolvedByAdmin(admin);
        dispute.setResolutionNote(note);
        dispute.setResolvedResultJson(scoreText);
        dispute.setResolvedAt(LocalDateTime.now());
        Dispute savedDispute = disputeRepository.save(dispute);

        // Sync linked SupportTicket status to RESOLVED
        try {
            List<SupportTicket> tickets = supportTicketRepository.findByTicketType("MATCH_DISPUTE");
            for (SupportTicket t : tickets) {
                String searchStr = (t.getAdminNote() != null ? t.getAdminNote() : "") + " " + (t.getDescription() != null ? t.getDescription() : "");
                if (searchStr.contains(match.getId().toString()) || searchStr.contains(dispute.getId().toString())) {
                    t.setStatus(SupportTicketStatus.RESOLVED);
                    t.setAdminNote(note + "\n(MatchId: " + match.getId() + " | DisputeId: " + dispute.getId() + ")");
                    t.setResolvedAt(LocalDateTime.now());
                    t.setProcessedBy(admin.getFullName() != null ? admin.getFullName() : admin.getEmail());
                    supportTicketRepository.save(t);
                    break;
                }
            }
        } catch (Exception ignored) {}

        // Send resolution notifications to both clubs
        try {
            String roomIdStr = room != null ? room.getId().toString() : match.getId().toString();
            if (hostClub.getCreator() != null) {
                String msg;
                if (outcome == NormalizedOutcome.DRAW) {
                    msg = "Admin đã xử lý kết quả: Hòa (" + scoreText + "). Điểm CRP và xếp hạng đã được cập nhật theo kết quả thi đấu.";
                } else if (outcome == NormalizedOutcome.WIN_HOST) {
                    msg = "Admin đã xử lý: CLB " + hostClub.getName() + " thắng (" + scoreText + "). Điểm CRP và xếp hạng đã được cập nhật.";
                } else {
                    msg = "Admin đã xử lý: CLB " + hostClub.getName() + " thua (" + scoreText + ") và bị trừ 10 điểm CRP do khai báo sai.";
                }

                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        hostClub.getCreator().getId(),
                        Role.PLAYER,
                        "Kết quả xử lý tranh chấp trận đấu",
                        msg,
                        NotificationType.MATCH_DISPUTE_RESOLVED,
                        roomIdStr
                ));
            }

            if (guestClub.getCreator() != null) {
                String msg;
                if (outcome == NormalizedOutcome.DRAW) {
                    msg = "Admin đã xử lý kết quả: Hòa (" + scoreText + "). Điểm CRP và xếp hạng đã được cập nhật theo kết quả thi đấu.";
                } else if (outcome == NormalizedOutcome.WIN_GUEST) {
                    msg = "Admin đã xử lý: CLB " + guestClub.getName() + " thắng (" + scoreText + "). Điểm CRP và xếp hạng đã được cập nhật.";
                } else {
                    msg = "Admin đã xử lý: CLB " + guestClub.getName() + " thua (" + scoreText + ") và bị trừ 10 điểm CRP do khiếu nại không hợp lệ.";
                }

                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        guestClub.getCreator().getId(),
                        Role.PLAYER,
                        "Kết quả xử lý tranh chấp trận đấu",
                        msg,
                        NotificationType.MATCH_DISPUTE_RESOLVED,
                        roomIdStr
                ));
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(savedDispute);
    }
}
