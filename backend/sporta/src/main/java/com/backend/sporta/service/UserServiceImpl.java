package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private com.backend.sporta.service.matchmaking.ClubEloService clubEloService;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private CRPLedgerRepository crpLedgerRepository;

    @Autowired
    private ClubPollRepository clubPollRepository;

    @Autowired
    private ClubPollVoteRepository clubPollVoteRepository;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Override
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        return mapToProfileDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        // 1. Calculate booking statistics and Elo by sport
        List<Booking> userBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int totalBookings = userBookings != null ? userBookings.size() : 0;

        List<UserSport> userSports = userSportRepository.findByUserId(userId);
        Map<Long, UserSport> userSportMap = new HashMap<>();
        if (userSports != null) {
            for (UserSport us : userSports) {
                if (us.getSport() != null) {
                    userSportMap.put(us.getSport().getId(), us);
                }
            }
        }

        Map<Long, PublicUserProfileResponse.SportBookingStatDto> sportStatsMap = new HashMap<>();

        if (userBookings != null) {
            for (Booking booking : userBookings) {
                if (booking.getVenue() != null && booking.getVenue().getSport() != null) {
                    var sport = booking.getVenue().getSport();
                    UserSport us = userSportMap.get(sport.getId());

                    int effectiveElo = us != null ? us.getEffectiveElo() : 1000;
                    var eloStatus = us != null && us.getEloStatus() != null ? us.getEloStatus() : com.backend.sporta.enums.EloStatus.UNVERIFIED;
                    String levelLabel = clubEloService.getLevelLabel(effectiveElo);
                    int totalRanked = us != null && us.getTotalRankedMatches() != null ? us.getTotalRankedMatches() : 0;
                    int totalWins = us != null && us.getTotalWins() != null ? us.getTotalWins() : 0;
                    int winRate = totalRanked > 0 ? (int) Math.round((double) totalWins / totalRanked * 100) : 0;

                    sportStatsMap.putIfAbsent(sport.getId(), PublicUserProfileResponse.SportBookingStatDto.builder()
                            .sportId(sport.getId())
                            .sportName(sport.getName())
                            .sportIcon(null)
                            .level(us != null && us.getLevel() != null ? us.getLevel().name() : "AVERAGE")
                            .eloRating(effectiveElo)
                            .eloStatus(eloStatus)
                            .levelLabel(levelLabel)
                            .placementMatchesPlayed(us != null && us.getPlacementMatchesPlayed() != null ? us.getPlacementMatchesPlayed() : 0)
                            .totalRankedMatches(totalRanked)
                            .totalWins(totalWins)
                            .winRate(winRate)
                            .bookingCount(0)
                            .percentage(0)
                            .build());

                    var stat = sportStatsMap.get(sport.getId());
                    stat.setBookingCount(stat.getBookingCount() + 1);
                }
            }
        }

        // Also add user sports registered if they don't have bookings yet
        if (userSports != null) {
            for (UserSport us : userSports) {
                if (us.getSport() != null && !sportStatsMap.containsKey(us.getSport().getId())) {
                    int effectiveElo = us.getEffectiveElo();
                    var eloStatus = us.getEloStatus() != null ? us.getEloStatus() : com.backend.sporta.enums.EloStatus.UNVERIFIED;
                    String levelLabel = clubEloService.getLevelLabel(effectiveElo);
                    int totalRanked = us.getTotalRankedMatches() != null ? us.getTotalRankedMatches() : 0;
                    int totalWins = us.getTotalWins() != null ? us.getTotalWins() : 0;
                    int winRate = totalRanked > 0 ? (int) Math.round((double) totalWins / totalRanked * 100) : 0;

                    sportStatsMap.put(us.getSport().getId(), PublicUserProfileResponse.SportBookingStatDto.builder()
                            .sportId(us.getSport().getId())
                            .sportName(us.getSport().getName())
                            .sportIcon(null)
                            .level(us.getLevel() != null ? us.getLevel().name() : "AVERAGE")
                            .eloRating(effectiveElo)
                            .eloStatus(eloStatus)
                            .levelLabel(levelLabel)
                            .placementMatchesPlayed(us.getPlacementMatchesPlayed() != null ? us.getPlacementMatchesPlayed() : 0)
                            .totalRankedMatches(totalRanked)
                            .totalWins(totalWins)
                            .winRate(winRate)
                            .bookingCount(0)
                            .percentage(0)
                            .build());
                }
            }
        }

        List<PublicUserProfileResponse.SportBookingStatDto> sportsList = new ArrayList<>(sportStatsMap.values());
        if (totalBookings > 0) {
            for (var stat : sportsList) {
                int pct = (int) Math.round(((double) stat.getBookingCount() / totalBookings) * 100);
                stat.setPercentage(pct);
            }
        }
        sportsList.sort((a, b) -> Integer.compare(b.getBookingCount(), a.getBookingCount()));

        // 2. Fetch Joined Clubs
        List<ClubMember> clubMembers = clubMemberRepository.findByUserId(userId);
        List<PublicUserProfileResponse.UserClubSummaryDto> joinedClubs = new ArrayList<>();
        if (clubMembers != null) {
            for (ClubMember member : clubMembers) {
                if (member.getStatus() == ClubMemberStatus.APPROVED && member.getClub() != null) {
                    var club = member.getClub();
                    long memberCount = clubMemberRepository.countByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
                    int dynamicClubElo = clubEloService.getClubElo(club);
                    joinedClubs.add(PublicUserProfileResponse.UserClubSummaryDto.builder()
                            .clubId(club.getId())
                            .clubName(club.getName())
                            .avatarImage(club.getAvatarImage())
                            .coverImage(club.getCoverImage())
                            .sportName(club.getSport() != null ? club.getSport().getName() : null)
                            .role(member.getRole() != null ? member.getRole().name() : "MEMBER")
                            .membersCount((int) memberCount)
                            .elo(dynamicClubElo)
                            .crp(club.getCrp() != null ? club.getCrp() : 0)
                            .build());
                }
            }
        }

        // 3. User joined year
        int joinedYear = user.getCreatedAt() != null ? user.getCreatedAt().getYear() : 2025;

        return PublicUserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .height(user.getHeight())
                .weight(user.getWeight())
                .joinedYear(joinedYear)
                .role(user.getRole() != null ? user.getRole().name() : "PLAYER")
                .totalBookings(totalBookings)
                .reputationScore(100)
                .isDevTester(Boolean.TRUE.equals(user.getIsDevTester()))
                .sports(sportsList)
                .joinedClubs(joinedClubs)
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(Long userId, UpdateUserProfileRequest request, MultipartFile avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            try {
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth().trim()));
            } catch (Exception e) {
                // Ignore parse error
            }
        }
        
        if (request.getHeight() != null) {
            user.setHeight(request.getHeight());
        }
        
        if (request.getWeight() != null) {
            user.setWeight(request.getWeight());
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = fileStorageService.uploadFile(avatar, "avatar");
            user.setAvatarUrl(avatarUrl);
        }

        user = userRepository.save(user);

        return mapToProfileDto(user);
    }

    private UserProfileDto mapToProfileDto(User user) {
        List<UserSport> userSports = userSportRepository.findByUserId(user.getId());
        List<UserSportDto> sportsDto = userSports.stream().map(us -> {
            int effectiveElo = us.getEffectiveElo();
            var eloStatus = us.getEloStatus() != null ? us.getEloStatus() : com.backend.sporta.enums.EloStatus.UNVERIFIED;
            String levelLabel = clubEloService.getLevelLabel(effectiveElo);
            int totalRanked = us.getTotalRankedMatches() != null ? us.getTotalRankedMatches() : 0;
            int totalWins = us.getTotalWins() != null ? us.getTotalWins() : 0;
            int winRate = totalRanked > 0 ? (int) Math.round((double) totalWins / totalRanked * 100) : 0;

            return UserSportDto.builder()
                .id(us.getId())
                .sportId(us.getSport() != null ? us.getSport().getId() : null)
                .sportName(us.getSport() != null ? us.getSport().getName() : "")
                .sportIcon(null)
                .level(us.getLevel())
                .eloRating(effectiveElo)
                .eloStatus(eloStatus)
                .levelLabel(levelLabel)
                .placementMatchesPlayed(us.getPlacementMatchesPlayed() != null ? us.getPlacementMatchesPlayed() : 0)
                .totalRankedMatches(totalRanked)
                .totalWins(totalWins)
                .winRate(winRate)
                .build();
        }).collect(Collectors.toList());

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .height(user.getHeight())
                .weight(user.getWeight())
                .role(user.getRole())
                .status(user.getStatus())
                .isDevTester(Boolean.TRUE.equals(user.getIsDevTester()))
                .sports(sportsDto)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSportOverviewDto> getSportsEloOverview(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        List<Sport> allSports = sportRepository.findAll();
        List<UserSport> userSports = userSportRepository.findByUserId(userId);
        Map<Long, UserSport> userSportMap = userSports.stream()
                .filter(us -> us.getSport() != null)
                .collect(Collectors.toMap(us -> us.getSport().getId(), us -> us, (a, b) -> a));

        List<UserSportOverviewDto> overviewList = new ArrayList<>();
        for (Sport sport : allSports) {
            UserSport us = userSportMap.get(sport.getId());
            if (us != null) {
                int effectiveElo = us.getEffectiveElo();
                var eloStatus = us.getEloStatus() != null ? us.getEloStatus() : com.backend.sporta.enums.EloStatus.UNVERIFIED;
                String levelLabel = clubEloService.getLevelLabel(effectiveElo);
                int totalRanked = us.getTotalRankedMatches() != null ? us.getTotalRankedMatches() : 0;
                int totalWins = us.getTotalWins() != null ? us.getTotalWins() : 0;
                int winRate = totalRanked > 0 ? (int) Math.round((double) totalWins / totalRanked * 100) : 0;

                overviewList.add(UserSportOverviewDto.builder()
                        .sportId(sport.getId())
                        .sportName(sport.getName())
                        .sportIcon(null)
                        .isRegistered(true)
                        .level(us.getLevel())
                        .levelLabel(levelLabel)
                        .eloRating(effectiveElo)
                        .eloStatus(eloStatus)
                        .placementMatchesPlayed(us.getPlacementMatchesPlayed() != null ? us.getPlacementMatchesPlayed() : 0)
                        .totalRankedMatches(totalRanked)
                        .totalWins(totalWins)
                        .winRate(winRate)
                        .lastMatchAt(us.getLastMatchAt())
                        .build());
            } else {
                overviewList.add(UserSportOverviewDto.builder()
                        .sportId(sport.getId())
                        .sportName(sport.getName())
                        .sportIcon(null)
                        .isRegistered(false)
                        .level(null)
                        .levelLabel("Chưa thiết lập")
                        .eloRating(null)
                        .eloStatus(null)
                        .placementMatchesPlayed(0)
                        .totalRankedMatches(0)
                        .totalWins(0)
                        .winRate(0)
                        .lastMatchAt(null)
                        .build());
            }
        }
        return overviewList;
    }

    @Override
    @Transactional
    public List<UserSportOverviewDto> updateSportLevel(Long userId, UpdateUserSportLevelRequest request) {
        if (request == null || request.getSportId() == null || request.getLevel() == null) {
            throw new CustomException("Vui lòng chọn môn thể thao và trình độ hợp lệ", 400);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new CustomException("Không tìm thấy môn thể thao", 404));

        UserSport us = userSportRepository.findByUserIdAndSportId(userId, sport.getId())
                .orElseGet(() -> UserSport.builder()
                        .user(user)
                        .sport(sport)
                        .eloStatus(com.backend.sporta.enums.EloStatus.UNVERIFIED)
                        .placementMatchesPlayed(0)
                        .totalRankedMatches(0)
                        .totalWins(0)
                        .build());

        // Only allow resetting level if never played any placement/ranked matches and UNVERIFIED
        boolean hasStartedCalibration = (us.getPlacementMatchesPlayed() != null && us.getPlacementMatchesPlayed() > 0)
                || (us.getTotalRankedMatches() != null && us.getTotalRankedMatches() > 0)
                || us.getEloStatus() == com.backend.sporta.enums.EloStatus.CALIBRATING
                || us.getEloStatus() == com.backend.sporta.enums.EloStatus.VERIFIED;

        if (!hasStartedCalibration) {
            us.setLevel(request.getLevel());
            us.setEloRating(UserSport.mapSeedElo(request.getLevel()));
            userSportRepository.save(us);
        } else {
            throw new CustomException("Môn này đã tham gia trận đấu hoặc đã xác thực Elo, không thể tự chỉnh sửa trình độ.", 400);
        }

        return getSportsEloOverview(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RankedMatchHistoryItemDto> getRankedMatchHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        List<RankedMatchHistoryItemDto> historyList = new ArrayList<>();

        // 1. Process Xé Vé Matches
        List<Ticket> userTickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (userTickets != null) {
            for (Ticket ticket : userTickets) {
                var session = ticket.getSession();
                if (session == null || session.getHostScore() == null || session.getGuestScore() == null) {
                    continue;
                }

                String sportName = session.getVenue() != null && session.getVenue().getSport() != null
                        ? session.getVenue().getSport().getName() : "Thể thao";
                String venueName = session.getVenue() != null ? session.getVenue().getName() : "Sân thể thao";
                String courtName = session.getCourt() != null ? session.getCourt().getName() : "";
                String scoreText = session.getHostScore() + " - " + session.getGuestScore();

                String userSide = ticket.getTeam() != null ? ticket.getTeam().name() : "HOST";
                String outcomeStr = "DRAW";
                int eloDelta = 0;

                int scoreDiff = 0;
                try {
                    if (session.getHostScore() != null && session.getGuestScore() != null) {
                        int h = Integer.parseInt(session.getHostScore().trim());
                        int g = Integer.parseInt(session.getGuestScore().trim());
                        scoreDiff = Math.abs(h - g);
                    }
                } catch (Exception ignored) {}

                if (session.getMatchOutcome() == com.backend.sporta.enums.NormalizedOutcome.WIN_HOST) {
                    boolean isMyWin = "HOST".equalsIgnoreCase(userSide);
                    outcomeStr = isMyWin ? "WIN" : "LOSS";
                    eloDelta = isMyWin ? (16 + Math.min(12, scoreDiff * 2)) : -(11 + Math.min(8, scoreDiff * 2));
                } else if (session.getMatchOutcome() == com.backend.sporta.enums.NormalizedOutcome.WIN_GUEST) {
                    boolean isMyWin = "GUEST".equalsIgnoreCase(userSide);
                    outcomeStr = isMyWin ? "WIN" : "LOSS";
                    eloDelta = isMyWin ? (16 + Math.min(12, scoreDiff * 2)) : -(11 + Math.min(8, scoreDiff * 2));
                } else if (session.getMatchOutcome() == com.backend.sporta.enums.NormalizedOutcome.DRAW) {
                    outcomeStr = "DRAW";
                    eloDelta = 0;
                }

                List<String> bonusNotes = new ArrayList<>();
                bonusNotes.add("Ca Xé Vé Tự Quản");
                List<String> friendlyExplanations = new ArrayList<>();
                if ("WIN".equals(outcomeStr)) {
                    friendlyExplanations.add("Đội của bạn giành chiến thắng (" + scoreText + ").");
                    friendlyExplanations.add("Điểm cá nhân: +" + eloDelta + " Elo.");
                } else if ("LOSS".equals(outcomeStr)) {
                    friendlyExplanations.add("Đội của bạn thua trận (" + scoreText + ").");
                    friendlyExplanations.add("Điểm cá nhân: " + eloDelta + " Elo.");
                } else {
                    friendlyExplanations.add("Trận đấu hòa (" + scoreText + ").");
                    friendlyExplanations.add("Điểm Elo giữ nguyên.");
                }

                if (Boolean.TRUE.equals(ticket.getIsCaptain())) {
                    friendlyExplanations.add("Trưởng Ca: Ghi nhận công sức tạo và điều phối ca đấu.");
                }

                var playedAt = session.getStartTime() != null && session.getPlayDate() != null
                        ? session.getPlayDate().atTime(session.getStartTime())
                        : ticket.getCreatedAt();

                int currentElo = 1500;
                var usOpt = userSportRepository.findByUserIdAndSportId(userId, session.getVenue() != null && session.getVenue().getSport() != null ? session.getVenue().getSport().getId() : 1L);
                if (usOpt.isPresent()) {
                    currentElo = usOpt.get().getEffectiveElo();
                }

                historyList.add(RankedMatchHistoryItemDto.builder()
                        .id(ticket.getId().toString())
                        .matchType("XE_VE")
                        .sportName(sportName)
                        .playedAt(playedAt)
                        .venueName(venueName)
                        .courtName(courtName)
                        .hostName("Đội Xanh")
                        .hostAvatarUrl(null)
                        .guestName("Đội Cam")
                        .guestAvatarUrl(null)
                        .scoreText(scoreText)
                        .userSide(userSide)
                        .userOutcome(outcomeStr)
                        .personalEloDelta(eloDelta)
                        .eloBefore(currentElo - eloDelta)
                        .eloAfter(currentElo)
                        .clubCrpDelta(null)
                        .crpBefore(null)
                        .crpAfter(null)
                        .bonusNotes(bonusNotes)
                        .explanation(friendlyExplanations)
                        .isCaptain(Boolean.TRUE.equals(ticket.getIsCaptain()))
                        .isDisputed(Boolean.TRUE.equals(session.getIsDisputed()))
                        .build());
            }
        }

        // 2. Process Club Ranked Matches
        List<ClubMember> clubMembers = clubMemberRepository.findByUserId(userId);
        if (clubMembers != null) {
            Set<Long> userClubIds = clubMembers.stream()
                    .filter(m -> m.getStatus() == ClubMemberStatus.APPROVED && m.getClub() != null)
                    .map(m -> m.getClub().getId())
                    .collect(Collectors.toSet());

            if (!userClubIds.isEmpty()) {
                List<Match> allMatches = matchRepository.findAll();
                for (Match match : allMatches) {
                    if (match.getStatus() != com.backend.sporta.enums.MatchStatus.RESULT_FINAL) {
                        continue;
                    }

                    boolean isHost = match.getHostClub() != null && userClubIds.contains(match.getHostClub().getId());
                    boolean isGuest = match.getGuestClub() != null && userClubIds.contains(match.getGuestClub().getId());

                    if (!isHost && !isGuest) {
                        continue;
                    }

                    Club userClub = isHost ? match.getHostClub() : match.getGuestClub();

                    // 1. Verify user membership in the club
                    Optional<ClubMember> memberOpt = clubMemberRepository.findByClubIdAndUserId(userClub.getId(), userId);
                    if (memberOpt.isEmpty() || memberOpt.get().getStatus() != ClubMemberStatus.APPROVED) {
                        continue;
                    }

                    // 2. Check if the match was played before the user even joined the club
                    ClubMember member = memberOpt.get();
                    if (member.getJoinedAt() != null && match.getCreatedAt() != null) {
                        if (match.getCreatedAt().isBefore(member.getJoinedAt().minusMinutes(2))) {
                            continue; // Match happened before user joined the club
                        }
                    }

                    // 3. Strict Check: User MUST have participated in the lineup of this match
                    Optional<ClubPoll> pollOpt = clubPollRepository.findByClubIdAndMatchId(userClub.getId(), match.getId());
                    if (pollOpt.isEmpty()) {
                        continue; // No lineup record -> user did not play in this match
                    }

                    boolean hasJoined = clubPollVoteRepository.findByPollIdAndUserId(pollOpt.get().getId(), userId)
                            .filter(v -> v.getOption() == com.backend.sporta.enums.PollVoteOption.JOIN)
                            .isPresent();

                    if (!hasJoined) {
                        continue; // User did not participate in this match
                    }

                    String userSide = isHost ? "HOST" : "GUEST";

                    var resultOpt = matchResultRepository.findByMatchId(match.getId());
                    var ledgerOpt = crpLedgerRepository.findByMatchIdAndClubId(match.getId(), userClub.getId());

                    String scoreText = resultOpt.map(com.backend.sporta.entity.MatchResult::getFinalScoreText).orElse("3 - 2");
                    var outcome = resultOpt.map(com.backend.sporta.entity.MatchResult::getOutcome).orElse(com.backend.sporta.enums.NormalizedOutcome.DRAW);

                    String outcomeStr = "DRAW";
                    if (outcome == com.backend.sporta.enums.NormalizedOutcome.WIN_HOST) {
                        outcomeStr = isHost ? "WIN" : "LOSS";
                    } else if (outcome == com.backend.sporta.enums.NormalizedOutcome.WIN_GUEST) {
                        outcomeStr = isGuest ? "WIN" : "LOSS";
                    }

                    int scoreDiff = 0;
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

                    int crpDelta = ledgerOpt.map(CRPLedger::getDeltaCrp).orElse("WIN".equals(outcomeStr) ? +25 : "LOSS".equals(outcomeStr) ? -14 : 0);
                    
                    // Dynamic Elo delta with score diff
                    int eloDelta = 0;
                    if ("WIN".equals(outcomeStr)) {
                        eloDelta = scoreDiff >= 10 ? +65 : (scoreDiff >= 4 ? +48 : +24);
                    } else if ("LOSS".equals(outcomeStr)) {
                        eloDelta = scoreDiff >= 10 ? -24 : -16;
                    } else {
                        eloDelta = 0;
                    }

                    List<String> bonusNotes = new ArrayList<>();
                    bonusNotes.add("Xếp Hạng CLB");
                    if ("WIN".equals(outcomeStr)) {
                        if (scoreDiff >= 5) {
                            bonusNotes.add("Thắng Đậm (+" + eloDelta + " Elo)");
                        } else {
                            bonusNotes.add("Chiến Thắng");
                        }
                    }

                    List<String> friendlyExplanations = new ArrayList<>();
                    if ("WIN".equals(outcomeStr)) {
                        friendlyExplanations.add("CLB của bạn đã giành chiến thắng (" + scoreText + ").");
                        friendlyExplanations.add("Điểm cá nhân: +" + eloDelta + " Elo.");
                        friendlyExplanations.add("Điểm CLB: +" + crpDelta + " CRP vào bảng xếp hạng.");
                    } else if ("LOSS".equals(outcomeStr)) {
                        friendlyExplanations.add("CLB của bạn nhận kết quả thua trận (" + scoreText + ").");
                        friendlyExplanations.add("Điểm cá nhân: " + eloDelta + " Elo.");
                        friendlyExplanations.add("Điểm CLB: " + crpDelta + " CRP.");
                        friendlyExplanations.add("Bảo vệ điểm thua: Quỹ Sporta tài trợ giảm 30% số điểm bị trừ.");
                    } else {
                        friendlyExplanations.add("Trận đấu kết thúc với kết quả hòa (" + scoreText + ").");
                        friendlyExplanations.add("Điểm số được giữ nguyên cho cả hai bên.");
                    }

                    String sportName = userClub.getSport() != null ? userClub.getSport().getName() : "Bóng đá";

                    String venueName = "Sân Thể Thao Sporta";
                    String courtName = "";
                    if (match.getBooking() != null) {
                        if (match.getBooking().getVenue() != null) {
                            venueName = match.getBooking().getVenue().getName();
                        }
                        if (match.getBooking().getDetails() != null && !match.getBooking().getDetails().isEmpty()) {
                            var detail = match.getBooking().getDetails().get(0);
                            if (detail.getCourt() != null) {
                                courtName = detail.getCourt().getName();
                            }
                        }
                    }

                    Integer crpBefore = null;
                    Integer crpAfter = null;
                    if (resultOpt.isPresent()) {
                        var r = resultOpt.get();
                        crpBefore = isHost ? r.getHostCrpBefore() : r.getGuestCrpBefore();
                        crpAfter = isHost ? r.getHostCrpAfter() : r.getGuestCrpAfter();
                    }
                    if (crpBefore == null && userClub != null) {
                        crpBefore = userClub.getCrp() != null ? userClub.getCrp() - crpDelta : 1000;
                        crpAfter = (crpBefore != null ? crpBefore : 1000) + crpDelta;
                    }

                    historyList.add(RankedMatchHistoryItemDto.builder()
                            .id(match.getId().toString())
                            .matchType("CLUB_RANKED")
                            .sportName(sportName)
                            .playedAt(match.getCreatedAt())
                            .venueName(venueName)
                            .courtName(courtName)
                            .hostName(match.getHostClub() != null ? match.getHostClub().getName() : "CLB Host")
                            .hostAvatarUrl(match.getHostClub() != null ? match.getHostClub().getAvatarImage() : null)
                            .guestName(match.getGuestClub() != null ? match.getGuestClub().getName() : "CLB Guest")
                            .guestAvatarUrl(match.getGuestClub() != null ? match.getGuestClub().getAvatarImage() : null)
                            .scoreText(scoreText)
                            .userSide(userSide)
                            .userOutcome(outcomeStr)
                            .personalEloDelta(eloDelta)
                            .clubCrpDelta(crpDelta)
                            .crpBefore(crpBefore)
                            .crpAfter(crpAfter)
                            .bonusNotes(bonusNotes)
                            .explanation(friendlyExplanations)
                            .isCaptain(false)
                            .isDisputed(false)
                            .build());
                }
            }
        }

        // Compute true continuous Elo progression per sport
        Map<String, List<RankedMatchHistoryItemDto>> bySport = historyList.stream()
                .collect(Collectors.groupingBy(item -> item.getSportName() != null ? item.getSportName() : "Default"));

        for (Map.Entry<String, List<RankedMatchHistoryItemDto>> entry : bySport.entrySet()) {
            List<RankedMatchHistoryItemDto> sportMatches = entry.getValue();
            sportMatches.sort((a, b) -> {
                if (a.getPlayedAt() == null || b.getPlayedAt() == null) return 0;
                return a.getPlayedAt().compareTo(b.getPlayedAt()); // Oldest first
            });

            // Get initial seed Elo of this user in this sport
            String sportName = entry.getKey();
            Sport sport = sportRepository.findByName(sportName).orElse(null);
            int runningElo = 1500;
            if (sport != null) {
                var usOpt = userSportRepository.findByUserIdAndSportId(userId, sport.getId());
                if (usOpt.isPresent()) {
                    runningElo = UserSport.mapSeedElo(usOpt.get().getLevel());
                }
            }

            for (RankedMatchHistoryItemDto m : sportMatches) {
                int delta = m.getPersonalEloDelta() != null ? m.getPersonalEloDelta() : 0;
                m.setEloBefore(runningElo);
                m.setEloAfter(runningElo + delta);
                runningElo = runningElo + delta;
            }
        }

        // Sort latest matches first for display
        historyList.sort((a, b) -> {
            if (a.getPlayedAt() == null || b.getPlayedAt() == null) return 0;
            return b.getPlayedAt().compareTo(a.getPlayedAt());
        });

        return historyList;
    }
}
