package com.backend.sporta.service;

import com.backend.sporta.dto.LeaderboardResponse;
import java.util.List;

public interface LeaderboardService {
    List<LeaderboardResponse> getLeaderboard(Long sportId, String area, Integer page, Integer size);
    List<LeaderboardResponse> getLeaderboard(Long sportId, String area, Integer page, Integer size, String userEmail);
}
