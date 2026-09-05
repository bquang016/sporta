package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.*;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.*;
import com.backend.sporta.service.matchmaking.LineupConflictValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchPollServiceImpl implements MatchPollService {

    @Autowired
    private MatchPollRepository matchPollRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private PollVoteRepository pollVoteRepository;

    @Autowired
    private MatchLineupRepository matchLineupRepository;

    @Autowired
    private LineupMemberRepository lineupMemberRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private LineupService lineupService;

    @Autowired
    private LineupConflictValidator lineupConflictValidator;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
    }

    private boolean isClubAdmin(Long clubId, Long userId) {
        Optional<ClubMember> member = clubMemberRepository.findByClubIdAndUserId(clubId, userId);
        if (member.isEmpty()) {
            Club club = clubRepository.findById(clubId).orElse(null);
            return club != null && club.getCreator() != null && club.getCreator().getId().equals(userId);
        }
        ClubMember m = member.get();
        if (m.getClub() != null && m.getClub().getCreator() != null && m.getClub().getCreator().getId().equals(userId)) {
            return true;
        }
        return m.getStatus() == ClubMemberStatus.APPROVED &&
                (m.getRole() == ClubMemberRole.ADMIN || m.getRole() == ClubMemberRole.SUB_LEADER);
    }

    private boolean isClubMember(Long clubId, Long userId) {
        Optional<ClubMember> member = clubMemberRepository.findByClubIdAndUserId(clubId, userId);
        if (member.isEmpty()) {
            Club club = clubRepository.findById(clubId).orElse(null);
            return club != null && club.getCreator() != null && club.getCreator().getId().equals(userId);
        }
        return member.get().getStatus() == ClubMemberStatus.APPROVED;
    }

    private int getSportDefaultMinPlayers(Sport sport) {
        if (sport == null || sport.getName() == null) return 1;
        String s = sport.getName().toLowerCase();
        if (s.contains("bóng đá") || s.contains("football")) return 5;
        if (s.contains("bóng rổ") || s.contains("basketball")) return 3;
        if (s.contains("cầu lông") || s.contains("badminton")) return 1;
        if (s.contains("pickleball")) return 1;
        if (s.contains("tennis") || s.contains("quần vợt")) return 1;
        return 1;
    }

    private int getUserEloForClub(Long userId, Club club) {
        if (club != null && club.getSport() != null) {
            Optional<UserSport> us = userSportRepository.findByUserIdAndSportId(userId, club.getSport().getId());
            if (us.isPresent()) {
                return us.get().getEffectiveElo();
            }
        }
        return 1200;
    }

    private String getMemberRole(Long clubId, Long userId) {
        Optional<ClubMember> member = clubMemberRepository.findByClubIdAndUserId(clubId, userId);
        if (member.isEmpty()) {
            Club club = clubRepository.findById(clubId).orElse(null);
            if (club != null && club.getCreator() != null && club.getCreator().getId().equals(userId)) {
                return "Trưởng CLB";
            }
            return "Thành viên";
        }
        ClubMember m = member.get();
        if (m.getRole() == ClubMemberRole.ADMIN) {
            return "Trưởng CLB";
        } else if (m.getRole() == ClubMemberRole.SUB_LEADER) {
            return "Phó CLB";
        }
        return "Thành viên";
    }

    @Override
    @Transactional
    public MatchPollResponse createPoll(Long clubId, CreateMatchPollRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new CustomException("Không tìm thấy CLB", 404));

        if (!isClubAdmin(clubId, user.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền tạo biểu quyết", 403);
        }

        int defaultMin = getSportDefaultMinPlayers(club.getSport());
        int minPlayers = request.getMinPlayers() != null ? request.getMinPlayers() : defaultMin;

        if (request.getMaxPlayers() != null && request.getMaxPlayers() < minPlayers) {
            throw new CustomException(
                    "Số người tối đa (" + request.getMaxPlayers() + ") không được nhỏ hơn số người tối thiểu của môn "
                            + (club.getSport() != null ? club.getSport().getName() : "") + " (" + minPlayers + " người)",
                    400);
        }

        MatchPoll poll = MatchPoll.builder()
                .club(club)
                .creator(user)
                .title(request.getTitle().trim())
                .pollType(request.getPollType())
                .deadline(request.getDeadline())
                .minPlayers(minPlayers)
                .maxPlayers(request.getMaxPlayers())
                .status(PollStatus.OPEN)
                .build();

        poll = matchPollRepository.save(poll);

        // Tạo 2 lựa chọn mặc định: Có (tham gia), Không (không tham gia)
        PollOption yesOpt = PollOption.builder()
                .poll(poll)
                .label("Có")
                .isJoinOption(true)
                .isDefault(true)
                .displayOrder(1)
                .build();
        pollOptionRepository.save(yesOpt);

        PollOption noOpt = PollOption.builder()
                .poll(poll)
                .label("Không")
                .isJoinOption(false)
                .isDefault(true)
                .displayOrder(2)
                .build();
        pollOptionRepository.save(noOpt);

        // Tạo các lựa chọn tùy chỉnh (nếu có)
        if (request.getCustomOptions() != null) {
            int order = 3;
            for (String custom : request.getCustomOptions()) {
                if (custom != null && !custom.trim().isBlank()) {
                    PollOption opt = PollOption.builder()
                            .poll(poll)
                            .label(custom.trim())
                            .isJoinOption(false)
                            .isDefault(false)
                            .displayOrder(order++)
                            .build();
                    pollOptionRepository.save(opt);
                }
            }
        }

        return mapToResponse(poll, user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchPollResponse> getClubPolls(Long clubId, String userEmail) {
        User user = getUserByEmail(userEmail);
        List<MatchPoll> polls = matchPollRepository.findByClubIdAndStatusNotOrderByCreatedAtDesc(clubId, PollStatus.DELETED);
        return polls.stream().map(p -> mapToResponse(p, user)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MatchPollResponse getPollDetail(Long pollId, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));
        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public MatchPollResponse votePoll(Long pollId, VotePollRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        if (poll.getStatus() != PollStatus.OPEN) {
            throw new CustomException("Biểu quyết này đã đóng hoặc đã tạo đội hình", 400);
        }

        if (poll.getDeadline() != null && LocalDateTime.now().isAfter(poll.getDeadline())) {
            poll.setStatus(PollStatus.CLOSED);
            poll.setClosedAt(LocalDateTime.now());
            matchPollRepository.save(poll);
            throw new CustomException("Biểu quyết này đã hết hạn", 400);
        }

        if (!isClubMember(poll.getClub().getId(), user.getId())) {
            throw new CustomException("Chỉ thành viên chính thức của CLB mới có quyền biểu quyết", 403);
        }

        PollOption selectedOption = pollOptionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new CustomException("Không tìm thấy lựa chọn biểu quyết", 404));

        if (!selectedOption.getPoll().getId().equals(pollId)) {
            throw new CustomException("Lựa chọn không thuộc biểu quyết này", 400);
        }

        // Lấy tất cả các vote hiện tại của user trong biểu quyết này
        List<PollVote> userVotes = pollVoteRepository.findByPollIdAndUserId(pollId, user.getId());

        boolean isSelectedDefault = Boolean.TRUE.equals(selectedOption.getIsDefault())
                || "Có".equalsIgnoreCase(selectedOption.getLabel())
                || "Không".equalsIgnoreCase(selectedOption.getLabel());

        boolean isAlreadyVotedThisOption = userVotes.stream()
                .anyMatch(v -> v.getOption().getId().equals(selectedOption.getId()));

        if (isAlreadyVotedThisOption) {
            // Nhấn lại lựa chọn đã chọn -> Hủy vote cho lựa chọn này
            pollVoteRepository.deleteByPollIdAndUserIdAndOptionId(pollId, user.getId(), selectedOption.getId());
        } else {
            // Nếu đây là lựa chọn mặc định ("Có" hoặc "Không"):
            if (isSelectedDefault) {
                // Xóa lựa chọn mặc định khác nếu có (chỉ được chọn 1 giữa Có hoặc Không)
                for (PollVote v : userVotes) {
                    boolean vIsDefault = Boolean.TRUE.equals(v.getOption().getIsDefault())
                            || "Có".equalsIgnoreCase(v.getOption().getLabel())
                            || "Không".equalsIgnoreCase(v.getOption().getLabel());
                    if (vIsDefault) {
                        pollVoteRepository.delete(v);
                    }
                }
            }
            // Thêm vote mới cho lựa chọn này
            PollVote newVote = PollVote.builder()
                    .poll(poll)
                    .user(user)
                    .option(selectedOption)
                    .build();
            pollVoteRepository.save(newVote);
        }

        // Kiểm tra tự động đóng vote nếu là MATCHMAKING và đã đủ maxPlayers
        if (poll.getPollType() == PollType.MATCHMAKING && poll.getMaxPlayers() != null) {
            Optional<PollOption> joinOpt = pollOptionRepository.findByPollIdAndIsJoinOptionTrue(pollId);
            if (joinOpt.isPresent()) {
                long joinCount = pollVoteRepository.countByPollIdAndOptionId(pollId, joinOpt.get().getId());
                if (joinCount >= poll.getMaxPlayers()) {
                    autoFormMatchmakingTeam(poll);
                }
            }
        }

        return mapToResponse(poll, user);
    }

    private void autoFormMatchmakingTeam(MatchPoll poll) {
        poll.setStatus(PollStatus.TEAM_FORMED);
        poll.setClosedAt(LocalDateTime.now());
        matchPollRepository.save(poll);

        Optional<PollOption> joinOpt = pollOptionRepository.findByPollIdAndIsJoinOptionTrue(poll.getId());
        if (joinOpt.isEmpty()) return;

        List<PollVote> joinVotes = pollVoteRepository.findByPollId(poll.getId()).stream()
                .filter(v -> v.getOption().getId().equals(joinOpt.get().getId()))
                .collect(Collectors.toList());

        long clubLineupCount = matchLineupRepository.countByClubId(poll.getClub().getId());
        String clubCode = "A";
        if (poll.getClub().getName() != null && !poll.getClub().getName().isBlank()) {
            String[] words = poll.getClub().getName().trim().split("\\s+");
            StringBuilder sb = new StringBuilder();
            for (String w : words) {
                if (!w.isEmpty()) sb.append(w.substring(0, 1).toUpperCase());
            }
            if (sb.length() > 0) clubCode = sb.toString();
        }
        String lineupName = "Đội hình " + clubCode + " - " + (clubLineupCount + 1);

        MatchLineup lineup = MatchLineup.builder()
                .club(poll.getClub())
                .sourcePoll(poll)
                .name(lineupName)
                .lineupType(LineupType.MATCHMAKING)
                .status(LineupStatus.ACTIVE)
                .eloAvg(0)
                .build();
        lineup = matchLineupRepository.save(lineup);

        int totalElo = 0;
        int count = 0;
        for (PollVote vote : joinVotes) {
            User u = vote.getUser();
            int userElo = getUserEloForClub(u.getId(), poll.getClub());
            LineupMember lm = LineupMember.builder()
                    .lineup(lineup)
                    .user(u)
                    .userEloSnapshot(userElo)
                    .addedBy(poll.getCreator())
                    .build();
            lineupMemberRepository.save(lm);
            totalElo += userElo;
            count++;
        }

        if (count > 0) {
            lineup.setEloAvg(Math.round((float) totalElo / count));
            matchLineupRepository.save(lineup);
        }
    }

    @Override
    @Transactional
    public MatchPollResponse closePoll(Long pollId, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        if (!isClubAdmin(poll.getClub().getId(), user.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền đóng biểu quyết", 403);
        }

        if (poll.getPollType() == PollType.INTERNAL) {
            // Tự động chia 2 đội cân bằng ELO cho nội bộ
            splitInternalTeamsLogic(poll);
        } else {
            // MATCHMAKING: nếu đã có người tham gia thì tạo đội hình GT
            Optional<PollOption> joinOpt = pollOptionRepository.findByPollIdAndIsJoinOptionTrue(poll.getId());
            if (joinOpt.isPresent()) {
                long joinCount = pollVoteRepository.countByPollIdAndOptionId(pollId, joinOpt.get().getId());
                if (joinCount >= (poll.getMinPlayers() != null ? poll.getMinPlayers() : 1)) {
                    autoFormMatchmakingTeam(poll);
                } else {
                    poll.setStatus(PollStatus.CLOSED);
                    poll.setClosedAt(LocalDateTime.now());
                    matchPollRepository.save(poll);
                }
            } else {
                poll.setStatus(PollStatus.CLOSED);
                poll.setClosedAt(LocalDateTime.now());
                matchPollRepository.save(poll);
            }
        }

        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public MatchPollResponse splitInternalTeams(Long pollId, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        if (!isClubAdmin(poll.getClub().getId(), user.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền chia đội hình", 403);
        }

        Optional<PollOption> joinOpt = pollOptionRepository.findByPollIdAndIsJoinOptionTrue(poll.getId());
        long joinCount = joinOpt.isPresent()
                ? pollVoteRepository.findByPollId(poll.getId()).stream().filter(v -> v.getOption().getId().equals(joinOpt.get().getId())).count()
                : 0;

        int minReq = (poll.getMinPlayers() != null && poll.getMinPlayers() > 2) ? poll.getMinPlayers() : 2;
        if (joinCount < minReq) {
            throw new CustomException("Chưa đạt đủ số lượng thành viên tối thiểu (" + minReq + " người) để chia 2 đội ra sân. Hiện tại chỉ có " + joinCount + " người chọn tham gia.", 400);
        }

        splitInternalTeamsLogic(poll);
        return mapToResponse(poll, user);
    }

    private void splitInternalTeamsLogic(MatchPoll poll) {
        Optional<PollOption> joinOpt = pollOptionRepository.findByPollIdAndIsJoinOptionTrue(poll.getId());
        if (joinOpt.isEmpty()) {
            poll.setStatus(PollStatus.CLOSED);
            poll.setClosedAt(LocalDateTime.now());
            matchPollRepository.save(poll);
            return;
        }

        List<PollVote> joinVotes = pollVoteRepository.findByPollId(poll.getId()).stream()
                .filter(v -> v.getOption().getId().equals(joinOpt.get().getId()))
                .collect(Collectors.toList());

        if (joinVotes.size() < 2) {
            // Ít hơn 2 người không chia được 2 đội
            poll.setStatus(PollStatus.CLOSED);
            poll.setClosedAt(LocalDateTime.now());
            matchPollRepository.save(poll);
            return;
        }

        // Xoá các lineup cũ nếu có từ poll này
        List<MatchLineup> oldLineups = matchLineupRepository.findBySourcePollId(poll.getId());
        for (MatchLineup old : oldLineups) {
            lineupMemberRepository.deleteByLineupId(old.getId());
            matchLineupRepository.delete(old);
        }

        // Sắp xếp các thành viên theo ELO từ cao xuống thấp
        List<User> participants = joinVotes.stream().map(PollVote::getUser).collect(Collectors.toList());
        participants.sort((u1, u2) -> {
            int elo1 = getUserEloForClub(u1.getId(), poll.getClub());
            int elo2 = getUserEloForClub(u2.getId(), poll.getClub());
            return Integer.compare(elo2, elo1); // Giảm dần
        });

        MatchLineup teamA = MatchLineup.builder()
                .club(poll.getClub())
                .sourcePoll(poll)
                .name("Nội bộ - Đội A")
                .lineupType(LineupType.INTERNAL_A)
                .status(LineupStatus.ACTIVE)
                .eloAvg(0)
                .build();
        teamA = matchLineupRepository.save(teamA);

        MatchLineup teamB = MatchLineup.builder()
                .club(poll.getClub())
                .sourcePoll(poll)
                .name("Nội bộ - Đội B")
                .lineupType(LineupType.INTERNAL_B)
                .status(LineupStatus.ACTIVE)
                .eloAvg(0)
                .build();
        teamB = matchLineupRepository.save(teamB);

        // Phân phối Snake Draft: A, B, B, A, A, B, B, A...
        boolean assignToA = true;
        for (int i = 0; i < participants.size(); i++) {
            User p = participants.get(i);
            int userElo = getUserEloForClub(p.getId(), poll.getClub());

            // Snake pattern: 0 -> A, 1 -> B, 2 -> B, 3 -> A, 4 -> A, 5 -> B...
            int pairIndex = i / 2;
            boolean toTeamA = (pairIndex % 2 == 0) ? (i % 2 == 0) : (i % 2 != 0);

            MatchLineup assignedTeam = toTeamA ? teamA : teamB;
            LineupMember lm = LineupMember.builder()
                    .lineup(assignedTeam)
                    .user(p)
                    .userEloSnapshot(userElo)
                    .addedBy(poll.getCreator())
                    .build();
            lineupMemberRepository.save(lm);
        }

        lineupService.recalculateEloAvg(teamA);
        lineupService.recalculateEloAvg(teamB);

        poll.setStatus(PollStatus.TEAM_FORMED);
        poll.setClosedAt(LocalDateTime.now());
        matchPollRepository.save(poll);
    }

    @Override
    @Transactional
    public MatchPollResponse formMatchmakingLineup(Long pollId, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        if (!isClubAdmin(poll.getClub().getId(), user.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền tạo đội hình ghép trận", 403);
        }

        Optional<PollOption> joinOpt = pollOptionRepository.findByPollIdAndIsJoinOptionTrue(poll.getId());
        long joinCount = joinOpt.isPresent()
                ? pollVoteRepository.findByPollId(poll.getId()).stream().filter(v -> v.getOption().getId().equals(joinOpt.get().getId())).count()
                : 0;

        int minReq = poll.getMinPlayers() != null ? poll.getMinPlayers() : 1;
        if (joinCount < minReq) {
            throw new CustomException("Chưa đạt đủ số lượng thành viên tối thiểu (" + minReq + " người) để chốt đội hình ra sân. Hiện tại chỉ có " + joinCount + " người chọn tham gia.", 400);
        }

        autoFormMatchmakingTeam(poll);
        return mapToResponse(poll, user);
    }

    @Override
    @Transactional
    public MatchPollResponse devAssignVotes(Long pollId, DevAssignVotesRequest request, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        PollOption selectedOption = pollOptionRepository.findById(request.getOptionId())
                .orElseThrow(() -> new CustomException("Không tìm thấy lựa chọn biểu quyết", 404));

        if (!selectedOption.getPoll().getId().equals(pollId)) {
            throw new CustomException("Lựa chọn không thuộc biểu quyết này", 400);
        }

        boolean isSelectedDefault = Boolean.TRUE.equals(selectedOption.getIsDefault())
                || "Có".equalsIgnoreCase(selectedOption.getLabel())
                || "Không".equalsIgnoreCase(selectedOption.getLabel());

        if (request.getUserIds() != null) {
            for (Long uid : request.getUserIds()) {
                User targetUser = userRepository.findById(uid).orElse(null);
                if (targetUser == null) continue;

                List<PollVote> userVotes = pollVoteRepository.findByPollIdAndUserId(pollId, targetUser.getId());

                if (Boolean.TRUE.equals(request.getClearExisting())) {
                    pollVoteRepository.deleteByPollIdAndUserId(pollId, targetUser.getId());
                } else if (isSelectedDefault) {
                    for (PollVote v : userVotes) {
                        boolean vIsDefault = Boolean.TRUE.equals(v.getOption().getIsDefault())
                                || "Có".equalsIgnoreCase(v.getOption().getLabel())
                                || "Không".equalsIgnoreCase(v.getOption().getLabel());
                        if (vIsDefault) {
                            pollVoteRepository.delete(v);
                        }
                    }
                }

                boolean alreadyVoted = pollVoteRepository.findByPollIdAndUserId(pollId, targetUser.getId()).stream()
                        .anyMatch(v -> v.getOption().getId().equals(selectedOption.getId()));

                if (!alreadyVoted) {
                    PollVote newVote = PollVote.builder()
                            .poll(poll)
                            .user(targetUser)
                            .option(selectedOption)
                            .build();
                    pollVoteRepository.save(newVote);
                }
            }
        }

        return mapToResponse(poll, currentUser);
    }

    @Override
    @Transactional
    public void deletePoll(Long pollId, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        if (!isClubAdmin(poll.getClub().getId(), user.getId())) {
            throw new CustomException("Bạn không có quyền xoá biểu quyết này", 403);
        }

        // 1. Soft delete poll (mark as DELETED & set closedAt)
        poll.setStatus(PollStatus.DELETED);
        poll.setClosedAt(LocalDateTime.now());
        matchPollRepository.save(poll);

        // 2. Soft delete / disband associated MatchLineups created from this poll
        List<MatchLineup> lineups = matchLineupRepository.findBySourcePollId(pollId);
        if (lineups != null && !lineups.isEmpty()) {
            for (MatchLineup ml : lineups) {
                ml.setStatus(LineupStatus.DISBANDED);
            }
            matchLineupRepository.saveAll(lineups);
        }
    }

    @Override
    @Transactional
    public MatchPollResponse addCustomOption(Long pollId, String label, String userEmail) {
        User user = getUserByEmail(userEmail);
        MatchPoll poll = matchPollRepository.findById(pollId)
                .orElseThrow(() -> new CustomException("Không tìm thấy biểu quyết", 404));

        if (!isClubAdmin(poll.getClub().getId(), user.getId())) {
            throw new CustomException("Chỉ Ban quản trị CLB mới có quyền thêm lựa chọn", 403);
        }

        if (poll.getStatus() != PollStatus.OPEN) {
            throw new CustomException("Biểu quyết đã kết thúc, không thể thêm lựa chọn", 400);
        }

        List<PollOption> currentOptions = pollOptionRepository.findByPollIdOrderByDisplayOrderAscIdAsc(pollId);
        int maxOrder = currentOptions.stream().mapToInt(PollOption::getDisplayOrder).max().orElse(2);

        PollOption opt = PollOption.builder()
                .poll(poll)
                .label(label.trim())
                .isJoinOption(false)
                .isDefault(false)
                .displayOrder(maxOrder + 1)
                .build();
        pollOptionRepository.save(opt);

        return mapToResponse(poll, user);
    }

    private MatchPollResponse mapToResponse(MatchPoll poll, User currentUser) {
        List<PollOption> options = pollOptionRepository.findByPollIdOrderByDisplayOrderAscIdAsc(poll.getId());
        List<PollVote> allVotes = pollVoteRepository.findByPollId(poll.getId());

        Map<Long, List<PollVote>> votesByOption = allVotes.stream()
                .collect(Collectors.groupingBy(v -> v.getOption().getId()));

        List<Long> myVotedOptionIds = new ArrayList<>();
        Long myVoteOptionId = null;
        if (currentUser != null) {
            myVotedOptionIds = allVotes.stream()
                    .filter(v -> v.getUser().getId().equals(currentUser.getId()))
                    .map(v -> v.getOption().getId())
                    .collect(Collectors.toList());
            if (!myVotedOptionIds.isEmpty()) {
                myVoteOptionId = myVotedOptionIds.get(0);
            }
        }

        int joinCount = 0;
        List<MatchPollResponse.PollOptionDto> optionDtos = new ArrayList<>();
        for (PollOption opt : options) {
            List<PollVote> optVotes = votesByOption.getOrDefault(opt.getId(), Collections.emptyList());
            if (Boolean.TRUE.equals(opt.getIsJoinOption())) {
                joinCount += optVotes.size();
            }

            List<MatchPollResponse.PollVoterDto> voterDtos = optVotes.stream().map(v -> {
                User u = v.getUser();
                return MatchPollResponse.PollVoterDto.builder()
                        .userId(u.getId())
                        .fullName(u.getFullName())
                        .avatarUrl(u.getAvatarUrl())
                        .elo(getUserEloForClub(u.getId(), poll.getClub()))
                        .role(getMemberRole(poll.getClub().getId(), u.getId()))
                        .votedAt(v.getVotedAt() != null ? v.getVotedAt().format(DATE_FMT) : null)
                        .build();
            }).collect(Collectors.toList());

            optionDtos.add(MatchPollResponse.PollOptionDto.builder()
                    .id(opt.getId())
                    .label(opt.getLabel())
                    .isJoinOption(opt.getIsJoinOption())
                    .isDefault(opt.getIsDefault())
                    .displayOrder(opt.getDisplayOrder())
                    .voteCount(optVotes.size())
                    .voters(voterDtos)
                    .build());
        }

        // Lấy danh sách lineups đã hình thành từ poll này (nếu có)
        List<MatchLineup> lineups = matchLineupRepository.findBySourcePollId(poll.getId());
        List<LineupResponse> lineupDtos = lineups.stream()
                .map(lineupService::mapToResponse)
                .collect(Collectors.toList());

        boolean canManage = currentUser != null && isClubAdmin(poll.getClub().getId(), currentUser.getId());

        return MatchPollResponse.builder()
                .id(poll.getId())
                .clubId(poll.getClub().getId())
                .clubName(poll.getClub().getName())
                .creatorId(poll.getCreator().getId())
                .creatorName(poll.getCreator().getFullName())
                .creatorAvatar(poll.getCreator().getAvatarUrl())
                .title(poll.getTitle())
                .pollType(poll.getPollType())
                .deadline(poll.getDeadline() != null ? poll.getDeadline().format(DATE_FMT) : null)
                .maxPlayers(poll.getMaxPlayers())
                .minPlayers(poll.getMinPlayers())
                .status(poll.getStatus())
                .options(optionDtos)
                .myVoteOptionId(myVoteOptionId)
                .myVotedOptionIds(myVotedOptionIds)
                .totalVotes(allVotes.size())
                .joinVotesCount(joinCount)
                .lineups(lineupDtos)
                .canManage(canManage)
                .createdAt(poll.getCreatedAt() != null ? poll.getCreatedAt().format(DATE_FMT) : null)
                .closedAt(poll.getClosedAt() != null ? poll.getClosedAt().format(DATE_FMT) : null)
                .build();
    }
}
