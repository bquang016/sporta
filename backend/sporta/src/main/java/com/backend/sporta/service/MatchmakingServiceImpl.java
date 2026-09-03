package com.backend.sporta.service;

import com.backend.sporta.config.MatchmakingConfig;
import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.service.matchmaking.ClubEloService;
import com.backend.sporta.service.matchmaking.CRPEngine;
import com.backend.sporta.service.matchmaking.ScoreAdapter;
import com.backend.sporta.service.matchmaking.ScoreAdapterRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.backend.sporta.event.NotificationEvent;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchmakingServiceImpl implements MatchmakingService {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private MatchRoomRepository matchRoomRepository;

    @Autowired
    private JoinRequestRepository joinRequestRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ScoreSubmissionRepository scoreSubmissionRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private CRPLedgerRepository crpLedgerRepository;

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private com.backend.sporta.service.matchmaking.PersonalEloEngine personalEloEngine;

    @Autowired
    private ClubPollRepository clubPollRepository;

    @Autowired
    private ClubPollVoteRepository clubPollVoteRepository;

    @Autowired
    private ClubEloService clubEloService;

    @Autowired
    private CRPEngine crpEngine;

    @Autowired
    private ScoreAdapterRegistry scoreAdapterRegistry;

    @Autowired
    private MatchmakingConfig config;

    @Autowired
    private LineupService lineupService;

    @Autowired
    private MatchLineupRepository matchLineupRepository;

    @Autowired
    private LineupMemberRepository lineupMemberRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
    }

    private boolean isClubAdmin(Long clubId, Long userId) {
        Optional<ClubMember> member = clubMemberRepository.findByClubIdAndUserId(clubId, userId);
        if (member.isEmpty()) {
            Club club = clubRepository.findById(clubId).orElse(null);
            if (club != null && club.getCreator() != null && club.getCreator().getId().equals(userId)) {
                return true;
            }
            return false;
        }
        ClubMember m = member.get();
        if (m.getClub() != null && m.getClub().getCreator() != null
                && m.getClub().getCreator().getId().equals(userId)) {
            return true;
        }
        return m.getStatus() == ClubMemberStatus.APPROVED &&
                (m.getRole() == ClubMemberRole.ADMIN || m.getRole() == ClubMemberRole.SUB_LEADER);
    }

    private LocalDateTime getBookingStartTime(Booking booking) {
        if (booking != null && booking.getDetails() != null && !booking.getDetails().isEmpty()) {
            LocalTime minStartTime = booking.getDetails().stream()
                    .map(BookingDetail::getStartTime)
                    .filter(Objects::nonNull)
                    .min(LocalTime::compareTo)
                    .orElse(LocalTime.of(18, 0));
            LocalDate bookingDate = booking.getDetails().stream()
                    .map(BookingDetail::getBookingDate)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(LocalDate.now().plusDays(1));
            return LocalDateTime.of(bookingDate, minStartTime);
        }
        return (booking != null && booking.getCreatedAt() != null) ? booking.getCreatedAt().plusDays(1)
                : LocalDateTime.now().plusDays(1);
    }

    private LocalDateTime getBookingEndTime(Booking booking) {
        if (booking != null && booking.getDetails() != null && !booking.getDetails().isEmpty()) {
            LocalTime maxEndTime = booking.getDetails().stream()
                    .map(BookingDetail::getEndTime)
                    .filter(Objects::nonNull)
                    .max(LocalTime::compareTo)
                    .orElse(LocalTime.of(20, 0));
            LocalDate bookingDate = booking.getDetails().stream()
                    .map(BookingDetail::getBookingDate)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(LocalDate.now().plusDays(1));
            return LocalDateTime.of(bookingDate, maxEndTime);
        }
        return getBookingStartTime(booking).plusHours(2);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchRoomResponse> getRooms(Long sportId, MatchType matchType, String timeFilter, String levelFilter,
            String sort, String userEmail) {
        User user = getUserByEmail(userEmail);
        List<MatchRoom> rooms = matchRoomRepository.findAllByFilters(sportId, null);

        List<MatchRoomResponse> result = new ArrayList<>();
        LocalDateTime cutoffThreshold = LocalDateTime.now().plusMinutes(config.getJoinCutoffMinutes());

        for (MatchRoom room : rooms) {
            if (room.getStatus() != MatchStatus.OPEN) {
                continue;
            }
            if (matchType != null && room.getMatchType() != matchType) {
                continue;
            }
            LocalDateTime matchStartTime = getBookingStartTime(room.getBooking());
            if (matchStartTime != null && matchStartTime.isBefore(cutoffThreshold)) {
                continue; // Bỏ qua bài đăng quá sát giờ thi đấu hoặc đã quá giờ
            }
            Match match = matchRepository.findByRoomId(room.getId()).orElse(null);
            result.add(mapToRoomResponse(room, match, user));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchRoomResponse> getMyMatches(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<ClubMember> memberships = clubMemberRepository.findByUserId(user.getId());
        List<Long> clubIds = memberships.stream()
                .filter(m -> m.getStatus() == ClubMemberStatus.APPROVED)
                .map(m -> m.getClub().getId())
                .collect(Collectors.toList());

        if (clubIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<MatchRoom> hostOrGuestRooms = matchRoomRepository
                .findByHostClubIdInOrGuestClubIdInOrderByCreatedAtDesc(clubIds, clubIds);
        List<JoinRequest> myRequests = joinRequestRepository.findByApplicantClubIdIn(clubIds);
        Set<UUID> requestedRoomIds = myRequests.stream().map(jr -> jr.getRoom().getId()).collect(Collectors.toSet());

        Set<MatchRoom> allMyRooms = new LinkedHashSet<>(hostOrGuestRooms);
        if (!requestedRoomIds.isEmpty()) {
            List<MatchRoom> requestedRooms = matchRoomRepository.findAllById(requestedRoomIds);
            allMyRooms.addAll(requestedRooms);
        }

        List<MatchRoom> sortedRooms = new ArrayList<>(allMyRooms);
        sortedRooms.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        List<MatchRoomResponse> result = new ArrayList<>();
        for (MatchRoom room : sortedRooms) {
            Match match = matchRepository.findByRoomId(room.getId()).orElse(null);
            result.add(mapToRoomResponse(room, match, user));
        }
        return result;
    }

    @Override
    @Transactional
    public MatchRoomResponse createRoom(CreateMatchRoomRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin đặt sân", 404));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new CustomException("Booking chưa được thanh toán thành công", 400);
        }

        if (matchRoomRepository.existsByBookingIdAndStatusNot(booking.getId(), MatchStatus.CANCELLED)) {
            throw new CustomException("Lịch đặt sân này (Mã đơn: "
                    + (booking.getBookingCode() != null ? booking.getBookingCode() : booking.getId())
                    + ") đã được tạo phòng ghép trận rồi. Mỗi lần thanh toán đặt sân (dù đặt 1 hay nhiều ca) chỉ được tạo 1 phòng ghép trận duy nhất.",
                    400);
        }

        Club hostClub = clubRepository.findById(request.getHostClubId())
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin CLB", 404));

        if (!isClubAdmin(hostClub.getId(), user.getId())) {
            throw new CustomException("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền đại diện CLB tạo phòng ghép trận.",
                    403);
        }

        if (!clubEloService.isEligibleForMatchmaking(hostClub.getId())) {
            throw new CustomException("CLB phải có ít nhất " + config.getMinActiveClubMembers()
                    + " thành viên ACTIVE để tạo room ghép trận", 400);
        }

        if (hostClub.getSport() != null && booking.getVenue() != null && booking.getVenue().getSport() != null) {
            if (!hostClub.getSport().getId().equals(booking.getVenue().getSport().getId())) {
                throw new CustomException("CLB " + hostClub.getName() + " (" + hostClub.getSport().getName()
                        + ") không cùng môn thể thao với sân đấu đã đặt ("
                        + booking.getVenue().getSport().getName() + ")", 400);
            }
        }

        LocalDateTime startTime = getBookingStartTime(booking);
        LocalDateTime joinDeadline = startTime.minusMinutes(config.getJoinCutoffMinutes());

        if (startTime == null || LocalDateTime.now().isAfter(joinDeadline)) {
            throw new CustomException(
                    "Lịch đặt sân đã quá giờ hoặc quá sát giờ thi đấu (cần tạo bài trước giờ thi đấu ít nhất "
                            + config.getJoinCutoffMinutes() + " phút)",
                    400);
        }

        int hostPercent = request.getHostSharePercent() != null ? request.getHostSharePercent() : 50;
        int guestPercent = 100 - hostPercent;
        double bookingTotal = booking.getFinalPrice() != null ? booking.getFinalPrice() : 0.0;
        double guestAmount = Math.round(bookingTotal * guestPercent / 100.0);

        String desiredLevelsStr = request.getDesiredLevels() != null ? String.join(",", request.getDesiredLevels())
                : "";

        if (request.getLineupId() == null) {
            throw new CustomException("Vui lòng chọn đội hình ra sân của CLB để tạo kèo tìm đối thủ.", 400);
        }

        MatchRoom room = MatchRoom.builder()
                .booking(booking)
                .hostClub(hostClub)
                .matchType(request.getMatchType())
                .hostSharePercent(hostPercent)
                .guestSharePercent(guestPercent)
                .guestShareAmount(guestAmount)
                .desiredLevels(desiredLevelsStr)
                .note(request.getNote())
                .status(MatchStatus.OPEN)
                .joinDeadline(joinDeadline)
                .build();

        room = matchRoomRepository.save(room);

        lineupService.attachLineupToRoom(request.getLineupId(), room.getId(), TeamSide.HOST);

        return mapToRoomResponse(room, null, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse getRoomDetail(UUID roomId, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin bài đăng ghép trận", 404));

        Match match = findMatchByRoomIdOrMatchId(room.getId());
        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse updateRoom(UUID roomId, UpdateMatchRoomRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy phòng ghép trận", 404));

        if (!isClubAdmin(room.getHostClub().getId(), user.getId())) {
            throw new CustomException("Bạn không có quyền chỉnh sửa phòng này", 403);
        }

        if (room.getStatus() != MatchStatus.OPEN) {
            throw new CustomException("Phòng không ở trạng thái mở để chỉnh sửa", 400);
        }

        List<JoinRequest> applicants = joinRequestRepository.findByRoomId(room.getId());
        boolean hasRequests = applicants.stream().anyMatch(a -> a.getStatus() == JoinRequestStatus.PENDING);

        if (hasRequests) {
            if (request.getHostSharePercent() != null
                    && !request.getHostSharePercent().equals(room.getHostSharePercent())) {
                throw new CustomException("Đã có đối thủ gửi yêu cầu, không được sửa tỷ lệ chi phí", 400);
            }
        } else {
            if (request.getHostSharePercent() != null) {
                int hostPercent = request.getHostSharePercent();
                int guestPercent = 100 - hostPercent;
                double bookingTotal = room.getBooking().getFinalPrice() != null ? room.getBooking().getFinalPrice()
                        : 0.0;
                double guestAmount = Math.round(bookingTotal * guestPercent / 100.0);
                room.setHostSharePercent(hostPercent);
                room.setGuestSharePercent(guestPercent);
                room.setGuestShareAmount(guestAmount);
            }
        }

        if (request.getDesiredLevels() != null) {
            room.setDesiredLevels(String.join(",", request.getDesiredLevels()));
        }
        if (request.getNote() != null) {
            room.setNote(request.getNote());
        }

        room = matchRoomRepository.save(room);
        Match match = matchRepository.findByRoomId(room.getId()).orElse(null);
        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public void cancelRoom(UUID roomId, String userEmail) {
        cancelRoom(roomId, null, userEmail);
    }

    @Override
    @Transactional
    public void cancelRoom(UUID roomId, String reason, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy phòng ghép trận", 404));

        if (!isClubAdmin(room.getHostClub().getId(), user.getId())) {
            throw new CustomException("Bạn không có quyền hủy phòng này", 403);
        }

        if (room.getStatus() != MatchStatus.OPEN) {
            throw new CustomException("Chỉ có thể hủy phòng ở trạng thái OPEN", 400);
        }

        room.setStatus(MatchStatus.CANCELLED);
        room.setCancelledAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            room.setCancellationReason(reason.trim());
        }
        matchRoomRepository.save(room);

        // Notify host that the room is cancelled and court booking remains theirs
        try {
            eventPublisher.publishEvent(new NotificationEvent(
                    this,
                    user.getId(),
                    Role.PLAYER,
                    "Đã huỷ phòng ghép trận",
                    "Bạn đã huỷ phòng ghép trận thành công. Sân đấu đã đặt vẫn thuộc quyền sử dụng của bạn.",
                    NotificationType.MATCH_CANCELLED,
                    room.getId().toString()));
        } catch (Exception ignored) {}

        List<JoinRequest> applicants = joinRequestRepository.findByRoomId(room.getId());
        for (JoinRequest req : applicants) {
            if (req.getStatus() == JoinRequestStatus.PENDING) {
                req.setStatus(JoinRequestStatus.WITHDRAWN);
                joinRequestRepository.save(req);
                try {
                    if (req.getApplicantClub() != null && req.getApplicantClub().getCreator() != null) {
                        String cancelContent = "Phòng ghép kèo của CLB " + room.getHostClub().getName() + " đã bị hủy.";
                        if (reason != null && !reason.isBlank()) {
                            cancelContent += " Lý do: " + reason.trim();
                        }
                        eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                req.getApplicantClub().getCreator().getId(),
                                Role.PLAYER,
                                "Kèo đấu đã bị hủy",
                                cancelContent,
                                NotificationType.MATCH_CANCELLED,
                                room.getId().toString()));
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }

    @Override
    @Transactional
    public JoinRequestResponse createJoinRequest(UUID roomId, CreateJoinRequestRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy phòng ghép trận", 404));

        if (room.getStatus() != MatchStatus.OPEN) {
            throw new CustomException("Phòng ghép trận này đã đóng hoặc đã ghép", 400);
        }

        Club applicantClub = clubRepository.findById(request.getApplicantClubId())
                .orElseThrow(() -> new CustomException("Không tìm thấy CLB xin ghép", 404));

        if (!isClubAdmin(applicantClub.getId(), user.getId())) {
            throw new CustomException("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền đại diện CLB gửi yêu cầu ghép trận.",
                    403);
        }

        if (room.getHostClub() != null && room.getHostClub().getSport() != null && applicantClub.getSport() != null) {
            if (!room.getHostClub().getSport().getId().equals(applicantClub.getSport().getId())) {
                throw new CustomException(
                        "CLB xin ghép khác môn thể thao với CLB phòng ghép trận (Môn thể thao bài đăng: "
                                + room.getHostClub().getSport().getName() + ", Môn thể thao CLB bạn: "
                                + applicantClub.getSport().getName() + ")",
                        400);
            }
        }

        if (applicantClub.getId().equals(room.getHostClub().getId())) {
            throw new CustomException("Không thể tự gửi yêu cầu ghép trận vào phòng của chính CLB mình", 400);
        }

        if (!clubEloService.isEligibleForMatchmaking(applicantClub.getId())) {
            throw new CustomException(
                    "CLB xin ghép phải có ít nhất " + config.getMinActiveClubMembers() + " thành viên ACTIVE", 400);
        }

        if (joinRequestRepository.existsByRoomIdAndApplicantClubIdAndStatusIn(room.getId(), applicantClub.getId(),
                Arrays.asList(JoinRequestStatus.PENDING, JoinRequestStatus.ACCEPTED))) {
            throw new CustomException("CLB đã gửi yêu cầu ghép trận vào phòng này trước đó", 400);
        }

        MatchLineup applicantLineup = null;
        if (request.getLineupId() != null) {
            applicantLineup = matchLineupRepository.findById(request.getLineupId())
                    .orElseThrow(() -> new CustomException("Không tìm thấy đội hình đăng ký", 404));
            if (!applicantLineup.getClub().getId().equals(applicantClub.getId())) {
                throw new CustomException("Đội hình đăng ký không thuộc CLB của bạn", 400);
            }

            // Cross-lineup member collision check with Host Lineup
            Optional<MatchLineup> hostLineupOpt = matchLineupRepository.findByMatchRoomIdAndTeamSide(room.getId(), TeamSide.HOST);
            if (hostLineupOpt.isPresent() && hostLineupOpt.get().getMembers() != null && applicantLineup.getMembers() != null) {
                java.util.Set<Long> hostUserIds = hostLineupOpt.get().getMembers().stream()
                        .map(m -> m.getUser().getId())
                        .collect(java.util.stream.Collectors.toSet());
                for (LineupMember gm : applicantLineup.getMembers()) {
                    if (gm.getUser() != null && hostUserIds.contains(gm.getUser().getId())) {
                        String name = gm.getUser().getFullName() != null ? gm.getUser().getFullName() : "Thành viên";
                        throw new CustomException("Thành viên " + name 
                                + " đã có mặt trong đội hình của CLB chủ nhà. Một người không thể thi đấu cho cả 2 bên.", 400);
                    }
                }
            }
        }

        JoinRequest joinReq = JoinRequest.builder()
                .room(room)
                .applicantClub(applicantClub)
                .status(JoinRequestStatus.PENDING)
                .lineup(applicantLineup)
                .note(request.getNote())
                .build();

        joinReq = joinRequestRepository.save(joinReq);

        try {
            if (room.getHostClub() != null && room.getHostClub().getCreator() != null) {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        room.getHostClub().getCreator().getId(),
                        Role.PLAYER,
                        "Yêu cầu ghép kèo mới ⚽",
                        "CLB " + applicantClub.getName() + " vừa gửi yêu cầu xin ghép kèo vào phòng của bạn.",
                        NotificationType.MATCH_REQUEST_JOIN,
                        room.getId().toString()));
            }
        } catch (Exception ignored) {
        }

        return mapToJoinRequestResponse(joinReq);
    }

    @Override
    @Transactional
    public void withdrawJoinRequest(UUID requestId, String userEmail) {
        User user = getUserByEmail(userEmail);
        JoinRequest req = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu ghép trận", 404));

        if (!isClubAdmin(req.getApplicantClub().getId(), user.getId())) {
            throw new CustomException("Bạn không có quyền rút yêu cầu này", 403);
        }

        if (req.getStatus() != JoinRequestStatus.PENDING) {
            throw new CustomException("Chỉ có thể rút yêu cầu khi đang ở trạng thái PENDING", 400);
        }

        req.setStatus(JoinRequestStatus.WITHDRAWN);
        joinRequestRepository.save(req);
    }

    @Override
    @Transactional
    public void rejectJoinRequest(UUID requestId, String userEmail) {
        User user = getUserByEmail(userEmail);
        JoinRequest req = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu ghép trận", 404));

        if (!isClubAdmin(req.getRoom().getHostClub().getId(), user.getId())) {
            throw new CustomException("Bạn không có quyền từ chối yêu cầu này", 403);
        }

        if (req.getStatus() != JoinRequestStatus.PENDING) {
            throw new CustomException("Chỉ có thể từ chối yêu cầu ở trạng thái PENDING", 400);
        }

        req.setStatus(JoinRequestStatus.REJECTED);
        joinRequestRepository.save(req);

        try {
            if (req.getApplicantClub() != null && req.getApplicantClub().getCreator() != null) {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        req.getApplicantClub().getCreator().getId(),
                        Role.PLAYER,
                        "Yêu cầu ghép kèo bị từ chối",
                        "CLB " + req.getRoom().getHostClub().getName() + " đã từ chối yêu cầu ghép kèo.",
                        NotificationType.MATCH_JOIN_REJECTED,
                        req.getRoom().getId().toString()));
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    @Transactional
    public MatchRoomResponse acceptJoinRequest(UUID requestId, String userEmail) {
        User user = getUserByEmail(userEmail);
        JoinRequest acceptedReq = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu ghép trận", 404));

        MatchRoom room = acceptedReq.getRoom();
        if (!isClubAdmin(room.getHostClub().getId(), user.getId())) {
            throw new CustomException("Bạn không có quyền chấp nhận yêu cầu này", 403);
        }

        if (room.getStatus() != MatchStatus.OPEN) {
            throw new CustomException("Phòng ghép trận không ở trạng thái MỞ để chấp nhận", 400);
        }

        if (acceptedReq.getStatus() != JoinRequestStatus.PENDING) {
            throw new CustomException("Yêu cầu này không còn ở trạng thái PENDING", 400);
        }

        Club guestClub = acceptedReq.getApplicantClub();

        // Cross-lineup member collision check between Host Lineup and Guest Lineup
        Optional<MatchLineup> hostLineupOpt = matchLineupRepository.findByMatchRoomIdAndTeamSide(room.getId(), TeamSide.HOST);
        if (hostLineupOpt.isPresent() && acceptedReq.getLineup() != null
                && hostLineupOpt.get().getMembers() != null && acceptedReq.getLineup().getMembers() != null) {
            java.util.Set<Long> hostUserIds = hostLineupOpt.get().getMembers().stream()
                    .map(m -> m.getUser().getId())
                    .collect(java.util.stream.Collectors.toSet());
            for (LineupMember gm : acceptedReq.getLineup().getMembers()) {
                if (gm.getUser() != null && hostUserIds.contains(gm.getUser().getId())) {
                    String name = gm.getUser().getFullName() != null ? gm.getUser().getFullName() : "Thành viên";
                    throw new CustomException("Thành viên " + name 
                            + " đang có mặt ở cả 2 đội hình thi đấu. Một người không thể thi đấu cho cả 2 bên.", 400);
                }
            }
        }

        if (room.getMatchType() == MatchType.RANKED) {
            validateAntiSmurf(room.getHostClub(), guestClub);
        }

        acceptedReq.setStatus(JoinRequestStatus.ACCEPTED);
        joinRequestRepository.save(acceptedReq);

        room.setStatus(MatchStatus.MATCHED);
        room.setGuestClub(guestClub);
        matchRoomRepository.save(room);

        try {
            if (guestClub != null && guestClub.getCreator() != null) {
                eventPublisher.publishEvent(new NotificationEvent(
                        this,
                        guestClub.getCreator().getId(),
                        Role.PLAYER,
                        "Yêu cầu ghép kèo được chấp nhận! 🎉",
                        "CLB " + room.getHostClub().getName()
                                + " đã đồng ý ghép kèo với CLB của bạn. Chuẩn bị ra sân nào!",
                        NotificationType.MATCH_JOIN_ACCEPTED,
                        room.getId().toString()));
            }
        } catch (Exception ignored) {
        }

        List<JoinRequest> roomRequests = joinRequestRepository.findByRoomId(room.getId());
        for (JoinRequest r : roomRequests) {
            if (!r.getId().equals(acceptedReq.getId()) && r.getStatus() == JoinRequestStatus.PENDING) {
                r.setStatus(JoinRequestStatus.REJECTED);
                joinRequestRepository.save(r);
            }
        }

        List<JoinRequest> guestPendingRequests = joinRequestRepository.findByApplicantClubIdAndStatus(guestClub.getId(),
                JoinRequestStatus.PENDING);
        for (JoinRequest otherReq : guestPendingRequests) {
            if (!otherReq.getId().equals(acceptedReq.getId())) {
                otherReq.setStatus(JoinRequestStatus.AUTO_CANCELLED_CONFLICT);
                joinRequestRepository.save(otherReq);
            }
        }

        if (acceptedReq.getLineup() != null) {
            lineupService.attachLineupToRoom(acceptedReq.getLineup().getId(), room.getId(), TeamSide.GUEST);
        }

        hostLineupOpt = matchLineupRepository.findByMatchRoomIdAndTeamSide(room.getId(), TeamSide.HOST);
        int hostElo = (hostLineupOpt.isPresent() && hostLineupOpt.get().getEloAvg() != null && hostLineupOpt.get().getEloAvg() > 0)
                ? hostLineupOpt.get().getEloAvg() : clubEloService.getClubElo(room.getHostClub());

        int guestElo = (acceptedReq.getLineup() != null && acceptedReq.getLineup().getEloAvg() != null && acceptedReq.getLineup().getEloAvg() > 0)
                ? acceptedReq.getLineup().getEloAvg() : clubEloService.getClubElo(guestClub);

        String hostLevel = clubEloService.getLevelLabel(hostElo);
        String guestLevel = clubEloService.getLevelLabel(guestElo);
        int hostCrp = room.getHostClub().getCrp() != null ? room.getHostClub().getCrp() : 0;
        int guestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;

        Match match = Match.builder()
                .room(room)
                .booking(room.getBooking())
                .hostClub(room.getHostClub())
                .guestClub(guestClub)
                .matchType(room.getMatchType())
                .status(MatchStatus.MATCHED)
                .hostSharePercent(room.getHostSharePercent())
                .guestSharePercent(room.getGuestSharePercent())
                .guestShareAmount(room.getGuestShareAmount())
                .hostClubEloSnapshot(hostElo)
                .guestClubEloSnapshot(guestElo)
                .hostLevelSnapshot(hostLevel)
                .guestLevelSnapshot(guestLevel)
                .hostCrpBeforeSnapshot(hostCrp)
                .guestCrpBeforeSnapshot(guestCrp)
                .build();

        match = matchRepository.save(match);
        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse submitScore(UUID matchId, SubmitScoreRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Match match = findMatchByRoomIdOrMatchId(matchId);
        if (match == null) {
            throw new CustomException("Không tìm thấy thông tin trận đấu", 404);
        }

        if (!isClubAdmin(match.getHostClub().getId(), user.getId())) {
            throw new CustomException("Chỉ chủ/quản lý CLB Host mới được nhập tỷ số", 403);
        }

        LocalDateTime startTime = getBookingStartTime(match.getBooking());
        if (startTime != null && LocalDateTime.now().isBefore(startTime)) {
            throw new CustomException("Chưa đến giờ thi đấu của trận đấu. Vui lòng đợi đến giờ đá để cập nhật tỷ số.", 400);
        }

        if (match.getStatus() == MatchStatus.RESULT_FINAL) {
            throw new CustomException("Trận đấu đã chốt kết quả FINAL", 400);
        }

        Sport sport = match.getHostClub().getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        ScoreAdapter.ValidationResult val = adapter.validate(request.getHostScore(), request.getGuestScore(),
                request.getRawScoreDetails());
        if (!val.isValid()) {
            throw new CustomException("Tỷ số không hợp lệ: " + val.getErrorMessage(), 400);
        }

        NormalizedOutcome outcome = adapter.normalize(request.getHostScore(), request.getGuestScore(),
                request.getRawScoreDetails());
        double gFactor = adapter.calculateG(request.getHostScore(), request.getGuestScore(),
                request.getRawScoreDetails());

        Optional<ScoreSubmission> lastSub = scoreSubmissionRepository
                .findFirstByMatchIdOrderByVersionDesc(match.getId());
        int version = lastSub.map(s -> s.getVersion() + 1).orElse(1);

        ScoreSubmission submission = ScoreSubmission.builder()
                .match(match)
                .submittedByClub(match.getHostClub())
                .version(version)
                .hostScore(request.getHostScore().trim())
                .guestScore(request.getGuestScore().trim())
                .rawScoreDetails(request.getRawScoreDetails())
                .outcome(outcome)
                .gFactor(gFactor)
                .build();

        scoreSubmissionRepository.save(submission);

        match.setStatus(MatchStatus.SCORE_CONFIRMING);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        room.setStatus(MatchStatus.SCORE_CONFIRMING);
        matchRoomRepository.save(room);

        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse confirmScore(UUID matchId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Match match = findMatchByRoomIdOrMatchId(matchId);
        if (match == null) {
            throw new CustomException("Không tìm thấy trận đấu", 404);
        }

        if (!isClubAdmin(match.getGuestClub().getId(), user.getId())) {
            throw new CustomException("Chỉ chủ/quản lý CLB Guest mới được xác nhận tỷ số", 403);
        }

        if (match.getStatus() != MatchStatus.SCORE_CONFIRMING && match.getStatus() != MatchStatus.RESULT_OVERDUE) {
            throw new CustomException("Trận đấu không ở trạng thái chờ xác nhận tỷ số", 400);
        }

        ScoreSubmission submission = scoreSubmissionRepository.findFirstByMatchIdOrderByVersionDesc(match.getId())
                .orElseThrow(() -> new CustomException("Chưa có tỷ số khai báo để xác nhận", 400));

        if (crpLedgerRepository.findByMatchIdAndClubId(match.getId(), match.getHostClub().getId()).isPresent()) {
            throw new CustomException("Trận đấu này đã được ghi sổ CRP trước đó", 400);
        }

        Sport sport = match.getHostClub().getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
        long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                match.getHostClub().getId(), match.getGuestClub().getId(), MatchType.RANKED, sevenDaysAgo);

        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, submission.getOutcome(), submission.getGFactor(),
                (int) recentRankedMatches);

        String scoreText = adapter.getCanonicalScoreText(submission.getHostScore(), submission.getGuestScore(),
                submission.getRawScoreDetails());
        String expJson = "";
        try {
            expJson = objectMapper.writeValueAsString(crpRes.getExplanation());
        } catch (Exception e) {
            expJson = "[]";
        }

        com.backend.sporta.entity.MatchResult result = com.backend.sporta.entity.MatchResult.builder()
                .match(match)
                .outcome(submission.getOutcome())
                .finalScoreText(scoreText)
                .hostCrpBefore(crpRes.getHostCrpBefore())
                .hostCrpDelta(crpRes.getHostCrpDelta())
                .hostCrpAfter(crpRes.getHostCrpAfter())
                .guestCrpBefore(crpRes.getGuestCrpBefore())
                .guestCrpDelta(crpRes.getGuestCrpDelta())
                .guestCrpAfter(crpRes.getGuestCrpAfter())
                .isRankedEligible(crpRes.isRankedEligible())
                .explanationJson(expJson)
                .confirmedAt(LocalDateTime.now())
                .build();

        matchResultRepository.save(result);

        if (crpRes.isRankedEligible()) {
            CRPLedger hostLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(match.getHostClub().getId())
                    .beforeCrp(crpRes.getHostCrpBefore())
                    .deltaCrp(crpRes.getHostCrpDelta())
                    .afterCrp(crpRes.getHostCrpAfter())
                    .reason("Kết quả trận đấu Ranked " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(hostLedger);

            CRPLedger guestLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(match.getGuestClub().getId())
                    .beforeCrp(crpRes.getGuestCrpBefore())
                    .deltaCrp(crpRes.getGuestCrpDelta())
                    .afterCrp(crpRes.getGuestCrpAfter())
                    .reason("Kết quả trận đấu Ranked " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(guestLedger);

            Club hostClub = match.getHostClub();
            int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
            hostClub.setCrp(Math.max(0, currentHostCrp + crpRes.getHostCrpDelta()));
            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
            if (submission.getOutcome() == NormalizedOutcome.WIN_HOST) {
                hostClub.setRankedWins((hostClub.getRankedWins() != null ? hostClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(hostClub);

            Club guestClub = match.getGuestClub();
            int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
            guestClub.setCrp(Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta()));
            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
            if (submission.getOutcome() == NormalizedOutcome.WIN_GUEST) {
                guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(guestClub);
        }

        updatePlayerElos(match, submission.getOutcome());

        match.setStatus(MatchStatus.RESULT_FINAL);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        room.setStatus(MatchStatus.RESULT_FINAL);
        matchRoomRepository.save(room);

        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse disagreeScore(UUID matchId, OpenDisputeRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new CustomException("Không tìm thấy trận đấu", 404));

        if (!isClubAdmin(match.getGuestClub().getId(), user.getId())
                && !isClubAdmin(match.getHostClub().getId(), user.getId())) {
            throw new CustomException("Chỉ chủ/quản lý CLB mới được từ chối tỷ số/khiếu nại", 403);
        }

        Dispute dispute = Dispute.builder()
                .match(match)
                .openedByClub(isClubAdmin(match.getGuestClub().getId(), user.getId()) ? match.getGuestClub()
                        : match.getHostClub())
                .reasonCode(request.getReasonCode() != null ? request.getReasonCode() : "DISAGREE_SCORE")
                .description(request.getDescription())
                .status(DisputeStatus.OPEN)
                .build();
        disputeRepository.save(dispute);

        match.setStatus(MatchStatus.DISPUTED);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        room.setStatus(MatchStatus.DISPUTED);
        matchRoomRepository.save(room);

        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse proposeDraw(UUID matchId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new CustomException("Không tìm thấy trận đấu", 404));

        if (!isClubAdmin(match.getHostClub().getId(), user.getId())
                && !isClubAdmin(match.getGuestClub().getId(), user.getId())) {
            throw new CustomException("Không có quyền đề nghị hòa", 403);
        }

        if (match.getStatus() != MatchStatus.RESULT_OVERDUE && match.getStatus() != MatchStatus.SCORE_PENDING) {
            throw new CustomException("Chỉ có thể đề nghị hòa khi trận đấu quá hạn hoặc chờ kết quả", 400);
        }

        match.setStatus(MatchStatus.DRAW_PROPOSED);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        room.setStatus(MatchStatus.DRAW_PROPOSED);
        matchRoomRepository.save(room);

        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public MatchRoomResponse acceptDraw(UUID matchId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new CustomException("Không tìm thấy trận đấu", 404));

        if (match.getStatus() != MatchStatus.DRAW_PROPOSED) {
            throw new CustomException("Trận đấu không ở trạng thái đề nghị hòa", 400);
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
        long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                match.getHostClub().getId(), match.getGuestClub().getId(), MatchType.RANKED, sevenDaysAgo);

        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, NormalizedOutcome.DRAW, 1.0,
                (int) recentRankedMatches);

        String expJson = "";
        try {
            expJson = objectMapper.writeValueAsString(crpRes.getExplanation());
        } catch (Exception e) {
            expJson = "[\"Kết quả Hòa theo đồng thuận\"]";
        }

        com.backend.sporta.entity.MatchResult result = com.backend.sporta.entity.MatchResult.builder()
                .match(match)
                .outcome(NormalizedOutcome.DRAW)
                .finalScoreText("Hòa (Đồng thuận)")
                .hostCrpBefore(crpRes.getHostCrpBefore())
                .hostCrpDelta(crpRes.getHostCrpDelta())
                .hostCrpAfter(crpRes.getHostCrpAfter())
                .guestCrpBefore(crpRes.getGuestCrpBefore())
                .guestCrpDelta(crpRes.getGuestCrpDelta())
                .guestCrpAfter(crpRes.getGuestCrpAfter())
                .isRankedEligible(crpRes.isRankedEligible())
                .explanationJson(expJson)
                .build();

        matchResultRepository.save(result);

        if (crpRes.isRankedEligible()) {
            CRPLedger hostLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(match.getHostClub().getId())
                    .beforeCrp(crpRes.getHostCrpBefore())
                    .deltaCrp(crpRes.getHostCrpDelta())
                    .afterCrp(crpRes.getHostCrpAfter())
                    .reason("Kết quả Hòa đồng thuận trận Ranked " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(hostLedger);

            CRPLedger guestLedger = CRPLedger.builder()
                    .matchId(match.getId())
                    .clubId(match.getGuestClub().getId())
                    .beforeCrp(crpRes.getGuestCrpBefore())
                    .deltaCrp(crpRes.getGuestCrpDelta())
                    .afterCrp(crpRes.getGuestCrpAfter())
                    .reason("Kết quả Hòa đồng thuận trận Ranked " + match.getId())
                    .algorithmVersion(config.getAlgorithmVersion())
                    .build();
            crpLedgerRepository.save(guestLedger);

            Club hostClub = match.getHostClub();
            int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
            hostClub.setCrp(Math.max(0, currentHostCrp + crpRes.getHostCrpDelta()));
            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
            clubRepository.save(hostClub);

            Club guestClub = match.getGuestClub();
            int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
            guestClub.setCrp(Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta()));
            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
            clubRepository.save(guestClub);

            updatePlayerElos(match, NormalizedOutcome.DRAW);
        }

        match.setStatus(MatchStatus.RESULT_FINAL);
        matchRepository.save(match);

        MatchRoom room = match.getRoom();
        room.setStatus(MatchStatus.RESULT_FINAL);
        matchRoomRepository.save(room);

        return mapToRoomResponse(room, match, user);
    }

    @Override
    @Transactional
    public void openDispute(UUID matchId, OpenDisputeRequest request, String userEmail) {
        disagreeScore(matchId, request, userEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public RankingPreviewResponse previewRanking(UUID matchId, String hostScore, String guestScore, String rawScoreDetails) {
        Match match = findMatchByRoomIdOrMatchId(matchId);
        if (match == null) {
            throw new CustomException("Không tìm thấy trận đấu", 404);
        }

        Sport sport = match.getHostClub().getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        ScoreAdapter.ValidationResult val = adapter.validate(hostScore, guestScore, rawScoreDetails);
        if (!val.isValid()) {
            throw new CustomException("Tỷ số preview không hợp lệ: " + val.getErrorMessage(), 400);
        }

        NormalizedOutcome outcome = adapter.normalize(hostScore, guestScore, rawScoreDetails);
        double gFactor = adapter.calculateG(hostScore, guestScore, rawScoreDetails);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(config.getPairLimitWindowDays());
        long recentRankedMatches = matchRepository.countRecentRankedMatchesBetweenClubs(
                match.getHostClub().getId(), match.getGuestClub().getId(), MatchType.RANKED, sevenDaysAgo);

        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, outcome, gFactor, (int) recentRankedMatches);

        String balanceLabel = clubEloService.getBalanceLabel(match.getHostClubEloSnapshot(),
                match.getGuestClubEloSnapshot());

        return RankingPreviewResponse.builder()
                .matchType(match.getMatchType())
                .hostClubElo(match.getHostClubEloSnapshot())
                .guestClubElo(match.getGuestClubEloSnapshot())
                .balanceLabel(balanceLabel)
                .dominanceFactor(crpRes.getGFactor())
                .upsetModifier(crpRes.getUpsetModifier())
                .hostCrpBefore(crpRes.getHostCrpBefore())
                .hostCrpDelta(crpRes.getHostCrpDelta())
                .hostCrpAfter(crpRes.getHostCrpAfter())
                .guestCrpBefore(crpRes.getGuestCrpBefore())
                .guestCrpDelta(crpRes.getGuestCrpDelta())
                .guestCrpAfter(crpRes.getGuestCrpAfter())
                .explanation(crpRes.getExplanation())
                .build();
    }

    private MatchRoomResponse mapToRoomResponse(MatchRoom room, Match match, User currentUser) {
        Booking booking = room.getBooking();

        String addressText = "";
        if (booking.getVenue() != null) {
            addressText = booking.getVenue().getAddressDetail() != null ? booking.getVenue().getAddressDetail()
                    : (booking.getVenue().getLocation() != null ? booking.getVenue().getLocation() : "");
        }

        LocalDateTime startDateTime = getBookingStartTime(booking);
        LocalDateTime endDateTime = getBookingEndTime(booking);

        BookingSummaryResponse bookingVM = BookingSummaryResponse.builder()
                .id(booking.getId().toString())
                .facilityName(booking.getVenue() != null ? booking.getVenue().getName() : "")
                .courtName(booking.getDetails() != null && !booking.getDetails().isEmpty()
                        && booking.getDetails().get(0).getCourt() != null
                                ? booking.getDetails().get(0).getCourt().getName()
                                : "Sân đấu")
                .sportId(room.getHostClub().getSport() != null ? room.getHostClub().getSport().getId().toString() : "1")
                .sportName(room.getHostClub().getSport() != null ? room.getHostClub().getSport().getName() : "Bóng đá")
                .date(startDateTime != null ? startDateTime.toLocalDate().toString() : LocalDate.now().toString())
                .startTime(startDateTime != null ? startDateTime.toLocalTime().toString() : "18:00")
                .endTime(endDateTime != null ? endDateTime.toLocalTime().toString() : "20:00")
                .totalPrice(booking.getFinalPrice())
                .isPaid(booking.getStatus() == BookingStatus.CONFIRMED)
                .format("Sân tiêu chuẩn")
                .address(addressText)
                .venueId(booking.getVenue() != null ? booking.getVenue().getId().toString() : null)
                .build();

        ClubSummaryResponse hostClubVM = mapToClubSummaryResponse(room.getHostClub());
        ClubSummaryResponse guestClubVM = room.getGuestClub() != null ? mapToClubSummaryResponse(room.getGuestClub())
                : null;

        List<JoinRequest> applicantsList = joinRequestRepository.findByRoomId(room.getId());
        List<JoinRequestResponse> applicantsVM = applicantsList.stream()
                .filter(a -> a.getStatus() == JoinRequestStatus.PENDING)
                .map(this::mapToJoinRequestResponse)
                .collect(Collectors.toList());

        JoinRequestResponse myReqVM = null;
        if (currentUser != null) {
            Optional<JoinRequest> pendingReq = applicantsList.stream()
                    .filter(a -> isClubAdmin(a.getApplicantClub().getId(), currentUser.getId()))
                    .filter(a -> a.getStatus() == JoinRequestStatus.PENDING)
                    .findFirst();
            if (pendingReq.isPresent()) {
                myReqVM = mapToJoinRequestResponse(pendingReq.get());
            } else {
                Optional<JoinRequest> latestReq = applicantsList.stream()
                        .filter(a -> isClubAdmin(a.getApplicantClub().getId(), currentUser.getId()))
                        .max((r1, r2) -> {
                            if (r1.getCreatedAt() == null || r2.getCreatedAt() == null) return 0;
                            return r1.getCreatedAt().compareTo(r2.getCreatedAt());
                        });
                if (latestReq.isPresent()) {
                    myReqVM = mapToJoinRequestResponse(latestReq.get());
                }
            }
        }

        List<MatchLineup> roomLineups = matchLineupRepository.findByMatchRoomId(room.getId());
        MatchLineup hostLineupEntity = roomLineups.stream().filter(l -> l.getTeamSide() == TeamSide.HOST).findFirst().orElse(null);
        MatchLineup guestLineupEntity = roomLineups.stream().filter(l -> l.getTeamSide() == TeamSide.GUEST).findFirst().orElse(null);

        LineupResponse hostLineupVM = hostLineupEntity != null ? lineupService.mapToResponse(hostLineupEntity) : null;
        LineupResponse guestLineupVM = guestLineupEntity != null ? lineupService.mapToResponse(guestLineupEntity) : null;

        int hostElo = (hostLineupEntity != null && hostLineupEntity.getEloAvg() != null && hostLineupEntity.getEloAvg() > 0)
                ? hostLineupEntity.getEloAvg() : clubEloService.getClubElo(room.getHostClub());
        int guestElo = (guestLineupEntity != null && guestLineupEntity.getEloAvg() != null && guestLineupEntity.getEloAvg() > 0)
                ? guestLineupEntity.getEloAvg()
                : (room.getGuestClub() != null ? clubEloService.getClubElo(room.getGuestClub()) : hostElo);
        String balanceLabel = clubEloService.getBalanceLabel(hostElo, guestElo);

        List<String> desiredLevelsList = room.getDesiredLevels() != null && !room.getDesiredLevels().isBlank()
                ? Arrays.asList(room.getDesiredLevels().split(","))
                : Collections.emptyList();

        ScoreSubmissionResponse submissionVM = null;
        MatchResultResponse resultVM = null;

        if (match != null) {
            Optional<ScoreSubmission> sub = scoreSubmissionRepository
                    .findFirstByMatchIdOrderByVersionDesc(match.getId());
            if (sub.isPresent()) {
                ScoreSubmission s = sub.get();
                submissionVM = ScoreSubmissionResponse.builder()
                        .matchId(match.getId().toString())
                        .hostScore(s.getHostScore())
                        .guestScore(s.getGuestScore())
                        .rawScoreDetails(s.getRawScoreDetails())
                        .submittedByClubId(s.getSubmittedByClub().getId().toString())
                        .submittedAt(s.getSubmittedAt().toString())
                        .normalizedOutcome(s.getOutcome())
                        .build();
            }

            Optional<com.backend.sporta.entity.MatchResult> res = matchResultRepository.findByMatchId(match.getId());
            if (res.isPresent()) {
                com.backend.sporta.entity.MatchResult r = res.get();
                List<String> expList = Collections.emptyList();
                try {
                    if (r.getExplanationJson() != null) {
                        expList = objectMapper.readValue(r.getExplanationJson(), List.class);
                    }
                } catch (Exception e) {
                }

                resultVM = MatchResultResponse.builder()
                        .matchId(match.getId().toString())
                        .outcome(r.getOutcome())
                        .finalScoreText(r.getFinalScoreText())
                        .hostCrpBefore(r.getHostCrpBefore())
                        .hostCrpDelta(r.getHostCrpDelta())
                        .hostCrpAfter(r.getHostCrpAfter())
                        .guestCrpBefore(r.getGuestCrpBefore())
                        .guestCrpDelta(r.getGuestCrpDelta())
                        .guestCrpAfter(r.getGuestCrpAfter())
                        .explanation(expList)
                        .confirmedAt(r.getConfirmedAt() != null ? r.getConfirmedAt().toString() : java.time.LocalDateTime.now().toString())
                        .build();
            }
        }

        MatchPermissionsResponse permissionsVM = buildPermissions(room, match, currentUser);

        String statusLabel;
        boolean isHostUser = currentUser != null && (
                isClubAdmin(room.getHostClub().getId(), currentUser.getId()) ||
                (room.getHostClub().getCreator() != null && room.getHostClub().getCreator().getId().equals(currentUser.getId()))
        );
        boolean isApplicantUser = myReqVM != null;

        if (room.getStatus() == MatchStatus.EXPIRED) {
            if (isHostUser) {
                statusLabel = "Quá hạn";
            } else if (isApplicantUser) {
                statusLabel = "Không tìm được đối thủ";
            } else {
                statusLabel = "Đã quá hạn";
            }
        } else if (room.getStatus() == MatchStatus.CANCELLED) {
            statusLabel = "Đã hủy";
        } else if (room.getStatus() == MatchStatus.OPEN) {
            statusLabel = "Đang tìm đối thủ";
        } else if (room.getStatus() == MatchStatus.MATCHED || room.getStatus() == MatchStatus.UPCOMING) {
            statusLabel = "Đã ghép đối thủ";
        } else if (room.getStatus() == MatchStatus.SCORE_PENDING || room.getStatus() == MatchStatus.SCORE_CONFIRMING) {
            statusLabel = "Chờ xác nhận tỷ số";
        } else if (room.getStatus() == MatchStatus.RESULT_FINAL) {
            statusLabel = "Đã hoàn thành";
        } else if (room.getStatus() == MatchStatus.RESULT_OVERDUE) {
            statusLabel = "Quá hạn nhập tỷ số";
        } else if (room.getStatus() == MatchStatus.DISPUTED) {
            statusLabel = "Đang khiếu nại";
        } else {
            statusLabel = room.getStatus() != null ? room.getStatus().name() : "";
        }

        return MatchRoomResponse.builder()
                .id(room.getId().toString())
                .booking(bookingVM)
                .hostClub(hostClubVM)
                .guestClub(guestClubVM)
                .matchType(room.getMatchType())
                .hostSharePercent(room.getHostSharePercent())
                .guestSharePercent(room.getGuestSharePercent())
                .guestShareAmount(room.getGuestShareAmount())
                .desiredLevels(desiredLevelsList)
                .note(room.getNote())
                .status(room.getStatus())
                .statusLabel(statusLabel)
                .cancellationReason(room.getCancellationReason())
                .applicants(applicantsVM)
                .myRequest(myReqVM)
                .permissions(permissionsVM)
                .createdAt(room.getCreatedAt().toString())
                .balanceLabel(balanceLabel)
                .scoreSubmission(submissionVM)
                .result(resultVM)
                .matchId(match != null ? match.getId().toString() : null)
                .hostLineup(hostLineupVM)
                .guestLineup(guestLineupVM)
                .build();
    }

    private ClubSummaryResponse mapToClubSummaryResponse(Club club) {
        int elo = clubEloService.getClubElo(club);
        String levelLabel = clubEloService.getLevelLabel(elo);
        int activeCount = clubEloService.getActiveMemberCount(club.getId());
        boolean eligible = activeCount >= config.getMinActiveClubMembers();

        return ClubSummaryResponse.builder()
                .id(club.getId().toString())
                .name(club.getName())
                .sportId(club.getSport() != null ? club.getSport().getId().toString() : "1")
                .sportName(club.getSport() != null ? club.getSport().getName() : "Bóng đá")
                .logoUrl(club.getAvatarImage())
                .avatarUrl(club.getAvatarImage())
                .activeMemberCount(activeCount)
                .isEligibleForMatchmaking(eligible)
                .clubElo(elo)
                .levelLabel(levelLabel)
                .crp(club.getCrp() != null ? club.getCrp() : 0)
                .build();
    }

    private JoinRequestResponse mapToJoinRequestResponse(JoinRequest req) {
        return JoinRequestResponse.builder()
                .id(req.getId().toString())
                .roomId(req.getRoom().getId().toString())
                .applicantClub(mapToClubSummaryResponse(req.getApplicantClub()))
                .status(req.getStatus())
                .createdAt(req.getCreatedAt().toString())
                .note(req.getNote())
                .lineup(req.getLineup() != null ? lineupService.mapToResponse(req.getLineup()) : null)
                .build();
    }

    private MatchPermissionsResponse buildPermissions(MatchRoom room, Match match, User currentUser) {
        if (currentUser == null) {
            return MatchPermissionsResponse.builder()
                    .canCreateRoom(false).canSuggest(false).canRequestJoin(false)
                    .canWithdrawRequest(false).canManageApplicants(false).canEditRoom(false)
                    .canCancelRoom(false).canEnterScore(false).canConfirmScore(false)
                    .canReport(false).canProposeDraw(false)
                    .build();
        }

        boolean isHostAdmin = isClubAdmin(room.getHostClub().getId(), currentUser.getId());
        boolean isGuestAdmin = room.getGuestClub() != null
                && isClubAdmin(room.getGuestClub().getId(), currentUser.getId());

        MatchStatus status = room.getStatus();

        return MatchPermissionsResponse.builder()
                .canCreateRoom(true)
                .canSuggest(true)
                .canRequestJoin(!isHostAdmin && status == MatchStatus.OPEN)
                .canWithdrawRequest(!isHostAdmin && status == MatchStatus.OPEN)
                .canManageApplicants(isHostAdmin && status == MatchStatus.OPEN)
                .canEditRoom(isHostAdmin && status == MatchStatus.OPEN)
                .canCancelRoom(isHostAdmin && status == MatchStatus.OPEN)
                .canEnterScore(isHostAdmin && (status == MatchStatus.MATCHED || status == MatchStatus.UPCOMING
                        || status == MatchStatus.SCORE_PENDING || status == MatchStatus.RESULT_OVERDUE))
                .canConfirmScore(isGuestAdmin
                        && (status == MatchStatus.SCORE_CONFIRMING || status == MatchStatus.RESULT_OVERDUE))
                .canReport((isHostAdmin || isGuestAdmin)
                        && (status == MatchStatus.SCORE_CONFIRMING || status == MatchStatus.RESULT_OVERDUE))
                .canProposeDraw((isHostAdmin || isGuestAdmin)
                        && (status == MatchStatus.RESULT_OVERDUE || status == MatchStatus.SCORE_PENDING))
                .build();
    }

    private Match findMatchByRoomIdOrMatchId(UUID id) {
        if (id == null) return null;
        Match match = matchRepository.findById(id)
                .or(() -> matchRepository.findByRoomId(id))
                .orElse(null);

        if (match == null) {
            MatchRoom room = matchRoomRepository.findById(id).orElse(null);
            if (room != null && room.getGuestClub() != null) {
                int hostElo = clubEloService.getClubElo(room.getHostClub());
                int guestElo = clubEloService.getClubElo(room.getGuestClub());
                String hostLevel = clubEloService.getLevelLabel(hostElo);
                String guestLevel = clubEloService.getLevelLabel(guestElo);
                int hostCrp = room.getHostClub().getCrp() != null ? room.getHostClub().getCrp() : 0;
                int guestCrp = room.getGuestClub().getCrp() != null ? room.getGuestClub().getCrp() : 0;

                match = Match.builder()
                        .room(room)
                        .booking(room.getBooking())
                        .hostClub(room.getHostClub())
                        .guestClub(room.getGuestClub())
                        .matchType(room.getMatchType())
                        .status(room.getStatus() != null ? room.getStatus() : MatchStatus.MATCHED)
                        .hostSharePercent(room.getHostSharePercent())
                        .guestSharePercent(room.getGuestSharePercent())
                        .guestShareAmount(room.getGuestShareAmount())
                        .hostClubEloSnapshot(hostElo)
                        .guestClubEloSnapshot(guestElo)
                        .hostLevelSnapshot(hostLevel)
                        .guestLevelSnapshot(guestLevel)
                        .hostCrpBeforeSnapshot(hostCrp)
                        .guestCrpBeforeSnapshot(guestCrp)
                        .build();
                match = matchRepository.save(match);
            }
        }
        return match;
    }

    public void updatePlayerElos(Match match, NormalizedOutcome outcome) {
        if (match == null || match.getHostClub() == null || match.getGuestClub() == null) return;
        if (match.getMatchType() != MatchType.RANKED) return;

        Club hostClub = match.getHostClub();
        Club guestClub = match.getGuestClub();
        Long sportId = hostClub.getSport() != null ? hostClub.getSport().getId() : null;
        if (sportId == null && guestClub.getSport() != null) {
            sportId = guestClub.getSport().getId();
        }
        if (sportId == null) return;

        List<ClubMember> hostLineup = getMatchLineup(match, hostClub);
        List<ClubMember> guestLineup = getMatchLineup(match, guestClub);

        int avgHostElo = calculateLineupAvgElo(hostLineup, sportId);
        int avgGuestElo = calculateLineupAvgElo(guestLineup, sportId);

        double hostScore = (outcome == NormalizedOutcome.WIN_HOST) ? 1.0 : (outcome == NormalizedOutcome.DRAW ? 0.5 : 0.0);
        double guestScore = (outcome == NormalizedOutcome.WIN_GUEST) ? 1.0 : (outcome == NormalizedOutcome.DRAW ? 0.5 : 0.0);

        int scoreDiff = 0;
        var resultOpt = matchResultRepository.findByMatchId(match.getId());
        if (resultOpt.isPresent()) {
            try {
                String[] parts = resultOpt.get().getFinalScoreText().split("-");
                if (parts.length == 2) {
                    int h = Integer.parseInt(parts[0].trim());
                    int g = Integer.parseInt(parts[1].trim());
                    scoreDiff = Math.abs(h - g);
                }
            } catch (Exception ignored) {}
        }

        for (ClubMember member : hostLineup) {
            updateIndividualMemberElo(member, sportId, avgGuestElo, hostScore, scoreDiff);
        }
        for (ClubMember member : guestLineup) {
            updateIndividualMemberElo(member, sportId, avgHostElo, guestScore, scoreDiff);
        }
    }

    private List<ClubMember> getMatchLineup(Match match, Club club) {
        if (match != null && club != null) {
            // 1. Check official MatchLineup from MatchRoom
            if (match.getRoom() != null) {
                boolean isHost = club.getId().equals(match.getHostClub().getId());
                var side = isHost ? com.backend.sporta.enums.TeamSide.HOST : com.backend.sporta.enums.TeamSide.GUEST;
                var lineupOpt = matchLineupRepository.findByMatchRoomIdAndTeamSide(match.getRoom().getId(), side);
                if (lineupOpt.isPresent()) {
                    List<com.backend.sporta.entity.LineupMember> lms = lineupMemberRepository.findByLineupId(lineupOpt.get().getId());
                    if (lms != null && !lms.isEmpty()) {
                        Set<Long> userIds = lms.stream()
                                .filter(lm -> lm.getUser() != null)
                                .map(lm -> lm.getUser().getId())
                                .collect(Collectors.toSet());
                        List<ClubMember> members = clubMemberRepository.findByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED)
                                .stream()
                                .filter(m -> m.getUser() != null && userIds.contains(m.getUser().getId()))
                                .collect(Collectors.toList());
                        if (!members.isEmpty()) {
                            return members;
                        }
                    }
                }
            }

            // 2. Check ClubPoll
            Optional<ClubPoll> pollOpt = clubPollRepository.findByClubIdAndMatchId(club.getId(), match.getId());
            if (pollOpt.isPresent()) {
                List<ClubPollVote> joinVotes = clubPollVoteRepository.findByPollIdAndOption(pollOpt.get().getId(), PollVoteOption.JOIN);
                if (!joinVotes.isEmpty()) {
                    Set<Long> userIds = joinVotes.stream()
                            .filter(v -> v.getUser() != null)
                            .map(v -> v.getUser().getId())
                            .collect(Collectors.toSet());
                    List<ClubMember> lineup = clubMemberRepository.findByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED)
                            .stream()
                            .filter(m -> m.getUser() != null && userIds.contains(m.getUser().getId()))
                            .collect(Collectors.toList());
                    if (!lineup.isEmpty()) {
                        return lineup;
                    }
                }
            }
        }
        return clubMemberRepository.findByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
    }

    private void recordDevLineup(Match match, Club club, List<Long> userIds) {
        if (match == null || club == null || userIds == null || userIds.isEmpty()) return;
        try {
            // 1. Sync MatchLineup & LineupMember
            if (match.getRoom() != null) {
                boolean isHost = club.getId().equals(match.getHostClub().getId());
                com.backend.sporta.enums.TeamSide side = isHost ? com.backend.sporta.enums.TeamSide.HOST : com.backend.sporta.enums.TeamSide.GUEST;
                com.backend.sporta.entity.MatchLineup lineup = matchLineupRepository.findByMatchRoomIdAndTeamSide(match.getRoom().getId(), side)
                        .orElseGet(() -> {
                            com.backend.sporta.entity.MatchLineup ml = com.backend.sporta.entity.MatchLineup.builder()
                                    .club(club)
                                    .matchRoom(match.getRoom())
                                    .name("Đội hình DEV " + club.getName())
                                    .lineupType(com.backend.sporta.enums.LineupType.MATCHMAKING)
                                    .teamSide(side)
                                    .status(com.backend.sporta.enums.LineupStatus.ACTIVE)
                                    .build();
                            return matchLineupRepository.save(ml);
                        });

                List<com.backend.sporta.entity.LineupMember> existingMembers = lineupMemberRepository.findByLineupId(lineup.getId());
                if (existingMembers != null && !existingMembers.isEmpty()) {
                    lineupMemberRepository.deleteAll(existingMembers);
                }

                int totalElo = 0;
                int memberCount = 0;
                Long sportId = club.getSport() != null ? club.getSport().getId() : 1L;

                for (Long uid : userIds) {
                    Optional<User> uOpt = userRepository.findById(uid);
                    if (uOpt.isPresent()) {
                        User u = uOpt.get();
                        int pElo = userSportRepository.findByUserIdAndSportId(u.getId(), sportId)
                                .map(UserSport::getEffectiveElo).orElse(1000);
                        totalElo += pElo;
                        memberCount++;

                        com.backend.sporta.entity.LineupMember lm = com.backend.sporta.entity.LineupMember.builder()
                                .lineup(lineup)
                                .user(u)
                                .userEloSnapshot(pElo)
                                .addedAt(LocalDateTime.now())
                                .build();
                        lineupMemberRepository.save(lm);
                    }
                }

                lineup.setEloAvg(memberCount > 0 ? totalElo / memberCount : 1000);
                matchLineupRepository.save(lineup);
            }
            syncDevPoll(match, club, userIds);
        } catch (Exception e) {
            System.err.println("WARN: Failed to record dev lineup: " + e.getMessage());
        }
    }

    private void syncDevPoll(Match match, Club club, List<Long> userIds) {
        if (match == null || club == null || userIds == null || userIds.isEmpty()) return;
        try {
            ClubPoll poll = clubPollRepository.findByClubIdAndMatchId(club.getId(), match.getId())
                    .orElseGet(() -> {
                        User creator = club.getCreator() != null ? club.getCreator() : userRepository.findById(userIds.get(0)).orElse(null);
                        ClubPoll newPoll = ClubPoll.builder()
                                .club(club)
                                .creator(creator)
                                .matchId(match.getId())
                                .title("Đội hình thi đấu trận " + match.getId())
                                .closeTime("23:59")
                                .isClosed(true)
                                .build();
                        return clubPollRepository.save(newPoll);
                    });

            List<ClubPollVote> existingVotes = clubPollVoteRepository.findByPollId(poll.getId());
            if (existingVotes != null && !existingVotes.isEmpty()) {
                clubPollVoteRepository.deleteAll(existingVotes);
            }

            for (Long uid : userIds) {
                userRepository.findById(uid).ifPresent(u -> {
                    ClubPollVote vote = ClubPollVote.builder()
                            .poll(poll)
                            .user(u)
                            .option(PollVoteOption.JOIN)
                            .votedAt(LocalDateTime.now())
                            .build();
                    clubPollVoteRepository.save(vote);
                });
            }
        } catch (Exception e) {
            System.err.println("WARN: Failed to sync dev poll: " + e.getMessage());
        }
    }

    private int calculateLineupAvgElo(List<ClubMember> lineup, Long sportId) {
        if (lineup == null || lineup.isEmpty()) return 1000;
        int total = 0;
        int count = 0;
        for (ClubMember m : lineup) {
            if (m.getUser() == null) continue;
            Optional<UserSport> us = userSportRepository.findByUserIdAndSportId(m.getUser().getId(), sportId);
            total += us.map(UserSport::getEffectiveElo).orElse(1000);
            count++;
        }
        return count > 0 ? (int) Math.round((double) total / count) : 1000;
    }

    private void updateIndividualMemberElo(ClubMember member, Long sportId, int opponentTeamElo, double score, int scoreDiff) {
        if (member == null || member.getUser() == null || sportId == null) return;
        User user = member.getUser();

        UserSport us = userSportRepository.findByUserIdAndSportId(user.getId(), sportId)
                .orElseGet(() -> {
                    Sport sport = (member.getClub() != null && member.getClub().getSport() != null)
                            ? member.getClub().getSport()
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

        personalEloEngine.updatePlayerStats(us, opponentTeamElo, score, EloSourceType.CLUB_RANKED, scoreDiff);
        userSportRepository.save(us);
    }

    private void validateAntiSmurf(Club hostClub, Club guestClub) {
        List<ClubMember> hostMembers = clubMemberRepository.findByClubIdAndStatus(hostClub.getId(), ClubMemberStatus.APPROVED);
        List<ClubMember> guestMembers = clubMemberRepository.findByClubIdAndStatus(guestClub.getId(), ClubMemberStatus.APPROVED);

        Set<Long> hostUserIds = hostMembers.stream()
                .filter(m -> m.getUser() != null)
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());

        long overlap = guestMembers.stream()
                .filter(m -> m.getUser() != null && hostUserIds.contains(m.getUser().getId()))
                .count();

        int smallerTeam = Math.min(hostMembers.size(), guestMembers.size());
        double overlapRatio = smallerTeam > 0 ? (double) overlap / smallerTeam : 0;

        if (overlapRatio > 0.3) {
            throw new CustomException("Hai CLB có quá nhiều thành viên trùng nhau ("
                    + (int) Math.round(overlapRatio * 100) + "%). Không thể đấu Xếp hạng để chống gian lận (Anti-smurf).", 400);
        }
    }

    @Override
    @Transactional
    public MatchRoomResponse devAssignClubs(UUID roomId, DevAssignClubsRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (!Boolean.TRUE.equals(user.getIsDevTester()) && user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Chỉ tài khoản DEV Tester hoặc Admin mới được sử dụng tính năng này", 403);
        }

        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy phòng ghép trận", 404));

        if (request.getHostClubId() != null) {
            Club hostClub = clubRepository.findById(request.getHostClubId())
                    .orElseThrow(() -> new CustomException("Không tìm thấy CLB Host", 404));
            room.setHostClub(hostClub);
        }

        if (request.getGuestClubId() != null) {
            Club guestClub = clubRepository.findById(request.getGuestClubId())
                    .orElseThrow(() -> new CustomException("Không tìm thấy CLB Guest", 404));
            room.setGuestClub(guestClub);
        }

        if (room.getHostClub() != null && room.getGuestClub() != null) {
            room.setStatus(MatchStatus.MATCHED);
            int hostElo = clubEloService.getClubElo(room.getHostClub());
            int guestElo = clubEloService.getClubElo(room.getGuestClub());
            String hostLevel = clubEloService.getLevelLabel(hostElo);
            String guestLevel = clubEloService.getLevelLabel(guestElo);
            int hostCrp = room.getHostClub().getCrp() != null ? room.getHostClub().getCrp() : 0;
            int guestCrp = room.getGuestClub().getCrp() != null ? room.getGuestClub().getCrp() : 0;

            Optional<Match> matchOpt = matchRepository.findByRoomId(room.getId());
            Match match;
            if (matchOpt.isPresent()) {
                match = matchOpt.get();
                match.setHostClub(room.getHostClub());
                match.setGuestClub(room.getGuestClub());
                match.setStatus(MatchStatus.MATCHED);
                match.setHostClubEloSnapshot(hostElo);
                match.setGuestClubEloSnapshot(guestElo);
                match.setHostLevelSnapshot(hostLevel);
                match.setGuestLevelSnapshot(guestLevel);
                match.setHostCrpBeforeSnapshot(hostCrp);
                match.setGuestCrpBeforeSnapshot(guestCrp);
            } else {
                match = Match.builder()
                        .room(room)
                        .booking(room.getBooking())
                        .hostClub(room.getHostClub())
                        .guestClub(room.getGuestClub())
                        .matchType(room.getMatchType())
                        .status(MatchStatus.MATCHED)
                        .hostSharePercent(room.getHostSharePercent())
                        .guestSharePercent(room.getGuestSharePercent())
                        .guestShareAmount(room.getGuestShareAmount())
                        .hostClubEloSnapshot(hostElo)
                        .guestClubEloSnapshot(guestElo)
                        .hostLevelSnapshot(hostLevel)
                        .guestLevelSnapshot(guestLevel)
                        .hostCrpBeforeSnapshot(hostCrp)
                        .guestCrpBeforeSnapshot(guestCrp)
                        .build();
            }
            matchRepository.save(match);
        }

        room = matchRoomRepository.save(room);
        Optional<Match> finalMatch = matchRepository.findByRoomId(room.getId());
        return mapToRoomResponse(room, finalMatch.orElse(null), user);
    }

    @Override
    @Transactional
    public MatchRoomResponse devForceFinishMatch(UUID roomId, DevForceFinishMatchRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (!Boolean.TRUE.equals(user.getIsDevTester()) && user.getRole() != Role.ADMIN && user.getRole() != Role.SUPER_ADMIN) {
            throw new CustomException("Chỉ tài khoản DEV Tester hoặc Admin mới được sử dụng tính năng này", 403);
        }

        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy phòng ghép trận", 404));

        if (room.getHostClub() == null || room.getGuestClub() == null) {
            throw new CustomException("Phòng chưa có đủ 2 CLB tham gia để kết thúc trận đấu. Vui lòng gán đủ 2 CLB trước.", 400);
        }

        Match match = matchRepository.findByRoomId(room.getId()).orElseGet(() -> {
            int hostElo = clubEloService.getClubElo(room.getHostClub());
            int guestElo = clubEloService.getClubElo(room.getGuestClub());
            return matchRepository.save(Match.builder()
                    .room(room)
                    .booking(room.getBooking())
                    .hostClub(room.getHostClub())
                    .guestClub(room.getGuestClub())
                    .matchType(room.getMatchType())
                    .status(MatchStatus.MATCHED)
                    .hostSharePercent(room.getHostSharePercent())
                    .guestSharePercent(room.getGuestSharePercent())
                    .guestShareAmount(room.getGuestShareAmount())
                    .hostClubEloSnapshot(hostElo)
                    .guestClubEloSnapshot(guestElo)
                    .hostLevelSnapshot(clubEloService.getLevelLabel(hostElo))
                    .guestLevelSnapshot(clubEloService.getLevelLabel(guestElo))
                    .hostCrpBeforeSnapshot(room.getHostClub().getCrp() != null ? room.getHostClub().getCrp() : 0)
                    .guestCrpBeforeSnapshot(room.getGuestClub().getCrp() != null ? room.getGuestClub().getCrp() : 0)
                    .build());
        });

        Sport sport = match.getHostClub().getSport();
        String sportName = sport != null ? sport.getName() : "Bóng đá";
        ScoreAdapter adapter = scoreAdapterRegistry.getAdapter(sportName);

        NormalizedOutcome outcome = adapter.normalize(request.getHostScore(), request.getGuestScore(),
                request.getRawScoreDetails());
        double gFactor = adapter.calculateG(request.getHostScore(), request.getGuestScore(),
                request.getRawScoreDetails());

        Optional<ScoreSubmission> lastSub = scoreSubmissionRepository
                .findFirstByMatchIdOrderByVersionDesc(match.getId());
        int version = lastSub.map(s -> s.getVersion() + 1).orElse(1);

        ScoreSubmission submission = ScoreSubmission.builder()
                .match(match)
                .submittedByClub(match.getHostClub())
                .version(version)
                .hostScore(request.getHostScore().trim())
                .guestScore(request.getGuestScore().trim())
                .rawScoreDetails(request.getRawScoreDetails())
                .outcome(outcome)
                .gFactor(gFactor)
                .build();
        scoreSubmissionRepository.save(submission);

        // 1. Link selected lineups or record DEV lineups
        if (request.getHostLineupId() != null) {
            matchLineupRepository.findById(request.getHostLineupId()).ifPresent(lineup -> {
                lineup.setMatchRoom(room);
                lineup.setTeamSide(com.backend.sporta.enums.TeamSide.HOST);
                lineup.setStatus(com.backend.sporta.enums.LineupStatus.IN_MATCH);
                matchLineupRepository.save(lineup);

                List<com.backend.sporta.entity.LineupMember> lms = lineupMemberRepository.findByLineupId(lineup.getId());
                List<Long> uids = lms.stream().filter(lm -> lm.getUser() != null).map(lm -> lm.getUser().getId()).toList();
                if (!uids.isEmpty()) {
                    syncDevPoll(match, match.getHostClub(), uids);
                }
            });
        } else if (request.getHostPlayerUserIds() != null && !request.getHostPlayerUserIds().isEmpty()) {
            recordDevLineup(match, match.getHostClub(), request.getHostPlayerUserIds());
        }

        if (request.getGuestLineupId() != null) {
            matchLineupRepository.findById(request.getGuestLineupId()).ifPresent(lineup -> {
                lineup.setMatchRoom(room);
                lineup.setTeamSide(com.backend.sporta.enums.TeamSide.GUEST);
                lineup.setStatus(com.backend.sporta.enums.LineupStatus.IN_MATCH);
                matchLineupRepository.save(lineup);

                List<com.backend.sporta.entity.LineupMember> lms = lineupMemberRepository.findByLineupId(lineup.getId());
                List<Long> uids = lms.stream().filter(lm -> lm.getUser() != null).map(lm -> lm.getUser().getId()).toList();
                if (!uids.isEmpty()) {
                    syncDevPoll(match, match.getGuestClub(), uids);
                }
            });
        } else if (request.getGuestPlayerUserIds() != null && !request.getGuestPlayerUserIds().isEmpty()) {
            recordDevLineup(match, match.getGuestClub(), request.getGuestPlayerUserIds());
        }

        // 2. Refresh match snapshots with the Lineup's Average Elo
        var hostLineupOpt = matchLineupRepository.findByMatchRoomIdAndTeamSide(room.getId(), com.backend.sporta.enums.TeamSide.HOST);
        var guestLineupOpt = matchLineupRepository.findByMatchRoomIdAndTeamSide(room.getId(), com.backend.sporta.enums.TeamSide.GUEST);
        if (hostLineupOpt.isPresent() && hostLineupOpt.get().getEloAvg() != null && hostLineupOpt.get().getEloAvg() > 0) {
            match.setHostClubEloSnapshot(hostLineupOpt.get().getEloAvg());
            match.setHostLevelSnapshot(clubEloService.getLevelLabel(hostLineupOpt.get().getEloAvg()));
        }
        if (guestLineupOpt.isPresent() && guestLineupOpt.get().getEloAvg() != null && guestLineupOpt.get().getEloAvg() > 0) {
            match.setGuestClubEloSnapshot(guestLineupOpt.get().getEloAvg());
            match.setGuestLevelSnapshot(clubEloService.getLevelLabel(guestLineupOpt.get().getEloAvg()));
        }
        match.setMatchType(room.getMatchType() != null ? room.getMatchType() : MatchType.RANKED);
        matchRepository.save(match);

        // 3. Calculate CRP (pass 0 for recent ranked matches so DEV mode is never blocked by anti-farming repeat limits)
        CRPEngine.CRPEngineResult crpRes = crpEngine.calculate(match, outcome, gFactor, 0);

        String scoreText = adapter.getCanonicalScoreText(request.getHostScore(), request.getGuestScore(),
                request.getRawScoreDetails());
        String expJson = "";
        try {
            expJson = objectMapper.writeValueAsString(crpRes.getExplanation());
        } catch (Exception e) {
            expJson = "[]";
        }

        com.backend.sporta.entity.MatchResult result = matchResultRepository.findByMatchId(match.getId())
                .orElseGet(() -> com.backend.sporta.entity.MatchResult.builder().match(match).build());

        result.setOutcome(outcome);
        result.setFinalScoreText(scoreText);
        result.setHostCrpBefore(crpRes.getHostCrpBefore());
        result.setHostCrpDelta(crpRes.getHostCrpDelta());
        result.setHostCrpAfter(crpRes.getHostCrpAfter());
        result.setGuestCrpBefore(crpRes.getGuestCrpBefore());
        result.setGuestCrpDelta(crpRes.getGuestCrpDelta());
        result.setGuestCrpAfter(crpRes.getGuestCrpAfter());
        result.setIsRankedEligible(crpRes.isRankedEligible());
        result.setExplanationJson(expJson);
        result.setConfirmedAt(LocalDateTime.now());

        matchResultRepository.save(result);

        if (crpRes.isRankedEligible()) {
            CRPLedger hostLedger = crpLedgerRepository.findByMatchIdAndClubId(match.getId(), match.getHostClub().getId())
                    .orElseGet(() -> CRPLedger.builder().matchId(match.getId()).clubId(match.getHostClub().getId()).build());
            hostLedger.setBeforeCrp(crpRes.getHostCrpBefore());
            hostLedger.setDeltaCrp(crpRes.getHostCrpDelta());
            hostLedger.setAfterCrp(crpRes.getHostCrpAfter());
            hostLedger.setReason("Kết quả trận đấu Ranked (DEV Force Finish) " + match.getId());
            hostLedger.setAlgorithmVersion(config.getAlgorithmVersion());
            crpLedgerRepository.save(hostLedger);

            CRPLedger guestLedger = crpLedgerRepository.findByMatchIdAndClubId(match.getId(), match.getGuestClub().getId())
                    .orElseGet(() -> CRPLedger.builder().matchId(match.getId()).clubId(match.getGuestClub().getId()).build());
            guestLedger.setBeforeCrp(crpRes.getGuestCrpBefore());
            guestLedger.setDeltaCrp(crpRes.getGuestCrpDelta());
            guestLedger.setAfterCrp(crpRes.getGuestCrpAfter());
            guestLedger.setReason("Kết quả trận đấu Ranked (DEV Force Finish) " + match.getId());
            guestLedger.setAlgorithmVersion(config.getAlgorithmVersion());
            crpLedgerRepository.save(guestLedger);

            Club hostClub = match.getHostClub();
            int currentHostCrp = hostClub.getCrp() != null ? hostClub.getCrp() : 0;
            hostClub.setCrp(Math.max(0, currentHostCrp + crpRes.getHostCrpDelta()));
            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
            if (outcome == NormalizedOutcome.WIN_HOST) {
                hostClub.setRankedWins((hostClub.getRankedWins() != null ? hostClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(hostClub);

            Club guestClub = match.getGuestClub();
            int currentGuestCrp = guestClub.getCrp() != null ? guestClub.getCrp() : 0;
            guestClub.setCrp(Math.max(0, currentGuestCrp + crpRes.getGuestCrpDelta()));
            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
            if (outcome == NormalizedOutcome.WIN_GUEST) {
                guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(guestClub);

            updatePlayerElos(match, outcome);
        }

        match.setStatus(MatchStatus.RESULT_FINAL);
        matchRepository.save(match);

        room.setStatus(MatchStatus.RESULT_FINAL);
        matchRoomRepository.save(room);

        return mapToRoomResponse(room, match, user);
    }
}
