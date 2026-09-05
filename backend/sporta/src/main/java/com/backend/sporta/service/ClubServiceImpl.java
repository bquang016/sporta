package com.backend.sporta.service;

import com.backend.sporta.dto.ClubCreateRequest;
import com.backend.sporta.dto.ClubResponse;
import com.backend.sporta.dto.ClubUpdateRequest;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.Sport;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.SportRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClubServiceImpl implements ClubService {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private com.backend.sporta.service.matchmaking.ClubEloService clubEloService;

    @Override
    @Transactional
    public ClubResponse createClub(ClubCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        if (clubRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên câu lạc bộ đã tồn tại");
        }

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn thể thao"));

        Club club = Club.builder()
                .name(request.getName())
                .description(request.getDescription())
                .avatarImage(request.getAvatarImage())
                .coverImage(request.getCoverImage())
                .isPrivate(request.getIsPrivate() != null && request.getIsPrivate())
                .activityLevel(request.getActivityLevel() != null ? request.getActivityLevel() : "Mới thành lập")
                .area(request.getArea())
                .maxMembers(request.getMaxMembers() != null ? request.getMaxMembers() : 50)
                .minEloRequired(request.getMinEloRequired() != null ? request.getMinEloRequired() : 0)
                .elo(1000)
                .sport(sport)
                .creator(user)
                .build();

        club = clubRepository.save(club);

        // Creator automatically joins as ADMIN
        ClubMember member = ClubMember.builder()
                .club(club)
                .user(user)
                .role(ClubMemberRole.ADMIN)
                .status(ClubMemberStatus.APPROVED)
                .build();

        clubMemberRepository.save(member);

        return mapToResponse(club, user);
    }

    @Override
    @Transactional
    public ClubResponse updateClub(Long clubId, ClubUpdateRequest request, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (member.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Chỉ Trưởng nhóm mới có quyền cập nhật thông tin câu lạc bộ");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty() && !request.getName().trim().equals(club.getName())) {
            String newName = request.getName().trim();
            if (clubRepository.existsByName(newName)) {
                throw new RuntimeException("Tên câu lạc bộ đã tồn tại");
            }
            club.setName(newName);
        }
        if (request.getDescription() != null) club.setDescription(request.getDescription());
        if (request.getAvatarImage() != null) club.setAvatarImage(request.getAvatarImage());
        if (request.getCoverImage() != null) club.setCoverImage(request.getCoverImage());
        if (request.getIsPrivate() != null) club.setIsPrivate(request.getIsPrivate());
        if (request.getActivityLevel() != null) club.setActivityLevel(request.getActivityLevel());
        if (request.getArea() != null) club.setArea(request.getArea());
        if (request.getMaxMembers() != null) club.setMaxMembers(request.getMaxMembers());
        if (request.getMinEloRequired() != null) club.setMinEloRequired(request.getMinEloRequired());
        if (request.getElo() != null) club.setElo(request.getElo());

        club = clubRepository.save(club);
        return mapToResponse(club, user);
    }

    @Override
    @Transactional
    public void deleteClub(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        if (!club.getCreator().getId().equals(user.getId())) {
            throw new RuntimeException("Chỉ Trưởng nhóm sáng lập mới được giải tán câu lạc bộ");
        }

        // Delete all members linked to club
        List<ClubMember> members = clubMemberRepository.findByClubId(clubId);
        clubMemberRepository.deleteAll(members);

        clubRepository.delete(club);
    }

    @Override
    @Transactional(readOnly = true)
    public ClubResponse getClubById(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = (userEmail != null && !userEmail.equals("anonymousUser"))
                ? userRepository.findByEmail(userEmail).orElse(null)
                : null;

        return mapToResponse(club, user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubResponse> getAvailableClubs(Long sportId, String query, String userEmail) {
        User user = (userEmail != null && !userEmail.equals("anonymousUser"))
                ? userRepository.findByEmail(userEmail).orElse(null)
                : null;

        String searchQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        List<Club> clubs;
        if (user == null) {
            if (searchQuery == null) {
                clubs = clubRepository.findAllClubsWithoutQuery(sportId);
            } else {
                clubs = clubRepository.findAllClubsWithQuery(sportId, searchQuery);
            }
            return clubs.stream().map(c -> mapToResponse(c, null)).collect(Collectors.toList());
        } else {
            if (searchQuery == null) {
                clubs = clubRepository.findAvailableClubsWithoutQuery(user.getId(), sportId);
            } else {
                clubs = clubRepository.findAvailableClubsWithQuery(user.getId(), sportId, searchQuery);
            }
            return clubs.stream().map(c -> mapToResponse(c, user)).collect(Collectors.toList());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubResponse> getJoinedClubs(Long sportId, String query, String userEmail) {
        User user = (userEmail != null && !userEmail.equals("anonymousUser"))
                ? userRepository.findByEmail(userEmail).orElse(null)
                : null;

        if (user == null) {
            return Collections.emptyList();
        }

        String searchQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        List<Club> clubs;
        if (searchQuery == null) {
            clubs = clubRepository.findJoinedClubsWithoutQuery(user.getId(), sportId);
        } else {
            clubs = clubRepository.findJoinedClubsWithQuery(user.getId(), sportId, searchQuery);
        }
        return clubs.stream().map(c -> mapToResponse(c, user)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubResponse> getAllClubs(Long sportId, String query, String userEmail) {
        User user = (userEmail != null && !userEmail.equals("anonymousUser"))
                ? userRepository.findByEmail(userEmail).orElse(null)
                : null;

        String searchQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        List<Club> clubs;
        if (searchQuery == null) {
            clubs = clubRepository.findAllClubsWithoutQuery(sportId);
        } else {
            clubs = clubRepository.findAllClubsWithQuery(sportId, searchQuery);
        }
        return clubs.stream().map(c -> mapToResponse(c, user)).collect(Collectors.toList());
    }

    private ClubResponse mapToResponse(Club club, User currentUser) {
        long memberCount = clubMemberRepository.countByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
        
        String userStatus = "NOT_MEMBER";
        if (currentUser != null) {
            Optional<ClubMember> memberOpt = clubMemberRepository.findByClubIdAndUserId(club.getId(), currentUser.getId());
            if (memberOpt.isPresent()) {
                ClubMember m = memberOpt.get();
                if (m.getStatus() == ClubMemberStatus.PENDING) {
                    userStatus = "PENDING";
                } else if (m.getStatus() == ClubMemberStatus.APPROVED) {
                    userStatus = m.getRole().name(); // "ADMIN", "SUB_LEADER", "MEMBER"
                } else {
                    userStatus = "REJECTED";
                }
            }
        }

        String sportIcon = "sports-club";
        if (club.getSport() != null && club.getSport().getName() != null) {
            String sportName = club.getSport().getName().toLowerCase();
            if (sportName.contains("bóng đá")) sportIcon = "sports-soccer";
            else if (sportName.contains("bóng rổ")) sportIcon = "sports-basketball";
            else if (sportName.contains("cầu lông")) sportIcon = "sports-tennis"; // Expo icons use sports-tennis for badminton/tennis
            else if (sportName.contains("pickleball")) sportIcon = "sports-tennis";
        }

        int realClubElo = clubEloService.getClubElo(club);
        String levelLabel = clubEloService.getLevelLabel(realClubElo);

        return ClubResponse.builder()
                .id(club.getId())
                .name(club.getName())
                .description(club.getDescription())
                .avatarImage(club.getAvatarImage())
                .coverImage(club.getCoverImage())
                .isPrivate(club.getIsPrivate())
                .activityLevel(club.getActivityLevel())
                .area(club.getArea())
                .members((int) memberCount)
                .maxMembers(club.getMaxMembers())
                .elo(realClubElo)
                .minEloRequired(club.getMinEloRequired() != null ? club.getMinEloRequired() : 0)
                .averageElo(realClubElo)
                .crp(club.getCrp() != null ? club.getCrp() : 0)
                .rankedWins(club.getRankedWins() != null ? club.getRankedWins() : 0)
                .finalMatches(club.getFinalMatches() != null ? club.getFinalMatches() : 0)
                .levelLabel(levelLabel)
                .sport(club.getSport() != null ? club.getSport().getName() : null)
                .sportId(club.getSport() != null ? club.getSport().getId() : null)
                .sportIcon(sportIcon)
                .creatorId(club.getCreator().getId())
                .creatorName(club.getCreator().getFullName())
                .userStatus(userStatus)
                .build();
    }
}
