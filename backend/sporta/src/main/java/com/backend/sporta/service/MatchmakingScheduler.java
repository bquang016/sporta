package com.backend.sporta.service;

import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.enums.MatchFlowType;
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
     * CronJob chạy định kỳ mỗi 60 giây để quét các phòng cọc giữ chỗ (DEPOSIT_HOLD)
     * đã quá hạn Dynamic TTL.
     * Khi hết hạn: Chuyển trạng thái sang EXPIRED và trả sân về AVAILABLE (không hoàn tiền cọc 50k).
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredMatchRooms() {
        LocalDateTime now = LocalDateTime.now();
        List<MatchRoom> openRooms = matchRoomRepository.findByStatusOrderByCreatedAtDesc(MatchRoomStatus.OPEN);
        
        for (MatchRoom room : openRooms) {
            if (room.getFlowType() == MatchFlowType.DEPOSIT_HOLD && room.getTtlExpiresAt() != null) {
                if (now.isAfter(room.getTtlExpiresAt())) {
                    log.info("Match room ID {} expired TTL at {}. Reverting to EXPIRED.", room.getId(), room.getTtlExpiresAt());
                    room.setStatus(MatchRoomStatus.EXPIRED);
                    matchRoomRepository.save(room);
                }
            }
        }
    }
}
