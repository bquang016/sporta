package com.backend.sporta.service;

import com.backend.sporta.dto.LineupResponse;
import com.backend.sporta.dto.SwapLineupMembersRequest;
import com.backend.sporta.entity.MatchLineup;
import com.backend.sporta.enums.LineupType;
import com.backend.sporta.enums.TeamSide;

import java.util.List;
import java.util.UUID;

public interface LineupService {

    LineupResponse createLineup(Long clubId, String name, LineupType type, String userEmail);

    List<LineupResponse> getClubLineups(Long clubId, String userEmail);

    LineupResponse getLineupDetail(Long lineupId, String userEmail);

    LineupResponse addMember(Long lineupId, Long userId, String userEmail);

    LineupResponse removeMember(Long lineupId, Long userId, String userEmail);

    void swapMembers(SwapLineupMembersRequest request, String userEmail);

    void disbandLineup(Long lineupId, String userEmail);

    int recalculateEloAvg(MatchLineup lineup);

    List<LineupResponse> getAvailableLineupsForMatch(Long clubId, Long sportId, String userEmail);

    void attachLineupToRoom(Long lineupId, UUID roomId, TeamSide teamSide);

    void detachLineupFromRoom(Long lineupId);

    LineupResponse mapToResponse(MatchLineup lineup);
}
