package com.backend.sporta.service;

import com.backend.sporta.dto.ClubPollRequest;
import com.backend.sporta.dto.ClubPollResponse;
import com.backend.sporta.dto.ClubPollResponse.MatchmadeTeamsResponse;
import com.backend.sporta.dto.ClubPollResponse.PollVoterDto;
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

        checkApprovedMemberPrivileges(clubId, user.getId());

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
            return null;
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
                // Toggle vote off if clicked again
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

        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public ClubPollResponse closePoll(Long pollId, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkLeaderOrSubLeaderPrivileges(poll.getClub().getId(), user.getId());

        if (poll.getIsClosed()) {
            throw new RuntimeException("Cuộc bình chọn này đã đóng trước đó");
        }

        poll.setIsClosed(true);

        // Perform matchmaking split for users who voted JOIN
        Long clubId = poll.getClub().getId();
        List<ClubPollVote> votes = clubPollVoteRepository.findByPollId(pollId);
        List<PollVoterDto> joinedVoters = votes.stream()
                .filter(v -> v.getOption() == PollVoteOption.JOIN)
                .map(v -> mapVoterDto(clubId, v.getUser()))
                .collect(Collectors.toList());

        List<String> teamA = new ArrayList<>();
        List<String> teamB = new ArrayList<>();
        List<PollVoterDto> teamAPlayers = new ArrayList<>();
        List<PollVoterDto> teamBPlayers = new ArrayList<>();

        if (!joinedVoters.isEmpty()) {
            // ELO balanced distribution (Snake draft by ELO)
            List<PollVoterDto> sorted = new ArrayList<>(joinedVoters);
            sorted.sort((a, b) -> Integer.compare(b.getElo() != null ? b.getElo() : 1200, a.getElo() != null ? a.getElo() : 1200));

            boolean toTeamA = true;
            for (int i = 0; i < sorted.size(); i++) {
                PollVoterDto voter = sorted.get(i);
                if (toTeamA) {
                    teamA.add(voter.getName());
                    teamAPlayers.add(voter);
                } else {
                    teamB.add(voter.getName());
                    teamBPlayers.add(voter);
                }
                // Snake draft pattern: A, B, B, A, A, B, B...
                if (i % 2 == 1) {
                    toTeamA = !toTeamA;
                }
            }
        }

        int totalEloA = teamAPlayers.stream().mapToInt(p -> p.getElo() != null ? p.getElo() : 1200).sum();
        int totalEloB = teamBPlayers.stream().mapToInt(p -> p.getElo() != null ? p.getElo() : 1200).sum();

        MatchmadeTeamsResponse splitResult = MatchmadeTeamsResponse.builder()
                .teamA(teamA)
                .teamB(teamB)
                .teamAPlayers(teamAPlayers)
                .teamBPlayers(teamBPlayers)
                .teamATotalElo(totalEloA)
                .teamBTotalElo(totalEloB)
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
    public ClubPollResponse reopenPoll(Long pollId, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkLeaderOrSubLeaderPrivileges(poll.getClub().getId(), user.getId());

        poll.setIsClosed(false);
        poll = clubPollRepository.save(poll);
        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public ClubPollResponse saveMatchmadeTeams(Long pollId, MatchmadeTeamsResponse request, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkLeaderOrSubLeaderPrivileges(poll.getClub().getId(), user.getId());

        try {
            String jsonResult = objectMapper.writeValueAsString(request);
            poll.setMatchmadeTeams(jsonResult);
            poll = clubPollRepository.save(poll);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi lưu kết quả chia đội");
        }

        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public void deletePoll(Long pollId, String userEmail) {
        ClubPoll poll = clubPollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc bình chọn"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkLeaderOrSubLeaderPrivileges(poll.getClub().getId(), user.getId());

        // Delete all votes first
        clubPollVoteRepository.deleteByPollId(pollId);
        clubPollRepository.delete(poll);
    }

    private void checkApprovedMemberPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED) {
            throw new RuntimeException("Chỉ thành viên đã gia nhập câu lạc bộ mới được thực hiện hành động này");
        }
    }

    private void checkLeaderOrSubLeaderPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED ||
                (member.getRole() != ClubMemberRole.ADMIN && member.getRole() != ClubMemberRole.SUB_LEADER)) {
            throw new RuntimeException("Chỉ Trưởng hoặc Phó câu lạc bộ mới có quyền quản lý biểu quyết này");
        }
    }

    private PollVoterDto mapVoterDto(Long clubId, User user) {
        Optional<ClubMember> memberOpt = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId());
        String roleText = "Thành viên";
        if (memberOpt.isPresent()) {
            if (memberOpt.get().getRole() == ClubMemberRole.ADMIN) {
                roleText = "Trưởng câu lạc bộ";
            } else if (memberOpt.get().getRole() == ClubMemberRole.SUB_LEADER) {
                roleText = "Phó câu lạc bộ";
            }
        }

        Integer virtualElo = 1000 + (int)(user.getId() % 300) + 150;
        String avatar = (user.getAvatarUrl() != null && !user.getAvatarUrl().trim().isEmpty())
                ? user.getAvatarUrl()
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

        return PollVoterDto.builder()
                .userId(user.getId())
                .name(user.getFullName() != null ? user.getFullName() : "Thành viên")
                .avatar(avatar)
                .elo(virtualElo)
                .role(roleText)
                .build();
    }

    private ClubPollResponse mapToResponse(ClubPoll poll, User currentUser) {
        List<ClubPollVote> votes = clubPollVoteRepository.findByPollId(poll.getId());

        List<PollVoterDto> joinedVoters = new ArrayList<>();
        List<PollVoterDto> absentVoters = new ArrayList<>();
        List<String> joined = new ArrayList<>();
        List<String> absent = new ArrayList<>();

        for (ClubPollVote v : votes) {
            PollVoterDto dto = mapVoterDto(poll.getClub().getId(), v.getUser());
            if (v.getOption() == PollVoteOption.JOIN) {
                joinedVoters.add(dto);
                joined.add(dto.getName());
            } else {
                absentVoters.add(dto);
                absent.add(dto.getName());
            }
        }

        String userVote = null;
        Optional<ClubPollVote> myVote = votes.stream()
                .filter(v -> v.getUser().getId().equals(currentUser.getId()))
                .findFirst();
        if (myVote.isPresent()) {
            userVote = myVote.get().getOption().name().toLowerCase();
        }

        MatchmadeTeamsResponse matchmade = null;
        if (poll.getMatchmadeTeams() != null) {
            try {
                matchmade = objectMapper.readValue(poll.getMatchmadeTeams(), MatchmadeTeamsResponse.class);
            } catch (JsonProcessingException e) {
                matchmade = MatchmadeTeamsResponse.builder()
                        .teamA(new ArrayList<>())
                        .teamB(new ArrayList<>())
                        .teamAPlayers(new ArrayList<>())
                        .teamBPlayers(new ArrayList<>())
                        .teamATotalElo(0)
                        .teamBTotalElo(0)
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
                .joinedVoters(joinedVoters)
                .absentVoters(absentVoters)
                .userVote(userVote)
                .matchmadeTeams(matchmade)
                .creatorId(poll.getCreator() != null ? poll.getCreator().getId() : null)
                .creatorName(poll.getCreator() != null ? poll.getCreator().getFullName() : "")
                .build();
    }
}
