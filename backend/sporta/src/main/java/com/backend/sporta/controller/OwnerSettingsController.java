package com.backend.sporta.controller;

import com.backend.sporta.dto.OwnerSettingsDto;
import com.backend.sporta.service.OwnerSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/owner/settings")
@CrossOrigin(origins = "*")
public class OwnerSettingsController {

    @Autowired
    private OwnerSettingsService ownerSettingsService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerSettingsDto> getOwnerSettings(Authentication authentication) {
        String email = authentication.getName();
        OwnerSettingsDto settings = ownerSettingsService.getOwnerSettings(email);
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerSettingsDto> updateOwnerSettings(
            Authentication authentication,
            @RequestBody OwnerSettingsDto dto) {
        String email = authentication.getName();
        OwnerSettingsDto updated = ownerSettingsService.updateOwnerSettings(email, dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/reset")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OwnerSettingsDto> resetOwnerSettings(Authentication authentication) {
        String email = authentication.getName();
        OwnerSettingsDto reset = ownerSettingsService.resetOwnerSettings(email);
        return ResponseEntity.ok(reset);
    }
}
