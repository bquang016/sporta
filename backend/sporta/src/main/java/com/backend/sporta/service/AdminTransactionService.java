package com.backend.sporta.service;

import com.backend.sporta.dto.AdminTransactionResponse;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.BookingDetail;
import com.backend.sporta.enums.BookingStatus;
import com.backend.sporta.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminTransactionService {

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<AdminTransactionResponse> getAdminTransactions() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<AdminTransactionResponse> list = new ArrayList<>();

        for (Booking b : bookings) {
            String bDate = "N/A";
            String bSlot = "N/A";
            String courtName = "Sân thể thao";

            if (b.getDetails() != null && !b.getDetails().isEmpty()) {
                BookingDetail firstDetail = b.getDetails().get(0);
                if (firstDetail.getBookingDate() != null) {
                    bDate = firstDetail.getBookingDate().toString();
                }
                
                // Gom tên sân
                List<String> courtNames = b.getDetails().stream()
                        .filter(d -> d.getCourt() != null && d.getCourt().getName() != null)
                        .map(d -> d.getCourt().getName())
                        .distinct()
                        .collect(Collectors.toList());
                if (!courtNames.isEmpty()) {
                    courtName = String.join(", ", courtNames);
                }

                // Gom slot giờ
                if (firstDetail.getStartTime() != null && firstDetail.getEndTime() != null) {
                    bSlot = String.format("%s - %s",
                            firstDetail.getStartTime().toString().substring(0, 5),
                            firstDetail.getEndTime().toString().substring(0, 5));
                    if (b.getDetails().size() > 1) {
                        bSlot += " (+" + (b.getDetails().size() - 1) + " ca)";
                    }
                }
            }

            double amount = b.getFinalPrice() != null ? b.getFinalPrice() : (b.getTotalPrice() != null ? b.getTotalPrice() : 0.0);
            double commissionAmount = 0.0;
            double ownerAmount = 0.0;
            double refundAmount = b.getRefundAmount() != null ? b.getRefundAmount().doubleValue() : 0.0;
            Integer refundRate = b.getRefundRate();

            String txStatus = "SUCCESS";
            if (b.getStatus() == BookingStatus.CANCELLED) {
                txStatus = "REFUNDED";
                // Khi hủy đơn, sàn thu 10% hoa hồng trên phần phí phạt không hoàn lại (amount - refundAmount)
                double netRetained = Math.max(0.0, amount - refundAmount);
                commissionAmount = Math.round(netRetained * 0.10);
                ownerAmount = Math.max(0.0, netRetained - commissionAmount);
            } else if (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED) {
                txStatus = "SUCCESS";
                commissionAmount = Math.round(amount * 0.10);
                ownerAmount = amount - commissionAmount;
            } else if (b.getStatus() == BookingStatus.PENDING) {
                txStatus = "FAILED";
            }

            String sportName = "Thể thao";
            if (b.getVenue() != null && b.getVenue().getSport() != null && b.getVenue().getSport().getName() != null) {
                sportName = b.getVenue().getSport().getName();
            }

            String playerName = "Khách đặt sân";
            String playerEmail = "N/A";
            String playerPhone = "N/A";

            if (b.getUser() != null) {
                playerName = b.getUser().getFullName() != null ? b.getUser().getFullName() : "Người dùng";
                playerEmail = b.getUser().getEmail() != null ? b.getUser().getEmail() : "N/A";
                playerPhone = b.getUser().getPhoneNumber() != null ? b.getUser().getPhoneNumber() : "N/A";
            } else if (b.getCustomerName() != null) {
                playerName = b.getCustomerName();
                playerPhone = b.getCustomerPhone() != null ? b.getCustomerPhone() : "N/A";
            }

            String code = b.getBookingCode() != null ? b.getBookingCode() : "TRX-" + b.getId().toString().substring(0, 6).toUpperCase();
            String payMethod = b.getPaymentMethod() != null ? b.getPaymentMethod().toUpperCase() : "PAYOS";

            list.add(AdminTransactionResponse.builder()
                    .id(code)
                    .playerName(playerName)
                    .playerEmail(playerEmail)
                    .playerPhone(playerPhone)
                    .facilityCluster(b.getVenue() != null && b.getVenue().getName() != null ? b.getVenue().getName() : "Cơ sở thể thao")
                    .courtName(courtName)
                    .sportType(sportName)
                    .bookingDate(bDate)
                    .bookingSlot(bSlot)
                    .amount(amount)
                    .commissionAmount(commissionAmount)
                    .ownerAmount(ownerAmount)
                    .refundAmount(refundAmount)
                    .refundRate(refundRate)
                    .paymentMethod(payMethod)
                    .status(txStatus)
                    .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : "")
                    .reason(b.getCancellationReason())
                    .build());
        }

        return list;
    }
}
