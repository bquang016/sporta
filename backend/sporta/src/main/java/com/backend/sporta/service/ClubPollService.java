package com.backend.sporta.service;

import com.backend.sporta.dto.ClubPollRequest;
import com.backend.sporta.dto.ClubPollResponse;

public interface ClubPollService {
    ClubPollResponse createPoll(Long clubId, ClubPollRequest request, String userEmail);
    
    ClubPollResponse getActivePoll(Long clubId, String userEmail);
    
    ClubPollResponse vote(Long pollId, String option, String userEmail);
    
    ClubPollResponse closePoll(Long pollId, String userEmail);
    
    ClubPollResponse reopenPoll(Long pollId, String userEmail);
    
    ClubPollResponse saveMatchmadeTeams(Long pollId, ClubPollResponse.MatchmadeTeamsResponse request, String userEmail);
    
    void deletePoll(Long pollId, String userEmail);
}
