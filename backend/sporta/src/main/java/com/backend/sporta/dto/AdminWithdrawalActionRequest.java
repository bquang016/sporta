package com.backend.sporta.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminWithdrawalActionRequest {

    /** Ghi chú của Admin (bắt buộc khi reject, optional khi approve) */
    private String note;
}
