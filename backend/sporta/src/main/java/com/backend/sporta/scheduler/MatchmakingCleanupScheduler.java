package com.backend.sporta.scheduler;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.BookingDetail;
import com.backend.sporta.entity.JoinRequest;
import com.backend.sporta.entity.Match;
import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.enums.JoinRequestStatus;
import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.repository.JoinRequestRepository;
import com.backend.sporta.repository.MatchRepository;
import com.backend.sporta.repository.MatchRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class MatchmakingCleanupScheduler {

    @Autowired
    private MatchRoomRepository matchRoomRepository;

    @Autowired
    private JoinRequestRepository joinRequestRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MatchmakingConfig config;

    @Scheduled(fixedDelay = 120000)
    @Transactional
    public void cleanupExpiredRoomsAndOverdueMatches() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Expire OPEN rooms passed joinDeadline
        List<MatchRoom> expiredRooms = matchRoomRepository.findByStatusAndJoinDeadlineBefore(MatchStatus.OPEN, now);
        for (MatchRoom room : expiredRooms) {
            room.setStatus(MatchStatus.EXPIRED);
            matchRoomRepository.save(room);

            List<JoinRequest> requests = joinRequestRepository.findByRoomId(room.getId());
            for (JoinRequest req : requests) {
                if (req.getStatus() == JoinRequestStatus.PENDING) {
                    req.setStatus(JoinRequestStatus.WITHDRAWN);
                    joinRequestRepository.save(req);
                }
            }
        }

        // 2. Mark matches RESULT_OVERDUE if passed endTime + 1 hour without final result
        List<MatchStatus> pendingStatuses = Arrays.asList(MatchStatus.MATCHED, MatchStatus.UPCOMING, MatchStatus.SCORE_PENDING, MatchStatus.SCORE_CONFIRMING);
        List<Match> matches = matchRepository.findByStatusNotIn(Arrays.asList(MatchStatus.RESULT_FINAL, MatchStatus.DISPUTED, MatchStatus.CANCELLED, MatchStatus.RESULT_OVERDUE));

        for (Match m : matches) {
            if (pendingStatuses.contains(m.getStatus())) {
                LocalDateTime endTime = getBookingEndTime(m);
                LocalDateTime overdueThreshold = endTime.plusMinutes(config.getResultConfirmationGraceMinutes());
                if (now.isAfter(overdueThreshold)) {
                    m.setStatus(MatchStatus.RESULT_OVERDUE);
                    matchRepository.save(m);

                    MatchRoom room = m.getRoom();
                    room.setStatus(MatchStatus.RESULT_OVERDUE);
                    matchRoomRepository.save(room);
                }
            }
        }
    }

    private LocalDateTime getBookingEndTime(Match m) {
        if (m.getBooking() != null && m.getBooking().getDetails() != null && !m.getBooking().getDetails().isEmpty()) {
            BookingDetail detail = m.getBooking().getDetails().get(0);
            return LocalDateTime.of(detail.getBookingDate(), detail.getEndTime());
        }
        return m.getCreatedAt().plusHours(2);
    }
}
