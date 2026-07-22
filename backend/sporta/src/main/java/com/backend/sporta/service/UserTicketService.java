package com.backend.sporta.service;

import com.backend.sporta.dto.TicketSessionResponse;
import com.backend.sporta.dto.UserTicketResponse;
import com.backend.sporta.entity.Ticket;
import com.backend.sporta.entity.TicketSession;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.SportLevel;
import com.backend.sporta.enums.TicketSessionStatus;
import com.backend.sporta.enums.TicketStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.TicketRepository;
import com.backend.sporta.repository.TicketSessionRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserTicketService {

    @Autowired
    private TicketSessionRepository ticketSessionRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

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
        if (quantity < 1) {
            throw new CustomException("Số lượng vé phải từ 1 trở lên", 400);
        }

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

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin người dùng", 404));

        // Increment booked slots by quantity
        session.setBookedSlots(session.getBookedSlots() + quantity);
        if (session.getBookedSlots() >= session.getMaxSlots()) {
            session.setStatus(TicketSessionStatus.FULL);
        }
        ticketSessionRepository.save(session);

        // Generate 1 single Ticket for this transaction representing N slots
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

        return mapToTicketResponse(savedTicket);
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
                .sportLevel(s.getSportLevel())
                .status(ticket.getStatus())
                .qrCodeToken(ticket.getQrCodeToken())
                .shortCode(ticket.getShortCode())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
