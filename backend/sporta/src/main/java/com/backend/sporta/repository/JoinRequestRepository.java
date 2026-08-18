package com.backend.sporta.repository;

import com.backend.sporta.entity.JoinRequest;
import com.backend.sporta.enums.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JoinRequestRepository extends JpaRepository<JoinRequest, UUID> {

    List<JoinRequest> findByRoomId(UUID roomId);

    List<JoinRequest> findByRoomIdAndStatus(UUID roomId, JoinRequestStatus status);

    Optional<JoinRequest> findByRoomIdAndApplicantClubIdAndStatusIn(UUID roomId, Long applicantClubId, List<JoinRequestStatus> statuses);

    List<JoinRequest> findByApplicantClubIdAndStatus(Long applicantClubId, JoinRequestStatus status);

    List<JoinRequest> findByApplicantClubIdIn(List<Long> applicantClubIds);

    boolean existsByRoomIdAndApplicantClubIdAndStatusIn(UUID roomId, Long applicantClubId, List<JoinRequestStatus> statuses);
}
