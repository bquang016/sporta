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

        String adminNote = ticket.getAdminNote();
        UUID matchId = null;
        if (adminNote != null && adminNote.contains("MatchId:")) {
            try {
                String matchIdPart = adminNote.split("MatchId:")[1].trim().split(" ")[0].trim();
                matchId = UUID.fromString(matchIdPart.replaceAll("[^a-zA-Z0-9-]", ""));
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
            effectiveRaw = "Admin phán quyết: Bên A (Host) thắng 3-0";
        } else if ("WIN_B".equalsIgnoreCase(ruling)) {
            effectiveHostScore = "0";
            effectiveGuestScore = "3";
            effectiveRaw = "Admin phán quyết: Bên B (Guest) thắng 3-0";
        }

        if (effectiveHostScore == null || effectiveGuestScore == null) {
            throw new CustomException("Tỷ số phân xử hoặc quyết định phán quyết (WIN_A / WIN_B) là bắt buộc", 400);
        }

        Sport sport = hostClub.getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        ScoreAdapter.ValidationResult val = adapter.validate(effectiveHostScore, effectiveGuestScore, effectiveRaw);
        if (!val.isValid()) {
            throw new CustomException("Tỷ số phân xử không hợp lệ: " + val.getErrorMessage(), 400);
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

        // Record standard CRP & apply CRP penalty (-10 CRP) to the losing/violating club
        int penaltyCrp = 10;
        if (crpRes.isRankedEligible() && crpLedgerRepository.findByMatchIdAndClubId(match.getId(), hostClub.getId()).isEmpty()) {
            // Standard Match CRP Entry for Host
            CRPLedger hostLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(hostClub.getId())
                    .beforeCrp(crpRes.getHostCrpBefore())
                    .deltaCrp(crpRes.getHostCrpDelta())
                    .afterCrp(crpRes.getHostCrpAfter())
                    .reason("Admin Phân xử Tranh chấp trận " + match.getId())
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
                    .reason("Admin Phân xử Tranh chấp trận " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(guestLedger);

            int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
            int newHostCrp = Math.max(0, currentHostCrp + crpRes.getHostCrpDelta());

            int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
            int newGuestCrp = Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta());

            // Apply -10 CRP Penalty to the violating party
            if ("WIN_A".equalsIgnoreCase(ruling) || outcome == NormalizedOutcome.WIN_HOST) {
                // Guest club was in the wrong -> -10 CRP penalty
                int afterPenalty = Math.max(0, newGuestCrp - penaltyCrp);
                CRPLedger penaltyLedger = CRPLedger.builder()
                        .matchId(match.getId())
                        .clubId(guestClub.getId())
                        .beforeCrp(newGuestCrp)
                        .deltaCrp(-penaltyCrp)
                        .afterCrp(afterPenalty)
                        .reason("Phạt vi phạm: Tố cáo sai / Khiếu nại không hợp lệ (Tranh chấp trận " + match.getId() + ")")
                        .algorithmVersion(config.getAlgorithmVersion())
                        .build();
                crpLedgerRepository.save(penaltyLedger);
                newGuestCrp = afterPenalty;
            } else if ("WIN_B".equalsIgnoreCase(ruling) || outcome == NormalizedOutcome.WIN_GUEST) {
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
                : ("Admin phân xử kết quả: " + scoreText);

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
                if (t.getAdminNote() != null && (t.getAdminNote().contains(match.getId().toString()) || t.getAdminNote().contains(dispute.getId().toString()))) {
                    t.setStatus(SupportTicketStatus.RESOLVED);
                    t.setAdminNote(note);
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
                boolean isHostWinner = (outcome == NormalizedOutcome.WIN_HOST);
                String msg = isHostWinner
                        ? ("Admin đã phân xử: CLB " + hostClub.getName() + " THẮNG (" + scoreText + "). Điểm CRP và xếp hạng đã được cập nhật.")
                        : ("Admin đã phân xử: CLB " + hostClub.getName() + " THUA (" + scoreText + ") và bị trừ 10 điểm CRP vi phạm khai báo sai.");

                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        hostClub.getCreator().getId(),
                        Role.PLAYER,
                        "Kết quả phân xử tranh chấp trận đấu",
                        msg,
                        NotificationType.MATCH_DISPUTE_RESOLVED,
                        roomIdStr
                ));
            }

            if (guestClub.getCreator() != null) {
                boolean isGuestWinner = (outcome == NormalizedOutcome.WIN_GUEST);
                String msg = isGuestWinner
                        ? ("Admin đã phân xử: CLB " + guestClub.getName() + " THẮNG (" + scoreText + "). Điểm CRP và xếp hạng đã được cập nhật.")
                        : ("Admin đã phân xử: CLB " + guestClub.getName() + " THUA (" + scoreText + ") và bị trừ 10 điểm CRP vì khiếu nại không hợp lệ.");

                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        guestClub.getCreator().getId(),
                        Role.PLAYER,
                        "Kết quả phân xử tranh chấp trận đấu",
                        msg,
                        NotificationType.MATCH_DISPUTE_RESOLVED,
                        roomIdStr
                ));
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(savedDispute);
    }
}
