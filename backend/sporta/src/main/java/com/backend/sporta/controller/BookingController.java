package com.backend.sporta.controller;

import com.backend.sporta.dto.BookingResponse;
import com.backend.sporta.dto.CreateBookingRequest;
import com.backend.sporta.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * POST /api/v1/bookings
     * Tạo đặt sân mới. Yêu cầu JWT của Player.
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        BookingResponse response = bookingService.createBooking(request, email);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/bookings/{id}
     * Lấy chi tiết 1 đơn đặt sân. Chỉ user sở hữu mới được xem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        BookingResponse response = bookingService.getBookingById(id, email);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/bookings/my
     * Lịch sử đặt sân của user đang đăng nhập.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<BookingResponse> response = bookingService.getMyBookings(email);
        return ResponseEntity.ok(response);
    }
}
