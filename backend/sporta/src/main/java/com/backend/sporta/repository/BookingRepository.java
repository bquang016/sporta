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

    /** Lấy tất cả booking sắp xếp mới nhất */
    List<Booking> findAllByOrderByCreatedAtDesc();


    /** Tìm theo bookingCode */
    java.util.Optional<Booking> findByBookingCode(String bookingCode);

    /** Tìm các booking theo trạng thái và được tạo trước một mốc thời gian */
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, java.time.LocalDateTime cutoffTime);

    /** Kiểm tra user đã có Booking COMPLETED tại venue này chưa (dùng cho điều kiện review) */
    boolean existsByUserIdAndVenueIdAndStatus(Long userId, UUID venueId, BookingStatus status);

    /** Tìm danh sách các Booking thuộc Venue có ngày chơi (BookingDetail.bookingDate) trong khoảng [fromDate, toDate] */
    @Query("SELECT DISTINCT b FROM Booking b " +
           "JOIN b.details d " +
           "WHERE b.venue.id = :venueId " +
           "AND d.bookingDate BETWEEN :fromDate AND :toDate " +
           "AND b.status IN :statuses")
    List<Booking> findBookingsByVenueAndDateRange(
            @Param("venueId") UUID venueId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT DISTINCT b.user.id FROM Booking b WHERE b.venue.owner.id = :ownerId AND b.status IN ('CONFIRMED', 'COMPLETED') AND b.user.notifPromo = true")
    List<Long> findUserIdsByOwnerBooking(@Param("ownerId") UUID ownerId);

    @Query("SELECT DISTINCT b.user.id FROM Booking b WHERE b.venue.id IN :venueIds AND b.status IN ('CONFIRMED', 'COMPLETED') AND b.user.notifPromo = true")
    List<Long> findUserIdsByVenueIds(@Param("venueIds") List<UUID> venueIds);
}
