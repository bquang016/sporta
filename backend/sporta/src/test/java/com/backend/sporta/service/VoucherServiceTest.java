package com.backend.sporta.service;

import com.backend.sporta.dto.CreateVoucherRequest;
import com.backend.sporta.dto.VoucherResponse;
import com.backend.sporta.entity.Voucher;
import com.backend.sporta.enums.DiscountType;
import com.backend.sporta.enums.VoucherScope;
import com.backend.sporta.enums.VoucherStatus;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.UserVoucherRepository;
import com.backend.sporta.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private UserVoucherRepository userVoucherRepository;

    @InjectMocks
    private VoucherService voucherService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createAdminVoucher_success() {
        CreateVoucherRequest request = new CreateVoucherRequest();
        request.setName("Voucher System");
        request.setCode("SYS50");
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(50.0);
        request.setMinOrderAmount(100000.0);
        request.setStartDate(LocalDateTime.now().plusDays(1));
        request.setEndDate(LocalDateTime.now().plusDays(10));
        request.setTotalQuantity(100);
        request.setBannerImageUrl("http://example.com/banner.jpg");

        Voucher savedVoucher = new Voucher();
        savedVoucher.setId(java.util.UUID.randomUUID());
        savedVoucher.setName("Voucher System");
        savedVoucher.setCode("SYS50");
        savedVoucher.setVoucherScope(VoucherScope.SYSTEM);
        savedVoucher.setStatus(VoucherStatus.ACTIVE);
        savedVoucher.setDiscountType(DiscountType.PERCENTAGE);
        savedVoucher.setDiscountValue(50.0);
        savedVoucher.setTotalQuantity(100);
        savedVoucher.setCollectedQuantity(0);
        savedVoucher.setUsedQuantity(0);
        savedVoucher.setStartDate(LocalDateTime.now().plusDays(1));
        savedVoucher.setEndDate(LocalDateTime.now().plusDays(10));

        when(voucherRepository.existsByCodeIgnoreCase("SYS50")).thenReturn(false);
        when(voucherRepository.save(any(Voucher.class))).thenReturn(savedVoucher);

        VoucherResponse response = voucherService.createAdminVoucher(request);

        assertNotNull(response);
        assertEquals("Voucher System", response.getName());
        assertEquals(VoucherScope.SYSTEM, response.getVoucherScope());
        verify(voucherRepository, times(1)).save(any(Voucher.class));
    }

    @Test
    void createAdminVoucher_fail_duplicateCode() {
        CreateVoucherRequest request = new CreateVoucherRequest();
        request.setCode("SYS50");
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(50.0);
        request.setMinOrderAmount(100000.0);
        request.setStartDate(LocalDateTime.now().plusDays(1));
        request.setEndDate(LocalDateTime.now().plusDays(10));
        request.setTotalQuantity(100);

        when(voucherRepository.existsByCodeIgnoreCase("SYS50")).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class, () -> {
            voucherService.createAdminVoucher(request);
        });

        assertEquals("Mã khuyến mãi đã tồn tại", exception.getMessage());
    }

    @Test
    void validateVoucherRequest_fail_invalidDiscount() {
        CreateVoucherRequest request = new CreateVoucherRequest();
        request.setCode("SYS110");
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(110.0); // Invalid percentage
        request.setStartDate(LocalDateTime.now().plusDays(1));
        request.setEndDate(LocalDateTime.now().plusDays(10));
        request.setTotalQuantity(100);

        CustomException exception = assertThrows(CustomException.class, () -> {
            voucherService.createAdminVoucher(request); // triggers validate internally
        });

        assertEquals("Giá trị giảm phần trăm không được vượt quá 100", exception.getMessage());
    }
}
