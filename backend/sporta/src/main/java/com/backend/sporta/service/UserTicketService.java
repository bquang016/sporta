package com.backend.sporta.service;

import com.backend.sporta.dto.ApplyVoucherRequest;
import com.backend.sporta.dto.CreatePaymentResponse;
import com.backend.sporta.dto.PurchaseTicketRequest;
import com.backend.sporta.dto.TicketSessionResponse;
import com.backend.sporta.dto.UserTicketResponse;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserTicketService {

    @Autowired
    private TicketSessionRepository ticketSessionRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserWalletRepository userWalletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    @Lazy
    private OwnerWalletService ownerWalletService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    public List<TicketSessionResponse> getAvailableSessions(Double userLat, 
                                                            Double userLng, 
                                                            Integer radiusKm, 
                                                            String timeSlot, 
                                                            SportLevel sportLevel, 
                                                            String keyword) {
        LocalDate today = LocalDate.now();
        List<TicketSession> sessions = ticketSessionRepository.findAvailableSessions(today, sportLevel);

        return sessions.stream()
                .filter(s -> s.getStatus() == TicketSessionStatus.OPEN)
                .filter(s -> s.getBookedSlots() < s.getMaxSlots())
                .filter(s -> {
                    if (keyword == null || keyword.trim().isEmpty()) return true;
                    String kw = keyword.trim().toLowerCase();
                    String venueName = s.getVenue().getName() != null ? s.getVenue().getName().toLowerCase() : "";
                    String courtName = s.getCourt().getName() != null ? s.getCourt().getName().toLowerCase() : "";
                    String address = s.getVenue().getAddressDetail() != null ? s.getVenue().getAddressDetail().toLowerCase() : "";
                    return venueName.contains(kw) || courtName.contains(kw) || address.contains(kw);
                })
                .filter(s -> {
                    if (timeSlot == null || timeSlot.trim().isEmpty() || "ALL".equalsIgnoreCase(timeSlot)) return true;
                    LocalTime start = s.getStartTime();
                    if ("MORNING".equalsIgnoreCase(timeSlot)) {
                        return !start.isBefore(LocalTime.of(6, 0)) && start.isBefore(LocalTime.of(12, 0));
                    } else if ("AFTERNOON".equalsIgnoreCase(timeSlot)) {
                        return !start.isBefore(LocalTime.of(12, 0)) && start.isBefore(LocalTime.of(18, 0));
                    } else if ("EVENING".equalsIgnoreCase(timeSlot)) {
                        return !start.isBefore(LocalTime.of(18, 0));
                    }
                    return true;
                })
                .filter(s -> {
                    if (userLat == null || userLng == null || radiusKm == null || radiusKm <= 0) return true;
                    Double vLat = s.getVenue().getLatitude();
                    Double vLng = s.getVenue().getLongitude();
                    if (vLat == null || vLng == null) return true;
                    double dist = calculateHaversineDistance(userLat, userLng, vLat, vLng);
                    return dist <= radiusKm;
                })
                .map(this::mapToSessionResponse)
                .collect(Collectors.toList());
    }

    public TicketSessionResponse getSessionDetail(UUID sessionId) {
        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));
        return mapToSessionResponse(session);
    }

    @Transactional
    public UserTicketResponse purchaseTicket(UUID sessionId, String userEmail, int quantity) {
        PurchaseTicketRequest req = PurchaseTicketRequest.builder()
                .quantity(quantity)
                .paymentMethod("payos")
                .build();
        return purchaseTicket(sessionId, userEmail, req);
    }

    @Transactional
    public UserTicketResponse purchaseTicket(UUID sessionId, String userEmail, PurchaseTicketRequest request) {
        int quantity = request != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
        String paymentMethod = request != null && request.getPaymentMethod() != null ? request.getPaymentMethod().toLowerCase() : "payos";

        // Concurrency Control: Lock the TicketSession row via Pessimistic Lock
        TicketSession session = ticketSessionRepository.findByIdWithLock(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        int availableSlots = session.getMaxSlots() - session.getBookedSlots();

        if (session.getStatus() != TicketSessionStatus.OPEN || availableSlots < quantity) {
            if (availableSlots <= 0) {
                throw new CustomException("Rất tiếc, vé cuối cùng vừa được mua", 409);
            } else {
                throw new CustomException("Rất tiếc, ca xé vé chỉ còn " + availableSlots + " slot trống", 409);
            }
        }

        if (userEmail == null || "anonymousUser".equalsIgnoreCase(userEmail)) {
            throw new CustomException("Vui lòng đăng nhập để thực hiện đặt vé xé", 401);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin người dùng", 404));

        // 1. Calculate price & vouchers
        BigDecimal unitPrice = session.getPricePerTicket();
        BigDecimal rawTotalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        double rawTotalPriceDouble = rawTotalPrice.doubleValue();

        double discount = 0.0;
        String ownerVoucher = request != null ? request.getOwnerVoucherCode() : null;
        String sysVoucher = request != null ? request.getSystemVoucherCode() : null;

        if ((ownerVoucher != null && !ownerVoucher.isBlank()) || (sysVoucher != null && !sysVoucher.isBlank())) {
            try {
                var voucherResp = voucherService.previewApplyVouchers(
                        new ApplyVoucherRequest(ownerVoucher, sysVoucher, session.getVenue().getId(), rawTotalPriceDouble),
                        user.getId()
                );
                discount = voucherResp.getTotalDiscount() != null ? voucherResp.getTotalDiscount() : 0.0;
            } catch (Exception e) {
                log.warn("Voucher preview failed for ticket purchase: {}", e.getMessage());
            }
        }

        double finalPriceDouble = Math.max(0.0, rawTotalPriceDouble - discount);
        long finalPriceLong = Math.round(finalPriceDouble);

        // 2. Increment booked slots by quantity
        session.setBookedSlots(session.getBookedSlots() + quantity);
        if (session.getBookedSlots() >= session.getMaxSlots()) {
            session.setStatus(TicketSessionStatus.FULL);
        }
        ticketSessionRepository.save(session);

        // 3. Generate 1 single Ticket for this transaction representing N slots
        String shortCode = generateUniqueShortCode();

        Ticket ticket = Ticket.builder()
                .session(session)
                .user(user)
                .quantity(quantity)
                .status(TicketStatus.UNUSED)
                .shortCode(shortCode)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);

        String qrToken = jwtTokenProvider.generateTicketToken(savedTicket.getId(), user.getId(), session.getId());
        savedTicket.setQrCodeToken(qrToken);
        ticketRepository.save(savedTicket);

        // 4. Handle Payment Method
        String checkoutUrl = null;
        Long orderCode = null;

        if ("wallet".equalsIgnoreCase(paymentMethod)) {
            UserWallet wallet = userWalletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new CustomException("Ví Sporta chưa được kích hoạt", 400));

            if (wallet.getBalance() < finalPriceLong) {
                throw new CustomException(
                        String.format("Số dư ví không đủ. Cần %,d VNĐ, số dư hiện tại là %,d VNĐ",
                                finalPriceLong, wallet.getBalance()),
                        400);
            }

            long balanceBefore = wallet.getBalance();
            wallet.setBalance(balanceBefore - finalPriceLong);
            userWalletRepository.save(wallet);

            WalletTransaction txn = WalletTransaction.builder()
                    .walletType(WalletType.USER)
                    .userId(user.getId())
                    .transactionType(WalletTransactionType.BOOKING_PAYMENT)
                    .amount(finalPriceLong)
                    .balanceBefore(balanceBefore)
                    .balanceAfter(wallet.getBalance())
                    .referenceId(savedTicket.getId())
                    .description("Thanh toán " + quantity + " vé xé (" + shortCode + ") - " + session.getVenue().getName())
                    .build();
            walletTransactionRepository.save(txn);

            if (session.getVenue() != null && session.getVenue().getOwner() != null) {
                try {
                    ownerWalletService.creditEarning(
                            session.getVenue().getOwner().getId(),
                            savedTicket.getId(),
                            finalPriceLong
                    );
                } catch (Exception e) {
                    log.error("Lỗi cộng doanh thu ví chủ sân cho vé xé {}: {}", savedTicket.getId(), e.getMessage());
                }
            }
        } else if ("payos".equalsIgnoreCase(paymentMethod)) {
            if (finalPriceLong >= 10000) {
                try {
                    CreatePaymentResponse paymentResponse = paymentService.createPaymentLink(
                            user.getId(),
                            finalPriceLong,
                            PaymentTransactionType.BOOKING_PAYMENT,
                            "Ve xe " + shortCode,
                            "TICKET",
                            savedTicket.getId()
                    );
                    checkoutUrl = paymentResponse.getCheckoutUrl();
                    orderCode = paymentResponse.getOrderCode();
                } catch (Exception e) {
                    log.error("Lỗi tạo PayOS checkout link cho vé xé {}: {}", savedTicket.getId(), e.getMessage());
                }
            }
        } else if ("dev".equalsIgnoreCase(paymentMethod)) {
            if (session.getVenue() != null && session.getVenue().getOwner() != null) {
                try {
                    ownerWalletService.creditEarning(
                            session.getVenue().getOwner().getId(),
                            savedTicket.getId(),
                            finalPriceLong
                    );
                } catch (Exception e) {
                    log.error("Lỗi cộng doanh thu ví chủ sân cho vé DEV {}: {}", savedTicket.getId(), e.getMessage());
                }
            }
        }

        // 5. Commit voucher usage if discount > 0
        if (discount > 0) {
            commitVoucherUsageForTicket(ownerVoucher, user.getId());
            commitVoucherUsageForTicket(sysVoucher, user.getId());
        }

        // 6. Gửi thông báo cho người mua vé
        try {
            String venueName = session.getVenue() != null ? session.getVenue().getName() : "Sân thể thao";
            String courtName = session.getCourt() != null ? session.getCourt().getName() : "Sân đấu";
            String timeStr = session.getStartTime() + " - " + session.getEndTime();
            notificationService.createNotification(
                    user.getId(),
                    user.getRole() != null ? user.getRole() : Role.PLAYER,
                    "Mua vé thành công 🎉",
                    String.format("Bạn đã mua %d vé tại ca %s (%s, %s). Mã vé: %s.",
                            quantity, timeStr, courtName, venueName, shortCode),
                    NotificationType.TICKET_PURCHASE_SUCCESS,
                    savedTicket.getId().toString()
            );

            // Gửi thông báo cho chủ sân
            if (session.getVenue() != null && session.getVenue().getOwner() != null && session.getVenue().getOwner().getUser() != null) {
                Long ownerUserId = session.getVenue().getOwner().getUser().getId();
                String buyerName = user.getFullName() != null && !user.getFullName().isEmpty() ? user.getFullName() : user.getEmail();
                notificationService.createNotification(
                        ownerUserId,
                        Role.OWNER,
                        "Khách mua vé ca ghép",
                        String.format("Khách hàng %s vừa mua %d vé tại ca ghép %s (%s - %s).",
                                buyerName, quantity, timeStr, courtName, venueName),
                        NotificationType.OWNER_TICKET_BOUGHT,
                        session.getId().toString()
                );
            }
        } catch (Exception e) {
            // Non-blocking notification failure
        }

        UserTicketResponse resp = mapToTicketResponse(savedTicket);
        resp.setDiscountAmount(BigDecimal.valueOf(discount));
        resp.setFinalPrice(BigDecimal.valueOf(finalPriceDouble));
        resp.setPaymentMethod(paymentMethod);
        resp.setCheckoutUrl(checkoutUrl);
        resp.setOrderCode(orderCode);
        return resp;
    }

    private void commitVoucherUsageForTicket(String code, Long userId) {
        if (code == null || code.isBlank()) return;
        try {
            Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
            if (voucher != null) {
                voucherRepository.incrementUsedQuantityIfPossible(voucher.getId());
                UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(userId, voucher.getId()).orElse(null);
                if (userVoucher != null) {
                    userVoucher.setStatus(UserVoucherStatus.USED);
                    userVoucher.setUsedAt(LocalDateTime.now());
                    userVoucherRepository.save(userVoucher);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to commit voucher {} for user {}: {}", code, userId, e.getMessage());
        }
    }

    public List<UserTicketResponse> getUserTickets(String userEmail) {
        List<Ticket> tickets = ticketRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
        return tickets.stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    public UserTicketResponse getTicketDetail(UUID ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException("Không tìm thấy vé điện tử", 404));

        if (!ticket.getUser().getEmail().equals(userEmail)) {
            throw new CustomException("Bạn không có quyền xem vé này", 403);
        }

        return mapToTicketResponse(ticket);
    }

    private String generateUniqueShortCode() {
        String code;
        do {
            code = Ticket.generateShortCode();
        } while (ticketRepository.existsByShortCode(code));
        return code;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private TicketSessionResponse mapToSessionResponse(TicketSession session) {
        String address = session.getVenue().getAddressDetail();
        if (address == null || address.isEmpty()) {
            address = session.getVenue().getLocation();
        }
        String sportName = session.getVenue().getSport() != null ? session.getVenue().getSport().getName() : "Thể thao";

        return TicketSessionResponse.builder()
                .id(session.getId())
                .venueId(session.getVenue().getId())
                .venueName(session.getVenue().getName())
                .venueAddress(address)
                .venueLocation(session.getVenue().getLocation())
                .coverImage(session.getVenue().getCoverImage())
                .latitude(session.getVenue().getLatitude())
                .longitude(session.getVenue().getLongitude())
                .sportName(sportName)
                .courtId(session.getCourt().getId())
                .courtName(session.getCourt().getName())
                .playDate(session.getPlayDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .pricePerTicket(session.getPricePerTicket())
                .maxSlots(session.getMaxSlots())
                .bookedSlots(session.getBookedSlots())
                .sportLevel(session.getSportLevel())
                .status(session.getStatus())
                .build();
    }

    private UserTicketResponse mapToTicketResponse(Ticket ticket) {
        TicketSession s = ticket.getSession();
        String address = s.getVenue().getAddressDetail();
        if (address == null || address.isEmpty()) {
            address = s.getVenue().getLocation();
        }

        BigDecimal totalPrice = s.getPricePerTicket().multiply(BigDecimal.valueOf(ticket.getQuantity()));

        return UserTicketResponse.builder()
                .ticketId(ticket.getId())
                .sessionId(s.getId())
                .venueId(s.getVenue().getId())
                .venueName(s.getVenue().getName())
                .venueAddress(address)
                .courtName(s.getCourt().getName())
                .playDate(s.getPlayDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .price(s.getPricePerTicket())
                .quantity(ticket.getQuantity())
                .totalPrice(totalPrice)
                .discountAmount(BigDecimal.ZERO)
                .finalPrice(totalPrice)
                .sportLevel(s.getSportLevel())
                .status(ticket.getStatus())
                .qrCodeToken(ticket.getQrCodeToken())
                .shortCode(ticket.getShortCode())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
