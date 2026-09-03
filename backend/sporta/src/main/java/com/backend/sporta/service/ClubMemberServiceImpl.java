package com.backend.sporta.service;

import com.backend.sporta.dto.ClubMemberResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.UserSport;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.UserSportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.sporta.entity.LineupMember;
import com.backend.sporta.entity.MatchLineup;
import com.backend.sporta.entity.MatchPoll;
import com.backend.sporta.enums.LineupStatus;
import com.backend.sporta.enums.NotificationType;
import com.backend.sporta.enums.PollStatus;
import com.backend.sporta.repository.LineupMemberRepository;
import com.backend.sporta.repository.MatchLineupRepository;
import com.backend.sporta.repository.MatchPollRepository;
import com.backend.sporta.repository.PollVoteRepository;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClubMemberServiceImpl implements ClubMemberService {

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private com.backend.sporta.service.matchmaking.ClubEloService clubEloService;

    @Autowired
    private com.backend.sporta.service.ai.PostFeedService postFeedService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MatchLineupRepository matchLineupRepository;

    @Autowired
    private LineupMemberRepository lineupMemberRepository;

    @Autowired
    private MatchPollRepository matchPollRepository;

    @Autowired
    private PollVoteRepository pollVoteRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private List<ClubMember> getClubLeaders(Long clubId) {
        return clubMemberRepository.findByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED)
                .stream()
                .filter(m -> m.getRole() == ClubMemberRole.ADMIN || m.getRole() == ClubMemberRole.SUB_LEADER)
                .collect(Collectors.toList());
    }

    private void cleanupMemberFromLineupsAndNotify(Club club, User user) {
        if (club == null || user == null) return;
        Long clubId = club.getId();
        Long userId = user.getId();

        try {
            // 1. Check all active lineups of this club
            List<MatchLineup> clubLineups = matchLineupRepository.findByClubIdOrderByCreatedAtDesc(clubId);
            boolean wasInAnyLineup = false;
            List<String> affectedLineupNames = new ArrayList<>();

            for (MatchLineup lineup : clubLineups) {
                if (lineup.getStatus() == LineupStatus.ACTIVE || lineup.getStatus() == LineupStatus.IN_MATCH) {
                    Optional<LineupMember> lmOpt = lineupMemberRepository.findByLineupIdAndUserId(lineup.getId(), userId);
                    if (lmOpt.isPresent()) {
                        wasInAnyLineup = true;
                        affectedLineupNames.add(lineup.getName());
                        lineupMemberRepository.deleteByLineupIdAndUserId(lineup.getId(), userId);

                        // Recalculate average Elo for remaining members
                        List<LineupMember> remainingMembers = lineupMemberRepository.findByLineupId(lineup.getId())
                                .stream()
                                .filter(m -> !m.getUser().getId().equals(userId))
                                .collect(Collectors.toList());

                        if (remainingMembers.isEmpty()) {
                            lineup.setEloAvg(0);
                        } else {
                            int totalElo = remainingMembers.stream()
                                    .mapToInt(m -> m.getUserEloSnapshot() != null ? m.getUserEloSnapshot() : 1000)
                                    .sum();
                            lineup.setEloAvg(totalElo / remainingMembers.size());
                        }
                        matchLineupRepository.save(lineup);
                    }
                }
            }

            // 2. Clean up from active poll votes in this club
            List<MatchPoll> activePolls = matchPollRepository.findByClubIdAndStatusOrderByCreatedAtDesc(clubId, PollStatus.OPEN);
            for (MatchPoll poll : activePolls) {
                pollVoteRepository.deleteByPollIdAndUserId(poll.getId(), userId);
            }

            // 3. If the member was in active lineup(s), immediately alert all club leaders (ADMIN & SUB_LEADER)
            if (wasInAnyLineup) {
                String lineupStr = String.join(", ", affectedLineupNames);
                List<ClubMember> leaders = getClubLeaders(clubId);
                for (ClubMember leader : leaders) {
                    if (leader.getUser() != null && !leader.getUser().getId().equals(userId)) {
                        notificationService.createNotification(
                                leader.getUser().getId(),
                                leader.getUser().getRole(),
                                "Cảnh báo đội hình thi đấu",
                                "Thành viên " + user.getFullName() + " (đang trong đội hình " + lineupStr + ") vừa rời khỏi hoặc bị xóa khỏi CLB " + club.getName() + ". Vui lòng kiểm tra và sắp xếp lại đội hình!",
                                NotificationType.CLUB_MEMBER_LEFT_LINEUP,
                                String.valueOf(clubId),
                                user.getId(),
                                user.getAvatarUrl()
                        );
                    }
                }
            }
        } catch (Exception e) {
            // Log error without blocking transaction
        }
    }

    @Override
    @Transactional
    public ClubMemberResponse joinClub(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        long currentMembersCount = clubMemberRepository.countByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED);
        if (currentMembersCount >= club.getMaxMembers()) {
            throw new RuntimeException("Câu lạc bộ đã đạt số lượng thành viên tối đa");
        }

        // Check Elo requirement if club has minEloRequired > 0 (Must have VERIFIED Elo)
        if (club.getMinEloRequired() != null && club.getMinEloRequired() > 0) {
            Long sportId = club.getSport() != null ? club.getSport().getId() : null;
            Optional<UserSport> usOpt = sportId != null ? userSportRepository.findByUserIdAndSportId(user.getId(), sportId) : Optional.empty();
            int userElo = usOpt.map(UserSport::getEffectiveElo).orElse(1000);
            com.backend.sporta.enums.EloStatus eloStatus = usOpt.map(UserSport::getEloStatus).orElse(com.backend.sporta.enums.EloStatus.UNVERIFIED);

            if (eloStatus != com.backend.sporta.enums.EloStatus.VERIFIED) {
                throw new RuntimeException("Câu lạc bộ này yêu cầu điểm Elo đã xác minh (VERIFIED qua 5 trận đấu). "
                        + "Trình độ hiện tại của bạn chưa hoàn thành 5 trận đấu xếp hạng/xé vé.");
            }

            if (userElo < club.getMinEloRequired()) {
                throw new RuntimeException(String.format("Bạn cần tối thiểu %d điểm Elo để gia nhập CLB này (Điểm Elo hiện tại của bạn: %d).",
                        club.getMinEloRequired(), userElo));
            }
        }

        Optional<ClubMember> existingMemberOpt = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId());
        if (existingMemberOpt.isPresent()) {
            ClubMember existing = existingMemberOpt.get();
            if (existing.getStatus() == ClubMemberStatus.APPROVED) {
                throw new RuntimeException("Bạn đã là thành viên của câu lạc bộ này rồi");
            } else if (existing.getStatus() == ClubMemberStatus.PENDING) {
                throw new RuntimeException("Yêu cầu gia nhập của bạn đang chờ phê duyệt");
            } else {
                // If previously rejected, allow sending a new request
                existing.setStatus(club.getIsPrivate() ? ClubMemberStatus.PENDING : ClubMemberStatus.APPROVED);
                existing.setRole(ClubMemberRole.MEMBER);
                existing = clubMemberRepository.save(existing);
                return mapToResponse(existing);
            }
        }

        ClubMemberStatus joinStatus = club.getIsPrivate() ? ClubMemberStatus.PENDING : ClubMemberStatus.APPROVED;

        ClubMember newMember = ClubMember.builder()
                .club(club)
                .user(user)
                .role(ClubMemberRole.MEMBER)
                .status(joinStatus)
                .build();

        newMember = clubMemberRepository.save(newMember);

        // Notify leaders if join request is pending
        if (joinStatus == ClubMemberStatus.PENDING) {
            List<ClubMember> leaders = getClubLeaders(clubId);
            for (ClubMember leader : leaders) {
                if (leader.getUser() != null && !leader.getUser().getId().equals(user.getId())) {
                    notificationService.createNotification(
                            leader.getUser().getId(),
                            leader.getUser().getRole(),
                            "Yêu cầu gia nhập CLB mới",
                            user.getFullName() + " đã gửi yêu cầu gia nhập câu lạc bộ " + club.getName() + ".",
                            NotificationType.CLUB_JOIN_REQUEST,
                            String.valueOf(clubId),
                            user.getId(),
                            user.getAvatarUrl()
                    );
                }
            }
        }

        return mapToResponse(newMember);
    }

    @Override
    @Transactional
    public void leaveClub(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (member.getRole() == ClubMemberRole.ADMIN) {
            long totalApproved = clubMemberRepository.countByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED);
            if (totalApproved > 1) {
                throw new RuntimeException("Trưởng câu lạc bộ không thể rời câu lạc bộ khi còn thành viên khác. Vui lòng chuyển nhượng quyền Trưởng câu lạc bộ trước.");
            }
            // Sole member admin leaving will delete the club
            List<ClubMember> allMembers = clubMemberRepository.findByClubId(clubId);
            clubMemberRepository.deleteAll(allMembers);
            clubRepository.delete(club);
            postFeedService.clearFeedCache(user.getId());
            return;
        }

        // Sub-leaders and regular members can freely leave the club
        cleanupMemberFromLineupsAndNotify(club, user);

        // Notify leaders that a member left
        List<ClubMember> leaders = getClubLeaders(clubId);
        for (ClubMember leader : leaders) {
            if (leader.getUser() != null && !leader.getUser().getId().equals(user.getId())) {
                notificationService.createNotification(
                        leader.getUser().getId(),
                        leader.getUser().getRole(),
                        "Thành viên rời CLB",
                        user.getFullName() + " đã rời khỏi câu lạc bộ " + club.getName() + ".",
                        NotificationType.CLUB_MEMBER_LEFT,
                        String.valueOf(clubId),
                        user.getId(),
                        user.getAvatarUrl()
                );
            }
        }

        clubMemberRepository.delete(member);
        postFeedService.clearFeedCache(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubMemberResponse> getClubMembers(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = (userEmail != null && !userEmail.equals("anonymousUser") && !userEmail.isBlank())
                ? userRepository.findByEmail(userEmail).orElse(null)
                : null;

        Optional<ClubMember> callerOpt = (user != null)
                ? clubMemberRepository.findByClubIdAndUserId(clubId, user.getId())
                : Optional.empty();

        // If club is private, only approved members can view the member list
        if (Boolean.TRUE.equals(club.getIsPrivate()) && (callerOpt.isEmpty() || callerOpt.get().getStatus() != ClubMemberStatus.APPROVED)) {
            return Collections.emptyList();
        }

        List<ClubMember> members;
        // If ADMIN or SUB_LEADER, show all members (including PENDING requests to approve)
        if (callerOpt.isPresent() && callerOpt.get().getStatus() == ClubMemberStatus.APPROVED &&
                (callerOpt.get().getRole() == ClubMemberRole.ADMIN || callerOpt.get().getRole() == ClubMemberRole.SUB_LEADER)) {
            members = clubMemberRepository.findByClubId(clubId);
        } else {
            // Regular members and non-members can view all APPROVED members of this club
            members = clubMemberRepository.findByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED);
        }

        return members.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClubMemberResponse approveMember(Long clubId, Long userIdToApprove, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(clubId, caller.getId());

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        long currentMembersCount = clubMemberRepository.countByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED);
        if (currentMembersCount >= club.getMaxMembers()) {
            throw new RuntimeException("Không thể duyệt thêm, câu lạc bộ đã đạt số lượng thành viên tối đa");
        }

        ClubMember memberToApprove = clubMemberRepository.findByClubIdAndUserId(clubId, userIdToApprove)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu gia nhập của người dùng này"));

        if (memberToApprove.getStatus() != ClubMemberStatus.PENDING) {
            throw new RuntimeException("Thành viên này đã được duyệt hoặc từ chối trước đó");
        }

        memberToApprove.setStatus(ClubMemberStatus.APPROVED);
        memberToApprove = clubMemberRepository.save(memberToApprove);
        postFeedService.clearFeedCache(userIdToApprove);

        // Notify member that their join request was accepted
        if (memberToApprove.getUser() != null) {
            notificationService.createNotification(
                    memberToApprove.getUser().getId(),
                    memberToApprove.getUser().getRole(),
                    "Yêu cầu gia nhập CLB được chấp thuận",
                    "Chúc mừng! Yêu cầu gia nhập câu lạc bộ " + club.getName() + " của bạn đã được phê duyệt thành công.",
                    NotificationType.CLUB_JOIN_ACCEPTED,
                    String.valueOf(clubId),
                    caller.getId(),
                    caller.getAvatarUrl()
            );
        }

        return mapToResponse(memberToApprove);
    }

    @Override
    @Transactional
    public ClubMemberResponse rejectMember(Long clubId, Long userIdToReject, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminOrSubLeaderPrivileges(clubId, caller.getId());

        ClubMember memberToReject = clubMemberRepository.findByClubIdAndUserId(clubId, userIdToReject)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu gia nhập của người dùng này"));

        if (memberToReject.getStatus() != ClubMemberStatus.PENDING) {
            throw new RuntimeException("Yêu cầu này không ở trạng thái chờ phê duyệt");
        }

        memberToReject.setStatus(ClubMemberStatus.REJECTED);
        memberToReject = clubMemberRepository.save(memberToReject);

        // Notify member that their join request was rejected
        if (memberToReject.getUser() != null && memberToReject.getClub() != null) {
            notificationService.createNotification(
                    memberToReject.getUser().getId(),
                    memberToReject.getUser().getRole(),
                    "Yêu cầu gia nhập CLB bị từ chối",
                    "Rất tiếc, yêu cầu gia nhập câu lạc bộ " + memberToReject.getClub().getName() + " của bạn đã bị từ chối.",
                    NotificationType.CLUB_JOIN_REJECTED,
                    String.valueOf(clubId),
                    caller.getId(),
                    caller.getAvatarUrl()
            );
        }

        return mapToResponse(memberToReject);
    }

    @Override
    @Transactional
    public void removeMember(Long clubId, Long userIdToRemove, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember callerMember = clubMemberRepository.findByClubIdAndUserId(clubId, caller.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (callerMember.getStatus() != ClubMemberStatus.APPROVED ||
                (callerMember.getRole() != ClubMemberRole.ADMIN && callerMember.getRole() != ClubMemberRole.SUB_LEADER)) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }

        ClubMember memberToRemove = clubMemberRepository.findByClubIdAndUserId(clubId, userIdToRemove)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong câu lạc bộ này"));

        if (memberToRemove.getRole() == ClubMemberRole.ADMIN) {
            throw new RuntimeException("Không thể trục xuất Trưởng câu lạc bộ");
        }

        if (callerMember.getRole() == ClubMemberRole.SUB_LEADER && memberToRemove.getRole() == ClubMemberRole.SUB_LEADER) {
            throw new RuntimeException("Phó câu lạc bộ không thể trục xuất Phó câu lạc bộ khác");
        }

        cleanupMemberFromLineupsAndNotify(callerMember.getClub(), memberToRemove.getUser());

        // Notify the kicked member
        if (memberToRemove.getUser() != null && callerMember.getClub() != null) {
            notificationService.createNotification(
                    memberToRemove.getUser().getId(),
                    memberToRemove.getUser().getRole(),
                    "Bạn đã bị xóa khỏi CLB",
                    "Bạn đã bị xóa khỏi câu lạc bộ " + callerMember.getClub().getName() + " bởi Ban quản trị.",
                    NotificationType.CLUB_MEMBER_KICKED,
                    String.valueOf(clubId),
                    caller.getId(),
                    caller.getAvatarUrl()
            );
        }

        // Notify other leaders
        List<ClubMember> leaders = getClubLeaders(clubId);
        for (ClubMember leader : leaders) {
            if (leader.getUser() != null && !leader.getUser().getId().equals(caller.getId()) && !leader.getUser().getId().equals(userIdToRemove)) {
                notificationService.createNotification(
                        leader.getUser().getId(),
                        leader.getUser().getRole(),
                        "Thành viên bị trục xuất khỏi CLB",
                        memberToRemove.getUser().getFullName() + " đã bị xóa khỏi câu lạc bộ " + callerMember.getClub().getName() + " bởi " + caller.getFullName() + ".",
                        NotificationType.CLUB_MEMBER_KICKED,
                        String.valueOf(clubId),
                        caller.getId(),
                        caller.getAvatarUrl()
                );
            }
        }

        clubMemberRepository.delete(memberToRemove);
        postFeedService.clearFeedCache(userIdToRemove);
    }

    private void checkAdminPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED || member.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Trưởng câu lạc bộ mới có quyền thực hiện hành động này");
        }
    }

    private void checkAdminOrSubLeaderPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED ||
                (member.getRole() != ClubMemberRole.ADMIN && member.getRole() != ClubMemberRole.SUB_LEADER)) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }
    }

    private ClubMemberResponse mapToResponse(ClubMember member) {
        String roleText = "Thành viên";
        if (member.getRole() == ClubMemberRole.ADMIN) {
            roleText = "Trưởng câu lạc bộ";
        } else if (member.getRole() == ClubMemberRole.SUB_LEADER) {
            roleText = "Phó câu lạc bộ";
        }

        // User Elo and verification status
        Integer userElo = 1000;
        com.backend.sporta.enums.EloStatus eloStatus = com.backend.sporta.enums.EloStatus.UNVERIFIED;
        String levelLabel = "TB";

        if (member.getUser() != null && member.getClub() != null && member.getClub().getSport() != null) {
            Optional<UserSport> us = userSportRepository.findByUserIdAndSportId(
                    member.getUser().getId(), member.getClub().getSport().getId());
            if (us.isPresent()) {
                userElo = us.get().getEffectiveElo();
                eloStatus = us.get().getEloStatus() != null ? us.get().getEloStatus() : com.backend.sporta.enums.EloStatus.UNVERIFIED;
                levelLabel = clubEloService.getLevelLabel(userElo);
            }
        }

        String avatar = (member.getUser() != null && member.getUser().getAvatarUrl() != null && !member.getUser().getAvatarUrl().trim().isEmpty())
                ? member.getUser().getAvatarUrl()
                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

        return ClubMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser() != null ? member.getUser().getId() : null)
                .name(member.getUser() != null ? member.getUser().getFullName() : "")
                .role(roleText)
                .elo(userElo)
                .eloStatus(eloStatus)
                .levelLabel(levelLabel)
                .avatar(avatar)
                .status(member.getStatus() != null ? member.getStatus().name() : ClubMemberStatus.APPROVED.name())
                .joinedAt(member.getJoinedAt() != null ? member.getJoinedAt().format(DATE_FORMATTER) : null)
                .build();
    }

    @Override
    @Transactional
    public void transferLeadership(Long clubId, Long newAdminUserId, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember callerMember = clubMemberRepository.findByClubIdAndUserId(clubId, caller.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (callerMember.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Trưởng nhóm mới có quyền chuyển nhượng câu lạc bộ");
        }

        User newAdminUser = userRepository.findById(newAdminUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng được chuyển nhượng"));

        ClubMember newAdminMember = clubMemberRepository.findByClubIdAndUserId(clubId, newAdminUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng được chuyển nhượng không phải thành viên câu lạc bộ"));

        if (newAdminMember.getStatus() != ClubMemberStatus.APPROVED) {
            throw new RuntimeException("Chỉ có thể chuyển nhượng cho thành viên đã được phê duyệt");
        }

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        // Swap roles
        callerMember.setRole(ClubMemberRole.MEMBER);
        newAdminMember.setRole(ClubMemberRole.ADMIN);

        // Update creator of the Club
        club.setCreator(newAdminUser);

        clubMemberRepository.save(callerMember);
        clubMemberRepository.save(newAdminMember);
        clubRepository.save(club);
    }

    @Override
    @Transactional
    public void assignSubLeader(Long clubId, Long userId, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember callerMember = clubMemberRepository.findByClubIdAndUserId(clubId, caller.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (callerMember.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Trưởng nhóm mới có quyền bổ nhiệm Phó nhóm");
        }

        ClubMember memberToAssign = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên trong câu lạc bộ này"));

        if (memberToAssign.getStatus() != ClubMemberStatus.APPROVED) {
            throw new RuntimeException("Chỉ có thể bổ nhiệm thành viên đã được phê duyệt");
        }

        if (memberToAssign.getRole() == ClubMemberRole.SUB_LEADER) {
            throw new RuntimeException("Thành viên này đã là Phó nhóm rồi");
        }

        if (memberToAssign.getRole() == ClubMemberRole.ADMIN) {
            throw new RuntimeException("Không thể bổ nhiệm Trưởng nhóm làm Phó nhóm");
        }

        // Tự động hạ cấp Phó câu lạc bộ cũ về làm Thành viên thường (nếu có)
        List<ClubMember> currentSubLeaders = clubMemberRepository.findByClubIdAndRoleAndStatus(clubId, ClubMemberRole.SUB_LEADER, ClubMemberStatus.APPROVED);
        for (ClubMember currentSub : currentSubLeaders) {
            if (!currentSub.getUser().getId().equals(userId)) {
                currentSub.setRole(ClubMemberRole.MEMBER);
                clubMemberRepository.save(currentSub);
            }
        }

        memberToAssign.setRole(ClubMemberRole.SUB_LEADER);
        clubMemberRepository.save(memberToAssign);
    }

    @Override
    @Transactional
    public void demoteSubLeader(Long clubId, Long userId, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember callerMember = clubMemberRepository.findByClubIdAndUserId(clubId, caller.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (callerMember.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Trưởng nhóm mới có quyền hạ chức Phó nhóm");
        }

        ClubMember memberToDemote = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thành viên trong câu lạc bộ này"));

        if (memberToDemote.getRole() != ClubMemberRole.SUB_LEADER) {
            throw new RuntimeException("Thành viên này không phải là Phó nhóm");
        }

        memberToDemote.setRole(ClubMemberRole.MEMBER);
        clubMemberRepository.save(memberToDemote);
    }
}
