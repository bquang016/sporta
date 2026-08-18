package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import com.backend.sporta.enums.MatchType;

import java.util.List;
import java.util.UUID;

public interface MatchmakingService {

    List<MatchRoomResponse> getRooms(Long sportId, MatchType matchType, String timeFilter, String levelFilter, String sort, String userEmail);

    List<MatchRoomResponse> getMyMatches(String userEmail);

    MatchRoomResponse createRoom(CreateMatchRoomRequest request, String userEmail);

    MatchRoomResponse getRoomDetail(UUID roomId, String userEmail);

    MatchRoomResponse updateRoom(UUID roomId, UpdateMatchRoomRequest request, String userEmail);

    void cancelRoom(UUID roomId, String userEmail);

    JoinRequestResponse createJoinRequest(UUID roomId, CreateJoinRequestRequest request, String userEmail);

    void withdrawJoinRequest(UUID requestId, String userEmail);

    void rejectJoinRequest(UUID requestId, String userEmail);

    MatchRoomResponse acceptJoinRequest(UUID requestId, String userEmail);

    MatchRoomResponse submitScore(UUID matchId, SubmitScoreRequest request, String userEmail);

    MatchRoomResponse confirmScore(UUID matchId, String userEmail);

    MatchRoomResponse disagreeScore(UUID matchId, OpenDisputeRequest request, String userEmail);

    MatchRoomResponse proposeDraw(UUID matchId, String userEmail);

    MatchRoomResponse acceptDraw(UUID matchId, String userEmail);

    void openDispute(UUID matchId, OpenDisputeRequest request, String userEmail);

    RankingPreviewResponse previewRanking(UUID matchId, String hostScore, String guestScore, String rawScoreDetails);
}
