package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.enums.TicketSessionStatus;
import com.backend.sporta.enums.TicketStatus;
import com.backend.sporta.enums.Role;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketSessionService {

    @Autowired
    private TicketSessionRepository ticketSessionRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private NotificationService notificationService;

    private String generateUniqueShortCode() {
        String code;
        do {
            code = Ticket.generateShortCode();
        } while (ticketRepository.existsByShortCode(code));
        return code;
    }

    @Transactional
    public TicketSessionResponse createTicketSession(TicketSessionRequest request, String ownerEmail) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        if (!venue.getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền quản lý cụm sân này", 403);
        }

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new CustomException("Không tìm thấy sân đấu", 404));

        if (!court.getVenue().getId().equals(venue.getId())) {
            throw new CustomException("Sân đấu không thuộc cụm sân này", 400);
        }

        int shiftMinutes = venue.getShiftDurationMinutes() != null ? venue.getShiftDurationMinutes() : 30;

        // Tự động tạo Booking nội bộ để khóa sân
        String bookingCode = "TK-LOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Booking booking = Booking.builder()
                .user(venue.getOwner().getUser())
                .venue(venue)
                .bookingCode(bookingCode)
                .paymentMethod("SYSTEM")
                .status(BookingStatus.CONFIRMED)
                .totalPrice(0.0)
                .finalPrice(0.0)
                .build();

        List<BookingDetail> details = new ArrayList<>();
        LocalTime current = request.getStartTime();
        LocalTime end = request.getEndTime();

        while (current.isBefore(end)) {
            LocalTime next = current.plusMinutes(shiftMinutes);
            
            // Kiểm tra xung đột với đặt sân hiện có
            boolean conflict = bookingDetailRepository.existsConflict(
                    court.getId(), request.getPlayDate(), current);
            if (conflict) {
                throw new CustomException("Sân đã có lịch đặt hoặc lịch xé vé trong khung giờ: " + current, 409);
            }

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .court(court)
                    .bookingDate(request.getPlayDate())
                    .startTime(current)
                    .endTime(next)
                    .price(0.0)
                    .build();
            details.add(detail);
            current = next;
        }

        booking.setDetails(details);
        bookingRepository.save(booking);

        // Lưu TicketSession sạch (không thêm tài khoản ảo, bắt đầu với 0 slot đã đặt)
        TicketSession session = TicketSession.builder()
                .venue(venue)
                .court(court)
                .playDate(request.getPlayDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .pricePerTicket(request.getPricePerTicket())
                .maxSlots(request.getMaxSlots())
                .bookedSlots(0)
                .sportLevel(request.getSportLevel())
                .hasHostTeam(Boolean.TRUE.equals(request.getHasHostTeam()))
                .hostTeamName(request.getHostTeamName())
                .hostTeamLevel(request.getHostTeamLevel())
                .status(TicketSessionStatus.OPEN)
                .build();

        TicketSession savedSession = ticketSessionRepository.save(session);
        return mapToResponse(savedSession);
    }

    public List<TicketSessionResponse> getTodaySessions(UUID venueId, String ownerEmail) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new CustomException("Không tìm thấy cụm sân", 404));

        if (!venue.getOwner().getUser().getEmail().equals(ownerEmail)) {
            throw new CustomException("Bạn không có quyền xem thông tin cụm sân này", 403);
        }

        return ticketSessionRepository.findByVenueIdAndPlayDate(venueId, LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketCheckInResponse checkInTicket(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new CustomException("Mã check-in không được để trống", 400);
        }
        token = token.trim();

        Ticket ticket;
        if (token.length() <= 8) {
            // Check-in by Short Code
            ticket = ticketRepository.findByShortCode(token.toUpperCase())
                    .orElseThrow(() -> new CustomException("Mã check-in thủ công không tồn tại hoặc không chính xác", 404));
        } else {
            // Check-in by JWT QR Code Token
            if (!jwtTokenProvider.validateToken(token)) {
                throw new CustomException("Mã QR vé không hợp lệ hoặc đã hết hạn", 400);
            }

            io.jsonwebtoken.Claims claims;
            try {
                claims = jwtTokenProvider.getClaimsFromToken(token);
            } catch (Exception e) {
                throw new CustomException("Không thể giải mã QR vé", 400);
            }

            String ticketIdStr = claims.get("ticketId", String.class);
            if (ticketIdStr == null) {
                throw new CustomException("Mã QR vé thiếu thông tin cần thiết", 400);
            }

            UUID ticketId = UUID.fromString(ticketIdStr);
            ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy thông tin vé trên hệ thống", 404));
        }

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new CustomException("Vé này đã được sử dụng trước đó.", 400);
        }
        if (ticket.getStatus() == TicketStatus.REFUNDED) {
            throw new CustomException("Vé này đã được hoàn trả, không thể sử dụng.", 400);
        }
        TicketSession session = ticket.getSession();

        // Kiểm tra hiệu lực ngày và giờ thi đấu
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalDate playDate = session.getPlayDate();
        LocalTime endTime = session.getEndTime();

        if (playDate != null) {
            if (playDate.isAfter(today)) {
                throw new CustomException(String.format("Vé này có hiệu lực vào ngày %s. Chưa đến ngày diễn ra ca đấu.", playDate), 400);
            } else if (playDate.isBefore(today)) {
                throw new CustomException(String.format("Vé đã quá hạn (Ngày diễn ra %s).", playDate), 400);
            }
        }

        if (endTime != null && now.isAfter(endTime.plusMinutes(15))) {
            throw new CustomException(String.format("Vé đã hết hạn sử dụng. Ca chơi đã kết thúc lúc %s.", endTime), 400);
        }

        ticket.setStatus(TicketStatus.USED);
        ticketRepository.save(ticket);

        
        try {
            if (ticket.getUser() != null) {
                String vName = session.getVenue() != null ? session.getVenue().getName() : "Sân thể thao";
                String cName = session.getCourt() != null ? session.getCourt().getName() : "Sân đấu";
                String sTime = session.getStartTime() != null ? session.getStartTime().toString().substring(0, 5) : "";
                String eTime = session.getEndTime() != null ? session.getEndTime().toString().substring(0, 5) : "";

                notificationService.createNotification(
                        ticket.getUser().getId(),
                        ticket.getUser().getRole() != null ? ticket.getUser().getRole() : Role.PLAYER,
                        "Check-in vé thành công",
                        String.format("Vé %s của bạn đã được quét check-in tại %s (%s, %s - %s). Chúc bạn thi đấu vui vẻ!",
                                ticket.getShortCode() != null ? ticket.getShortCode() : "", vName, cName, sTime, eTime),
                        NotificationType.TICKET_CHECKIN_SUCCESS,
                        ticket.getId().toString()
                );
            }
        } catch (Exception e) {
            System.err.println("Lỗi gửi thông báo check-in: " + e.getMessage());
        }

        String customerName = ticket.getUser() != null && ticket.getUser().getFullName() != null ? ticket.getUser().getFullName() : "Khách hàng";
        String customerPhone = ticket.getUser() != null ? ticket.getUser().getPhoneNumber() : null;
        String customerEmail = ticket.getUser() != null ? ticket.getUser().getEmail() : null;
        String customerAvatar = ticket.getUser() != null ? ticket.getUser().getAvatarUrl() : null;
        String venueName = session.getVenue() != null ? session.getVenue().getName() : "Sân thể thao Sporta";

        return TicketCheckInResponse.builder()
                .ticketId(ticket.getId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .customerAvatar(customerAvatar)
                .venueName(venueName)
                .courtName(session.getCourt().getName())
                .shortCode(ticket.getShortCode())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .playDate(session.getPlayDate())
                .checkInTime(LocalDateTime.now())
                .sportLevel(session.getSportLevel())
                .quantity(ticket.getQuantity())
                .status("USED")
                .build();
    }

    public List<TestTicketResponse> getTestTickets(UUID sessionId) {
        return ticketRepository.findBySessionId(sessionId).stream()
                .map(t -> TestTicketResponse.builder()
                        .ticketId(t.getId())
                        .customerName(t.getUser().getFullName())
                        .qrCodeToken(t.getQrCodeToken())
                        .shortCode(t.getShortCode())
                        .build())
                .collect(Collectors.toList());
    }

    private TicketSessionResponse mapToResponse(TicketSession session) {
        return TicketSessionResponse.builder()
                .id(session.getId())
                .venueId(session.getVenue().getId())
                .venueName(session.getVenue().getName())
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
                .hasHostTeam(session.getHasHostTeam())
                .hostTeamName(session.getHostTeamName())
                .hostTeamLevel(session.getHostTeamLevel())
                .build();
    }

    @Transactional
    public void cancelTicketSession(UUID sessionId, String email) {
        TicketSession session = ticketSessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ca xé vé", 404));

        if (!session.getVenue().getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền hủy ca xé vé này", 403);
        }

        session.setStatus(TicketSessionStatus.CANCELLED);
        ticketSessionRepository.save(session);

        try {
            List<Ticket> tickets = ticketRepository.findBySessionId(sessionId);
            for (Ticket t : tickets) {
                if (t.getUser() != null && t.getStatus() == TicketStatus.UNUSED) {
                    t.setStatus(TicketStatus.REFUNDED);
                    ticketRepository.save(t);

                    notificationService.createNotification(
                            t.getUser().getId(),
                            t.getUser().getRole() != null ? t.getUser().getRole() : Role.PLAYER,
                            "Ca ghép sân bị hủy",
                            String.format("Ca xé vé lúc %s - %s ngày %s tại %s đã bị hủy bởi chủ sân. Tiền vé đã được hoàn lại.",
                                    session.getStartTime(), session.getEndTime(), session.getPlayDate(), session.getVenue().getName()),
                            NotificationType.TICKET_SESSION_CANCELLED,
                            session.getId().toString()
                    );
                }
            }
        } catch (Exception e) {}
    }
}
