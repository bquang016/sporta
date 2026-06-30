package com.backend.sporta.controller;

import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.dto.VenueRequest;
import com.backend.sporta.dto.VenueResponse;
import com.backend.sporta.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/venues")
@CrossOrigin(origins = "*")
public class OwnerVenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getOwnerVenues() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<VenueResponse> response = venueService.getVenuesByOwnerEmail(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody VenueRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VenueResponse response = venueService.createVenue(request, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<VenueResponse> updateVenueStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") VenueStatus status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VenueResponse response = venueService.updateVenueStatus(id, status, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(
            @PathVariable("id") UUID id,
            @Valid @RequestBody VenueRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VenueResponse response = venueService.updateVenue(id, request, email);
        return ResponseEntity.ok(response);
    }
}