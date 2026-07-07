package com.backend.sporta.controller;

import com.backend.sporta.dto.VenueResponse;
import com.backend.sporta.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/venues")
@CrossOrigin(origins = "*")
public class PublicVenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAllActiveVenues() {
        List<VenueResponse> response = venueService.getAllActiveVenues();
        return ResponseEntity.ok(response);
    }
}
