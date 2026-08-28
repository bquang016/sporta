package com.backend.sporta.controller;

import com.backend.sporta.dto.LeaderboardResponse;
import com.backend.sporta.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
@CrossOrigin(origins = "*")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String area,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(sportId, area, page, size));
    }
}
