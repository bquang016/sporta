package com.backend.sporta.controller;

import com.backend.sporta.dto.OwnerProfileDto;
import com.backend.sporta.service.OwnerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/owner/profile")
@CrossOrigin(origins = "*")
public class OwnerProfileController {

    @Autowired
    private OwnerProfileService ownerProfileService;

    @GetMapping
    public ResponseEntity<OwnerProfileDto> getOwnerProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        OwnerProfileDto profile = ownerProfileService.getOwnerProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<OwnerProfileDto> updateOwnerProfile(@RequestBody OwnerProfileDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        OwnerProfileDto updated = ownerProfileService.updateOwnerProfile(email, dto);
        return ResponseEntity.ok(updated);
    }
}
