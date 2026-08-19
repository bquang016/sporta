package com.backend.sporta.service;

import com.backend.sporta.dto.ClubMemberResponse;
import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.entity.User;
import com.backend.sporta.enums.ClubMemberRole;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.repository.ClubMemberRepository;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
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

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional
    public ClubMemberResponse joinClub(Long clubId, String userEmail) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

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

        long currentMembersCount = clubMemberRepository.countByClubIdAndStatus(clubId, ClubMemberStatus.APPROVED);
        if (currentMembersCount >= club.getMaxMembers()) {
            throw new RuntimeException("Câu lạc bộ đã đạt số lượng thành viên tối đa");
        }

        ClubMemberStatus joinStatus = club.getIsPrivate() ? ClubMemberStatus.PENDING : ClubMemberStatus.APPROVED;

        ClubMember newMember = ClubMember.builder()
                .club(club)
                .user(user)
                .role(ClubMemberRole.MEMBER)
                .status(joinStatus)
                .build();

        newMember = clubMemberRepository.save(newMember);
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
            throw new RuntimeException("Trưởng câu lạc bộ không thể rời câu lạc bộ khi còn thành viên khác. Vui lòng chuyển nhượng quyền Trưởng câu lạc bộ cho thành viên khác trước.");
        }

        clubMemberRepository.delete(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubMemberResponse> getClubMembers(Long clubId, String userEmail) {
        clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu lạc bộ"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        Optional<ClubMember> callerOpt = clubMemberRepository.findByClubIdAndUserId(clubId, user.getId());

        List<ClubMember> members;
        // If ADMIN (Trưởng câu lạc bộ), show all members (including PENDING requests to approve)
        if (callerOpt.isPresent() && callerOpt.get().getStatus() == ClubMemberStatus.APPROVED && callerOpt.get().getRole() == ClubMemberRole.ADMIN) {
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

        checkAdminPrivileges(clubId, caller.getId());

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

        return mapToResponse(memberToApprove);
    }

    @Override
    @Transactional
    public ClubMemberResponse rejectMember(Long clubId, Long userIdToReject, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        checkAdminPrivileges(clubId, caller.getId());

        ClubMember memberToReject = clubMemberRepository.findByClubIdAndUserId(clubId, userIdToReject)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu gia nhập của người dùng này"));

        if (memberToReject.getStatus() != ClubMemberStatus.PENDING) {
            throw new RuntimeException("Yêu cầu này không ở trạng thái chờ phê duyệt");
        }

        memberToReject.setStatus(ClubMemberStatus.REJECTED);
        memberToReject = clubMemberRepository.save(memberToReject);

        return mapToResponse(memberToReject);
    }

    @Override
    @Transactional
    public void removeMember(Long clubId, Long userIdToRemove, String userEmail) {
        User caller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));

        ClubMember callerMember = clubMemberRepository.findByClubIdAndUserId(clubId, caller.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));

        if (callerMember.getStatus() != ClubMemberStatus.APPROVED || callerMember.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }

        ClubMember memberToRemove = clubMemberRepository.findByClubIdAndUserId(clubId, userIdToRemove)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong câu lạc bộ này"));

        if (memberToRemove.getRole() == ClubMemberRole.ADMIN) {
            throw new RuntimeException("Không thể trục xuất Trưởng nhóm sáng lập");
        }

        clubMemberRepository.delete(memberToRemove);
    }

    private void checkAdminPrivileges(Long clubId, Long userId) {
        ClubMember member = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải thành viên câu lạc bộ này"));
        if (member.getStatus() != ClubMemberStatus.APPROVED || member.getRole() != ClubMemberRole.ADMIN) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }
    }

    private ClubMemberResponse mapToResponse(ClubMember member) {
        String roleText = (member.getRole() == ClubMemberRole.ADMIN) ? "Trưởng câu lạc bộ" : "Thành viên";

        // Elo default logic for users
        Integer userElo = 1200; // Mock ELO as user profile currently has no ELO field, 1200 is default ELO.

        return ClubMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .name(member.getUser().getFullName())
                .role(roleText)
                .elo(userElo)
                .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80") // default placeholder avatar if null
                .status(member.getStatus().name())
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
