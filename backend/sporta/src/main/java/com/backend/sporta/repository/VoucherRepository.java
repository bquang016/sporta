package com.backend.sporta.repository;

import com.backend.sporta.entity.Voucher;
import com.backend.sporta.enums.VoucherScope;
import com.backend.sporta.enums.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, UUID> {

    /** Tìm voucher theo mã (case-insensitive) */
    Optional<Voucher> findByCodeIgnoreCase(String code);

    /** Kiểm tra mã voucher đã tồn tại chưa */
    boolean existsByCodeIgnoreCase(String code);

    /** Danh sách voucher của owner (phân trang) */
    Page<Voucher> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    /** Danh sách voucher của owner theo trạng thái */
    Page<Voucher> findByOwnerIdAndStatusOrderByCreatedAtDesc(UUID ownerId, VoucherStatus status, Pageable pageable);

    /** Danh sách voucher hệ thống (phân trang) */
    Page<Voucher> findByVoucherScopeOrderByCreatedAtDesc(VoucherScope scope, Pageable pageable);

    /** Danh sách voucher hệ thống theo trạng thái */
    Page<Voucher> findByVoucherScopeAndStatusOrderByCreatedAtDesc(VoucherScope scope, VoucherStatus status, Pageable pageable);

    /** Tìm kiếm voucher của owner theo tên hoặc mã */
    @Query("SELECT v FROM Voucher v WHERE v.owner.id = :ownerId " +
           "AND (LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Voucher> searchByOwner(@Param("ownerId") UUID ownerId, @Param("keyword") String keyword, Pageable pageable);

    /** Tìm kiếm voucher của owner theo tên/mã + trạng thái */
    @Query("SELECT v FROM Voucher v WHERE v.owner.id = :ownerId AND v.status = :status " +
           "AND (LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Voucher> searchByOwnerAndStatus(@Param("ownerId") UUID ownerId, @Param("status") VoucherStatus status, @Param("keyword") String keyword, Pageable pageable);

    /** Tìm kiếm voucher hệ thống theo tên hoặc mã */
    @Query("SELECT v FROM Voucher v WHERE v.voucherScope = :scope " +
           "AND (LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Voucher> searchByScope(@Param("scope") VoucherScope scope, @Param("keyword") String keyword, Pageable pageable);

    /** Tìm kiếm voucher hệ thống theo tên/mã + trạng thái */
    @Query("SELECT v FROM Voucher v WHERE v.voucherScope = :scope AND v.status = :status " +
           "AND (LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Voucher> searchByScopeAndStatus(@Param("scope") VoucherScope scope, @Param("status") VoucherStatus status, @Param("keyword") String keyword, Pageable pageable);

    /** Voucher hệ thống có banner, đang active, chưa hết hạn (cho trang chủ user) */
    @Query("SELECT v FROM Voucher v WHERE v.voucherScope = 'SYSTEM' AND v.status = 'ACTIVE' " +
           "AND v.bannerImageUrl IS NOT NULL AND v.startDate <= :now AND v.endDate > :now " +
           "ORDER BY v.createdAt DESC")
    List<Voucher> findActiveBannerVouchers(@Param("now") LocalDateTime now);

    /** Voucher đã hết hạn nhưng chưa được cập nhật trạng thái */
    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.endDate <= :now")
    List<Voucher> findExpiredActiveVouchers(@Param("now") LocalDateTime now);

    /** Đếm voucher theo owner và trạng thái */
    long countByOwnerIdAndStatus(UUID ownerId, VoucherStatus status);

    /** Đếm tổng voucher của owner */
    long countByOwnerId(UUID ownerId);

    /** Đếm voucher hệ thống theo trạng thái */
    long countByVoucherScopeAndStatus(VoucherScope scope, VoucherStatus status);

    /** Đếm tổng voucher hệ thống */
    long countByVoucherScope(VoucherScope scope);

    /** Lấy voucher VENUE active áp dụng cho tất cả sân của owner (không có record VoucherVenue) */
    @Query("SELECT v FROM Voucher v WHERE v.voucherScope = 'VENUE' AND v.status = 'ACTIVE' " +
           "AND v.startDate <= :now AND v.endDate > :now " +
           "AND v.owner.id = :ownerId " +
           "AND NOT EXISTS (SELECT vv FROM VoucherVenue vv WHERE vv.voucher = v)")
    List<Voucher> findActiveOwnerVouchersForAllVenues(@Param("ownerId") UUID ownerId, @Param("now") LocalDateTime now);

    /** Lấy voucher VENUE active áp dụng cho venue cụ thể */
    @Query("SELECT v FROM Voucher v JOIN VoucherVenue vv ON vv.voucher = v " +
           "WHERE v.voucherScope = 'VENUE' AND v.status = 'ACTIVE' " +
           "AND v.startDate <= :now AND v.endDate > :now AND vv.venue.id = :venueId")
    List<Voucher> findActiveVouchersForVenue(@Param("venueId") UUID venueId, @Param("now") LocalDateTime now);

    /** Lấy voucher SYSTEM active */
    @Query("SELECT v FROM Voucher v WHERE v.voucherScope = 'SYSTEM' AND v.status = 'ACTIVE' " +
           "AND v.startDate <= :now AND v.endDate > :now")
    List<Voucher> findActiveSystemVouchers(@Param("now") LocalDateTime now);
}
