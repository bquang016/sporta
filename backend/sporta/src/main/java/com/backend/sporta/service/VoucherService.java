package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.UserVoucherStatus;
import com.backend.sporta.enums.VoucherScope;
import com.backend.sporta.enums.VoucherStatus;
import com.backend.sporta.enums.DiscountType;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private VoucherVenueRepository voucherVenueRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    @Autowired
    private BookingVoucherRepository bookingVoucherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    // --- OWNER VOUCHER API ---

    @Transactional
    public VoucherResponse createOwnerVoucher(String ownerEmail, CreateVoucherRequest request) {
        validateVoucherRequest(request, false);

        Owner owner = ownerRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy chủ sân", 404));

        Voucher voucher = buildVoucherFromRequest(request, VoucherScope.VENUE);
        voucher.setOwner(owner);
        voucher = voucherRepository.save(voucher);

        saveVoucherVenues(voucher, request.getVenueIds());

        return mapToVoucherResponse(voucher);
    }

    @Transactional
    public VoucherResponse updateOwnerVoucher(String ownerEmail, UUID voucherId, UpdateVoucherRequest request) {
        Voucher voucher = getOwnerVoucher(ownerEmail, voucherId);
        return updateVoucherInternal(voucher, request);
    }

    @Transactional
    public void disableOwnerVoucher(String ownerEmail, UUID voucherId) {
        Voucher voucher = getOwnerVoucher(ownerEmail, voucherId);
        disableVoucherInternal(voucher);
    }

    public Page<VoucherResponse> getOwnerVouchers(String ownerEmail, VoucherStatus status, String keyword, Pageable pageable) {
        Owner owner = ownerRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy chủ sân", 404));
        UUID ownerId = owner.getId();
        
        Page<Voucher> page;
        if (keyword != null && !keyword.isEmpty()) {
            if (status != null) {
                page = voucherRepository.searchByOwnerAndStatus(ownerId, status, keyword, pageable);
            } else {
                page = voucherRepository.searchByOwner(ownerId, keyword, pageable);
            }
        } else {
            if (status != null) {
                page = voucherRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, status, pageable);
            } else {
                page = voucherRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable);
            }
        }
        return page.map(this::mapToVoucherResponse);
    }

    public VoucherResponse getOwnerVoucherDetail(String ownerEmail, UUID voucherId) {
        Voucher voucher = getOwnerVoucher(ownerEmail, voucherId);
        return mapToVoucherResponse(voucher);
    }

    private Voucher getOwnerVoucher(String ownerEmail, UUID voucherId) {
        Owner owner = ownerRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy chủ sân", 404));
                
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException("Không tìm thấy mã khuyến mãi", 404));
        if (voucher.getOwner() == null || !voucher.getOwner().getId().equals(owner.getId())) {
            throw new CustomException("Bạn không có quyền truy cập mã khuyến mãi này", 403);
        }
        return voucher;
    }

    // --- ADMIN VOUCHER API ---

    @Transactional
    public VoucherResponse createAdminVoucher(CreateVoucherRequest request) {
        validateVoucherRequest(request, true);

        Voucher voucher = buildVoucherFromRequest(request, VoucherScope.SYSTEM);
        if (request.getBannerImageUrl() == null || request.getBannerImageUrl().isEmpty()) {
            throw new CustomException("Voucher hệ thống phải có banner", 400);
        }
        voucher.setBannerImageUrl(request.getBannerImageUrl());
        voucher = voucherRepository.save(voucher);

        return mapToVoucherResponse(voucher);
    }

    @Transactional
    public VoucherResponse updateAdminVoucher(UUID voucherId, UpdateVoucherRequest request) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException("Không tìm thấy mã khuyến mãi", 404));
        if (voucher.getVoucherScope() != VoucherScope.SYSTEM) {
            throw new CustomException("Voucher này không phải voucher hệ thống", 400);
        }
        return updateVoucherInternal(voucher, request);
    }

    @Transactional
    public void disableAdminVoucher(UUID voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException("Không tìm thấy mã khuyến mãi", 404));
        if (voucher.getVoucherScope() != VoucherScope.SYSTEM) {
            throw new CustomException("Voucher này không phải voucher hệ thống", 400);
        }
        disableVoucherInternal(voucher);
    }

    public Page<VoucherResponse> getAdminVouchers(VoucherStatus status, String keyword, Pageable pageable) {
        Page<Voucher> page;
        if (keyword != null && !keyword.isEmpty()) {
            if (status != null) {
                page = voucherRepository.searchByScopeAndStatus(VoucherScope.SYSTEM, status, keyword, pageable);
            } else {
                page = voucherRepository.searchByScope(VoucherScope.SYSTEM, keyword, pageable);
            }
        } else {
            if (status != null) {
                page = voucherRepository.findByVoucherScopeAndStatusOrderByCreatedAtDesc(VoucherScope.SYSTEM, status, pageable);
            } else {
                page = voucherRepository.findByVoucherScopeOrderByCreatedAtDesc(VoucherScope.SYSTEM, pageable);
            }
        }
        return page.map(this::mapToVoucherResponse);
    }

    public VoucherResponse getAdminVoucherDetail(UUID voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException("Không tìm thấy mã khuyến mãi", 404));
        if (voucher.getVoucherScope() != VoucherScope.SYSTEM) {
            throw new CustomException("Voucher này không phải voucher hệ thống", 400);
        }
        return mapToVoucherResponse(voucher);
    }

    // --- USER VOUCHER API ---

    @Transactional
    public UserVoucherResponse collectVoucher(Long userId, UUID voucherId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException("Không tìm thấy mã khuyến mãi", 404));

        if (!voucher.isCurrentlyValid()) {
            throw new CustomException("Mã khuyến mãi không còn hiệu lực hoặc đã hết lượt sử dụng", 400);
        }

        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)) {
            throw new CustomException("Bạn đã lưu mã khuyến mãi này rồi", 400);
        }

        // Increment collectedQuantity if voucher is not completely used up
        int updated = voucherRepository.incrementCollectedQuantityIfPossible(voucherId);
        if (updated == 0) {
            throw new CustomException("Mã khuyến mãi đã hết lượt sử dụng", 400);
        }
        
        voucher = voucherRepository.findById(voucherId).get();

        UserVoucher userVoucher = UserVoucher.builder()
                .user(user)
                .voucher(voucher)
                .status(UserVoucherStatus.COLLECTED)
                .build();
        userVoucherRepository.save(userVoucher);

        return mapToUserVoucherResponse(userVoucher);
    }

    @Transactional
    public UserVoucherResponse collectVoucherByCode(Long userId, String voucherCode) {
        if (voucherCode == null || voucherCode.trim().isEmpty()) {
            throw new CustomException("Mã khuyến mãi không được để trống", 400);
        }
        String cleanCode = voucherCode.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(cleanCode)
                .orElseThrow(() -> new CustomException("Mã khuyến mãi '" + cleanCode + "' không tồn tại", 404));
        return collectVoucher(userId, voucher.getId());
    }

    public List<UserVoucherResponse> getUserVouchers(Long userId, UserVoucherStatus status) {
        List<UserVoucher> userVouchers;
        if (status != null) {
            userVouchers = userVoucherRepository.findByUserIdAndStatusOrderByCollectedAtDesc(userId, status);
        } else {
            userVouchers = userVoucherRepository.findByUserIdOrderByCollectedAtDesc(userId);
        }
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        return userVouchers.stream()
                .filter(uv -> {
                    // If voucher expired, only display if expired within last 24h
                    if (uv.getVoucher() != null && uv.getVoucher().getEndDate() != null) {
                        boolean isExpired = uv.getVoucher().getEndDate().isBefore(LocalDateTime.now()) || uv.getStatus() == UserVoucherStatus.EXPIRED;
                        if (isExpired && uv.getVoucher().getEndDate().isBefore(twentyFourHoursAgo)) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(this::mapToUserVoucherResponse)
                .collect(Collectors.toList());
    }

    public List<VoucherResponse> getActiveBannerVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> vouchers = voucherRepository.findActiveBannerVouchers(now, org.springframework.data.domain.PageRequest.of(0, 10));
        return vouchers.stream().map(this::mapToVoucherResponse).collect(Collectors.toList());
    }

    public List<VoucherResponse> getExploreVouchers(VoucherScope scope) {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        List<Voucher> vouchers = voucherRepository.findExploreVouchers(scope, twentyFourHoursAgo);
        return vouchers.stream().map(this::mapToVoucherResponse).collect(Collectors.toList());
    }

    // --- BOOKING VOUCHER LOGIC ---

    public ApplyVoucherResponse previewApplyVouchers(ApplyVoucherRequest request, Long userId) {
        return applyVouchersInternal(request.getOwnerVoucherCode(), request.getSystemVoucherCode(),
                request.getVenueId(), request.getTotalPrice(), false, null, userId);
    }

    /**
     * Called by BookingService to actually commit the voucher usage.
     */
    @Transactional
    public ApplyVoucherResponse commitApplyVouchers(String ownerCode, String systemCode, UUID venueId, Double totalPrice, Booking booking, Long userId) {
        return applyVouchersInternal(ownerCode, systemCode, venueId, totalPrice, true, booking, userId);
    }

    private ApplyVoucherResponse applyVouchersInternal(String ownerCode, String systemCode, UUID venueId, Double totalPrice, boolean isCommit, Booking booking, Long userId) {
        ApplyVoucherResponse response = new ApplyVoucherResponse();
        response.setFinalPrice(totalPrice);
        
        Double maxTotalDiscount = totalPrice * 0.8; // Cap 80%

        Voucher ownerVoucher = null;
        Voucher systemVoucher = null;
        Double ownerDiscount = 0.0;
        Double systemDiscount = 0.0;

        // 1. Process Owner Voucher
        if (ownerCode != null && !ownerCode.isEmpty()) {
            ownerVoucher = voucherRepository.findByCodeIgnoreCase(ownerCode)
                    .orElseThrow(() -> new CustomException("Mã khuyến mãi chủ sân không hợp lệ", 400));
            validateVoucherForBooking(ownerVoucher, venueId, totalPrice, VoucherScope.VENUE, userId);
            ownerDiscount = calculateDiscount(ownerVoucher, totalPrice);
        }

        // 2. Process System Voucher
        if (systemCode != null && !systemCode.isEmpty()) {
            systemVoucher = voucherRepository.findByCodeIgnoreCase(systemCode)
                    .orElseThrow(() -> new CustomException("Mã khuyến mãi hệ thống không hợp lệ", 400));
            validateVoucherForBooking(systemVoucher, venueId, totalPrice, VoucherScope.SYSTEM, userId);
            systemDiscount = calculateDiscount(systemVoucher, totalPrice);
        }

        // 3. Apply Cap 80%
        Double totalDiscount = ownerDiscount + systemDiscount;
        if (totalDiscount > maxTotalDiscount) {
            totalDiscount = maxTotalDiscount;
            response.setCappedAt80(true);
            response.getMessages().add("Tổng giảm giá đã được giới hạn ở mức 80% giá trị đơn hàng");
            
            // Re-allocate discounts proportionally if capped
            if (ownerDiscount > 0 && systemDiscount > 0) {
                double ownerRatio = ownerDiscount / (ownerDiscount + systemDiscount);
                ownerDiscount = maxTotalDiscount * ownerRatio;
                systemDiscount = maxTotalDiscount - ownerDiscount;
            } else if (ownerDiscount > 0) {
                ownerDiscount = maxTotalDiscount;
            } else {
                systemDiscount = maxTotalDiscount;
            }
        }

        response.setOwnerDiscount(ownerDiscount);
        response.setSystemDiscount(systemDiscount);
        response.setTotalDiscount(totalDiscount);
        response.setFinalPrice(totalPrice - totalDiscount);

        // 4. Commit changes if requested
        if (isCommit) {
            if (ownerVoucher != null) {
                commitVoucherUsage(ownerVoucher, ownerDiscount, booking, userId);
            }
            if (systemVoucher != null) {
                commitVoucherUsage(systemVoucher, systemDiscount, booking, userId);
            }
        }

        return response;
    }
    
    private void commitVoucherUsage(Voucher voucher, Double discount, Booking booking, Long userId) {
        int updated = voucherRepository.incrementUsedQuantityIfPossible(voucher.getId());
        if (updated == 0) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " đã đạt giới hạn sử dụng", 400);
        }
        
        voucher = voucherRepository.findById(voucher.getId()).get();
        
        BookingVoucher bv = BookingVoucher.builder()
                .booking(booking)
                .voucher(voucher)
                .voucherScope(voucher.getVoucherScope())
                .discountApplied(discount)
                .build();
        bookingVoucherRepository.save(bv);
        
        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId())
                .orElseThrow(() -> new CustomException("Người dùng chưa thu thập mã này", 400));
        userVoucher.setStatus(UserVoucherStatus.USED);
        userVoucher.setUsedAt(LocalDateTime.now());
        userVoucherRepository.save(userVoucher);
    }

    private void validateVoucherForBooking(Voucher voucher, UUID venueId, Double totalPrice, VoucherScope expectedScope, Long userId) {
        if (voucher.getVoucherScope() != expectedScope) {
            throw new CustomException("Loại mã khuyến mãi không đúng (Cần " + expectedScope + ")", 400);
        }
        
        // Ensure user has collected and can use this voucher
        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId())
                .orElseThrow(() -> new CustomException("Bạn chưa lưu mã khuyến mãi " + voucher.getCode(), 400));
                
        if (userVoucher.getStatus() != UserVoucherStatus.COLLECTED) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " đã được sử dụng hoặc không còn khả dụng trong ví của bạn", 400);
        }
        
        if (userVoucher.getCooldownUntil() != null && LocalDateTime.now().isBefore(userVoucher.getCooldownUntil())) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " đang trong thời gian chờ hoàn", 400);
        }
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " không còn hoạt động", 400);
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate())) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " chưa đến ngày/giờ bắt đầu hiệu lực", 400);
        }
        if (now.isAfter(voucher.getEndDate())) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " đã hết hạn", 400);
        }
        if (voucher.getUsedQuantity() >= voucher.getTotalQuantity()) {
            throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " đã hết số lượng", 400);
        }
        if (totalPrice < voucher.getMinOrderAmount()) {
            throw new CustomException("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getMinOrderAmount() + " để dùng mã " + voucher.getCode(), 400);
        }
        if (expectedScope == VoucherScope.VENUE) {
            List<VoucherVenue> venues = voucher.getApplicableVenues();
            if (venues != null && !venues.isEmpty()) {
                boolean applicable = venues.stream().anyMatch(vv -> vv.getVenue().getId().equals(venueId));
                if (!applicable) {
                    throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " không áp dụng cho cụm sân này", 400);
                }
            } else {
                // If applicableVenues is empty/null, it applies to all venues belonging to this owner
                if (voucher.getOwner() != null) {
                    boolean belongsToOwner = venueRepository.findById(venueId)
                            .map(v -> v.getOwner() != null && v.getOwner().getId().equals(voucher.getOwner().getId()))
                            .orElse(false);
                    if (!belongsToOwner) {
                        throw new CustomException("Mã khuyến mãi " + voucher.getCode() + " không thuộc quyền áp dụng của cụm sân này", 400);
                    }
                }
            }
        }
    }

    private Double calculateDiscount(Voucher voucher, Double totalPrice) {
        if (voucher.getDiscountType() == DiscountType.FIXED_AMOUNT) {
            return voucher.getDiscountValue();
        } else {
            Double discount = totalPrice * (voucher.getDiscountValue() / 100.0);
            if (voucher.getMaxDiscountAmount() != null && discount > voucher.getMaxDiscountAmount()) {
                return voucher.getMaxDiscountAmount();
            }
            return discount;
        }
    }

    @Transactional
    public void restoreVoucherOnCancel(Booking booking) {
        List<BookingVoucher> bvs = bookingVoucherRepository.findByBookingId(booking.getId());
        LocalDateTime now = LocalDateTime.now();
        
        for (BookingVoucher bv : bvs) {
            Voucher voucher = bv.getVoucher();
            if (voucher.getStatus() == VoucherStatus.ACTIVE && now.isBefore(voucher.getEndDate())) {
                voucher.setUsedQuantity(Math.max(0, voucher.getUsedQuantity() - 1));
                voucherRepository.save(voucher);
                
                userVoucherRepository.findByUserIdAndVoucherId(booking.getUser().getId(), voucher.getId())
                        .ifPresent(uv -> {
                            uv.setStatus(UserVoucherStatus.COLLECTED);
                            uv.setUsedAt(null);
                            uv.setCooldownUntil(now.plusMinutes(30));
                            userVoucherRepository.save(uv);
                        });
            }
        }
    }

    // --- INTERNAL HELPERS ---

    private VoucherResponse updateVoucherInternal(Voucher voucher, UpdateVoucherRequest request) {
        // Enforce Q13 rule: If used/collected, can only change name, totalQuantity(increase), endDate(extend), banner
        boolean hasInteractions = voucher.getCollectedQuantity() > 0;
        
        if (request.getName() != null) voucher.setName(request.getName());
        if (request.getBannerImageUrl() != null) voucher.setBannerImageUrl(request.getBannerImageUrl());
        
        if (request.getTotalQuantity() != null) {
            if (hasInteractions && request.getTotalQuantity() < voucher.getTotalQuantity()) {
                throw new CustomException("Không thể giảm số lượng mã khi đã có người thu thập", 400);
            }
            voucher.setTotalQuantity(request.getTotalQuantity());
        }
        
        if (request.getEndDate() != null) {
            if (hasInteractions && request.getEndDate().isBefore(voucher.getEndDate())) {
                throw new CustomException("Không thể rút ngắn thời hạn khi đã có người thu thập", 400);
            }
            voucher.setEndDate(request.getEndDate());
        }

        voucher = voucherRepository.save(voucher);
        return mapToVoucherResponse(voucher);
    }

    private void disableVoucherInternal(Voucher voucher) {
        voucher.setStatus(VoucherStatus.DISABLED);
        voucherRepository.save(voucher);
        
        List<UserVoucher> collectedVouchers = userVoucherRepository.findCollectedByVoucherId(voucher.getId());
        for (UserVoucher uv : collectedVouchers) {
            uv.setStatus(UserVoucherStatus.EXPIRED);
        }
        userVoucherRepository.saveAll(collectedVouchers);
    }

    private void validateVoucherRequest(CreateVoucherRequest request, boolean isAdmin) {
        if (voucherRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new CustomException("Mã khuyến mãi đã tồn tại", 400);
        }
        if (request.getStartDate().isBefore(LocalDateTime.now().minusMinutes(5))) { // Allow 5min buffer
            throw new CustomException("Ngày bắt đầu không được trong quá khứ", 400);
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new CustomException("Ngày kết thúc phải sau ngày bắt đầu", 400);
        }
        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue() > 100) {
                throw new CustomException("Giá trị giảm phần trăm không được vượt quá 100", 400);
            }
            // maxDiscountAmount may be null for percentage if no cap, but if present must be > 0
            if (request.getMaxDiscountAmount() != null && request.getMaxDiscountAmount() <= 0) {
                throw new CustomException("Giảm tối đa phải lớn hơn 0", 400);
            }
        }
    }

    private Voucher buildVoucherFromRequest(CreateVoucherRequest request, VoucherScope scope) {
        return Voucher.builder()
                .name(request.getName())
                .code(request.getCode())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .maxDiscountAmount(request.getDiscountType() == DiscountType.PERCENTAGE ? request.getMaxDiscountAmount() : null)
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : 0.0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalQuantity(request.getTotalQuantity())
                .voucherScope(scope)
                .status(VoucherStatus.ACTIVE)
                .maxUsagePerUser(1) // As per Q1
                .build();
    }

    private void saveVoucherVenues(Voucher voucher, List<UUID> venueIds) {
        if (venueIds != null && !venueIds.isEmpty()) {
            List<VoucherVenue> vvs = venueIds.stream()
                    .map(vid -> venueRepository.findById(vid)
                            .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân ID: " + vid, 404)))
                    .map(venue -> VoucherVenue.builder().voucher(voucher).venue(venue).build())
                    .collect(Collectors.toList());
            voucherVenueRepository.saveAll(vvs);
        }
    }

    private VoucherResponse mapToVoucherResponse(Voucher voucher) {
        List<UUID> venueIds = new ArrayList<>();
        List<String> venueNames = new ArrayList<>();
        if (voucher.getApplicableVenues() != null) {
            for (VoucherVenue vv : voucher.getApplicableVenues()) {
                venueIds.add(vv.getVenue().getId());
                venueNames.add(vv.getVenue().getName());
            }
        }

        return VoucherResponse.builder()
                .id(voucher.getId())
                .name(voucher.getName())
                .code(voucher.getCode())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .maxUsagePerUser(voucher.getMaxUsagePerUser())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .totalQuantity(voucher.getTotalQuantity())
                .collectedQuantity(voucher.getCollectedQuantity())
                .usedQuantity(voucher.getUsedQuantity())
                .voucherScope(voucher.getVoucherScope())
                .status(voucher.getStatus())
                .bannerImageUrl(voucher.getBannerImageUrl())
                .ownerId(voucher.getOwner() != null ? voucher.getOwner().getId() : null)
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .remainingQuantity(voucher.getRemainingQuantity())
                .usageRate(voucher.getUsageRate())
                .conversionRate(voucher.getConversionRate())
                .isExpired(LocalDateTime.now().isAfter(voucher.getEndDate()))
                .venueIds(venueIds.isEmpty() ? null : venueIds)
                .venueNames(venueNames.isEmpty() ? null : venueNames)
                .build();
    }

    private UserVoucherResponse mapToUserVoucherResponse(UserVoucher uv) {
        Voucher voucher = uv.getVoucher();
        LocalDateTime now = LocalDateTime.now();
        
        boolean isUpcoming = now.isBefore(voucher.getStartDate());
        boolean isSoldOut = voucher.getUsedQuantity() >= voucher.getTotalQuantity();
        boolean isUsable = uv.getStatus() == UserVoucherStatus.COLLECTED &&
                voucher.getStatus() == VoucherStatus.ACTIVE &&
                !isUpcoming &&
                !isSoldOut &&
                now.isBefore(voucher.getEndDate()) &&
                (uv.getCooldownUntil() == null || now.isAfter(uv.getCooldownUntil()));
        
        String reason = null;
        if (!isUsable) {
            if (uv.getStatus() == UserVoucherStatus.USED) reason = "Đã sử dụng";
            else if (uv.getStatus() == UserVoucherStatus.EXPIRED || voucher.getStatus() != VoucherStatus.ACTIVE) reason = "Mã không còn hiệu lực";
            else if (isUpcoming) reason = "Chưa đến ngày/giờ bắt đầu";
            else if (now.isAfter(voucher.getEndDate())) reason = "Mã đã hết hạn";
            else if (isSoldOut) reason = "Mã đã hết lượt sử dụng";
            else if (uv.getCooldownUntil() != null && now.isBefore(uv.getCooldownUntil())) reason = "Mã đang trong thời gian chờ hoàn (cooldown)";
        }

        List<UUID> venueIds = voucher.getApplicableVenues() != null ? 
                voucher.getApplicableVenues().stream().map(vv -> vv.getVenue().getId()).collect(Collectors.toList()) : null;
        List<String> venueNames = voucher.getApplicableVenues() != null ? 
                voucher.getApplicableVenues().stream().map(vv -> vv.getVenue().getName()).collect(Collectors.toList()) : null;

        return UserVoucherResponse.builder()
                .id(uv.getId())
                .voucherId(voucher.getId())
                .voucherName(voucher.getName())
                .voucherCode(voucher.getCode())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .voucherScope(voucher.getVoucherScope())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .status(uv.getStatus())
                .collectedAt(uv.getCollectedAt())
                .usedAt(uv.getUsedAt())
                .isUsable(isUsable)
                .reasonIfNotUsable(reason)
                .venueIds(venueIds)
                .venueNames(venueNames)
                .ownerId(voucher.getOwner() != null ? voucher.getOwner().getId() : null)
                .bannerImageUrl(voucher.getBannerImageUrl())
                .totalQuantity(voucher.getTotalQuantity())
                .usedQuantity(voucher.getUsedQuantity())
                .remainingQuantity(voucher.getRemainingQuantity())
                .build();
    }
}
