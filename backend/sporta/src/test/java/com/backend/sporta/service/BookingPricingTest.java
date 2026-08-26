package com.backend.sporta.service;

import com.backend.sporta.dto.BookingResponse;
import com.backend.sporta.dto.BookingSlotRequest;
import com.backend.sporta.dto.CreateBookingRequest;
import com.backend.sporta.entity.*;
import com.backend.sporta.enums.PriceRuleType;
import com.backend.sporta.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingPricingTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingDetailRepository bookingDetailRepository;
    @Mock
    private CourtRepository courtRepository;
    @Mock
    private CourtPriceRuleRepository courtPriceRuleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PaymentService paymentService;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private VoucherService voucherService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Tạo booking với sân có CourtPriceRule SHIFT -> Tính đúng customPrice")
    void testCreateBookingWithShiftPriceRule() {
        UUID courtId = UUID.randomUUID();
        UUID venueId = UUID.randomUUID();

        Venue venue = Venue.builder().id(venueId).name("Sân Sporta Test").build();
        Court court = Court.builder().id(courtId).name("Sân 1").price(200000.0).venue(venue).build();
        User user = User.builder().id(100L).email("player@sporta.vn").fullName("Test Player").build();

        when(userRepository.findByEmail("player@sporta.vn")).thenReturn(Optional.of(user));
        when(courtRepository.findById(courtId)).thenReturn(Optional.of(court));
        when(courtRepository.findByIdWithLock(courtId)).thenReturn(Optional.of(court));
        when(bookingDetailRepository.existsConflict(eq(courtId), any(), any())).thenReturn(false);

        // Rule: 17:00 - 21:00 -> 250k
        CourtPriceRule shiftRule = CourtPriceRule.builder()
                .court(court)
                .ruleType(PriceRuleType.SHIFT)
                .startTime(LocalTime.of(17, 0))
                .endTime(LocalTime.of(21, 0))
                .customPrice(250000.0)
                .build();
        when(courtPriceRuleRepository.findByCourtId(courtId)).thenReturn(List.of(shiftRule));

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            if (b.getId() == null) b.setId(UUID.randomUUID());
            return b;
        });

        CreateBookingRequest request = new CreateBookingRequest();
        request.setPaymentMethod("CASH");
        BookingSlotRequest slot = new BookingSlotRequest();
        slot.setCourtId(courtId);
        slot.setBookingDate(LocalDate.of(2026, 8, 26)); // Wednesday
        slot.setStartTime(LocalTime.of(18, 0));
        slot.setEndTime(LocalTime.of(19, 0));
        request.setSlots(List.of(slot));

        BookingResponse response = bookingService.createBooking(request, "player@sporta.vn");

        assertNotNull(response);
        assertEquals(250000.0, response.getTotalPrice(), "Total price must be 250k from SHIFT rule");
        assertEquals(250000.0, response.getFinalPrice(), "Final price must be 250k");
    }
}
