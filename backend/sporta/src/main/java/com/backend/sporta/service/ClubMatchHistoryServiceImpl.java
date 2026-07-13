package com.backend.sporta.service;

import com.backend.sporta.dto.ClubMatchRequest;
import com.backend.sporta.dto.ClubMatchResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMatchHistory;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.enums.MatchResult;
import com.backend.sporta.repository.ClubMatchHistoryRepository;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.List;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    @Transactional
    public ClubMatchResponse addMatch(Long clubId, ClubMatchRequest request, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(clubId, user.getId());

        MatchResult matchResult;
        try {
            matchResult = MatchResult.valueOf(request.getResult().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Kết quả trận đấu không hợp lệ. Chỉ chấp nhận WIN, LOSE, hoặc DRAW");
        }

        ClubMatchHistory history = ClubMatchHistory.builder()
                .opponentName(request.getOpponentName())
                .opponentAvatar(request.getOpponentAvatar() != null ? request.getOpponentAvatar() : "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=100&auto=format&fit=crop&q=80")
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
        clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        // Must be approved member to view matches history
        clubMemberRepository.findByClubIdAndUserId(clubId, user.getId())
                .filter(m -> m.getStatus() == ClubMemberStatus.APPROVED)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        List<ClubMatchHistory> histories = clubMatchHistoryRepository.findByClubIdOrderByDateDescCreatedAtDesc(clubId);
        return histories.stream().map(this::mapToResponse).collect(Collectors.toList());
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
                .result(history.getResult().name().toLowerCase()) // "win", "lose", "draw"
                .location(history.getLocation())
                .build();
    }
}
