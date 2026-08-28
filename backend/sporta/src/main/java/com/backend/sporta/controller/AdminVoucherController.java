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
@RequestMapping({"/api/v1/admin/vouchers", "/api/admin/vouchers"})
public class AdminVoucherController {

    @Autowired
    private VoucherService voucherService;

    @PostMapping
    public ResponseEntity<VoucherResponse> createSystemVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(voucherService.createAdminVoucher(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponse> updateSystemVoucher(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateVoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateAdminVoucher(id, request));
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disableSystemVoucher(@PathVariable UUID id) {
        voucherService.disableAdminVoucher(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<Page<VoucherResponse>> getSystemVouchers(
            @RequestParam(required = false) VoucherStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return ResponseEntity.ok(voucherService.getAdminVouchers(status, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getSystemVoucherDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(voucherService.getAdminVoucherDetail(id));
    }
}
