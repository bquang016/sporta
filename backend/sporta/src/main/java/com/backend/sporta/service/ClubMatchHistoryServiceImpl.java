package com.backend.sporta.service;

import com.backend.sporta.dto.ClubMatchRequest;
import com.backend.sporta.dto.ClubMatchResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMatchHistory;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.Match;
import com.backend.sporta.entity.MatchResult;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.enums.NormalizedOutcome;
import com.backend.sporta.repository.ClubMatchHistoryRepository;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.MatchRepository;
import com.backend.sporta.repository.MatchResultRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClubMatchHistoryServiceImpl implements ClubMatchHistoryService {

    @Autowired
    private ClubMatchHistoryRepository clubMatchHistoryRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional
    public ClubMatchResponse addMatch(Long clubId, ClubMatchRequest request, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(clubId, user.getId());

        com.backend.sporta.enums.MatchResult matchResult;
        try {
            matchResult = com.backend.sporta.enums.MatchResult.valueOf(request.getResult().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Kết quả trận đấu không hợp lệ. Chỉ chấp nhận WIN, LOSE, hoặc DRAW");
        }

        ClubMatchHistory history = ClubMatchHistory.builder()
                .opponentName(request.getOpponentName())
                .opponentAvatar(request.getOpponentAvatar() != null ? request.getOpponentAvatar() : null)
                .date(request.getDate())
                .ourScore(request.getOurScore())
                .opponentScore(request.getOpponentScore())
                .result(matchResult)
                .location(request.getLocation())
                .club(club)
                .build();

        history = clubMatchHistoryRepository.save(history);
        return mapToResponse(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubMatchResponse> getMatches(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        if (Boolean.TRUE.equals(club.getIsPrivate())) {
            if (userEmail == null || userEmail.isBlank() || userEmail.equals("anonymousUser")) {
                return new ArrayList<>();
            }
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null) {
                return new ArrayList<>();
            }
            Optional<ClubMember> callerOpt = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId());
            if (callerOpt.isEmpty() || callerOpt.get().getStatus() != ClubMemberStatus.APPROVED) {
                return new ArrayList<>();
            }
        }

        List<ClubMatchResponse> responses = new ArrayList<>();

        // 1. Fetch Real Ranked Matches from Matchmaking System
        List<Match> realMatches = matchRepository.findFinalRankedMatchesByClubId(clubId);
        for (Match m : realMatches) {
            Optional<MatchResult> resultOpt = matchResultRepository.findByMatchId(m.getId());
            if (resultOpt.isEmpty()) continue;
            MatchResult mr = resultOpt.get();

            boolean isHost = m.getHostClub() != null && m.getHostClub().getId().equals(clubId);
            Club opponentClub = isHost ? m.getGuestClub() : m.getHostClub();
            String opponentName = opponentClub != null ? opponentClub.getName() : "Đối thủ";
            String opponentAvatar = opponentClub != null ? (opponentClub.getAvatarImage() != null ? opponentClub.getAvatarImage() : opponentClub.getCoverImage()) : null;
            Long opponentClubId = opponentClub != null ? opponentClub.getId() : null;

            int ourScore = 0;
            int opponentScore = 0;
            String scoreText = mr.getFinalScoreText();
            if (scoreText != null && scoreText.contains("-")) {
                String[] parts = scoreText.split("-");
                try {
                    int s1 = Integer.parseInt(parts[0].trim());
                    int s2 = Integer.parseInt(parts[1].trim());
                    ourScore = isHost ? s1 : s2;
                    opponentScore = isHost ? s2 : s1;
                } catch (Exception ignored) {}
            }

            String outcomeStr = "draw";
            if (mr.getOutcome() == NormalizedOutcome.WIN_HOST) {
                outcomeStr = isHost ? "win" : "lose";
            } else if (mr.getOutcome() == NormalizedOutcome.WIN_GUEST) {
                outcomeStr = isHost ? "lose" : "win";
            }

            Integer crpDelta = isHost ? mr.getHostCrpDelta() : mr.getGuestCrpDelta();

            String location = "Sân thể thao";
            if (m.getBooking() != null && m.getBooking().getVenue() != null) {
                location = m.getBooking().getVenue().getName();
            }

            String formattedDate = m.getCreatedAt() != null ? m.getCreatedAt().format(DATE_TIME_FORMATTER) : "";

            responses.add(ClubMatchResponse.builder()
                    .id(m.getId().getMostSignificantBits() & Long.MAX_VALUE)
                    .matchId(m.getId().toString())
                    .opponentClubId(opponentClubId)
                    .opponentName(opponentName)
                    .opponentAvatar(opponentAvatar)
                    .date(formattedDate)
                    .ourScore(ourScore)
                    .opponentScore(opponentScore)
                    .scoreText(ourScore + " - " + opponentScore)
                    .result(outcomeStr)
                    .crpDelta(crpDelta)
                    .location(location)
                    .matchType("Giao hữu Xếp Hạng CLB")
                    .build());
        }

        // 2. Fetch Legacy / Manual match history
        List<ClubMatchHistory> histories = clubMatchHistoryRepository.findByClubIdOrderByDateDescCreatedAtDesc(clubId);
        for (ClubMatchHistory h : histories) {
            responses.add(mapToResponse(h));
        }

        return responses;
    }

    private void checkAdminOrSubLeaderPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED || 
            (member.getRole() != ClubMemberRole.ADMIN && member.getRole() != ClubMemberRole.SUB_LEADER)) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }
    }

    private ClubMatchResponse mapToResponse(ClubMatchHistory history) {
        return ClubMatchResponse.builder()
                .id(history.getId())
                .opponentName(history.getOpponentName())
                .opponentAvatar(history.getOpponentAvatar())
                .date(history.getDate() != null ? history.getDate().format(DATE_FORMATTER) : null)
                .ourScore(history.getOurScore())
                .opponentScore(history.getOpponentScore())
                .scoreText(history.getOurScore() + " - " + history.getOpponentScore())
                .result(history.getResult().name().toLowerCase()) // "win", "lose", "draw"
                .location(history.getLocation())
                .matchType("Trận đấu CLB")
                .build();
    }
}
