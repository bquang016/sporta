package com.backend.sporta.scheduler;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.event.NotificationEvent;
import com.backend.sporta.repository.*;
import com.backend.sporta.service.MatchmakingService;
import com.backend.sporta.service.matchmaking.CRPEngine;
import com.backend.sporta.service.matchmaking.ScoreAdapter;
import com.backend.sporta.service.matchmaking.ScoreAdapterRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component
@Slf4j
public class MatchmakingCleanupScheduler {

    @Autowired
    private MatchRoomRepository matchRoomRepository;

    @Autowired
    private JoinRequestRepository joinRequestRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ScoreSubmissionRepository scoreSubmissionRepository;

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private DisputeEvidenceRepository disputeEvidenceRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private CRPLedgerRepository crpLedgerRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private ScoreAdapterRegistry scoreAdapterRegistry;

    @Autowired
    private CRPEngine crpEngine;

    @Autowired
    private MatchmakingService matchmakingService;

    @Autowired
    private MatchmakingConfig config;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm dd/MM");

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void cleanupExpiredRoomsAndOverdueMatches() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Expire OPEN rooms passed joinDeadline or passed booking start time
        try {
            List<MatchRoom> expiredRooms = matchRoomRepository.findByStatusAndJoinDeadlineBefore(MatchStatus.OPEN, now);
            for (MatchRoom room : expiredRooms) {
                expireRoom(room, now);
            }

            List<MatchRoom> openRooms = matchRoomRepository.findOpenRoomsWithoutGuestNotReminded();
            for (MatchRoom room : openRooms) {
                LocalDateTime startTime = getBookingStartTime(room.getBooking());
                if (now.isAfter(startTime)) {
                    expireRoom(room, now);
                }
            }
        } catch (Exception e) {
            log.error("Error in expireRoom scheduler: {}", e.getMessage());
        }

        // 2. Send 3-4 hour advance reminder for OPEN rooms without opponent
        try {
            sendNoOpponentReminders(now);
        } catch (Exception e) {
            log.error("Error in sendNoOpponentReminders: {}", e.getMessage());
        }

