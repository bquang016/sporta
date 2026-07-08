package com.backend.sporta.service;

import com.backend.sporta.dto.ClubMatchRequest;
import com.backend.sporta.dto.ClubMatchResponse;
import java.util.List;

public interface ClubMatchHistoryService {
    ClubMatchResponse addMatch(Long clubId, ClubMatchRequest request, String userEmail);
    
    List<ClubMatchResponse> getMatches(Long clubId, String userEmail);
}
