package com.backend.sporta.controller;

import com.backend.sporta.dto.OwnerContractDto;
import com.backend.sporta.service.OwnerContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/contracts")
public class OwnerContractController {

    @Autowired
    private OwnerContractService ownerContractService;

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<OwnerContractDto>> getMyContracts(Authentication authentication) {
        String email = authentication.getName();
        List<OwnerContractDto> contracts = ownerContractService.getMyContracts(email);
        return ResponseEntity.ok(contracts);
    }
}