        // 3. Mark matches RESULT_OVERDUE if passed endTime + grace period without final result
        try {
            List<MatchStatus> pendingStatuses = Arrays.asList(MatchStatus.MATCHED, MatchStatus.UPCOMING, MatchStatus.SCORE_PENDING);
            List<Match> matches = matchRepository.findByStatusNotIn(Arrays.asList(MatchStatus.RESULT_FINAL, MatchStatus.DISPUTED, MatchStatus.CANCELLED, MatchStatus.RESULT_OVERDUE, MatchStatus.SCORE_CONFIRMING));

            for (Match m : matches) {
                if (m != null && pendingStatuses.contains(m.getStatus())) {
                    LocalDateTime endTime = getBookingEndTime(m);
                    LocalDateTime overdueThreshold = endTime.plusMinutes(config.getResultConfirmationGraceMinutes());
                    if (now.isAfter(overdueThreshold)) {
                        m.setStatus(MatchStatus.RESULT_OVERDUE);
                        matchRepository.save(m);

                        if (m.getRoom() != null) {
                            MatchRoom room = m.getRoom();
                            room.setStatus(MatchStatus.RESULT_OVERDUE);
                            matchRoomRepository.save(room);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in RESULT_OVERDUE scheduler: {}", e.getMessage());
        }

        // 4. Auto-finalize SCORE_CONFIRMING matches after 24h if Guest does not confirm or dispute
        try {
            autoConfirmUnconfirmedScores(now);
        } catch (Exception e) {
            log.error("Error in autoConfirmUnconfirmedScores: {}", e.getMessage());
        }

        // 5. Auto-rule DISPUTED matches after 24h if Host does not provide counter-evidence (Side B wins 3-0)
        try {
            autoRuleDisputesWithoutHostEvidence(now);
        } catch (Exception e) {
            log.error("Error in autoRuleDisputesWithoutHostEvidence: {}", e.getMessage());
        }
    }

    private void autoConfirmUnconfirmedScores(LocalDateTime now) {
        List<Match> confirmingMatches = matchRepository.findByStatusIn(List.of(MatchStatus.SCORE_CONFIRMING));
        for (Match match : confirmingMatches) {
            Optional<ScoreSubmission> lastSubOpt = scoreSubmissionRepository.findFirstByMatchIdOrderByVersionDesc(match.getId());
            if (lastSubOpt.isEmpty()) continue;

            ScoreSubmission sub = lastSubOpt.get();
            LocalDateTime subCreatedAt = sub.getSubmittedAt() != null ? sub.getSubmittedAt() : match.getCreatedAt();
            if (subCreatedAt == null) continue;

            // Timeout: 24 hours from submission
            LocalDateTime autoConfirmThreshold = subCreatedAt.plusHours(24);
            if (now.isAfter(autoConfirmThreshold)) {
                log.info("Auto-confirming match {} after 24 hours without Guest response", match.getId());
                try {
                    Club hostClub = match.getHostClub();
                    Club guestClub = match.getGuestClub();
                    Sport sport = hostClub.getSport();
                    String sportName = sport != null ? sport.getName() : "Bóng đá";
                    ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

                    LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
                    long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                            hostClub.getId(), guestClub.getId(), MatchType.RANKED, sevenDaysAgo);

                    CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, sub.getOutcome(), sub.getGFactor(), (int) recentRankedMatches);

                    String scoreText = adapter.getCanonicalScoreText(sub.getHostScore(), sub.getGuestScore(), sub.getRawScoreDetails());
                    String expJson = "[]";
                    try {
                        expJson = objectMapper.writeValueAsString(crpRes.getExplanation());
                    } catch (Exception ignored) {}

                    com.backend.sporta.entity.MatchResult result = matchResultRepository.findByMatchId(match.getId())
                            .orElseGet(() -> com.backend.sporta.entity.MatchResult.builder().match(match).build());

                    result.setOutcome(sub.getOutcome());
                    result.setFinalScoreText(scoreText);
                    result.setHostCrpBefore(crpRes.getHostCrpBefore());
                    result.setHostCrpDelta(crpRes.getHostCrpDelta());
                    result.setHostCrpAfter(crpRes.getHostCrpAfter());
                    result.setGuestCrpBefore(crpRes.getGuestCrpBefore());
                    result.setGuestCrpDelta(crpRes.getGuestCrpDelta());
                    result.setGuestCrpAfter(crpRes.getGuestCrpAfter());
                    result.setIsRankedEligible(crpRes.isRankedEligible());
                    result.setExplanationJson(expJson);
                    result.setConfirmedAt(LocalDateTime.now());

                    matchResultRepository.save(result);

                    if (crpRes.isRankedEligible() && crpLedgerRepository.findByMatchIdAndClubId(match.getId(), hostClub.getId()).isEmpty()) {
                        CRPLedger hostLedger = CRPLedger.builder()
                                .matchId(match.getId())
                                .clubId(hostClub.getId())
                                .beforeCrp(crpRes.getHostCrpBefore())
                                .deltaCrp(crpRes.getHostCrpDelta())
                                .afterCrp(crpRes.getHostCrpAfter())
                                .reason("Tự động chốt tỷ số sau 24h trận " + match.getId())
                                .algorithmVersion(config.getAlgorithmVersion())
                                .build();
                        crpLedgerRepository.save(hostLedger);

                        CRPLedger guestLedger = CRPLedger.builder()
                                .matchId(match.getId())
                                .clubId(guestClub.getId())
                                .beforeCrp(crpRes.getGuestCrpBefore())
                                .deltaCrp(crpRes.getGuestCrpDelta())
                                .afterCrp(crpRes.getGuestCrpAfter())
                                .reason("Tự động chốt tỷ số sau 24h trận " + match.getId())
                                .algorithmVersion(config.getAlgorithmVersion())
                                .build();
                        crpLedgerRepository.save(guestLedger);

                        int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
                        hostClub.setCrp(Math.max(0, currentHostCrp + crpRes.getHostCrpDelta()));
                        hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
                        if (sub.getOutcome() == NormalizedOutcome.WIN_HOST) {
                            hostClub.setRankedWins((hostClub.getRankedWins() != null ? hostClub.getRankedWins() : 0) + 1);
                        }
                        clubRepository.save(hostClub);

                        int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
                        guestClub.setCrp(Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta()));
                        guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
                        if (sub.getOutcome() == NormalizedOutcome.WIN_GUEST) {
                            guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
                        }
                        clubRepository.save(guestClub);
                    }

                    matchmakingService.updatePlayerElos(match, sub.getOutcome());

                    match.setStatus(MatchStatus.RESULT_FINAL);
                    matchRepository.save(match);

                    MatchRoom room = match.getRoom();
                    if (room != null) {
                        room.setStatus(MatchStatus.RESULT_FINAL);
                        matchRoomRepository.save(room);
                    }

                    // Notify both clubs
                    String roomIdStr = room != null ? room.getId().toString() : match.getId().toString();
                    if (hostClub.getCreator() != null) {
                        eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                hostClub.getCreator().getId(),
                                Role.PLAYER,
                                "Kết quả trận đấu đã được tự động chốt",
                                "Trận đấu đã được chốt kết quả (" + scoreText + ") do đối thủ không phản hồi sau 24h.",
                                NotificationType.MATCH_REMINDER,
                                roomIdStr
                        ));
                    }
                    if (guestClub.getCreator() != null) {
                        eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                guestClub.getCreator().getId(),
                                Role.PLAYER,
                                "Kết quả trận đấu đã được tự động chốt",
                                "Trận đấu đã được tự động chốt kết quả (" + scoreText + ") theo khai báo của Bên A do bạn không phản hồi sau 24h.",
                                NotificationType.MATCH_REMINDER,
                                roomIdStr
                        ));
                    }
                } catch (Exception e) {
                    log.error("Failed to auto-confirm match {}: {}", match.getId(), e.getMessage());
                }
            }
        }
    }

    private void autoRuleDisputesWithoutHostEvidence(LocalDateTime now) {
        List<Dispute> openDisputes = disputeRepository.findByStatus(DisputeStatus.OPEN);
        for (Dispute dispute : openDisputes) {
            LocalDateTime createdAt = dispute.getCreatedAt();
            if (createdAt == null) continue;

            LocalDateTime deadline = createdAt.plusHours(24);
            if (now.isAfter(deadline)) {
                // Check if Host submitted evidence
                List<DisputeEvidence> evidences = disputeEvidenceRepository.findByDisputeId(dispute.getId());
                boolean hasHostCounter = evidences.stream().anyMatch(e -> "HOST_COUNTER".equals(e.getEvidenceType()));

                if (!hasHostCounter) {
                    log.info("Auto-ruling dispute {} in favor of Guest (3-0) due to Host failing to provide counter-evidence in 24h", dispute.getId());
                    try {
                        Match match = dispute.getMatch();
                        Club hostClub = match.getHostClub();
                        Club guestClub = match.getGuestClub();

                        String effectiveHostScore = "0";
                        String effectiveGuestScore = "3";
                        String effectiveRaw = "Tự động xử Bên B thắng 3-0 do Chủ nhà không gửi bằng chứng đối chất sau 24 giờ";

                        Sport sport = hostClub.getSport();
                        String sportName = sport != null ? sport.getName() : "Bóng đá";
                        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

                        NormalizedOutcome outcome = NormalizedOutcome.WIN_GUEST;
                        double gFactor = adapter.calculateG(effectiveHostScore, effectiveGuestScore, effectiveRaw);

                        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
                        long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                                hostClub.getId(), guestClub.getId(), MatchType.RANKED, sevenDaysAgo);

                        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, outcome, gFactor, (int) recentRankedMatches);

                        String scoreText = adapter.getCanonicalScoreText(effectiveHostScore, effectiveGuestScore, effectiveRaw);

                        com.backend.sporta.entity.MatchResult result = matchResultRepository.findByMatchId(match.getId())
                                .orElseGet(() -> com.backend.sporta.entity.MatchResult.builder().match(match).build());

                        result.setOutcome(outcome);
                        result.setFinalScoreText(scoreText);
                        result.setHostCrpBefore(crpRes.getHostCrpBefore());
                        result.setHostCrpDelta(crpRes.getHostCrpDelta());
                        result.setHostCrpAfter(crpRes.getHostCrpAfter());
                        result.setGuestCrpBefore(crpRes.getGuestCrpBefore());
                        result.setGuestCrpDelta(crpRes.getGuestCrpDelta());
                        result.setGuestCrpAfter(crpRes.getGuestCrpAfter());
                        result.setIsRankedEligible(crpRes.isRankedEligible());
                        result.setExplanationJson("[]");
                        result.setConfirmedAt(LocalDateTime.now());

                        matchResultRepository.save(result);

                        int penaltyCrp = 10;
                        if (crpRes.isRankedEligible() && crpLedgerRepository.findByMatchIdAndClubId(match.getId(), hostClub.getId()).isEmpty()) {
                            CRPLedger hostLedger = CRPLedger.builder()
                                    .matchId(match.getId())
                                    .clubId(hostClub.getId())
                                    .beforeCrp(crpRes.getHostCrpBefore())
                                    .deltaCrp(crpRes.getHostCrpDelta())
                                    .afterCrp(crpRes.getHostCrpAfter())
                                    .reason("Xử thua do không đối chất trận " + match.getId())
                                    .algorithmVersion(config.getAlgorithmVersion())
                                    .build();
                            crpLedgerRepository.save(hostLedger);

                            CRPLedger guestLedger = CRPLedger.builder()
                                    .matchId(match.getId())
                                    .clubId(guestClub.getId())
                                    .beforeCrp(crpRes.getGuestCrpBefore())
                                    .deltaCrp(crpRes.getGuestCrpDelta())
                                    .afterCrp(crpRes.getGuestCrpAfter())
                                    .reason("Xử thắng do đối thủ không đối chất trận " + match.getId())
                                    .algorithmVersion(config.getAlgorithmVersion())
                                    .build();
                            crpLedgerRepository.save(guestLedger);

                            int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
                            int newHostCrp = Math.max(0, currentHostCrp + crpRes.getHostCrpDelta());

                            // Host gets -10 CRP penalty
                            int afterPenalty = Math.max(0, newHostCrp - penaltyCrp);
                            CRPLedger penaltyLedger = CRPLedger.builder()
                                    .matchId(match.getId())
                                    .clubId(hostClub.getId())
                                    .beforeCrp(newHostCrp)
                                    .deltaCrp(-penaltyCrp)
                                    .afterCrp(afterPenalty)
                                    .reason("Phạt vi phạm: Không gửi bằng chứng đối chất trong 24h (Tranh chấp trận " + match.getId() + ")")
                                    .algorithmVersion(config.getAlgorithmVersion())
                                    .build();
                            crpLedgerRepository.save(penaltyLedger);

                            hostClub.setCrp(afterPenalty);
                            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
                            clubRepository.save(hostClub);

                            int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
                            guestClub.setCrp(Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta()));
                            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
                            guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
                            clubRepository.save(guestClub);
                        }

                        matchmakingService.updatePlayerElos(match, outcome);

                        match.setStatus(MatchStatus.RESULT_FINAL);
                        matchRepository.save(match);

                        MatchRoom room = match.getRoom();
                        if (room != null) {
                            room.setStatus(MatchStatus.RESULT_FINAL);
                            matchRoomRepository.save(room);
                        }

                        dispute.setStatus(DisputeStatus.RESOLVED);
                        dispute.setResolutionNote("Tự động xử Bên B thắng 3-0 do Chủ nhà không gửi bằng chứng đối chất sau 24 giờ.");
                        dispute.setResolvedResultJson(scoreText);
                        dispute.setResolvedAt(LocalDateTime.now());
                        disputeRepository.save(dispute);

                        // Sync SupportTicket
                        try {
                            List<SupportTicket> tickets = supportTicketRepository.findByTicketType("MATCH_DISPUTE");
                            for (SupportTicket t : tickets) {
                                if (t.getAdminNote() != null && (t.getAdminNote().contains(match.getId().toString()) || t.getAdminNote().contains(dispute.getId().toString()))) {
                                    t.setStatus(SupportTicketStatus.RESOLVED);
                                    t.setAdminNote("Tự động xử Bên B thắng 3-0 do Chủ nhà không gửi bằng chứng đối chất trong 24h.");
                                    t.setResolvedAt(LocalDateTime.now());
                                    t.setProcessedBy("Hệ thống tự động");
                                    supportTicketRepository.save(t);
                                    break;
                                }
                            }
                        } catch (Exception ignored) {}

                        // Send notifications
                        String roomIdStr = room != null ? room.getId().toString() : match.getId().toString();
                        if (hostClub.getCreator() != null) {
                            eventPublisher.publishEvent(new NotificationEvent(
                                    this,
                                    hostClub.getCreator().getId(),
                                    Role.PLAYER,
                                    "Trận đấu đã kết thúc",
                                    "Bạn bị xử thua 0-3 và trừ 10 điểm CRP do không gửi bằng chứng đối chất trong vòng 24 giờ.",
                                    NotificationType.MATCH_DISPUTE_RESOLVED,
                                    roomIdStr
                            ));
                        }
                        if (guestClub.getCreator() != null) {
                            eventPublisher.publishEvent(new NotificationEvent(
                                    this,
                                    guestClub.getCreator().getId(),
                                    Role.PLAYER,
                                    "Trận đấu đã kết thúc",
                                    "CLB bạn được xử thắng 3-0 do đối thủ không gửi bằng chứng đối chất trong vòng 24 giờ.",
                                    NotificationType.MATCH_DISPUTE_RESOLVED,
                                    roomIdStr
                            ));
                        }
                    } catch (Exception e) {
                        log.error("Failed to auto-rule dispute {}: {}", dispute.getId(), e.getMessage());
                    }
                }
            }
        }
    }

    private void expireRoom(MatchRoom room, LocalDateTime now) {
        if (room.getStatus() != MatchStatus.OPEN) return;

        room.setStatus(MatchStatus.EXPIRED);
        matchRoomRepository.save(room);

        String timeStr = formatBookingTime(room.getBooking());

        try {
            if (room.getHostClub() != null && room.getHostClub().getCreator() != null) {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        room.getHostClub().getCreator().getId(),
                        Role.PLAYER,
                        "Kèo đấu đã quá hạn",
                        "Kèo đấu lúc " + timeStr + " đã quá thời gian tìm đối thủ. Sân đấu đã đặt vẫn thuộc quyền sử dụng của bạn.",
                        NotificationType.MATCH_EXPIRED,
                        room.getId().toString()
                ));
            }
        } catch (Exception ignored) {}

        List<JoinRequest> requests = joinRequestRepository.findByRoomId(room.getId());
        for (JoinRequest req : requests) {
            if (req.getStatus() == JoinRequestStatus.PENDING) {
                req.setStatus(JoinRequestStatus.WITHDRAWN);
                joinRequestRepository.save(req);

                try {
                    if (req.getApplicantClub() != null && req.getApplicantClub().getCreator() != null) {
                        eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                req.getApplicantClub().getCreator().getId(),
                                Role.PLAYER,
                                "Kèo đấu đã hết hạn",
                                "Phòng ghép trận lúc " + timeStr + " của CLB " + (room.getHostClub() != null ? room.getHostClub().getName() : "") + " đã hết hạn mà không chốt đối thủ.",
                                NotificationType.MATCH_EXPIRED,
                                room.getId().toString()
                        ));
                    }
                } catch (Exception ignored) {}
            }
        }
    }

    private void sendNoOpponentReminders(LocalDateTime now) {
        List<MatchRoom> candidateRooms = matchRoomRepository.findOpenRoomsWithoutGuestNotReminded();
        int reminderWindowMinutes = config.getReminderBeforeMinutes();

        for (MatchRoom room : candidateRooms) {
            LocalDateTime startTime = getBookingStartTime(room.getBooking());
            LocalDateTime reminderThreshold = startTime.minusMinutes(reminderWindowMinutes);

            if (now.isAfter(reminderThreshold) && now.isBefore(startTime)) {
                room.setReminderSent(true);
                matchRoomRepository.save(room);

                try {
                    if (room.getHostClub() != null && room.getHostClub().getCreator() != null) {
                        String timeStr = formatBookingTime(room.getBooking());
                        String venueName = (room.getBooking() != null && room.getBooking().getVenue() != null)
                                ? room.getBooking().getVenue().getName() : "sân đấu";

                        eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                room.getHostClub().getCreator().getId(),
                                Role.PLAYER,
                                "Nhắc nhở: Chưa tìm được đối thủ",
                                "Hiện chưa tìm được đối thủ cho kèo đấu lúc " + timeStr + " tại " + venueName + ". Hãy nhấn vào để kiểm tra và xử lý kèo đấu của bạn.",
                                NotificationType.MATCH_NO_OPPONENT_REMINDER,
                                room.getId().toString()
                        ));
                    }
                } catch (Exception ignored) {}
            }
        }
    }

    private LocalDateTime getBookingStartTime(Booking booking) {
        if (booking != null && booking.getDetails() != null && !booking.getDetails().isEmpty()) {
            LocalTime minStartTime = booking.getDetails().stream()
                    .map(BookingDetail::getStartTime)
                    .filter(Objects::nonNull)
                    .min(LocalTime::compareTo)
                    .orElse(LocalTime.of(18, 0));
            LocalDate bookingDate = booking.getDetails().stream()
                    .map(BookingDetail::getBookingDate)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(LocalDate.now().plusDays(1));
            return LocalDateTime.of(bookingDate, minStartTime);
        }
        return (booking != null && booking.getCreatedAt() != null) ? booking.getCreatedAt().plusDays(1)
                : LocalDateTime.now().plusDays(1);
    }

    private String formatBookingTime(Booking booking) {
        try {
            LocalDateTime st = getBookingStartTime(booking);
            return st.format(TIME_FMT);
        } catch (Exception e) {
            return "sắp diễn ra";
        }
    }

    private LocalDateTime getBookingEndTime(Match m) {
        try {
            if (m.getBooking() != null && m.getBooking().getDetails() != null && !m.getBooking().getDetails().isEmpty()) {
                BookingDetail detail = m.getBooking().getDetails().get(0);
                if (detail != null && detail.getBookingDate() != null && detail.getEndTime() != null) {
                    return LocalDateTime.of(detail.getBookingDate(), detail.getEndTime());
                }
            }
        } catch (Exception ignored) {}
        return m.getCreatedAt() != null ? m.getCreatedAt().plusHours(2) : LocalDateTime.now();
    }
}