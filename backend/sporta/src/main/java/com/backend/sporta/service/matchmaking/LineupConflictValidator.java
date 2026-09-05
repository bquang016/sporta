package com.backend.sporta.service.matchmaking;

import com.backend.sporta.entity.BookingDetail;
import com.backend.sporta.entity.LineupMember;
import com.backend.sporta.entity.MatchLineup;
import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.enums.LineupStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.LineupMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Component
public class LineupConflictValidator {

    @Autowired
    private LineupMemberRepository lineupMemberRepository;

    /**
     * Kiểm tra xung đột đội hình khi thực hiện ghép trận (Matchmaking):
     * 1. Một người không thể có mặt ở cả 2 bên đội hình (Host và Guest) của cùng một trận đấu.
     * 2. Một người không thể thi đấu nếu đang có trận đấu khác đang diễn ra (IN_MATCH).
     */
    public void validateNoConflict(Long userId, MatchLineup targetLineup) {
        if (userId == null || targetLineup == null) return;

        // Chỉ kiểm tra khi đội hình này đang thực sự tham gia vào một trận đấu cụ thể
        if (targetLineup.getMatchRoom() == null && targetLineup.getStatus() != LineupStatus.IN_MATCH) {
            return;
        }

        List<LineupMember> activeMemberships = lineupMemberRepository.findActiveMembershipsByUserId(userId);
        Long targetClubId = targetLineup.getClub().getId();

        for (LineupMember membership : activeMemberships) {
            MatchLineup existingLineup = membership.getLineup();
            if (existingLineup == null || existingLineup.getId().equals(targetLineup.getId())) {
                continue;
            }

            Long existingClubId = existingLineup.getClub().getId();
            if (!existingClubId.equals(targetClubId)) {
                // Nếu đang trong trận đấu IN_MATCH
                if (existingLineup.getStatus() == LineupStatus.IN_MATCH) {
                    throw new CustomException(
                            "Thành viên này đang trực tiếp thi đấu cho CLB \"" + existingLineup.getClub().getName()
                                    + "\" (Đội " + existingLineup.getName() + "). Vui lòng chờ trận đấu kết thúc hoặc thay người!",
                            400);
                }
            }
        }
    }

    private LocalDate getLineupMatchDate(MatchLineup lineup) {
        if (lineup == null) return null;
        MatchRoom room = lineup.getMatchRoom();
        if (room != null && room.getBooking() != null && room.getBooking().getDetails() != null
                && !room.getBooking().getDetails().isEmpty()) {
            return room.getBooking().getDetails().stream()
                    .map(BookingDetail::getBookingDate)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}
