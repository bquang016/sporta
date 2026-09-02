package com.backend.sporta.service;

import com.backend.sporta.dto.CreateMatchPollRequest;
import com.backend.sporta.dto.MatchPollResponse;
import com.backend.sporta.dto.VotePollRequest;

import java.util.List;

public interface MatchPollService {

    MatchPollResponse createPoll(Long clubId, CreateMatchPollRequest request, String userEmail);

    List<MatchPollResponse> getClubPolls(Long clubId, String userEmail);

    MatchPollResponse getPollDetail(Long pollId, String userEmail);

    MatchPollResponse votePoll(Long pollId, VotePollRequest request, String userEmail);

    MatchPollResponse closePoll(Long pollId, String userEmail);

    void deletePoll(Long pollId, String userEmail);

    MatchPollResponse addCustomOption(Long pollId, String label, String userEmail);

    MatchPollResponse splitInternalTeams(Long pollId, String userEmail);

    MatchPollResponse formMatchmakingLineup(Long pollId, String userEmail);
}
