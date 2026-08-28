package com.backend.sporta.scheduler;

import com.backend.sporta.entity.Booking;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class BookingCleanupScheduler {

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Chạy mỗi 1 phút (60000ms) để dọn dẹp các booking bị "ngâm" quá lâu.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupPendingBookings() {
        // Hủy các booking ở trạng thái PENDING và tạo trước thời điểm hiện tại 15 phút
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.PENDING, cutoffTime);

        if (!expiredBookings.isEmpty()) {
            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.CANCELLED);
                // Ở đây sau này có thể thêm logic gửi Push Notification (như yêu cầu của user)
            }
            bookingRepository.saveAll(expiredBookings);
            System.out.println("Cleaned up " + expiredBookings.size() + " expired pending bookings.");
        }
    }
}
