package com.backend.sporta.service;

import com.backend.sporta.dto.ClubPollRequest;
import com.backend.sporta.dto.ClubPollResponse;
import com.backend.sporta.dto.ClubPollResponse.MatchmadeTeamsResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.ClubPoll;
import com.backend.sporta.entity.ClubPollVote;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.enums.PollVoteOption;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubPollRepository;
import com.backend.sporta.repository.ClubPollVoteRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClubPollServiceImpl implements ClubPollService {

    @Autowired
    private ClubPollRepository clubPollRepository;

    @Autowired
    private ClubPollVoteRepository clubPollVoteRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public ClubPollResponse createPoll(Long clubId, ClubPollRequest request, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(clubId, user.getId());

        // Close any active poll before creating a new one
        Optional<ClubPoll> activePollOpt = clubPollRepository.findFirstByClubIdAndIsClosedFalseOrderByCreatedAtDesc(clubId);
        if (activePollOpt.isPresent()) {
            ClubPoll active = activePollOpt.get();
            active.setIsClosed(true);
            clubPollRepository.save(active);
        }

        ClubPoll poll = ClubPoll.builder()
                .title(request.getTitle())
                .closeTime(request.getCloseTime())
                .isClosed(false)
                .club(club)
                .creator(user)
                .build();

        poll = clubPollRepository.save(poll);
        return mapToResponse(poll, user);
    }

    @Override
    @Transactional(readOnly = true)
    public ClubPollResponse getActivePoll(Long clubId, String userEmail) {
        clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        // Caller must be approved member of the club to view polls
        clubMemberRepository.findByClubIdAndUserId(clubId, user.getId())
                .filter(m -> m.getStatus() == ClubMemberStatus.APPROVED)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        Optional<ClubPoll> activePollOpt = clubPollRepository.findFirstByClubIdAndIsClosedFalseOrderByCreatedAtDesc(clubId);
        if (activePollOpt.isEmpty()) {
            return null; // Return null if no active poll exists (matches frontend expectations)
        }

        return mapToResponse(activePollOpt.get(), user);
    }

    @Override
    @Transactional
    public ClubPollResponse vote(Long pollId, String option, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        if (poll.getIsClosed()) {
            throw new RuntimeException("Cuộc bình chọn đã đóng");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        // Must be approved member of the club
        clubMemberRepository.findByClubIdAndUserId(poll.getClub().getId(), user.getId())
                .filter(m -> m.getStatus() == ClubMemberStatus.APPROVED)
                .orElseThrow(() -> new RuntimeException("Chỉ thành viên câu lạc bộ mới được bình chọn"));

        PollVoteOption voteOption;
        try {
            voteOption = PollVoteOption.valueOf(option.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Lựa chọn bình chọn không hợp lệ. Chỉ chấp nhận JOIN hoặc ABSENT");
        }

        Optional<ClubPollVote> existingVoteOpt = clubPollVoteRepository.findByPollIdAndUserId(pollId, user.getId());
        if (existingVoteOpt.isPresent()) {
            ClubPollVote existing = existingVoteOpt.get();
            if (existing.getOption() == voteOption) {
                // Toggle vote off if clicked again (matches frontend userVote toggle)
                clubPollVoteRepository.delete(existing);
            } else {
                existing.setOption(voteOption);
                clubPollVoteRepository.save(existing);
            }
        } else {
            ClubPollVote vote = ClubPollVote.builder()
                    .poll(poll)
                    .user(user)
                    .option(voteOption)
                    .build();
            clubPollVoteRepository.save(vote);
        }

        // Return updated poll response
        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public ClubPollResponse closePoll(Long pollId, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(poll.getClub().getId(), user.getId());

        if (poll.getIsClosed()) {
            throw new RuntimeException("Cuộc bình chọn này đã đóng trước đó");
        }

        poll.setIsClosed(true);

        // Perform random matchmaking split for users who voted JOIN
        List<ClubPollVote> votes = clubPollVoteRepository.findByPollId(pollId);
        List<String> joinedMemberNames = votes.stream()
                .filter(v -> v.getOption() == PollVoteOption.JOIN)
                .map(v -> v.getUser().getFullName())
                .collect(Collectors.toList());

        List<String> teamA = new ArrayList<>();
        List<String> teamB = new ArrayList<>();

        if (!joinedMemberNames.isEmpty()) {
            // Shuffle
            Collections.shuffle(joinedMemberNames);
            for (int i = 0; i < joinedMemberNames.size(); i++) {
                if (i % 2 == 0) {
                    teamA.add(joinedMemberNames.get(i));
                } else {
                    teamB.add(joinedMemberNames.get(i));
                }
            }
        }

        MatchmadeTeamsResponse splitResult = MatchmadeTeamsResponse.builder()
                .teamA(teamA)
                .teamB(teamB)
                .build();

        try {
            String jsonResult = objectMapper.writeValueAsString(splitResult);
            poll.setMatchmadeTeams(jsonResult);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi xử lý kết quả chia đội");
        }

        poll = clubPollRepository.save(poll);
        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public void deletePoll(Long pollId, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(poll.getClub().getId(), user.getId());

        // Delete all votes first
        clubPollVoteRepository.deleteByPollId(pollId);
        clubPollRepository.delete(poll);
    }

    private void checkAdminOrSubLeaderPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED || 
            (member.getRole() != ClubMemberRole.ADMIN && member.getRole() != ClubMemberRole.SUB_LEADER)) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }
    }

    private ClubPollResponse mapToResponse(ClubPoll poll, User currentUser) {
        List<ClubPollVote> votes = clubPollVoteRepository.findByPollId(poll.getId());

        List<String> joined = votes.stream()
                .filter(v -> v.getOption() == PollVoteOption.JOIN)
                .map(v -> v.getUser().getFullName())
                .collect(Collectors.toList());

        List<String> absent = votes.stream()
                .filter(v -> v.getOption() == PollVoteOption.ABSENT)
                .map(v -> v.getUser().getFullName())
                .collect(Collectors.toList());

        String userVote = null;
        Optional<ClubPollVote> myVote = votes.stream()
                .filter(v -> v.getUser().getId().equals(currentUser.getId()))
                .findFirst();
        if (myVote.isPresent()) {
            userVote = myVote.get().getOption().name().toLowerCase(); // "join" or "absent"
        }

        MatchmadeTeamsResponse matchmade = null;
        if (poll.getMatchmadeTeams() != null) {
            try {
                matchmade = objectMapper.readValue(poll.getMatchmadeTeams(), MatchmadeTeamsResponse.class);
            } catch (JsonProcessingException e) {
                // fallback if json is broken
                matchmade = MatchmadeTeamsResponse.builder()
                        .teamA(new ArrayList<>())
                        .teamB(new ArrayList<>())
                        .build();
            }
        }

        return ClubPollResponse.builder()
                .id(poll.getId())
                .title(poll.getTitle())
                .closeTime(poll.getCloseTime())
                .isClosed(poll.getIsClosed())
                .joinedMembers(joined)
                .absentMembers(absent)
                .userVote(userVote)
                .matchmadeTeams(matchmade)
                .build();
    }
}
