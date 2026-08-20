package com.backend.sporta.controller;

import com.backend.sporta.dto.CreateVoucherRequest;
import com.backend.sporta.dto.UpdateVoucherRequest;
import com.backend.sporta.dto.VoucherResponse;
import com.backend.sporta.enums.VoucherStatus;
import com.backend.sporta.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner/vouchers")
@CrossOrigin(origins = "*")
public class OwnerVoucherController {

    @Autowired
    private VoucherService voucherService;

    @PostMapping
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(voucherService.createOwnerVoucher(email, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateVoucherRequest request) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(voucherService.updateOwnerVoucher(email, id, request));
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disableVoucher(@PathVariable UUID id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        voucherService.disableOwnerVoucher(email, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<VoucherResponse>> getVouchers(
            @RequestParam(required = false) VoucherStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return ResponseEntity.ok(voucherService.getOwnerVouchers(email, status, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getVoucherDetail(@PathVariable UUID id) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(voucherService.getOwnerVoucherDetail(email, id));
    }
}
