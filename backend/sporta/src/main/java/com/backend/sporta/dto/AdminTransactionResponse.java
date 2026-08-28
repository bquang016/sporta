package com.backend.sporta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTransactionResponse {
    private String id;
    private String playerName;
    private String playerEmail;
    private String playerPhone;
    private String facilityCluster;
    private String courtName;
    private String sportType;
    private String bookingDate;
    private String bookingSlot;
    private double amount;
    private double commissionAmount;
    private double ownerAmount;
    private double refundAmount;
    private Integer refundRate;
    private String paymentMethod;
    private String status;
    private String createdAt;
    private String reason;
}
