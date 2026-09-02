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
import java.util.Optional;
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

    @Autowired
    private com.backend.sporta.service.matchmaking.ScoreAdapterRegistry scoreAdapterRegistry;

    @Autowired
    private com.backend.sporta.service.matchmaking.PersonalEloEngine personalEloEngine;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private SportRepository sportRepository;

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

        // 2. Determine if caller is first buyer BEFORE incrementing
        boolean isFirstBuyer = (session.getBookedSlots() == 0) || (ticketRepository.findBySessionId(session.getId()).isEmpty());

        // Increment booked slots by quantity
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
                .team(Boolean.TRUE.equals(session.getHasHostTeam()) ? TeamSide.GUEST : null)
                .isCaptain(isFirstBuyer)
                .isScoreConfirmed(false)
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

    public List<UserTicketResponse> getParticipants(UUID sessionId) {
        List<Ticket> tickets = ticketRepository.findBySessionId(sessionId);
        return tickets.stream().map(this::mapToTicketResponse).collect(Collectors.toList());
    }

    @Transactional
    public UserTicketResponse assignTeam(UUID sessionId, com.backend.sporta.dto.AssignTeamRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        Ticket targetTicket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new CustomException("Không tìm thấy vé cần gán đội", 404));

        if (!targetTicket.getSession().getId().equals(sessionId)) {
            throw new CustomException("Vé không thuộc ca xé vé này", 400);
        }

        // Verify if caller is Captain or the ticket owner
        Optional<Ticket> callerTicketOpt = ticketRepository.findBySessionIdAndUserId(sessionId, user.getId());
        boolean isCaptain = callerTicketOpt.isPresent() && Boolean.TRUE.equals(callerTicketOpt.get().getIsCaptain());
        boolean isOwner = targetTicket.getUser().getId().equals(user.getId());

        if (!isCaptain && !isOwner) {
            throw new CustomException("Chỉ Trưởng ca (Captain) hoặc chủ vé mới được phân đội", 403);
        }

        targetTicket.setTeam(request.getTeam());
        targetTicket = ticketRepository.save(targetTicket);
        return mapToTicketResponse(targetTicket);
    }

    @Transactional
    public TicketSessionResponse declareScore(UUID sessionId, com.backend.sporta.dto.DeclareScoreRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        Optional<Ticket> captainTicketOpt = ticketRepository.findBySessionIdAndUserId(sessionId, user.getId());
        if (captainTicketOpt.isEmpty() || !Boolean.TRUE.equals(captainTicketOpt.get().getIsCaptain())) {
            throw new CustomException("Chỉ Trưởng ca (Captain) mới có quyền khai báo tỷ số trận đấu", 403);
        }

        if (session.getPlayDate().isAfter(LocalDate.now())) {
            throw new CustomException("Chưa đến ngày diễn ra ca xé vé để khai báo tỷ số", 400);
        }

        String sportName = session.getVenue() != null && session.getVenue().getSport() != null
                ? session.getVenue().getSport().getName() : "Bóng đá";
        com.backend.sporta.service.matchmaking.ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        var val = adapter.validate(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());
        if (!val.isValid()) {
            throw new CustomException("Tỷ số không hợp lệ: " + val.getErrorMessage(), 400);
        }

        NormalizedOutcome outcome = adapter.normalize(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());

        session.setHostScore(request.getHostScore().trim());
        session.setGuestScore(request.getGuestScore().trim());
        session.setMatchOutcome(outcome);
        session.setScoreDeclaredAt(LocalDateTime.now());
        session.setScoreConfirmedCount(1);
        session.setIsDisputed(false);

        // Mark Captain's ticket as confirmed
        Ticket capTicket = captainTicketOpt.get();
        capTicket.setIsScoreConfirmed(true);
        ticketRepository.save(capTicket);

        session = ticketSessionRepository.save(session);

        // Check if there are only 1 or 2 participants, auto settle
        List<Ticket> allTickets = ticketRepository.findBySessionId(sessionId);
        if (allTickets.size() <= 1) {
            settleXeVeElo(session);
        }

        return mapToSessionResponse(session);
    }

    @Transactional
    public TicketSessionResponse confirmTicketScore(UUID sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        if (session.getScoreDeclaredAt() == null || session.getMatchOutcome() == null) {
            throw new CustomException("Chưa có tỷ số được khai báo để xác nhận", 400);
        }

        if (Boolean.TRUE.equals(session.getIsDisputed())) {
            throw new CustomException("Ca xé vé đang có tranh chấp khiếu nại tỷ số", 400);
        }

        Ticket userTicket = ticketRepository.findBySessionIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new CustomException("Bạn không tham gia ca xé vé này", 403));

        if (Boolean.TRUE.equals(userTicket.getIsScoreConfirmed())) {
            return mapToSessionResponse(session);
        }

        userTicket.setIsScoreConfirmed(true);
        ticketRepository.save(userTicket);

        int count = session.getScoreConfirmedCount() != null ? session.getScoreConfirmedCount() + 1 : 1;
        session.setScoreConfirmedCount(count);
        session = ticketSessionRepository.save(session);

        List<Ticket> allTickets = ticketRepository.findBySessionId(sessionId);
        if (count >= Math.ceil(allTickets.size() / 2.0)) {
            settleXeVeElo(session);
        }

        return mapToSessionResponse(session);
    }

    @Transactional
    public TicketSessionResponse flagDispute(UUID sessionId, String reason, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        ticketRepository.findBySessionIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new CustomException("Bạn không tham gia ca xé vé này để khiếu nại", 403));

        session.setIsDisputed(true);
        session.setIsEloSettled(false);
        session = ticketSessionRepository.save(session);
        return mapToSessionResponse(session);
    }

    @Transactional
    public void settleXeVeElo(TicketSession session) {
        if (session == null || Boolean.TRUE.equals(session.getIsEloSettled()) || Boolean.TRUE.equals(session.getIsDisputed())) {
            return;
        }
        if (session.getMatchOutcome() == null) {
            return;
        }

        Long sportId = session.getVenue() != null && session.getVenue().getSport() != null
                ? session.getVenue().getSport().getId() : null;
        if (sportId == null) return;

        List<Ticket> tickets = ticketRepository.findBySessionId(session.getId());
        List<User> hostUsers = tickets.stream()
                .filter(t -> t.getTeam() == com.backend.sporta.enums.TeamSide.HOST && t.getUser() != null)
                .map(Ticket::getUser).collect(Collectors.toList());
        List<User> guestUsers = tickets.stream()
                .filter(t -> t.getTeam() == com.backend.sporta.enums.TeamSide.GUEST && t.getUser() != null)
                .map(Ticket::getUser).collect(Collectors.toList());

        // If hasHostTeam is true and no tickets specifically marked as GUEST, all participants are challengers (GUEST)
        if (Boolean.TRUE.equals(session.getHasHostTeam()) && guestUsers.isEmpty()) {
            guestUsers = tickets.stream()
                    .filter(t -> t.getUser() != null)
                    .map(Ticket::getUser).collect(Collectors.toList());
        }

        int avgHostElo;
        if (hostUsers.isEmpty() && Boolean.TRUE.equals(session.getHasHostTeam())) {
            SportLevel lvl = session.getHostTeamLevel() != null ? session.getHostTeamLevel() : session.getSportLevel();
            avgHostElo = switch (lvl) {
                case GOOD -> 2100;
                case AVERAGE_GOOD -> 1800;
                case AVERAGE -> 1500;
                case WEAK_AVERAGE -> 1200;
                case WEAK -> 900;
                default -> 1500;
            };
        } else if (!hostUsers.isEmpty()) {
            avgHostElo = calculateUsersAvgElo(hostUsers, sportId);
        } else {
            return;
        }

        if (guestUsers.isEmpty()) {
            return;
        }

        int avgGuestElo = calculateUsersAvgElo(guestUsers, sportId);

        int scoreDiff = 0;
        try {
            if (session.getHostScore() != null && session.getGuestScore() != null) {
                int h = Integer.parseInt(session.getHostScore().trim());
                int g = Integer.parseInt(session.getGuestScore().trim());
                scoreDiff = Math.abs(h - g);
            }
        } catch (Exception ignored) {}

        double hostScore = (session.getMatchOutcome() == NormalizedOutcome.WIN_HOST) ? 1.0
                : (session.getMatchOutcome() == NormalizedOutcome.DRAW ? 0.5 : 0.0);
        double guestScore = (session.getMatchOutcome() == NormalizedOutcome.WIN_GUEST) ? 1.0
                : (session.getMatchOutcome() == NormalizedOutcome.DRAW ? 0.5 : 0.0);

        for (User u : hostUsers) {
            updateIndividualElo(u, sportId, avgGuestElo, hostScore, session, scoreDiff);
        }
        for (User u : guestUsers) {
            updateIndividualElo(u, sportId, avgHostElo, guestScore, session, scoreDiff);
        }

        session.setIsEloSettled(true);
        ticketSessionRepository.save(session);
    }

    @Transactional
    public TicketSessionResponse devForceFinishXeVe(UUID sessionId, com.backend.sporta.dto.DevForceFinishXeVeRequest request, String userEmail) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (!Boolean.TRUE.equals(requester.getIsDevTester()) && requester.getRole() != Role.ADMIN && requester.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Chỉ tài khoản DEV Tester hoặc Admin mới được sử dụng tính năng này", 403);
        }

        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        boolean isFixedHost = Boolean.TRUE.equals(session.getHasHostTeam());
        if (!isFixedHost && (request.getHostUserIds() == null || request.getHostUserIds().isEmpty())) {
            throw new CustomException("Vui lòng chỉ định danh sách người chơi cho Đội A (Host)", 400);
        }
        if (request.getGuestUserIds() == null || request.getGuestUserIds().isEmpty()) {
            throw new CustomException("Vui lòng chỉ định danh sách người chơi cho Đội Thách Đấu (Guest)", 400);
        }

        // Add or update tickets for Side A (Host)
        if (request.getHostUserIds() != null && !request.getHostUserIds().isEmpty()) {
            for (int i = 0; i < request.getHostUserIds().size(); i++) {
                Long uid = request.getHostUserIds().get(i);
                boolean isCap = (i == 0);
                Optional<User> uOpt = userRepository.findById(uid);
                if (uOpt.isPresent()) {
                    User u = uOpt.get();
                    Ticket t = ticketRepository.findBySessionIdAndUserId(sessionId, u.getId())
                            .orElseGet(() -> Ticket.builder()
                                    .session(session)
                                    .user(u)
                                    .quantity(1)
                                    .qrCodeToken("DEV_" + UUID.randomUUID().toString().substring(0, 8))
                                    .shortCode(generateUniqueShortCode())
                                    .status(com.backend.sporta.enums.TicketStatus.USED)
                                    .build());
                    t.setTeam(com.backend.sporta.enums.TeamSide.HOST);
                    t.setIsCaptain(isCap);
                    t.setIsScoreConfirmed(true);
                    ticketRepository.save(t);
                }
            }
        }

        // Add or update tickets for Side B (Guest)
        for (Long uid : request.getGuestUserIds()) {
            Optional<User> uOpt = userRepository.findById(uid);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                Ticket t = ticketRepository.findBySessionIdAndUserId(sessionId, u.getId())
                        .orElseGet(() -> Ticket.builder()
                                .session(session)
                                .user(u)
                                .quantity(1)
                                .qrCodeToken("DEV_" + UUID.randomUUID().toString().substring(0, 8))
                                .shortCode(generateUniqueShortCode())
                                .status(com.backend.sporta.enums.TicketStatus.USED)
                                .build());
                t.setTeam(com.backend.sporta.enums.TeamSide.GUEST);
                t.setIsCaptain(false);
                t.setIsScoreConfirmed(true);
                ticketRepository.save(t);
            }
        }

        String sportName = session.getVenue() != null && session.getVenue().getSport() != null
                ? session.getVenue().getSport().getName() : "Bóng đá";
        com.backend.sporta.service.matchmaking.ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        NormalizedOutcome outcome = adapter.normalize(request.getHostScore(), request.getGuestScore(), request.getRawScoreDetails());

        int hostCount = (request.getHostUserIds() != null ? request.getHostUserIds().size() : 0);
        session.setHostScore(request.getHostScore().trim());
        session.setGuestScore(request.getGuestScore().trim());
        session.setMatchOutcome(outcome);
        session.setScoreDeclaredAt(LocalDateTime.now());
        session.setScoreConfirmedCount(hostCount + request.getGuestUserIds().size());
        session.setIsDisputed(false);
        session.setStatus(com.backend.sporta.enums.TicketSessionStatus.FULL);
        session.setIsEloSettled(false); // Reset so settleXeVeElo calculates fresh Elo

        TicketSession savedSession = ticketSessionRepository.save(session);

        // Run Elo settlement
        settleXeVeElo(savedSession);

        return mapToSessionResponse(savedSession);
    }

    public List<com.backend.sporta.dto.DevUserSummaryDto> getDevUsers(String keyword) {
        List<User> users;
        if (keyword != null && !keyword.trim().isEmpty()) {
            users = userRepository.findBySearch(keyword.trim());
        } else {
            users = userRepository.findAllActiveOrderByCreatedAtDesc();
        }

        return users.stream()
                .filter(u -> u.getStatus() == com.backend.sporta.enums.UserStatus.ACTIVE)
                .map(u -> {
                    var sports = userSportRepository.findByUserId(u.getId());
                    int elo = 1500;
                    String level = "Trung bình";
                    if (!sports.isEmpty()) {
                        elo = sports.get(0).getEffectiveElo();
                        level = sports.get(0).getLevel() != null ? sports.get(0).getLevel().name() : "Trung bình";
                    }
                    return com.backend.sporta.dto.DevUserSummaryDto.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .email(u.getEmail())
                            .avatarUrl(u.getAvatarUrl())
                            .role(u.getRole() != null ? u.getRole().name() : "PLAYER")
                            .elo(elo)
                            .level(level)
                            .build();
                })
                .limit(50)
                .collect(Collectors.toList());
    }

    private int calculateUsersAvgElo(List<User> users, Long sportId) {
        if (users == null || users.isEmpty()) return 1000;
        int total = 0;
        for (User u : users) {
            Optional<UserSport> us = userSportRepository.findByUserIdAndSportId(u.getId(), sportId);
            total += us.map(UserSport::getEffectiveElo).orElse(1000);
        }
        return (int) Math.round((double) total / users.size());
    }

    private void updateIndividualElo(User user, Long sportId, int opponentTeamElo, double score, TicketSession session, int scoreDiff) {
        if (user == null || sportId == null) return;

        UserSport us = userSportRepository.findByUserIdAndSportId(user.getId(), sportId)
                .orElseGet(() -> {
                    Sport sport = (session != null && session.getVenue() != null && session.getVenue().getSport() != null)
                            ? session.getVenue().getSport()
                            : sportRepository.findById(sportId).orElse(null);
                    return UserSport.builder()
                            .user(user)
                            .sport(sport)
                            .level(SportLevel.AVERAGE)
                            .eloRating(1500)
                            .eloStatus(EloStatus.UNVERIFIED)
                            .placementMatchesPlayed(0)
                            .totalRankedMatches(0)
                            .totalWins(0)
                            .build();
                });

        personalEloEngine.updatePlayerStats(us, opponentTeamElo, score, EloSourceType.XE_VE, scoreDiff);
        userSportRepository.save(us);
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
                .hostScore(session.getHostScore())
                .guestScore(session.getGuestScore())
                .matchOutcome(session.getMatchOutcome())
                .isEloSettled(session.getIsEloSettled())
                .isDisputed(session.getIsDisputed())
                .hasHostTeam(session.getHasHostTeam())
                .hostTeamName(session.getHostTeamName())
                .hostTeamLevel(session.getHostTeamLevel())
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
                .team(ticket.getTeam())
                .isCaptain(ticket.getIsCaptain())
                .isScoreConfirmed(ticket.getIsScoreConfirmed())
                .qrCodeToken(ticket.getQrCodeToken())
                .shortCode(ticket.getShortCode())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
