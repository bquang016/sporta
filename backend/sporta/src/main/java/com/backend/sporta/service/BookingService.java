package com.backend.sporta.service;

import com.backend.sporta.dto.BookingDetailResponse;
import com.backend.sporta.dto.BookingResponse;
import com.backend.sporta.dto.BookingSlotRequest;
import com.backend.sporta.dto.CreateBookingRequest;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.BookingDetail;
import com.backend.sporta.entity.Court;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.BookingDetailRepository;
import com.backend.sporta.repository.BookingRepository;
import com.backend.sporta.repository.CourtRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private CourtRepository courtRepository;

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
        request.getSlots().sort(java.util.Comparator.comparing(BookingSlotRequest::getCourtId));

        for (BookingSlotRequest slot : request.getSlots()) {
            Court court = courtRepository.findByIdWithLock(slot.getCourtId())
                    .orElseThrow(() -> new CustomException("Không tìm thấy sân " + slot.getCourtId(), 404));

            if (!court.getVenue().getId().equals(venue.getId())) {
                throw new CustomException("Các khung giờ đặt phải thuộc cùng một cơ sở thể thao", 400);
            }

            // Kiểm tra xung đột slot
            boolean conflict = bookingDetailRepository.existsConflict(
                    court.getId(), slot.getBookingDate(), slot.getStartTime());
            if (conflict) {
                throw new CustomException(
                    String.format("Khung giờ %s - %s ngày %s của sân %s đã được đặt.", 
                        slot.getStartTime(), slot.getEndTime(), slot.getBookingDate(), court.getName()), 
                    409);
            }

            double price = court.getPrice(); // TODO: có thể tính theo rules nếu cần
            totalPrice += price;

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .court(court)
                    .bookingDate(slot.getBookingDate())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .price(price)
                    .build();
            details.add(detail);
        }

        booking.setDetails(details);
        booking.setTotalPrice(totalPrice);
        booking.setFinalPrice(totalPrice); // Default final price before discount
        booking.setDiscountAmount(0.0);
        
        booking = bookingRepository.save(booking); // Save first to get ID for booking_voucher

        // Apply vouchers if provided
        if ((request.getOwnerVoucherCode() != null && !request.getOwnerVoucherCode().isEmpty()) || 
            (request.getSystemVoucherCode() != null && !request.getSystemVoucherCode().isEmpty())) {
            
            com.backend.sporta.dto.ApplyVoucherResponse voucherResp = voucherService.commitApplyVouchers(
                request.getOwnerVoucherCode(), 
                request.getSystemVoucherCode(), 
                venue.getId(), 
                totalPrice, 
                booking, 
                user.getId()
            );
            
            booking.setFinalPrice(voucherResp.getFinalPrice());
            booking.setDiscountAmount(voucherResp.getTotalDiscount());
            booking = bookingRepository.save(booking);
        }

        BookingResponse response = mapToResponse(booking);

        // Create notifications and publish event if booking is confirmed or completed (e.g. DEV method)
        if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.COMPLETED) {
            try {
                if (booking.getVenue() != null && booking.getVenue().getOwner() != null) {
                    eventPublisher.publishEvent(new com.backend.sporta.event.BookingPaidEvent(
                            this,
                            booking.getId(),
                            Math.round(totalPrice),
                            booking.getVenue().getId(),
                            booking.getVenue().getOwner().getId()
                    ));
                }
            } catch (Exception e) {}

            try {
                notificationService.createNotification(
                        user.getId(),
                        user.getRole(),
                        "Đặt sân thành công",
                        "Đơn đặt sân tại " + venue.getName() + " (Mã: " + booking.getBookingCode() + ") đã được xác nhận thành công.",
                        NotificationType.BOOKING_SUCCESS,
                        booking.getId().toString()
                );
            } catch (Exception e) {}
        }

        // Generate PayOS link if needed
        if ("payos".equals(request.getPaymentMethod())) {
            com.backend.sporta.dto.CreatePaymentResponse paymentResponse = paymentService.createPaymentLink(
                    user.getId(),
                    Math.round(totalPrice),
                    com.backend.sporta.enums.PaymentTransactionType.BOOKING_PAYMENT,
                    "Thanh toán đặt sân - " + booking.getBookingCode(),
                    "BOOKING",
                    booking.getId()
            );
            response.setCheckoutUrl(paymentResponse.getCheckoutUrl());
            response.setOrderCode(paymentResponse.getOrderCode());
        }

        return response;
    }

    // ─── Get Booking by ID ─────────────────────────────────────────────────────

    // ─── Get Booking by ID ─────────────────────────────────────────────────────

    @Transactional
    public BookingResponse getBookingById(UUID bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân", 404));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        boolean isCustomer = booking.getUser() != null && booking.getUser().getId().equals(user.getId());
        boolean isOwner = booking.getVenue() != null && booking.getVenue().getOwner() != null 
                && booking.getVenue().getOwner().getUser() != null 
                && booking.getVenue().getOwner().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;

        if (!isCustomer && !isOwner && !isAdmin) {
            throw new CustomException("Bạn không có quyền xem đơn đặt sân này", 403);
        }

        return mapToResponse(booking);
    }

    // ─── Confirm Booking Payment (Webhook) ──────────────────────────────────────

    @Transactional
    public void confirmBookingPayment(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân", 404));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return; // Idempotent check
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Publish event for Owner Wallet
        try {
            if (booking.getVenue() != null && booking.getVenue().getOwner() != null) {
                eventPublisher.publishEvent(new com.backend.sporta.event.BookingPaidEvent(
                        this,
                        booking.getId(),
                        Math.round(booking.getFinalPrice()),
                        booking.getVenue().getId(),
                        booking.getVenue().getOwner().getId()
                ));
            }
        } catch (Exception e) {}

        try {
            if (booking.getUser() != null) {
                notificationService.createNotification(
                        booking.getUser().getId(),
                        booking.getUser().getRole(),
                        "Đặt sân thành công",
                        "Đơn đặt sân tại " + (booking.getVenue() != null ? booking.getVenue().getName() : "sân") + " (Mã: " + booking.getBookingCode() + ") đã được xác nhận thành công.",
                        NotificationType.BOOKING_SUCCESS,
                        booking.getId().toString()
                );
            }
        } catch (Exception e) {}
    }

    // ─── My Bookings ───────────────────────────────────────────────────────────

    @Transactional
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private String generateBookingCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder("SP-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        sb.append("-");
        for (int i = 0; i < 2; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));

        String code = sb.toString();
        if (bookingRepository.findByBookingCode(code).isPresent()) {
            return generateBookingCode();
        }
        return code;
    }

    private BookingResponse mapToResponse(Booking booking) {
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
                .venueId(venue.getId())
                .venueName(venue.getName())
                .venueLocation(venue.getLocation())
                .venuePhone(venue.getOwner() != null ? venue.getOwner().getPhoneNumber() : null)
                .totalPrice(booking.getTotalPrice())
                .discountAmount(booking.getDiscountAmount())
                .finalPrice(booking.getFinalPrice())
                .details(detailResponses)
                .paymentMethod(booking.getPaymentMethod())
                .status(booking.getStatus())
                .playerName(booking.getIsManual() != null && booking.getIsManual() ? booking.getCustomerName() : booking.getUser().getFullName())
                .playerEmail(booking.getUser().getEmail())
                .playerPhone(booking.getIsManual() != null && booking.getIsManual() ? booking.getCustomerPhone() : booking.getUser().getPhoneNumber())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    @Transactional
    public void cancelBooking(UUID bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn đặt sân", 404));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new CustomException("Đơn đặt sân này đã bị hủy trước đó", 400);
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new CustomException("Không thể hủy đơn đặt sân đã hoàn thành", 400);
        }

        // Kiểm tra xem đã qua giờ đá chưa
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

        // Check if requester is owner of the venue
        boolean isVenueOwner = booking.getVenue() != null &&
                booking.getVenue().getOwner() != null &&
                booking.getVenue().getOwner().getUser() != null &&
                booking.getVenue().getOwner().getUser().getEmail().equals(email);

        if (isVenueOwner) {
            if (booking.getIsManual() == null || !booking.getIsManual()) {
                throw new CustomException("Chủ sân không thể hủy lịch đặt của khách hàng đặt qua ứng dụng", 403);
            }
        } else {
            // Player cancelling their own booking
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
            if (!booking.getUser().getId().equals(user.getId())) {
                throw new CustomException("Bạn không có quyền hủy đơn đặt này", 403);
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        // Restore voucher if eligible
        voucherService.restoreVoucherOnCancel(booking);
    }
}
