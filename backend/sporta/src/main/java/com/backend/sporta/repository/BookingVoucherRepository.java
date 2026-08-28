package com.backend.sporta.repository;

import com.backend.sporta.entity.BookingVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingVoucherRepository extends JpaRepository<BookingVoucher, UUID> {

    /** Lấy danh sách voucher đã áp dụng cho booking */
    List<BookingVoucher> findByBookingId(UUID bookingId);

    /** Kiểm tra voucher đã được dùng cho booking nào chưa */
    boolean existsByBookingIdAndVoucherId(UUID bookingId, UUID voucherId);
}
