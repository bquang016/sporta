package com.backend.sporta.service;

import com.backend.sporta.dto.ClubMemberResponse;
import java.util.List;

public interface ClubMemberService {
    ClubMemberResponse joinClub(Long clubId, String userEmail);
    
    void leaveClub(Long clubId, String userEmail);
    
    List<ClubMemberResponse> getClubMembers(Long clubId, String userEmail);
    
    ClubMemberResponse approveMember(Long clubId, Long userIdToApprove, String userEmail);
    
    ClubMemberResponse rejectMember(Long clubId, Long userIdToReject, String userEmail);
    
    void removeMember(Long clubId, Long userIdToRemove, String userEmail);
    
    void transferLeadership(Long clubId, Long newAdminUserId, String userEmail);

    void assignSubLeader(Long clubId, Long userId, String userEmail);

    void demoteSubLeader(Long clubId, Long userId, String userEmail);

    List<com.backend.sporta.dto.DevClubCandidateResponse> getDevCandidateUsers(Long clubId, String userEmail);

    java.util.Map<String, Object> devAssignMembers(Long clubId, com.backend.sporta.dto.DevAssignClubMembersRequest request, String userEmail);
}
