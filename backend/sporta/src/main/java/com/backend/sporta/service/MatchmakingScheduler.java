package com.backend.sporta.service;

import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.enums.MatchRoomStatus;
import com.backend.sporta.repository.MatchRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchmakingScheduler {

    private final MatchRoomRepository matchRoomRepository;

    /**
     * Cronjob chạy mỗi 1 phút để quét các phòng giữ chỗ (Luồng 2) hoặc phòng chờ thanh toán (15m) quá hạn TTL
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processExpiredMatchRooms() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Quét các phòng quá 15m chờ thanh toán cưa đôi -> quay lại OPEN
        List<MatchRoom> expiredPaymentRooms = matchRoomRepository.findExpiredHoldRooms(MatchRoomStatus.PENDING_PAYMENT, now);
        for (MatchRoom room : expiredPaymentRooms) {
            log.info("Match room {} expired 15-min payment window, reverting to OPEN", room.getId());
            room.setMatchedClub(null);
            room.setStatus(MatchRoomStatus.OPEN);
            matchRoomRepository.save(room);
        }

        // 2. Quét các phòng cọc giữ chỗ (DEPOSIT_HOLD) ở trạng thái OPEN quá hạn Dynamic TTL -> chuyển thành EXPIRED (nhả sân)
        List<MatchRoom> expiredHoldRooms = matchRoomRepository.findExpiredHoldRooms(MatchRoomStatus.OPEN, now);
        for (MatchRoom room : expiredHoldRooms) {
            if (room.getFlowType() == com.backend.sporta.enums.MatchFlowType.DEPOSIT_HOLD) {
                log.info("Match room {} expired Dynamic TTL hold window, setting status to EXPIRED", room.getId());
                room.setStatus(MatchRoomStatus.EXPIRED);
                matchRoomRepository.save(room);
            }
        }
    }
}
