package com.backend.sporta.controller;

import com.backend.sporta.dto.VenueRequest;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/venues")
@CrossOrigin(origins = "*")
public class OwnerVenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping
    public ResponseEntity<List<Venue>> getOwnerVenues() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Venue> response = venueService.getVenuesByOwnerEmail(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Venue> createVenue(@Valid @RequestBody VenueRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Venue response = venueService.createVenue(
                request.getName(),
                request.getLocation(),
                request.getDescription(),
                email
        );
        return ResponseEntity.ok(response);
    }
}
