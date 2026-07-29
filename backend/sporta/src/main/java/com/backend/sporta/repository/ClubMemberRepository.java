package com.backend.sporta.repository;

import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.enums.ClubMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    Optional<ClubMember> findFirstByClubIdAndUserId(Long clubId, Long userId);

    default Optional<ClubMember> findByClubIdAndUserId(Long clubId, Long userId) {
        return findFirstByClubIdAndUserId(clubId, userId);
    }

    List<ClubMember> findByClubId(Long clubId);

    List<ClubMember> findByClubIdAndStatus(Long clubId, ClubMemberStatus status);

    long countByClubIdAndStatus(Long clubId, ClubMemberStatus status);

    boolean existsByClubIdAndUserIdAndStatus(Long clubId, Long userId, ClubMemberStatus status);

    long countByClubIdAndRoleAndStatus(Long clubId, com.backend.sporta.enums.ClubMemberRole role, ClubMemberStatus status);

    List<ClubMember> findByClubIdAndRoleAndStatus(Long clubId, com.backend.sporta.enums.ClubMemberRole role, ClubMemberStatus status);
}
