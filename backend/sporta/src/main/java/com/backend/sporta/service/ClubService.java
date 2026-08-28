package com.backend.sporta.service;

import com.backend.sporta.dto.ClubCreateRequest;
import com.backend.sporta.dto.ClubResponse;
import com.backend.sporta.dto.ClubUpdateRequest;
import java.util.List;

public interface ClubService {
    ClubResponse createClub(ClubCreateRequest request, String userEmail);
    
    ClubResponse updateClub(Long clubId, ClubUpdateRequest request, String userEmail);
    
    void deleteClub(Long clubId, String userEmail);
    
    ClubResponse getClubById(Long clubId, String userEmail);
    
    List<ClubResponse> getAvailableClubs(Long sportId, String query, String userEmail);
    
    List<ClubResponse> getJoinedClubs(Long sportId, String query, String userEmail);
}
