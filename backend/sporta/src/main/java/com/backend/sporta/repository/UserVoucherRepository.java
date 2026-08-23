package com.backend.sporta.repository;

import com.backend.sporta.entity.UserVoucher;
import com.backend.sporta.enums.UserVoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, UUID> {

    /** Kiểm tra user đã thu thập voucher này chưa (unique constraint check) */
    Optional<UserVoucher> findByUserIdAndVoucherId(Long userId, UUID voucherId);

    /** Kiểm tra tồn tại */
    boolean existsByUserIdAndVoucherId(Long userId, UUID voucherId);

    /** Ví voucher của user theo trạng thái */
    List<UserVoucher> findByUserIdAndStatusOrderByCollectedAtDesc(Long userId, UserVoucherStatus status);

    /** Tất cả voucher của user (cho ví voucher) */
    List<UserVoucher> findByUserIdOrderByCollectedAtDesc(Long userId);

    /** Đếm voucher chưa sử dụng của user (cho badge) */
    long countByUserIdAndStatus(Long userId, UserVoucherStatus status);

    /** Lấy voucher khả dụng (COLLECTED) của user cho danh sách voucher ID cụ thể */
    @Query("SELECT uv FROM UserVoucher uv WHERE uv.user.id = :userId AND uv.status = 'COLLECTED' " +
           "AND uv.voucher.id IN :voucherIds " +
           "AND (uv.cooldownUntil IS NULL OR uv.cooldownUntil < CURRENT_TIMESTAMP)")
    List<UserVoucher> findUsableByUserAndVoucherIds(@Param("userId") Long userId, @Param("voucherIds") List<UUID> voucherIds);

    /** Cập nhật tất cả voucher COLLECTED của một voucher thành EXPIRED (khi voucher bị disable/expire) */
    @Query("SELECT uv FROM UserVoucher uv WHERE uv.voucher.id = :voucherId AND uv.status = 'COLLECTED'")
    List<UserVoucher> findCollectedByVoucherId(@Param("voucherId") UUID voucherId);
}
