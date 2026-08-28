package com.backend.sporta.repository;

import com.backend.sporta.entity.VoucherVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VoucherVenueRepository extends JpaRepository<VoucherVenue, UUID> {

    /** Lấy danh sách venue áp dụng cho voucher */
    List<VoucherVenue> findByVoucherId(UUID voucherId);

    /** Xóa tất cả venue mapping khi cập nhật voucher */
    void deleteByVoucherId(UUID voucherId);

    /** Kiểm tra voucher có áp dụng cho venue cụ thể không */
    boolean existsByVoucherIdAndVenueId(UUID voucherId, UUID venueId);
}
