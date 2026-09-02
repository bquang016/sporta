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
     * Kiểm tra ràng buộc: Một thành viên không được tham gia cùng lúc ở đội hình ra sân của 2 CLB khác nhau.
     * 
     * @param userId        ID người dùng
     * @param targetLineup  Đội hình dự kiến thêm vào
     */
    public void validateNoConflict(Long userId, MatchLineup targetLineup) {
        if (userId == null || targetLineup == null) return;

        List<LineupMember> activeMemberships = lineupMemberRepository.findActiveMembershipsByUserId(userId);
        Long targetClubId = targetLineup.getClub().getId();

        for (LineupMember membership : activeMemberships) {
            MatchLineup existingLineup = membership.getLineup();
            if (existingLineup == null || existingLineup.getId().equals(targetLineup.getId())) {
                continue;
            }

            Long existingClubId = existingLineup.getClub().getId();
            // Nếu thuộc CLB khác
            if (!existingClubId.equals(targetClubId)) {
                // Kiểm tra xem có trùng lịch thi đấu / trùng phòng ghép trận hay không
                LocalDate existingDate = getLineupMatchDate(existingLineup);
                LocalDate targetDate = getLineupMatchDate(targetLineup);

                // Nếu cả hai đều có ngày thi đấu và trùng ngày, hoặc 1 trong 2 đang trong trận đấu IN_MATCH
                if (existingLineup.getStatus() == LineupStatus.IN_MATCH || targetLineup.getStatus() == LineupStatus.IN_MATCH) {
                    throw new CustomException(
                            "Thành viên này đang trong trận đấu của CLB \"" + existingLineup.getClub().getName()
                                    + "\" (Đội " + existingLineup.getName() + "). Không thể tham gia đội hình CLB khác!",
                            400);
                }

                if (existingDate != null && targetDate != null && existingDate.isEqual(targetDate)) {
                    throw new CustomException(
                            "Thành viên này đã đăng ký thi đấu cho CLB \"" + existingLineup.getClub().getName()
                                    + "\" (Đội " + existingLineup.getName() + ") vào ngày " + existingDate
                                    + ". Một thành viên không thể ra sân cho 2 CLB cùng ngày!",
                            400);
                }

                // Nếu đội hình hiện tại đang gắn vào MatchRoom chưa hoàn thành
                if (existingLineup.getMatchRoom() != null && targetLineup.getMatchRoom() != null) {
                    throw new CustomException(
                            "Thành viên này đã có tên trong danh sách thi đấu của CLB \"" + existingLineup.getClub().getName()
                                    + "\" tại một phòng ghép trận khác.",
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
