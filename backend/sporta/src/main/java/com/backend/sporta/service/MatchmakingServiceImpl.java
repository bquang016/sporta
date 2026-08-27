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
    private UserRepository userRepository;

    @Autowired
    private ClubEloService clubEloService;

    @Autowired
    private CRPEngine crpEngine;

    @Autowired
    private ScoreAdapterRegistry scoreAdapterRegistry;

    @Autowired
    private MatchmakingConfig config;

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
        matchRoomRepository.save(room);

        List<JoinRequest> applicants = joinRequestRepository.findByRoomId(room.getId());
        for (JoinRequest req : applicants) {
            if (req.getStatus() == JoinRequestStatus.PENDING) {
                req.setStatus(JoinRequestStatus.WITHDRAWN);
                joinRequestRepository.save(req);
                try {
                    if (req.getApplicantClub() != null && req.getApplicantClub().getCreator() != null) {
                        eventPublisher.publishEvent(new NotificationEvent(
                                this,
                                req.getApplicantClub().getCreator().getId(),
                                Role.PLAYER,
                                "Kèo đấu đã bị hủy",
                                "Phòng ghép kèo của CLB " + room.getHostClub().getName() + " đã bị hủy.",
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

        JoinRequest joinReq = JoinRequest.builder()
                .room(room)
                .applicantClub(applicantClub)
                .status(JoinRequestStatus.PENDING)
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

        int hostElo = clubEloService.getClubElo(room.getHostClub());
        int guestElo = clubEloService.getClubElo(guestClub);
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
            hostClub.setCrp(crpRes.getHostCrpAfter());
            hostClub.setFinalMatches((hostClub.getFinalMatches() != null ? hostClub.getFinalMatches() : 0) + 1);
            if (submission.getOutcome() == NormalizedOutcome.WIN_HOST) {
                hostClub.setRankedWins((hostClub.getRankedWins() != null ? hostClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(hostClub);

            Club guestClub = match.getGuestClub();
            guestClub.setCrp(crpRes.getGuestCrpAfter());
            guestClub.setFinalMatches((guestClub.getFinalMatches() != null ? guestClub.getFinalMatches() : 0) + 1);
            if (submission.getOutcome() == NormalizedOutcome.WIN_GUEST) {
                guestClub.setRankedWins((guestClub.getRankedWins() != null ? guestClub.getRankedWins() : 0) + 1);
            }
            clubRepository.save(guestClub);
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

        com.backend.sporta.entity.MatchResult result = com.backend.sporta.entity.MatchResult.builder()
                .match(match)
                .outcome(NormalizedOutcome.DRAW)
                .finalScoreText("Hòa (Đồng thuận)")
                .hostCrpBefore(match.getHostCrpBeforeSnapshot())
                .hostCrpDelta(0)
                .hostCrpAfter(match.getHostCrpBeforeSnapshot())
                .guestCrpBefore(match.getGuestCrpBeforeSnapshot())
                .guestCrpDelta(0)
                .guestCrpAfter(match.getGuestCrpBeforeSnapshot())
                .isRankedEligible(false)
                .explanationJson("[\"Kết quả Hòa theo đồng thuận - CRP không đổi.\"]")
                .build();

        matchResultRepository.save(result);

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
                .build();

        ClubSummaryResponse hostClubVM = mapToClubSummaryResponse(room.getHostClub());
        ClubSummaryResponse guestClubVM = room.getGuestClub() != null ? mapToClubSummaryResponse(room.getGuestClub())
                : null;

        List<JoinRequest> applicantsList = joinRequestRepository.findByRoomId(room.getId());
        List<JoinRequestResponse> applicantsVM = applicantsList.stream()
                .map(this::mapToJoinRequestResponse)
                .collect(Collectors.toList());

        JoinRequestResponse myReqVM = null;
        if (currentUser != null) {
            Optional<JoinRequest> myReq = applicantsList.stream()
                    .filter(a -> isClubAdmin(a.getApplicantClub().getId(), currentUser.getId()))
                    .findFirst();
            if (myReq.isPresent()) {
                myReqVM = mapToJoinRequestResponse(myReq.get());
            }
        }

        int hostElo = clubEloService.getClubElo(room.getHostClub());
        int guestElo = room.getGuestClub() != null ? clubEloService.getClubElo(room.getGuestClub()) : hostElo;
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
                        .confirmedAt(r.getConfirmedAt().toString())
                        .build();
            }
        }

        MatchPermissionsResponse permissionsVM = buildPermissions(room, match, currentUser);

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
                .applicants(applicantsVM)
                .myRequest(myReqVM)
                .permissions(permissionsVM)
                .createdAt(room.getCreatedAt().toString())
                .balanceLabel(balanceLabel)
                .scoreSubmission(submissionVM)
                .result(resultVM)
                .matchId(match != null ? match.getId().toString() : null)
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
}
