package com.backend.sporta.service;

import com.backend.sporta.dto.LineupMemberDto;
import com.backend.sporta.dto.LineupResponse;
import com.backend.sporta.dto.SwapLineupMembersRequest;
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
public class LineupServiceImpl implements LineupService {

    @Autowired
    private MatchLineupRepository matchLineupRepository;

    @Autowired
    private LineupMemberRepository lineupMemberRepository;

    @Autowired
    private MatchRoomRepository matchRoomRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

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
    public LineupResponse createLineup(Long clubId, String name, LineupType type, String userEmail) {
        User user = getUserByEmail(userEmail);
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new CustomException("Không tìm thấy CLB", 404));

        if (!isClubAdmin(clubId, user.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền tạo đội hình", 403);
        }

        MatchLineup lineup = MatchLineup.builder()
                .club(club)
                .name(name != null && !name.isBlank() ? name.trim() : "Đội " + (matchLineupRepository.countByClubId(clubId) + 1))
                .lineupType(type != null ? type : LineupType.MATCHMAKING)
                .status(LineupStatus.ACTIVE)
                .eloAvg(0)
                .build();

        lineup = matchLineupRepository.save(lineup);
        return mapToResponse(lineup);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LineupResponse> getClubLineups(Long clubId, String userEmail) {
        List<MatchLineup> lineups = matchLineupRepository.findByClubIdOrderByCreatedAtDesc(clubId);
        return lineups.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LineupResponse getLineupDetail(Long lineupId, String userEmail) {
        MatchLineup lineup = matchLineupRepository.findById(lineupId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đội hình", 404));
        return mapToResponse(lineup);
    }

    @Override
    @Transactional
    public LineupResponse addMember(Long lineupId, Long targetUserId, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        MatchLineup lineup = matchLineupRepository.findById(lineupId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đội hình", 404));

        if (!isClubAdmin(lineup.getClub().getId(), currentUser.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền thêm thành viên", 403);
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng cần thêm", 404));

        // Ràng buộc: Một thành viên không được tham gia cùng lúc ở đội hình ra sân của 2 CLB khác nhau
        lineupConflictValidator.validateNoConflict(targetUserId, lineup);

        // Kiểm tra xem đã có trong đội hình chưa
        Optional<LineupMember> existing = lineupMemberRepository.findByLineupIdAndUserId(lineupId, targetUserId);
        if (existing.isPresent()) {
            throw new CustomException("Thành viên này đã có trong đội hình", 400);
        }

        int elo = getUserEloForClub(targetUserId, lineup.getClub());
        LineupMember member = LineupMember.builder()
                .lineup(lineup)
                .user(targetUser)
                .userEloSnapshot(elo)
                .addedBy(currentUser)
                .build();

        lineupMemberRepository.save(member);
        recalculateEloAvg(lineup);

        return mapToResponse(lineup);
    }

    @Override
    @Transactional
    public LineupResponse removeMember(Long lineupId, Long targetUserId, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        MatchLineup lineup = matchLineupRepository.findById(lineupId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đội hình", 404));

        if (!isClubAdmin(lineup.getClub().getId(), currentUser.getId()) && !currentUser.getId().equals(targetUserId)) {
            throw new CustomException("Bạn không có quyền xoá thành viên này khỏi đội hình", 403);
        }

        lineupMemberRepository.deleteByLineupIdAndUserId(lineupId, targetUserId);
        recalculateEloAvg(lineup);

        return mapToResponse(lineup);
    }

    @Override
    @Transactional
    public void swapMembers(SwapLineupMembersRequest request, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        MatchLineup sourceLineup = matchLineupRepository.findById(request.getSourceLineupId())
                .orElseThrow(() -> new CustomException("Không tìm thấy đội A", 404));
        MatchLineup targetLineup = matchLineupRepository.findById(request.getTargetLineupId())
                .orElseThrow(() -> new CustomException("Không tìm thấy đội B", 404));

        if (!isClubAdmin(sourceLineup.getClub().getId(), currentUser.getId())) {
            throw new CustomException("Chỉ Trưởng hoặc Phó nhóm mới có quyền điều chỉnh đội hình", 403);
        }

        LineupMember memA = lineupMemberRepository.findByLineupIdAndUserId(sourceLineup.getId(), request.getUserIdA())
                .orElseThrow(() -> new CustomException("Không tìm thấy thành viên A trong đội", 404));
        LineupMember memB = lineupMemberRepository.findByLineupIdAndUserId(targetLineup.getId(), request.getUserIdB())
                .orElseThrow(() -> new CustomException("Không tìm thấy thành viên B trong đội", 404));

        // Hoán đổi đội hình
        memA.setLineup(targetLineup);
        memB.setLineup(sourceLineup);

        lineupMemberRepository.save(memA);
        lineupMemberRepository.save(memB);

        recalculateEloAvg(sourceLineup);
        recalculateEloAvg(targetLineup);
    }

    @Override
    @Transactional
    public void disbandLineup(Long lineupId, String userEmail) {
        User currentUser = getUserByEmail(userEmail);
        MatchLineup lineup = matchLineupRepository.findById(lineupId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đội hình", 404));

        if (!isClubAdmin(lineup.getClub().getId(), currentUser.getId())) {
            throw new CustomException("Bạn không có quyền giải tán đội hình này", 403);
        }

        if (lineup.getStatus() == LineupStatus.IN_MATCH) {
            throw new CustomException("Đội hình đang thi đấu trận ghép, không thể giải tán", 400);
        }

        lineup.setStatus(LineupStatus.DISBANDED);
        matchLineupRepository.save(lineup);
    }

    @Override
    @Transactional
    public int recalculateEloAvg(MatchLineup lineup) {
        List<LineupMember> members = lineupMemberRepository.findByLineupId(lineup.getId());
        if (members.isEmpty()) {
            lineup.setEloAvg(0);
            matchLineupRepository.save(lineup);
            return 0;
        }

        int totalElo = 0;
        for (LineupMember lm : members) {
            int elo = lm.getUserEloSnapshot() != null ? lm.getUserEloSnapshot()
                    : getUserEloForClub(lm.getUser().getId(), lineup.getClub());
            totalElo += elo;
        }
        int avg = Math.round((float) totalElo / members.size());
        lineup.setEloAvg(avg);
        matchLineupRepository.save(lineup);
        return avg;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LineupResponse> getAvailableLineupsForMatch(Long clubId, Long sportId, String userEmail) {
        List<MatchLineup> lineups = matchLineupRepository.findByClubIdAndStatusOrderByCreatedAtDesc(clubId, LineupStatus.ACTIVE);
        return lineups.stream()
                .filter(l -> l.getLineupType() == LineupType.MATCHMAKING)
                .filter(l -> l.getMatchRoom() == null) // Chưa gắn vào phòng ghép kèo nào
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void attachLineupToRoom(Long lineupId, UUID roomId, TeamSide teamSide) {
        MatchLineup lineup = matchLineupRepository.findById(lineupId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đội hình", 404));
        MatchRoom room = matchRoomRepository.findById(roomId)
                .orElseThrow(() -> new CustomException("Không tìm thấy phòng ghép trận", 404));

        lineup.setMatchRoom(room);
        lineup.setTeamSide(teamSide);
        lineup.setStatus(LineupStatus.IN_MATCH);
        matchLineupRepository.save(lineup);
    }

    @Override
    @Transactional
    public void detachLineupFromRoom(Long lineupId) {
        Optional<MatchLineup> opt = matchLineupRepository.findById(lineupId);
        if (opt.isPresent()) {
            MatchLineup lineup = opt.get();
            lineup.setMatchRoom(null);
            lineup.setTeamSide(null);
            lineup.setStatus(LineupStatus.ACTIVE);
            matchLineupRepository.save(lineup);
        }
    }

    @Override
    public LineupResponse mapToResponse(MatchLineup lineup) {
        List<LineupMember> members = lineupMemberRepository.findByLineupId(lineup.getId());
        List<LineupMemberDto> memberDtos = members.stream().map(m -> {
            User u = m.getUser();
            return LineupMemberDto.builder()
                    .userId(u.getId())
                    .fullName(u.getFullName())
                    .avatarUrl(u.getAvatarUrl())
                    .elo(m.getUserEloSnapshot() != null ? m.getUserEloSnapshot() : getUserEloForClub(u.getId(), lineup.getClub()))
                    .role(getMemberRole(lineup.getClub().getId(), u.getId()))
                    .addedAt(m.getAddedAt() != null ? m.getAddedAt().format(DATE_FMT) : null)
                    .build();
        }).collect(Collectors.toList());

        return LineupResponse.builder()
                .id(lineup.getId())
                .clubId(lineup.getClub().getId())
                .clubName(lineup.getClub().getName())
                .sourcePollId(lineup.getSourcePoll() != null ? lineup.getSourcePoll().getId() : null)
                .name(lineup.getName())
                .eloAvg(lineup.getEloAvg() != null ? lineup.getEloAvg() : 0)
                .lineupType(lineup.getLineupType())
                .status(lineup.getStatus())
                .matchRoomId(lineup.getMatchRoom() != null ? lineup.getMatchRoom().getId().toString() : null)
                .teamSide(lineup.getTeamSide())
                .members(memberDtos)
                .memberCount(memberDtos.size())
                .createdAt(lineup.getCreatedAt() != null ? lineup.getCreatedAt().format(DATE_FMT) : null)
                .build();
    }
}
