package com.backend.sporta.dto;

import com.backend.sporta.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateVoucherRequest {

    @NotBlank(message = "Tên mã khuyến mãi không được để trống")
    private String name;

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    @Size(max = 50, message = "Mã khuyến mãi tối đa 50 ký tự")
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @Positive(message = "Giá trị giảm phải lớn hơn 0")
    private Double discountValue;

    /** Giảm tối đa (chỉ áp dụng cho PERCENTAGE, nullable cho FIXED_AMOUNT) */
    private Double maxDiscountAmount;

    /** Giá trị đơn hàng tối thiểu (mặc định 0 nếu không truyền) */
    @Min(value = 0, message = "Đơn tối thiểu không được âm")
    private Double minOrderAmount;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày hết hạn không được để trống")
    private LocalDateTime endDate;

    @NotNull(message = "Số lượng mã không được để trống")
    @Positive(message = "Số lượng mã phải lớn hơn 0")
    private Integer totalQuantity;

    /** Danh sách venue IDs áp dụng (null/empty = tất cả cụm sân của owner, hoặc toàn hệ thống cho admin) */
    private List<UUID> venueIds;

    /** URL ảnh banner (bắt buộc cho admin voucher, nullable cho owner) */
    private String bannerImageUrl;
}
