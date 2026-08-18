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
@RequestMapping("/api/owner/vouchers")
public class OwnerVoucherController {

    @Autowired
    private VoucherService voucherService;

    // Simulate getting owner ID from security context
    private UUID getCurrentOwnerId() {
        // In a real app, you'd extract this from SecurityContextHolder
        // Here we'll just hardcode a dummy UUID or expect it from headers for testing if needed
        // Assuming we have a fixed owner for testing, or we expect it as a request attribute.
        // For now, I'll use a mocked method or throw unsupported if not handled by interceptor.
        // Let's assume we can get it from an attribute set by a JWT filter.
        // Using a dummy ID for the skeleton, you can adjust this to your actual auth flow.
        return UUID.fromString("00000000-0000-0000-0000-000000000001");
    }

    @PostMapping
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody CreateVoucherRequest request, @RequestAttribute("ownerId") UUID ownerId) {
        return ResponseEntity.ok(voucherService.createOwnerVoucher(ownerId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponse> updateVoucher(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateVoucherRequest request,
            @RequestAttribute("ownerId") UUID ownerId) {
        return ResponseEntity.ok(voucherService.updateOwnerVoucher(ownerId, id, request));
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disableVoucher(@PathVariable UUID id, @RequestAttribute("ownerId") UUID ownerId) {
        voucherService.disableOwnerVoucher(ownerId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<VoucherResponse>> getVouchers(
            @RequestParam(required = false) VoucherStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestAttribute("ownerId") UUID ownerId) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return ResponseEntity.ok(voucherService.getOwnerVouchers(ownerId, status, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getVoucherDetail(@PathVariable UUID id, @RequestAttribute("ownerId") UUID ownerId) {
        return ResponseEntity.ok(voucherService.getOwnerVoucherDetail(ownerId, id));
    }
}
