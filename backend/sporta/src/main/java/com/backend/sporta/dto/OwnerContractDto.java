package com.backend.sporta.dto;

import com.backend.sporta.enums.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerContractDto {
    private Long id;
    private String contractCode;
    private String venueName;
    private String digitalSignatureHash;
    private String signedIpAddress;
    private LocalDateTime signedAt;
    private ContractStatus status;
    private LocalDateTime createdAt;
    
    // Additional details for frontend rendering
    private String ownerFullName;
    private String ownerIdCard;
    private String venueAddress;
}
