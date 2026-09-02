package com.backend.sporta.dto;

import com.backend.sporta.enums.SportLevel;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketSessionRequest {

    @NotNull(message = "venueId không được để trống")
    private UUID venueId;

    @NotNull(message = "courtId không được để trống")
    private UUID courtId;

    @NotNull(message = "Ngày chơi không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate playDate;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "0.0", message = "Giá vé không được âm")
    private BigDecimal pricePerTicket;

    @NotNull(message = "Số lượng vé tối đa không được để trống")
    @Min(value = 1, message = "Số lượng vé tối đa phải lớn hơn 0")
    private Integer maxSlots;

    @NotNull(message = "Trình độ không được để trống")
    private SportLevel sportLevel;

    private Boolean hasHostTeam;

    private String hostTeamName;

    private SportLevel hostTeamLevel;
}
