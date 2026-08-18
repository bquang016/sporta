package com.backend.sporta.scheduler;

import com.backend.sporta.entity.UserVoucher;
import com.backend.sporta.entity.Voucher;
import com.backend.sporta.enums.UserVoucherStatus;
import com.backend.sporta.enums.VoucherStatus;
import com.backend.sporta.repository.UserVoucherRepository;
import com.backend.sporta.repository.VoucherRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class VoucherExpiryScheduler {

    private static final Logger logger = LoggerFactory.getLogger(VoucherExpiryScheduler.class);

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    /**
     * Chạy mỗi giờ một lần (ví dụ phút thứ 0 của mỗi giờ)
     * Cron: 0 0 * * * *
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireVouchers() {
        logger.info("Running VoucherExpiryScheduler at {}", LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();
        List<Voucher> expiredVouchers = voucherRepository.findExpiredActiveVouchers(now);

        if (expiredVouchers.isEmpty()) {
            logger.info("No vouchers to expire");
            return;
        }

        logger.info("Found {} vouchers to expire", expiredVouchers.size());

        for (Voucher voucher : expiredVouchers) {
            // Update voucher status to EXPIRED
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);

            // Cascade update to UserVouchers with status COLLECTED
            List<UserVoucher> collectedUserVouchers = userVoucherRepository.findCollectedByVoucherId(voucher.getId());
            for (UserVoucher uv : collectedUserVouchers) {
                uv.setStatus(UserVoucherStatus.EXPIRED);
            }
            userVoucherRepository.saveAll(collectedUserVouchers);
            
            logger.info("Expired voucher {} and {} collected user vouchers", voucher.getCode(), collectedUserVouchers.size());
        }
    }
}
