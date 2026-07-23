package com.backend.sporta.controller;

import com.backend.sporta.dto.matchmaking.MatchRoomDTO;
import com.backend.sporta.dto.matchmaking.ResolveDisputeRequest;
import com.backend.sporta.service.MatchmakingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/disputes")
@RequiredArgsConstructor
public class AdminDisputeController {

    private final MatchmakingService matchmakingService;

    @PostMapping("/resolve")
    public ResponseEntity<MatchRoomDTO> resolveDispute(@RequestBody ResolveDisputeRequest req) {
        return ResponseEntity.ok(matchmakingService.resolveDispute(req));
    }
}
