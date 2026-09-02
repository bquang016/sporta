package com.backend.sporta.scheduler;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.JoinRequestStatus;
import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.event.NotificationEvent;
import com.backend.sporta.repository.JoinRequestRepository;
import com.backend.sporta.repository.MatchRepository;
import com.backend.sporta.repository.MatchRoomRepository;
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

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm dd/MM");

    @Scheduled(fixedDelay = 120000)
    @Transactional
    public void cleanupExpiredRoomsAndOverdueMatches() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Expire OPEN rooms passed joinDeadline or passed booking start time
        try {
            List<MatchRoom> expiredRooms = matchRoomRepository.findByStatusAndJoinDeadlineBefore(MatchStatus.OPEN, now);
            for (MatchRoom room : expiredRooms) {
                expireRoom(room, now);
            }

            // Also check any open room without deadline whose booking start time is already in the past
            List<MatchRoom> openRooms = matchRoomRepository.findOpenRoomsWithoutGuestNotReminded();
            for (MatchRoom room : openRooms) {
                LocalDateTime startTime = getBookingStartTime(room.getBooking());
                if (now.isAfter(startTime)) {
                    expireRoom(room, now);
                }
            }
        } catch (Exception ignored) {}

        // 2. Send 3-4 hour advance reminder for OPEN rooms without opponent
        try {
            sendNoOpponentReminders(now);
        } catch (Exception ignored) {}

        // 3. Mark matches RESULT_OVERDUE if passed endTime + 1 hour without final result
        try {
            List<MatchStatus> pendingStatuses = Arrays.asList(MatchStatus.MATCHED, MatchStatus.UPCOMING, MatchStatus.SCORE_PENDING, MatchStatus.SCORE_CONFIRMING);
            List<Match> matches = matchRepository.findByStatusNotIn(Arrays.asList(MatchStatus.RESULT_FINAL, MatchStatus.DISPUTED, MatchStatus.CANCELLED, MatchStatus.RESULT_OVERDUE));

            for (Match m : matches) {
                if (m != null && pendingStatuses.contains(m.getStatus())) {
                    LocalDateTime endTime = getBookingEndTime(m);
                    LocalDateTime overdueThreshold = endTime.plusMinutes(config.getResultConfirmationGraceMinutes());
                    if (now.isAfter(overdueThreshold)) {
                        m.setStatus(MatchStatus.RESULT_OVERDUE);
                        matchRepository.save(m);

                        try {
                            if (m.getRoom() != null) {
                                MatchRoom room = m.getRoom();
                                room.setStatus(MatchStatus.RESULT_OVERDUE);
                                matchRoomRepository.save(room);
                            }
                        } catch (Exception ignored) {}
                    }
                }
            }
        } catch (Exception ignored) {}
    }

    private void expireRoom(MatchRoom room, LocalDateTime now) {
        if (room.getStatus() != MatchStatus.OPEN) return;

        room.setStatus(MatchStatus.EXPIRED);
        matchRoomRepository.save(room);

        String timeStr = formatBookingTime(room.getBooking());

        // Notify Host that room is expired but court booking is still theirs
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

        // Withdraw & notify all applicants
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

            // If within the reminder window (e.g. 3 hours before) and before start time
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