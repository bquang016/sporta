package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.event.NotificationEvent;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private com.backend.sporta.repository.CourtPriceRuleRepository courtPriceRuleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private UserWalletService userWalletService;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private OwnerWalletService ownerWalletService;

    @Autowired
    private VenuePolicyRepository venuePolicyRepository;

    @Autowired
    private MatchRoomRepository matchRoomRepository;

    private static final NumberFormat VND_FORMAT = NumberFormat.getInstance(new Locale("vi", "VN"));

    // ─── Create Booking ────────────────────────────────────────────────────────

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new CustomException("Danh sách khung giờ không được để trống", 400);
        }

        // Lấy venue từ court đầu tiên (giả định tất cả slot trong 1 booking thuộc cùng 1 venue)
        UUID firstCourtId = request.getSlots().get(0).getCourtId();
        Court firstCourt = courtRepository.findById(firstCourtId)
                .orElseThrow(() -> new CustomException("Không tìm thấy sân", 404));
        Venue venue = firstCourt.getVenue();

        double totalPrice = 0.0;
        List<BookingDetail> details = new ArrayList<>();

        Booking booking = Booking.builder()
                .user(user)
                .venue(venue)
                .bookingCode(generateBookingCode())
                .paymentMethod(request.getPaymentMethod())
                .status("payos".equals(request.getPaymentMethod()) ? BookingStatus.PENDING : (request.getStatus() != null ? request.getStatus() : BookingStatus.CONFIRMED))
                .isManual(request.getIsManual() != null ? request.getIsManual() : false)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .build();

        // Sắp xếp các slot theo courtId để tránh deadlock khi có nhiều court cần lock
        List<BookingSlotRequest> sortedSlots = new ArrayList<>(request.getSlots());
        sortedSlots.sort(java.util.Comparator.comparing(BookingSlotRequest::getCourtId));

        for (BookingSlotRequest slot : sortedSlots) {
            Court court = courtRepository.findByIdWithLock(slot.getCourtId())
                    .orElseThrow(() -> new CustomException("Không tìm thấy sân " + slot.getCourtId(), 404));

            // Kiểm tra court có thuộc đúng venue không
            if (!court.getVenue().getId().equals(venue.getId())) {
                throw new CustomException("Các khung giờ đặt phải thuộc cùng một cơ sở thể thao", 400);
            }

            // Kiểm tra xung đột: sân đã được đặt ở khung giờ này chưa
            boolean conflict = bookingDetailRepository.existsConflict(
                    court.getId(), slot.getBookingDate(), slot.getStartTime());
            if (conflict) {
                throw new CustomException(
                        String.format("Khung giờ %s - %s ngày %s của sân %s đã được đặt trước đó.",
                                slot.getStartTime(), slot.getEndTime(), slot.getBookingDate(), court.getName()),
                        409);
            }

            // Tính giá thực tế (ưu tiên rule theo ca giờ hoặc theo thứ, fallback về court.price)
            double actualPrice = resolveSlotPrice(court, slot.getBookingDate(), slot.getStartTime(), slot.getEndTime());
            totalPrice += actualPrice;

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .court(court)
                    .bookingDate(slot.getBookingDate())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .price(actualPrice)
                    .build();
            details.add(detail);
        }

        booking.setDetails(details);
        booking.setTotalPrice(totalPrice);

        // Áp dụng voucher nếu có
        double discount = 0.0;
        String ownerVoucher = request.getOwnerVoucherCode();
        String sysVoucher = request.getSystemVoucherCode();
        if ((ownerVoucher == null || ownerVoucher.isBlank()) && (sysVoucher == null || sysVoucher.isBlank()) && request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            sysVoucher = request.getVoucherCode();
        }

        if ((ownerVoucher != null && !ownerVoucher.isBlank()) || (sysVoucher != null && !sysVoucher.isBlank())) {
            var voucherResp = voucherService.previewApplyVouchers(
                    new ApplyVoucherRequest(ownerVoucher, sysVoucher, venue.getId(), totalPrice),
                    user.getId()
            );
            discount = voucherResp.getTotalDiscount() != null ? voucherResp.getTotalDiscount() : 0.0;
        }
        booking.setDiscountAmount(discount);
        booking.setFinalPrice(Math.max(0.0, totalPrice - discount));

        booking = bookingRepository.save(booking);

        // Ghi nhận sử dụng voucher sau khi lưu booking
        if (discount > 0 && ((ownerVoucher != null && !ownerVoucher.isBlank()) || (sysVoucher != null && !sysVoucher.isBlank()))) {
            voucherService.commitApplyVouchers(ownerVoucher, sysVoucher, venue.getId(), totalPrice, booking, user.getId());
        }

        // Nếu thanh toán bằng PayOS, tạo link thanh toán qua PaymentService (Module 1)
        if ("payos".equalsIgnoreCase(booking.getPaymentMethod())) {
            CreatePaymentResponse paymentResponse = paymentService.createPaymentLink(
                    user.getId(),
                    Math.round(booking.getFinalPrice()),
                    com.backend.sporta.enums.PaymentTransactionType.BOOKING_PAYMENT,
                    "Đặt sân " + booking.getBookingCode(),
                    "BOOKING",
                    booking.getId()
            );

            BookingResponse response = mapToBookingResponse(booking);
            response.setCheckoutUrl(paymentResponse.getCheckoutUrl());
            response.setOrderCode(paymentResponse.getOrderCode());
            return response;
        }

        // Nếu thanh toán bằng DEV / WALLET / Online khác và booking được CONFIRMED ngay
        if (booking.getStatus() == BookingStatus.CONFIRMED && !"cash".equalsIgnoreCase(booking.getPaymentMethod())) {
            if (booking.getVenue() != null && booking.getVenue().getOwner() != null) {
                try {
                    ownerWalletService.creditEarning(
                            booking.getVenue().getOwner().getId(),
                            booking.getId(),
                            Math.round(booking.getFinalPrice())
                    );
                } catch (Exception e) {
                    log.error("Lỗi cộng doanh thu ví chủ sân cho booking {}: {}", booking.getId(), e.getMessage());
                }
            }

            try {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        booking.getUser().getId(),
                        Role.PLAYER,
                        "Đặt sân thành công 🎉",
                        String.format("Đơn đặt sân %s tại %s đã được xác nhận thành công!",
                                booking.getBookingCode(), booking.getVenue().getName()),
                        NotificationType.BOOKING_SUCCESS,
                        booking.getId().toString()
                ));
            } catch (Exception ignored) {}
        }

        return mapToBookingResponse(booking);
    }

    /**
     * Xác nhận thanh toán thành công cho đơn đặt sân từ webhook PayOS
     */
    @Transactional
    public void confirmBookingPayment(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            log.error("Không tìm thấy booking để xác nhận thanh toán: {}", bookingId);
            return;
        }

        if (booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
            log.info("Booking {} đã được xác nhận thanh toán PayOS thành công.", booking.getBookingCode());

            // Ghi nhận doanh thu ví chủ sân
            if (booking.getVenue() != null && booking.getVenue().getOwner() != null) {
                try {
                    ownerWalletService.creditEarning(
                            booking.getVenue().getOwner().getId(),
                            booking.getId(),
                            Math.round(booking.getFinalPrice())
                    );
                } catch (Exception e) {
                    log.error("Lỗi cộng doanh thu ví chủ sân cho booking {}: {}", booking.getId(), e.getMessage());
                }
            }

            // Gửi thông báo Push Notification
            try {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        booking.getUser().getId(),
                        Role.PLAYER,
                        "Đặt sân thành công 🎉",
                        String.format("Đơn đặt sân %s tại %s đã được thanh toán thành công!",
                                booking.getBookingCode(), booking.getVenue().getName()),
                        NotificationType.BOOKING_SUCCESS,
                        booking.getId().toString()
                ));
            } catch (Exception ignored) {}
        }
    }

    // ─── Resolve Slot Price with Custom Rules ───────────────────────────────────

    private double resolveSlotPrice(Court court, LocalDate date, LocalTime startTime, LocalTime endTime) {
        if (date == null || startTime == null || endTime == null) {
            return court.getPrice() != null ? court.getPrice() : 0.0;
        }

        var rules = courtPriceRuleRepository.findByCourtId(court.getId());
        return com.backend.sporta.util.CourtPricingCalculationHelper.calculateSlotPrice(
                court.getPrice(), rules, date, startTime
        );
    }

    // ─── Generate Booking Code ──────────────────────────────────────────────────

    private String generateBookingCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder("SP-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        sb.append("-");
        for (int i = 0; i < 2; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));

        String code = sb.toString();
        if (bookingRepository.findByBookingCode(code).isPresent()) {
            return generateBookingCode(); // Retry nếu trùng
        }
        return code;
    }

    // ─── Get User Bookings ──────────────────────────────────────────────────────

    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        return getUserBookings(userEmail);
    }

    // ─── Get Booking Detail ─────────────────────────────────────────────────────

    public BookingResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân", 404));
        return mapToBookingResponse(booking);
    }

    public BookingResponse getBookingById(UUID id, String email) {
        return getBookingById(id);
    }

    public BookingResponse getBookingByCode(String code) {
        Booking booking = bookingRepository.findByBookingCode(code)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân với mã: " + code, 404));
        return mapToBookingResponse(booking);
    }

    // ─── Helper: Get Earliest Start Time ────────────────────────────────────────

    private LocalDateTime getEarliestBookingStartTime(Booking booking) {
        if (booking.getDetails() == null || booking.getDetails().isEmpty()) {
            return (booking.getCreatedAt() != null) ? booking.getCreatedAt().plusDays(1) : LocalDateTime.now().plusDays(1);
        }

        BookingDetail earliest = booking.getDetails().stream()
                .filter(d -> d.getBookingDate() != null && d.getStartTime() != null)
                .min(Comparator.comparing((BookingDetail d) -> LocalDateTime.of(d.getBookingDate(), d.getStartTime())))
                .orElse(null);

        if (earliest != null) {
            return LocalDateTime.of(earliest.getBookingDate(), earliest.getStartTime());
        }
        return (booking.getCreatedAt() != null) ? booking.getCreatedAt().plusDays(1) : LocalDateTime.now().plusDays(1);
    }

    // ─── Helper: Get Venue Policy ───────────────────────────────────────────────

    private VenuePolicy getEffectiveVenuePolicy(Venue venue) {
        if (venue == null) {
            return VenuePolicy.builder()
                    .freeCancellationHours(24)
                    .lateCancellationRefundRate(50)
                    .rainRescheduleAllowed(true)
                    .build();
        }
        if (venue.getVenuePolicy() != null) {
            return venue.getVenuePolicy();
        }
        return venuePolicyRepository.findByVenueId(venue.getId())
                .orElseGet(() -> VenuePolicy.builder()
                        .freeCancellationHours(24)
                        .lateCancellationRefundRate(50)
                        .rainRescheduleAllowed(true)
                        .build());
    }

    // ─── Cancellation Preview ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CancellationPreviewResponse getCancellationPreview(UUID bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân", 404));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        boolean isVenueOwner = booking.getVenue() != null &&
                booking.getVenue().getOwner() != null &&
                booking.getVenue().getOwner().getUser() != null &&
                booking.getVenue().getOwner().getUser().getEmail().equals(email);

        if (!isVenueOwner && !booking.getUser().getId().equals(user.getId())) {
            throw new CustomException("Bạn không có quyền xem thông tin hủy đơn đặt này", 403);
        }

        Venue venue = booking.getVenue();
        VenuePolicy policy = getEffectiveVenuePolicy(venue);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = getEarliestBookingStartTime(booking);
        LocalDateTime bookingCreatedAt = booking.getCreatedAt() != null ? booking.getCreatedAt() : now;

        Duration duration = Duration.between(now, startTime);
        double hoursRemaining = Math.max(0.0, duration.toMinutes() / 60.0);

        long minutesSinceBooking = Math.max(0, Duration.between(bookingCreatedAt, now).toMinutes());
        boolean isGracePeriod = minutesSinceBooking <= 10;
        long graceMinutesRemaining = Math.max(0, 10 - minutesSinceBooking);

        int freeHours = (policy.getFreeCancellationHours() != null) ? policy.getFreeCancellationHours() : 24;
        int lateRate = (policy.getLateCancellationRefundRate() != null) ? policy.getLateCancellationRefundRate() : 50;

        int refundRate;
        String policyDesc;
        boolean eligible = true;

        if (isGracePeriod) {
            refundRate = 100;
            policyDesc = "Trong thời gian ân hạn 10 phút sau khi đặt: Miễn phí hủy, hoàn 100% toàn bộ tiền vào Ví Sporta (còn " + (graceMinutesRemaining > 0 ? graceMinutesRemaining + " phút" : "dưới 1 phút") + ").";
        } else if (hoursRemaining >= freeHours) {
            refundRate = 100;
            policyDesc = "Hủy trước " + freeHours + " giờ thi đấu: Miễn phí hủy, hoàn 100% vào Ví Sporta.";
        } else if (hoursRemaining >= 2.0) {
            refundRate = lateRate;
            policyDesc = "Hủy muộn (còn " + String.format("%.1f", hoursRemaining) + "h): Hoàn " + lateRate + "% vào Ví Sporta, phí giữ lại " + (100 - lateRate) + "%.";
        } else {
            refundRate = 0;
            eligible = false;
            policyDesc = "Hủy quá sát giờ thi đấu (< 2 giờ) hoặc đã bắt đầu: Không đủ điều kiện hoàn tiền theo chính sách của sân.";
        }

        double paid = booking.getFinalPrice() != null ? booking.getFinalPrice() : 0.0;
        long refundAmount = Math.round(paid * (refundRate / 100.0));
        long cancellationFee = Math.round(paid) - refundAmount;

        String courtName = (booking.getDetails() != null && !booking.getDetails().isEmpty() && booking.getDetails().get(0).getCourt() != null)
                ? booking.getDetails().get(0).getCourt().getName()
                : "Sân";

        return CancellationPreviewResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .venueName(venue != null ? venue.getName() : "Cơ sở thể thao")
                .courtName(courtName)
                .startTime(startTime)
                .hoursRemaining(Math.round(hoursRemaining * 10.0) / 10.0)
                .originalPrice(booking.getTotalPrice())
                .finalPaidPrice(paid)
                .refundRate(refundRate)
                .refundAmount(refundAmount)
                .cancellationFee(cancellationFee)
                .policyDescription(policyDesc)
                .isEligibleForRefund(eligible)
                .refundDestination("Ví Sporta")
                .isGracePeriod(isGracePeriod)
                .graceMinutesRemaining(graceMinutesRemaining)
                .build();
    }

    // ─── Cancel Booking with Wallet Refund ──────────────────────────────────────

    @Transactional
    public CancelBookingResponse cancelBookingWithRefund(UUID bookingId, CancelBookingRequest request, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân", 404));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new CustomException("Đơn đặt sân này đã bị hủy trước đó", 400);
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new CustomException("Không thể hủy đơn đặt sân đã hoàn thành", 400);
        }

        // Kiểm tra xem đã qua giờ kết thúc thi đấu chưa
        if (booking.getDetails() != null && !booking.getDetails().isEmpty()) {
            boolean isFinished = booking.getDetails().stream().anyMatch(d -> {
                if (d.getBookingDate() == null || d.getEndTime() == null) return false;
                LocalDateTime endDateTime = LocalDateTime.of(d.getBookingDate(), d.getEndTime());
                return !endDateTime.isAfter(LocalDateTime.now());
            });
            if (isFinished) {
                booking.setStatus(BookingStatus.COMPLETED);
                bookingRepository.save(booking);
                throw new CustomException("Không thể hủy đơn đặt sân đã qua thời gian thi đấu", 400);
            }
        }

        // Check requester
        boolean isVenueOwner = booking.getVenue() != null &&
                booking.getVenue().getOwner() != null &&
                booking.getVenue().getOwner().getUser() != null &&
                booking.getVenue().getOwner().getUser().getEmail().equals(email);

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (isVenueOwner) {
            if (booking.getIsManual() == null || !booking.getIsManual()) {
                throw new CustomException("Chủ sân không thể hủy lịch đặt của khách hàng đặt qua ứng dụng", 403);
            }
        } else {
            if (!booking.getUser().getId().equals(currentUser.getId())) {
                throw new CustomException("Bạn không có quyền hủy đơn đặt này", 403);
            }
        }

        // Tính toán hoàn tiền
        Venue venue = booking.getVenue();
        VenuePolicy policy = getEffectiveVenuePolicy(venue);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = getEarliestBookingStartTime(booking);
        LocalDateTime bookingCreatedAt = booking.getCreatedAt() != null ? booking.getCreatedAt() : now;

        Duration duration = Duration.between(now, startTime);
        double hoursRemaining = Math.max(0.0, duration.toMinutes() / 60.0);

        long minutesSinceBooking = Math.max(0, Duration.between(bookingCreatedAt, now).toMinutes());
        boolean isGracePeriod = minutesSinceBooking <= 10;

        int freeHours = (policy.getFreeCancellationHours() != null) ? policy.getFreeCancellationHours() : 24;
        int lateRate = (policy.getLateCancellationRefundRate() != null) ? policy.getLateCancellationRefundRate() : 50;

        int refundRate;
        if (isGracePeriod) {
            refundRate = 100;
        } else if (hoursRemaining >= freeHours) {
            refundRate = 100;
        } else if (hoursRemaining >= 2.0) {
            refundRate = lateRate;
        } else {
            refundRate = 0;
        }

        double paid = booking.getFinalPrice() != null ? booking.getFinalPrice() : 0.0;
        long refundAmount = Math.round(paid * (refundRate / 100.0));
        long cancellationFee = Math.round(paid) - refundAmount;

        // 1. Hoàn tiền vào ví người dùng nếu có hoàn tiền
        long userNewBalance = 0L;
        if (refundAmount > 0) {
            userNewBalance = userWalletService.creditBookingRefund(
                    booking.getUser().getId(),
                    booking.getId(),
                    refundAmount,
                    booking.getBookingCode(),
                    refundRate
            );
        } else {
            var balanceResp = userWalletService.getBalance(booking.getUser().getEmail());
            userNewBalance = balanceResp.getBalance();
        }

        // 2. Khấu trừ doanh thu của Owner nếu đã được cộng trước đó
        if (venue != null && venue.getOwner() != null && refundAmount > 0) {
            try {
                ownerWalletService.debitBookingRefund(
                        venue.getOwner().getId(),
                        booking.getId(),
                        refundAmount,
                        booking.getBookingCode(),
                        refundRate
                );
            } catch (Exception e) {
                log.warn("Lỗi khấu trừ ví chủ sân khi hủy booking: {}", e.getMessage());
            }
        }

        // 3. Cập nhật Booking
        String reason = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? request.getReason().trim() + (request.getNote() != null && !request.getNote().isBlank() ? " (" + request.getNote().trim() + ")" : "")
                : "Người dùng hủy đặt sân";

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRefundAmount((double) refundAmount);
        booking.setRefundRate(refundRate);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // 4. Khôi phục voucher nếu có
        voucherService.restoreVoucherOnCancel(booking);

        // 5. Hủy phòng ghép kèo MatchRoom nếu có tạo từ booking này
        try {
            matchRoomRepository.findByBookingId(booking.getId()).ifPresent(room -> {
                if (room.getStatus() == MatchStatus.OPEN) {
                    room.setStatus(MatchStatus.CANCELLED);
                    matchRoomRepository.save(room);
                }
            });
        } catch (Exception ignored) {}

        // 6. Gửi thông báo Push Notification
        try {
            // Cho User
            String userMsg = refundAmount > 0
                    ? String.format("Đã hủy đơn %s và hoàn %s VNĐ vào Ví Sporta của bạn (Tỷ lệ hoàn %d%%).",
                        booking.getBookingCode(), VND_FORMAT.format(refundAmount), refundRate)
                    : String.format("Đã hủy đơn %s. Đơn hủy sát giờ không đủ điều kiện hoàn tiền theo chính sách sân.",
                        booking.getBookingCode());

            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    booking.getUser().getId(),
                    Role.PLAYER,
                    "Hủy đặt sân thành công 🎟️",
                    userMsg,
                    NotificationType.BOOKING_CANCELLED,
                    booking.getId().toString()
            ));

            // Cho Chủ sân
            if (venue != null && venue.getOwner() != null && venue.getOwner().getUser() != null) {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        venue.getOwner().getUser().getId(),
                        Role.OWNER,
                        "Khách hàng đã hủy lịch đặt sân ⚠️",
                        String.format("Khách hàng %s đã hủy đơn %s tại %s. Khung giờ thi đấu đã được tự động mở lại trên lịch.",
                                booking.getUser().getFullName(), booking.getBookingCode(), venue.getName()),
                        NotificationType.OWNER_BOOKING_CANCELLED,
                        booking.getId().toString()
                ));
            }
        } catch (Exception e) {
            log.warn("Lỗi gửi thông báo khi hủy booking: {}", e.getMessage());
        }

        String successMsg = refundAmount > 0
                ? String.format("Hủy đơn thành công. Đã hoàn %s VNĐ vào ví Sporta của bạn.", VND_FORMAT.format(refundAmount))
                : "Hủy đơn thành công.";

        return CancelBookingResponse.builder()
                .success(true)
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .status("CANCELLED")
                .refundAmount(refundAmount)
                .refundRate(refundRate)
                .cancellationFee(cancellationFee)
                .userWalletBalance(userNewBalance)
                .message(successMsg)
                .cancelledAt(booking.getCancelledAt())
                .build();
    }

    // ─── Legacy Cancel Booking (Delegates to Cancel with Refund) ────────────────

    @Transactional
    public void cancelBooking(UUID bookingId, String email) {
        cancelBookingWithRefund(bookingId, null, email);
    }

    // ─── Map to BookingResponse ─────────────────────────────────────────────────

    private BookingResponse mapToBookingResponse(Booking booking) {
        // Tự động cập nhật COMPLETED nếu thời gian đá đã qua
        if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PENDING) {
            if (booking.getDetails() != null && !booking.getDetails().isEmpty()) {
                boolean allFinished = booking.getDetails().stream().allMatch(d -> {
                    if (d.getBookingDate() == null || d.getEndTime() == null) return false;
                    LocalDateTime endDateTime = LocalDateTime.of(d.getBookingDate(), d.getEndTime());
                    return !endDateTime.isAfter(LocalDateTime.now());
                });
                if (allFinished) {
                    booking.setStatus(BookingStatus.COMPLETED);
                    bookingRepository.save(booking);
                }
            }
        }

        Venue venue = booking.getVenue();
        
        List<BookingDetailResponse> detailResponses = booking.getDetails().stream().map(d -> 
            BookingDetailResponse.builder()
                .id(d.getId())
                .courtId(d.getCourt().getId())
                .courtName(d.getCourt().getName())
                .bookingDate(d.getBookingDate())
                .startTime(d.getStartTime())
                .endTime(d.getEndTime())
                .price(d.getPrice())
                .build()
        ).collect(Collectors.toList());

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .venueId(venue != null ? venue.getId() : null)
                .venueName(venue != null ? venue.getName() : null)
                .venueLocation(venue != null ? venue.getLocation() : null)
                .venuePhone(venue != null && venue.getOwner() != null ? venue.getOwner().getPhoneNumber() : null)
                .totalPrice(booking.getTotalPrice())
                .discountAmount(booking.getDiscountAmount())
                .finalPrice(booking.getFinalPrice())
                .details(detailResponses)
                .paymentMethod(booking.getPaymentMethod())
                .status(booking.getStatus())
                .playerName(booking.getIsManual() != null && booking.getIsManual() ? booking.getCustomerName() : (booking.getUser() != null ? booking.getUser().getFullName() : null))
                .playerEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .playerPhone(booking.getIsManual() != null && booking.getIsManual() ? booking.getCustomerPhone() : (booking.getUser() != null ? booking.getUser().getPhoneNumber() : null))
                .refundAmount(booking.getRefundAmount())
                .refundRate(booking.getRefundRate())
                .cancellationReason(booking.getCancellationReason())
                .cancelledAt(booking.getCancelledAt())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
