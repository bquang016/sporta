package com.backend.sporta.repository;

import com.backend.sporta.entity.BookingDetail;
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
public interface BookingDetailRepository extends JpaRepository<BookingDetail, UUID> {

    @Query("SELECT d FROM BookingDetail d " +
           "WHERE d.court.id = :courtId " +
           "AND d.bookingDate = :date " +
           "AND d.booking.status IN :statuses")
    List<BookingDetail> findByCourtIdAndBookingDateAndBookingStatusIn(
            @Param("courtId") UUID courtId, 
            @Param("date") LocalDate date, 
            @Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT COUNT(d) > 0 FROM BookingDetail d " +
           "WHERE d.court.id = :courtId " +
           "AND d.bookingDate = :date " +
           "AND d.startTime = :startTime " +
           "AND d.booking.status IN (com.backend.sporta.enums.BookingStatus.PENDING, " +
           "                          com.backend.sporta.enums.BookingStatus.CONFIRMED)")
    boolean existsConflict(
            @Param("courtId") UUID courtId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime);

    @Query("SELECT d FROM BookingDetail d " +
           "JOIN FETCH d.court c " +
           "JOIN FETCH d.booking b " +
           "WHERE c.venue.id = :venueId " +
           "AND d.bookingDate BETWEEN :fromDate AND :toDate " +
           "AND b.status IN :statuses")
    List<BookingDetail> findValidBookingDetailsInDateRange(
            @Param("venueId") UUID venueId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("statuses") List<BookingStatus> statuses);
}
