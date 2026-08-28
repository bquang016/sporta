package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.event.BookingPaidEvent;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserWalletServiceImpl implements UserWalletService {

    @Autowired
    private UserWalletRepository userWalletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Value("${wallet.booking-discount-percent:5}")
    private int bookingDiscountPercent;

    private static final NumberFormat VND_FORMAT = NumberFormat.getInstance(new Locale("vi", "VN"));

    // ─── Get Balance ─────────────────────────────────────────────────────────────

    @Override
    public WalletBalanceResponse getBalance(String userEmail) {
        User user = findUserByEmail(userEmail);
        UserWallet wallet = getOrCreateWallet(user);

        return WalletBalanceResponse.builder()
                .balance(wallet.getBalance())
                .formattedBalance(VND_FORMAT.format(wallet.getBalance()) + " VNĐ")
                .build();
    }

    // ─── Initiate Top Up ────────────────────────────────────────────────────────

    @Override
    public TopUpResponse initiateTopUp(String userEmail, TopUpRequest request) {
        User user = findUserByEmail(userEmail);

        // Gọi Module 1 (PaymentService) qua interface để tạo link PayOS
        CreatePaymentResponse paymentResponse = paymentService.createPaymentLink(
                user.getId(),
                request.getAmount(),
                PaymentTransactionType.TOP_UP,
                "Nạp ví Sporta",
                null,
                null
        );

        log.info("Top-up initiated: userId={}, amount={}, orderCode={}",
                user.getId(), request.getAmount(), paymentResponse.getOrderCode());

        return TopUpResponse.builder()
                .orderCode(paymentResponse.getOrderCode())
                .checkoutUrl(paymentResponse.getCheckoutUrl())
                .qrCode(paymentResponse.getQrCode())
                .amount(request.getAmount())
                .message("Vui lòng thanh toán để nạp tiền vào ví")
                .build();
    }

    // ─── Process Top-Up Completion (Called by Event Listener) ────────────────────

    @Override
    @Transactional
    public void processTopUpCompletion(Long orderCode, Long amount, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        UserWallet wallet = getOrCreateWallet(user);
        long balanceBefore = wallet.getBalance();
        wallet.setBalance(balanceBefore + amount);
        userWalletRepository.save(wallet);

        // Log giao dịch
        WalletTransaction txn = WalletTransaction.builder()
                .walletType(WalletType.USER)
                .userId(userId)
                .transactionType(WalletTransactionType.TOP_UP)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .description("Nạp tiền vào ví - Mã GD: " + orderCode)
                .build();
        walletTransactionRepository.save(txn);

        log.info("Top-up completed: userId={}, amount={}, newBalance={}",
                userId, amount, wallet.getBalance());
    }

    // ─── Pay Booking with Wallet ────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingResponse payBookingWithWallet(String userEmail, WalletPayBookingRequest request) {
        User user = findUserByEmail(userEmail);
        UserWallet wallet = getOrCreateWallet(user);

        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new CustomException("Danh sách khung giờ không được để trống", 400);
        }

        // Lấy venue từ court đầu tiên
        UUID firstCourtId = request.getSlots().get(0).getCourtId();
        Court firstCourt = courtRepository.findById(firstCourtId)
                .orElseThrow(() -> new CustomException("Không tìm thấy sân", 404));
        Venue venue = firstCourt.getVenue();

        // Tính tổng giá
        double totalPrice = 0.0;
        List<BookingDetail> details = new ArrayList<>();

        // Sắp xếp để tránh deadlock
        request.getSlots().sort(java.util.Comparator.comparing(BookingSlotRequest::getCourtId));

        Booking booking = Booking.builder()
                .user(user)
                .venue(venue)
                .bookingCode(generateBookingCode())
                .paymentMethod("WALLET")
                .status(BookingStatus.CONFIRMED)
                .isManual(false)
                .build();

        for (BookingSlotRequest slot : request.getSlots()) {
            Court court = courtRepository.findByIdWithLock(slot.getCourtId())
                    .orElseThrow(() -> new CustomException("Không tìm thấy sân " + slot.getCourtId(), 404));

            if (!court.getVenue().getId().equals(venue.getId())) {
                throw new CustomException("Các khung giờ đặt phải thuộc cùng một cơ sở thể thao", 400);
            }

            // Kiểm tra xung đột
            boolean conflict = bookingDetailRepository.existsConflict(
                    court.getId(), slot.getBookingDate(), slot.getStartTime());
            if (conflict) {
                throw new CustomException(
                        String.format("Khung giờ %s - %s ngày %s của sân %s đã được đặt.",
                                slot.getStartTime(), slot.getEndTime(), slot.getBookingDate(), court.getName()),
                        409);
            }

            double price = court.getPrice();
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

        // Bỏ chiết khấu ví theo yêu cầu
        long finalPrice = Math.round(totalPrice);
        long discountAmount = 0;

        // Kiểm tra đủ tiền
        if (wallet.getBalance() < finalPrice) {
            throw new CustomException(
                    String.format("Số dư không đủ. Cần %s VNĐ, bạn có %s VNĐ",
                            VND_FORMAT.format(finalPrice), VND_FORMAT.format(wallet.getBalance())),
                    400);
        }

        // Trừ tiền
        long balanceBefore = wallet.getBalance();
        wallet.setBalance(balanceBefore - finalPrice);
        userWalletRepository.save(wallet);

        // Lưu booking
        booking.setDetails(details);
        booking.setTotalPrice(totalPrice);
        booking.setDiscountAmount((double) discountAmount);
        booking.setFinalPrice((double) finalPrice);
        booking.setWalletDiscountAmount(discountAmount);
        booking = bookingRepository.save(booking);

        // Log giao dịch ví
        WalletTransaction walletTxn = WalletTransaction.builder()
                .walletType(WalletType.USER)
                .userId(user.getId())
                .transactionType(WalletTransactionType.BOOKING_PAYMENT)
                .amount(finalPrice)
                .balanceBefore(balanceBefore)
                .balanceAfter(wallet.getBalance())
                .referenceId(booking.getId())
                .description("Thanh toán đặt sân - " + booking.getBookingCode())
                .build();
        walletTransactionRepository.save(walletTxn);

        log.info("Booking paid with wallet: userId={}, bookingId={}, amount={}, discount={}",
                user.getId(), booking.getId(), finalPrice, discountAmount);

        // Publish event cho Module 3 (Owner Wallet) cộng doanh thu
        Owner venueOwner = venue.getOwner();
        eventPublisher.publishEvent(new BookingPaidEvent(
                this,
                booking.getId(),
                finalPrice,
                venue.getId(),
                venueOwner.getId()
        ));

        return mapBookingToResponse(booking);
    }

    // ─── Credit Booking Refund ──────────────────────────────────────────────────
    @Override
    @Transactional
    public long creditBookingRefund(Long userId, UUID bookingId, Long refundAmount, String bookingCode, int refundRate) {
        if (refundAmount <= 0) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
            UserWallet wallet = getOrCreateWallet(user);
            return wallet.getBalance();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        UserWallet wallet = getOrCreateWallet(user);

        long balanceBefore = wallet.getBalance();
        long balanceAfter = balanceBefore + refundAmount;
        wallet.setBalance(balanceAfter);
        userWalletRepository.save(wallet);

        // Ghi log giao dịch ví
        WalletTransaction txn = WalletTransaction.builder()
                .walletType(WalletType.USER)
                .userId(userId)
                .transactionType(WalletTransactionType.BOOKING_REFUND)
                .amount(refundAmount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .referenceId(bookingId)
                .description("Hoàn tiền hủy đơn đặt sân - " + bookingCode + " (Hoàn " + refundRate + "%)")
                .build();
        walletTransactionRepository.save(txn);

        log.info("Booking refund credited to user wallet: userId={}, bookingId={}, amount={}, newBalance={}",
                userId, bookingId, refundAmount, balanceAfter);

        return balanceAfter;
    }

    // ─── Transaction History ────────────────────────────────────────────────────

    @Override
    public List<WalletTransactionResponse> getTransactionHistory(String userEmail, int page, int size) {
        User user = findUserByEmail(userEmail);

        return walletTransactionRepository
                .findByWalletTypeAndUserIdOrderByCreatedAtDesc(WalletType.USER, user.getId(), PageRequest.of(page, size))
                .stream()
                .map(this::mapToWalletTxnResponse)
                .collect(Collectors.toList());
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
    }

    /**
     * Lazy initialization: tạo ví nếu chưa có.
     */
    private UserWallet getOrCreateWallet(User user) {
        return userWalletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserWallet newWallet = UserWallet.builder()
                            .user(user)
                            .balance(0L)
                            .build();
                    return userWalletRepository.save(newWallet);
                });
    }

    private String generateBookingCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.util.Random rnd = new java.util.Random();
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

    private BookingResponse mapBookingToResponse(Booking booking) {
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
                .playerName(booking.getUser().getFullName())
                .playerEmail(booking.getUser().getEmail())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private WalletTransactionResponse mapToWalletTxnResponse(WalletTransaction txn) {
        return WalletTransactionResponse.builder()
                .id(txn.getId())
                .walletType(txn.getWalletType())
                .transactionType(txn.getTransactionType())
                .amount(txn.getAmount())
                .balanceBefore(txn.getBalanceBefore())
                .balanceAfter(txn.getBalanceAfter())
                .referenceId(txn.getReferenceId())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
