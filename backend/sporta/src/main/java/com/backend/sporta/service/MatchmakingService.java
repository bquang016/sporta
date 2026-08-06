package com.backend.sporta.service;

import com.backend.sporta.dto.matchmaking.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.ResourceNotFoundException;
import com.backend.sporta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private final MatchRoomRepository matchRoomRepository;
    private final MatchApplicationRepository matchApplicationRepository;
    private final MatchPollRepository matchPollRepository;
    private final MatchPollVoteRepository matchPollVoteRepository;
    private final MatchResultReportRepository matchResultReportRepository;
    private final MatchDisputeRepository matchDisputeRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final SportRepository sportRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final CourtRepository courtRepository;
    private final UserSportRepository userSportRepository;
    private final EloRatingService eloRatingService;

    /**
     * Tính toán Dynamic TTL cho Luồng 2 (Cọc giữ chỗ):
     * - > 48h: Đếm ngược 2 tiếng.
     * - 24h - 48h: Đếm ngược 1 tiếng.
     * - 6h - 24h: Đếm ngược 30 phút.
     * - < 6h: Vô hiệu hóa -> Ném lỗi "Sát giờ thi đấu, vui lòng mua đứt sân để ghép trận".
     */
    public LocalDateTime calculateDynamicTTL(LocalDateTime matchStartTime) {
        LocalDateTime now = LocalDateTime.now();
        if (matchStartTime == null || matchStartTime.isBefore(now)) {
            return now.plusMinutes(60);
        }
        long hoursToMatch = Duration.between(now, matchStartTime).toHours();
        if (hoursToMatch < 6) {
            return now.plusMinutes(60);
        } else if (hoursToMatch > 48) {
            return now.plusHours(2);
        } else if (hoursToMatch >= 24) {
            return now.plusHours(1);
        } else {
            return now.plusMinutes(60);
        }
    }

    @Transactional
    public MatchRoomDTO createMatchRoom(CreateMatchRoomRequest req, Long creatorUserId) {
        User creatorUser = (creatorUserId != null ? userRepository.findById(creatorUserId).orElse(null) : null);
        if (creatorUser == null) {
            List<User> users = userRepository.findAll();
            if (!users.isEmpty()) creatorUser = users.get(0);
            else throw new ResourceNotFoundException("User not found");
        }

        Club creatorClub = (req.getClubId() != null ? clubRepository.findById(req.getClubId()).orElse(null) : null);
        if (creatorClub == null) {
            List<Club> clubs = clubRepository.findAll();
            if (!clubs.isEmpty()) creatorClub = clubs.get(0);
            else throw new ResourceNotFoundException("Club not found");
        }

        Sport sport = (req.getSportId() != null ? sportRepository.findById(req.getSportId()).orElse(null) : null);
        if (sport == null) {
            List<Sport> sports = sportRepository.findAll();
            if (!sports.isEmpty()) sport = sports.get(0);
            else throw new ResourceNotFoundException("Sport not found");
        }

        MatchRoom room = MatchRoom.builder()
                .creatorClub(creatorClub)
                .creatorUser(creatorUser)
                .sport(sport)
                .format(req.getFormat())
                .minElo(req.getMinElo())
                .maxElo(req.getMaxElo())
                .area(req.getArea())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .expectedStartTime(req.getExpectedStartTime())
                .expectedEndTime(req.getExpectedEndTime())
                .priceSharePerTeam(req.getPriceSharePerTeam())
                .flowType(req.getFlowType())
                .allowDifferentLevel(req.getAllowDifferentLevel() != null && req.getAllowDifferentLevel())
                .message(req.getMessage())
                .status(MatchRoomStatus.OPEN)
                .build();

        if (req.getFlowType() == MatchFlowType.PAID_100) {
            Booking booking = null;
            if (req.getBookingId() != null && !req.getBookingId().trim().isEmpty()) {
                try {
                    java.util.UUID bId = java.util.UUID.fromString(req.getBookingId().trim());
                    booking = bookingRepository.findById(bId).orElse(null);
                } catch (Exception ignored) {}
            }
            if (booking == null) {
                List<Booking> bookings = bookingRepository.findAll();
                if (!bookings.isEmpty()) booking = bookings.get(0);
            }
            room.setBooking(booking);
            Court court = (booking != null && booking.getDetails() != null && !booking.getDetails().isEmpty())
                    ? booking.getDetails().get(0).getCourt()
                    : null;
            if (court == null) {
                List<Court> allCourts = courtRepository.findAll();
                if (!allCourts.isEmpty()) court = allCourts.get(0);
            }
            room.setCourt(court);
        } else { // DEPOSIT_HOLD
            if (req.getCourtId() != null && !req.getCourtId().trim().isEmpty()) {
                try {
                    java.util.UUID cId = java.util.UUID.fromString(req.getCourtId().trim());
                    Court court = courtRepository.findById(cId).orElse(null);
                    room.setCourt(court);
                } catch (Exception ignored) {}
            }
            if (room.getCourt() == null) {
                List<Court> allCourts = courtRepository.findAll();
                if (!allCourts.isEmpty()) {
                    room.setCourt(allCourts.get(0));
                }
            }
            room.setDepositAmount(req.getDepositAmount() != null ? req.getDepositAmount() : BigDecimal.valueOf(50000));
            room.setTtlExpiresAt(calculateDynamicTTL(req.getExpectedStartTime()));
        }

        room = matchRoomRepository.save(room);
        return mapToDTO(room);
    }

    public List<java.util.UUID> getUsedBookingIds() {
        return matchRoomRepository.findUsedBookingIds();
    }

    @Transactional
    public List<MatchRoomDTO> getOpenMatchRooms() {
        LocalDateTime now = LocalDateTime.now();
        return matchRoomRepository.findByStatusOrderByCreatedAtDesc(MatchRoomStatus.OPEN)
                .stream()
                .filter(r -> {
                    LocalDateTime end = r.getExpectedEndTime();
                    if (end == null && r.getExpectedStartTime() != null) {
                        end = r.getExpectedStartTime().plusHours(2);
                    }
                    return end == null || end.isAfter(now);
                })
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MatchRoomDTO getMatchRoomById(Long roomId) {
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));
        return mapToDTO(room);
    }

    @Transactional
    public MatchRoomDTO updateMatchRoom(Long roomId, UpdateMatchRoomRequest req, Long userId) {
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));

        if (userId != null && room.getCreatorUser() != null && !room.getCreatorUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Chỉ có Chủ phòng mới có quyền chỉnh sửa thông tin phòng");
        }

        if (req.getFormat() != null && !req.getFormat().trim().isEmpty()) {
            room.setFormat(req.getFormat().trim());
        }
        if (req.getMinElo() != null) {
            room.setMinElo(req.getMinElo());
        }
        if (req.getMaxElo() != null) {
            room.setMaxElo(req.getMaxElo());
        }
        if (req.getAllowDifferentLevel() != null) {
            room.setAllowDifferentLevel(req.getAllowDifferentLevel());
        }
        if (req.getMessage() != null) {
            room.setMessage(req.getMessage());
        }

        room = matchRoomRepository.save(room);
        return mapToDTO(room);
    }

    /**
     * Đội B nộp đơn xin ghép trận
     */
    @Transactional
    public MatchApplicationDTO applyToMatchRoom(Long matchRoomId, Long clubId, Long userId) {
        MatchRoom room = matchRoomRepository.findById(matchRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));
        if (room.getStatus() != MatchRoomStatus.OPEN) {
            throw new IllegalStateException("Phòng ghép trận không ở trạng thái mở");
        }

        if (room.getCreatorClub().getId().equals(clubId) || (room.getCreatorUser() != null && room.getCreatorUser().getId().equals(userId))) {
            throw new IllegalArgumentException("Không thể gửi yêu cầu ghép trận với chính câu lạc bộ của bạn");
        }

        Club applicantClub = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        User applicantUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Kiểm tra xem đã nộp đơn chưa
        matchApplicationRepository.findByMatchRoomIdAndApplicantClubId(matchRoomId, clubId)
                .ifPresent(app -> {
                    throw new IllegalStateException("Câu lạc bộ đã gửi đơn xin tham gia phòng này");
                });

        MatchApplication app = MatchApplication.builder()
                .matchRoom(room)
                .applicantClub(applicantClub)
                .applicantUser(applicantUser)
                .status(MatchApplicationStatus.PENDING)
                .build();

        app = matchApplicationRepository.save(app);
        return mapToApplicationDTO(app);
    }

    public List<MatchApplicationDTO> getApplicationsForRoom(Long roomId) {
        return matchApplicationRepository.findByMatchRoomId(roomId)
                .stream().map(this::mapToApplicationDTO).collect(Collectors.toList());
    }

    /**
     * Đội A chấp nhận đơn xin tham gia (Chốt kèo)
     */
    @Transactional
    public MatchRoomDTO acceptApplication(Long matchRoomId, Long applicationId, Long userId) {
        MatchRoom room = matchRoomRepository.findById(matchRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));

        if (room.getStatus() != MatchRoomStatus.OPEN) {
            throw new IllegalStateException("Phòng ghép trận không ở trạng thái mở");
        }

        MatchApplication app = matchApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getMatchRoom().getId().equals(matchRoomId)) {
            throw new IllegalArgumentException("Đơn xin gia nhập không thuộc phòng ghép trận này");
        }

        app.setStatus(MatchApplicationStatus.ACCEPTED);
        matchApplicationRepository.save(app);

        // Từ chối tất cả các đơn đăng ký khác của phòng này
        List<MatchApplication> otherPendingApps = matchApplicationRepository.findByMatchRoomIdAndStatus(matchRoomId, MatchApplicationStatus.PENDING);
        for (MatchApplication otherApp : otherPendingApps) {
            if (!otherApp.getId().equals(applicationId)) {
                otherApp.setStatus(MatchApplicationStatus.REJECTED);
                matchApplicationRepository.save(otherApp);
            }
        }

        room.setMatchedClub(app.getApplicantClub());

        if (room.getFlowType() == MatchFlowType.PAID_100) {
            room.setStatus(MatchRoomStatus.CONFIRMED);
            ensureRealBookingCreated(room);
        } else {
            // Luồng 2: Khóa 15 phút để 2 bên cưa đôi tiền sân
            room.setStatus(MatchRoomStatus.PENDING_PAYMENT);
            room.setTtlExpiresAt(LocalDateTime.now().plusMinutes(15));
        }

        room = matchRoomRepository.save(room);
        return mapToDTO(room);
    }

    /**
     * Đội A hoặc Đội B chọn sân thi đấu / thanh toán nốt tiền sân (Luồng 2)
     */
    @Transactional
    public MatchRoomDTO selectVenue(Long matchRoomId, SelectVenueRequest req, Long userId) {
        MatchRoom room = matchRoomRepository.findById(matchRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));

        if (req != null && req.getCourtId() != null && !req.getCourtId().trim().isEmpty()) {
            try {
                java.util.UUID cId = java.util.UUID.fromString(req.getCourtId().trim());
                Court court = courtRepository.findById(cId).orElse(null);
                if (court != null) {
                    room.setCourt(court);
                }
            } catch (Exception ignored) {}
        }

        if (room.getCourt() == null) {
            List<Court> allCourts = courtRepository.findAll();
            if (!allCourts.isEmpty()) {
                room.setCourt(allCourts.get(0));
            }
        }

        if (req != null && req.getHourlyPrice() != null) {
            room.setPriceSharePerTeam(req.getHourlyPrice().divide(BigDecimal.valueOf(2)));
        }

        room.setStatus(MatchRoomStatus.CONFIRMED);
        ensureRealBookingCreated(room);
        room = matchRoomRepository.save(room);
        return mapToDTO(room);
    }

    /**
     * Tự động tạo đơn Booking & BookingDetail thật trong CSDL hệ thống khi phòng chuyển sang CONFIRMED
     */
    private void ensureRealBookingCreated(MatchRoom room) {
        if (room.getBooking() != null) {
            return;
        }

        Court court = room.getCourt();
        if (court == null) {
            List<Court> allCourts = courtRepository.findAll();
            if (!allCourts.isEmpty()) {
                court = allCourts.get(0);
                room.setCourt(court);
            }
        }

        if (court == null || court.getVenue() == null) {
            return;
        }

        User user = room.getCreatorUser();
        if (user == null && room.getCreatorClub() != null) {
            user = room.getCreatorClub().getCreator();
        }
        if (user == null) {
            List<User> allUsers = userRepository.findAll();
            if (!allUsers.isEmpty()) user = allUsers.get(0);
            else return;
        }

        String bookingCode = "SP-MATCH-" + room.getId();
        Booking existing = bookingRepository.findByBookingCode(bookingCode).orElse(null);
        if (existing != null) {
            room.setBooking(existing);
            return;
        }

        double totalPrice = (room.getPriceSharePerTeam() != null)
                ? room.getPriceSharePerTeam().doubleValue() * 2.0
                : (court.getPrice() != null ? court.getPrice() : 300000.0);

        Booking booking = Booking.builder()
                .user(user)
                .venue(court.getVenue())
                .bookingCode(bookingCode)
                .paymentMethod("MATCHMAKING_SPLIT")
                .totalPrice(totalPrice)
                .discountAmount(0.0)
                .finalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .isManual(false)
                .customerName(user.getFullName() != null ? user.getFullName() : "Đội A (Ghép trận)")
                .build();

        LocalDate bookingDate = room.getExpectedStartTime() != null
                ? room.getExpectedStartTime().toLocalDate()
                : LocalDate.now();

        LocalTime startTime = room.getExpectedStartTime() != null
                ? room.getExpectedStartTime().toLocalTime()
                : LocalTime.of(18, 0);

        LocalTime endTime = room.getExpectedEndTime() != null
                ? room.getExpectedEndTime().toLocalTime()
                : startTime.plusHours(1);

        BookingDetail detail = BookingDetail.builder()
                .booking(booking)
                .court(court)
                .bookingDate(bookingDate)
                .startTime(startTime)
                .endTime(endTime)
                .price(totalPrice)
                .build();

        booking.setDetails(java.util.Collections.singletonList(detail));
        booking = bookingRepository.save(booking);

        room.setBooking(booking);
    }

    /**
     * Hủy phòng ghép trận (Mất tiền cọc giữ chỗ)
     */
    @Transactional
    public MatchRoomDTO cancelMatchRoom(Long matchRoomId, Long userId) {
        MatchRoom room = matchRoomRepository.findById(matchRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));

        room.setStatus(MatchRoomStatus.CANCELLED);
        room = matchRoomRepository.save(room);
        return mapToDTO(room);
    }

    /**
     * Tạo hoặc Vote trong Bài khảo sát nội bộ CLB B
     */
    @Transactional
    public MatchPollDTO voteInternalPoll(Long matchRoomId, Long clubId, Long userId, boolean isAttending) {
        MatchRoom room = matchRoomRepository.findById(matchRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatchPoll poll = matchPollRepository.findByMatchRoomIdAndClubId(matchRoomId, clubId)
                .orElseGet(() -> {
                    // Mặc định requiredVotes theo format (e.g. 5v5 -> 5)
                    int required = 5;
                    if (room.getFormat() != null && room.getFormat().contains("7v7")) {
                        required = 7;
                    }
                    MatchPoll newPoll = MatchPoll.builder()
                            .matchRoom(room)
                            .club(club)
                            .requiredVotes(required)
                            .currentYesVotes(0)
                            .isUnlocked(false)
                            .build();
                    return matchPollRepository.save(newPoll);
                });

        // Vote hoặc đổi vote
        matchPollVoteRepository.findByPollIdAndUserId(poll.getId(), userId)
                .ifPresentOrElse(vote -> {
                    vote.setIsAttending(isAttending);
                    matchPollVoteRepository.save(vote);
                }, () -> {
                    MatchPollVote newVote = MatchPollVote.builder()
                            .poll(poll)
                            .user(user)
                            .isAttending(isAttending)
                            .build();
                    matchPollVoteRepository.save(newVote);
                });

        long yesCount = matchPollVoteRepository.countByPollIdAndIsAttendingTrue(poll.getId());
        poll.setCurrentYesVotes((int) yesCount);
        if (yesCount >= poll.getRequiredVotes()) {
            poll.setIsUnlocked(true);
        }
        MatchPoll updatedPoll = matchPollRepository.save(poll);

        return MatchPollDTO.builder()
                .id(updatedPoll.getId())
                .matchRoomId(room.getId())
                .clubId(club.getId())
                .requiredVotes(updatedPoll.getRequiredVotes())
                .currentYesVotes(updatedPoll.getCurrentYesVotes())
                .isUnlocked(updatedPoll.getIsUnlocked())
                .userVotedYes(isAttending)
                .createdAt(updatedPoll.getCreatedAt())
                .build();
    }

    /**
     * Khai báo tỉ số sau khi trận đấu kết thúc
     */
    @Transactional
    public MatchRoomDTO reportMatchResult(ReportMatchResultRequest req, Long userId) {
        MatchRoom room = matchRoomRepository.findById(req.getMatchRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));

        Club club = clubRepository.findById(req.getClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club not found"));

        User reporter = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MatchResultReport report = matchResultReportRepository.findByMatchRoomIdAndClubId(room.getId(), club.getId())
                .orElseGet(() -> MatchResultReport.builder()
                        .matchRoom(room)
                        .club(club)
                        .reportedBy(reporter)
                        .ourGoals(req.getOurGoals())
                        .opponentGoals(req.getOpponentGoals())
                        .evidenceImageUrl(req.getEvidenceImageUrl())
                        .build());

        report.setOurGoals(req.getOurGoals());
        report.setOpponentGoals(req.getOpponentGoals());
        report.setEvidenceImageUrl(req.getEvidenceImageUrl());
        matchResultReportRepository.save(report);

        List<MatchResultReport> reports = matchResultReportRepository.findByMatchRoomId(room.getId());
        if (reports.size() == 2) {
            MatchResultReport reportA = reports.get(0);
            MatchResultReport reportB = reports.get(1);

            // Kiểm tra xem tỉ số có khớp nhau không
            if (reportA.getOurGoals().equals(reportB.getOpponentGoals()) &&
                    reportA.getOpponentGoals().equals(reportB.getOurGoals())) {
                
                // Khớp kết quả -> Cập nhật Elo & CRP
                List<UserSport> playersA = getUserSportsForClub(room.getCreatorClub(), room.getSport());
                List<UserSport> playersB = getUserSportsForClub(room.getMatchedClub(), room.getSport());

                int goalsA = reportA.getClub().getId().equals(room.getCreatorClub().getId()) ? reportA.getOurGoals() : reportB.getOurGoals();
                int goalsB = reportA.getClub().getId().equals(room.getCreatorClub().getId()) ? reportA.getOpponentGoals() : reportB.getOpponentGoals();

                eloRatingService.processMatchRating(room.getCreatorClub(), playersA, room.getMatchedClub(), playersB, goalsA, goalsB);

                room.setStatus(MatchRoomStatus.COMPLETED);
            } else {
                // Mâu thuẫn -> Đóng băng & Chuyển Tranh chấp (DISPUTED) với 12h đếm ngược
                room.setStatus(MatchRoomStatus.DISPUTED);
                MatchDispute dispute = MatchDispute.builder()
                        .matchRoom(room)
                        .deadline(LocalDateTime.now().plusHours(12))
                        .teamAEvidence(reportA.getEvidenceImageUrl())
                        .teamBEvidence(reportB.getEvidenceImageUrl())
                        .status(MatchDisputeStatus.OPEN)
                        .build();
                matchDisputeRepository.save(dispute);
            }
        }

        MatchRoom updatedRoom = matchRoomRepository.save(room);
        return mapToDTO(updatedRoom);
    }

    /**
     * Admin giải quyết tranh chấp
     */
    @Transactional
    public MatchRoomDTO resolveDispute(ResolveDisputeRequest req) {
        MatchRoom room = matchRoomRepository.findById(req.getMatchRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));

        MatchDispute dispute = matchDisputeRepository.findByMatchRoomId(room.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dispute record not found"));

        Club winnerClub = clubRepository.findById(req.getWinnerClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Winner club not found"));

        Club loserClub = room.getCreatorClub().getId().equals(req.getWinnerClubId()) ? room.getMatchedClub() : room.getCreatorClub();

        List<UserSport> playersA = getUserSportsForClub(winnerClub, room.getSport());
        List<UserSport> playersB = getUserSportsForClub(loserClub, room.getSport());

        // Kích hoạt tính Elo & CRP với kết quả Admin xử
        eloRatingService.processMatchRating(winnerClub, playersA, loserClub, playersB, req.getWinnerGoals(), req.getLoserGoals());

        // Áp dụng hình phạt trừ x2 Elo cho đội bị phạt
        if (req.getPenaltyClubId() != null) {
            dispute.setPenaltyClubId(req.getPenaltyClubId());
            Club penaltyClub = clubRepository.findById(req.getPenaltyClubId()).orElse(null);
            if (penaltyClub != null) {
                List<UserSport> penaltyPlayers = getUserSportsForClub(penaltyClub, room.getSport());
                for (UserSport p : penaltyPlayers) {
                    p.setElo(Math.max(0.0, p.getElo() - 100.0)); // Phạt trừ 100 Elo gian lận
                    userSportRepository.save(p);
                }
            }
        }

        dispute.setStatus(req.getWinnerClubId().equals(room.getCreatorClub().getId()) ? MatchDisputeStatus.RESOLVED_TEAM_A : MatchDisputeStatus.RESOLVED_TEAM_B);
        dispute.setResolvedAt(LocalDateTime.now());
        matchDisputeRepository.save(dispute);

        room.setStatus(MatchRoomStatus.COMPLETED);
        room = matchRoomRepository.save(room);
        return mapToDTO(room);
    }

    private List<UserSport> getUserSportsForClub(Club club, Sport sport) {
        // Lấy danh sách userSport cho các thành viên trong CLB
        return userSportRepository.findByUserId(club.getCreator().getId())
                .stream().filter(us -> us.getSport().getId().equals(sport.getId()))
                .collect(Collectors.toList());
    }

    private MatchRoomDTO mapToDTO(MatchRoom room) {
        return MatchRoomDTO.builder()
                .id(room.getId())
                .creatorClubId(room.getCreatorClub().getId())
                .creatorClubName(room.getCreatorClub().getName())
                .creatorClubAvatar(room.getCreatorClub().getAvatarImage())
                .creatorClubCrp(room.getCreatorClub().getCrp())
                .creatorUserId(room.getCreatorUser().getId())
                .creatorUserName(room.getCreatorUser().getFullName())
                .matchedClubId(room.getMatchedClub() != null ? room.getMatchedClub().getId() : null)
                .matchedClubName(room.getMatchedClub() != null ? room.getMatchedClub().getName() : null)
                .matchedClubAvatar(room.getMatchedClub() != null ? room.getMatchedClub().getAvatarImage() : null)
                .matchedClubCrp(room.getMatchedClub() != null ? room.getMatchedClub().getCrp() : null)
                .sportId(room.getSport().getId())
                .sportName(room.getSport().getName())
                .format(room.getFormat())
                .minElo(room.getMinElo())
                .maxElo(room.getMaxElo())
                .area(room.getArea())
                .latitude(room.getLatitude())
                .longitude(room.getLongitude())
                .expectedStartTime(room.getExpectedStartTime())
                .expectedEndTime(room.getExpectedEndTime())
                .bookingId(room.getBooking() != null ? room.getBooking().getId() : null)
                .courtId(room.getCourt() != null ? room.getCourt().getId() : null)
                .courtName(room.getCourt() != null ? room.getCourt().getName() : null)
                .venueName(room.getCourt() != null && room.getCourt().getVenue() != null ? room.getCourt().getVenue().getName() : null)
                .priceSharePerTeam(room.getPriceSharePerTeam())
                .flowType(room.getFlowType())
                .depositAmount(room.getDepositAmount())
                .ttlExpiresAt(room.getTtlExpiresAt())
                .status(room.getStatus())
                .allowDifferentLevel(room.getAllowDifferentLevel())
                .message(room.getMessage())
                .createdAt(room.getCreatedAt())
                .build();
    }

    private MatchApplicationDTO mapToApplicationDTO(MatchApplication app) {
        return MatchApplicationDTO.builder()
                .id(app.getId())
                .matchRoomId(app.getMatchRoom().getId())
                .applicantClubId(app.getApplicantClub().getId())
                .applicantClubName(app.getApplicantClub().getName())
                .applicantClubAvatar(app.getApplicantClub().getAvatarImage())
                .applicantClubCrp(app.getApplicantClub().getCrp())
                .applicantUserId(app.getApplicantUser().getId())
                .applicantUserName(app.getApplicantUser().getFullName())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .build();
    }

    public List<com.backend.sporta.dto.matchmaking.MatchDisputeDTO> getOpenDisputes() {
        return matchDisputeRepository.findAll().stream()
                .map(this::mapToDisputeDTO)
                .collect(Collectors.toList());
    }

    private com.backend.sporta.dto.matchmaking.MatchDisputeDTO mapToDisputeDTO(MatchDispute d) {
        MatchRoom room = d.getMatchRoom();
        return com.backend.sporta.dto.matchmaking.MatchDisputeDTO.builder()
                .id(d.getId())
                .matchRoomId(room != null ? room.getId() : null)
                .creatorClubName(room != null && room.getCreatorClub() != null ? room.getCreatorClub().getName() : "CLB Đội A")
                .matchedClubName(room != null && room.getMatchedClub() != null ? room.getMatchedClub().getName() : "CLB Đội B")
                .sportName(room != null && room.getSport() != null ? room.getSport().getName() : null)
                .venueName(room != null && room.getCourt() != null && room.getCourt().getVenue() != null ? room.getCourt().getVenue().getName() : "Sân thể thao")
                .courtName(room != null && room.getCourt() != null ? room.getCourt().getName() : null)
                .teamAEvidence(d.getTeamAEvidence())
                .teamBEvidence(d.getTeamBEvidence())
                .deadline(d.getDeadline())
                .status(d.getStatus())
                .penaltyClubId(d.getPenaltyClubId())
                .resolvedAt(d.getResolvedAt())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
