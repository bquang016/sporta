package com.backend.sporta.repository;

import com.backend.sporta.entity.Booking;
import com.backend.sporta.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    // Các phương thức truy vấn slot đã được chuyển sang BookingDetailRepository

    /** Lịch sử đặt sân của user */
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);


    /** Tìm theo bookingCode */
    java.util.Optional<Booking> findByBookingCode(String bookingCode);

    /** Tìm các booking theo trạng thái và được tạo trước một mốc thời gian */
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, java.time.LocalDateTime cutoffTime);

    /** Kiểm tra user đã có Booking COMPLETED tại venue này chưa (dùng cho điều kiện review) */
    boolean existsByUserIdAndVenueIdAndStatus(Long userId, UUID venueId, BookingStatus status);
}
