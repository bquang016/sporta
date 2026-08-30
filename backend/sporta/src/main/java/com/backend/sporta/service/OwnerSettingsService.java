package com.backend.sporta.service;

import com.backend.sporta.dto.OwnerSettingsDto;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.OwnerSettings;
import com.backend.sporta.entity.User;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.OwnerSettingsRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OwnerSettingsService {

    @Autowired
    private OwnerSettingsRepository ownerSettingsRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public OwnerSettingsDto getOwnerSettings(String email) {
        Owner owner = getOwnerByEmail(email);
        OwnerSettings settings = ownerSettingsRepository.findByOwnerId(owner.getId())
                .orElseGet(() -> createDefaultSettings(owner));

        return mapToDto(settings);
    }

    @Transactional
    public OwnerSettingsDto updateOwnerSettings(String email, OwnerSettingsDto dto) {
        Owner owner = getOwnerByEmail(email);
        OwnerSettings settings = ownerSettingsRepository.findByOwnerId(owner.getId())
                .orElseGet(() -> createDefaultSettings(owner));

        if (dto.getNotifyNewBooking() != null) {
            settings.setNotifyNewBooking(dto.getNotifyNewBooking());
        }
        if (dto.getNotifyCancellation() != null) {
            settings.setNotifyCancellation(dto.getNotifyCancellation());
        }
        if (dto.getNotifyOnScan() != null) {
            settings.setNotifyOnScan(dto.getNotifyOnScan());
        }
        if (dto.getDailyRevenueReport() != null) {
            settings.setDailyRevenueReport(dto.getDailyRevenueReport());
        }
        if (dto.getRequireOtpWithdrawal() != null) {
            settings.setRequireOtpWithdrawal(dto.getRequireOtpWithdrawal());
        }
        if (dto.getSessionTimeoutMinutes() != null) {
            settings.setSessionTimeoutMinutes(dto.getSessionTimeoutMinutes());
        }
        if (dto.getDefaultBookingView() != null) {
            settings.setDefaultBookingView(dto.getDefaultBookingView());
        }

        OwnerSettings saved = ownerSettingsRepository.save(settings);
        return mapToDto(saved);
    }

    @Transactional
    public OwnerSettingsDto resetOwnerSettings(String email) {
        Owner owner = getOwnerByEmail(email);
        OwnerSettings settings = ownerSettingsRepository.findByOwnerId(owner.getId())
                .orElseGet(() -> createDefaultSettings(owner));

        settings.setNotifyNewBooking(true);
        settings.setNotifyCancellation(true);
        settings.setNotifyOnScan(true);
        settings.setDailyRevenueReport(true);
        settings.setRequireOtpWithdrawal(false);
        settings.setSessionTimeoutMinutes(30);
        settings.setDefaultBookingView("grid");

        OwnerSettings saved = ownerSettingsRepository.save(settings);
        return mapToDto(saved);
    }

    private Owner getOwnerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found: " + email, 404));

        return ownerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException("Owner profile not found for user: " + email, 404));
    }

    private OwnerSettings createDefaultSettings(Owner owner) {
        OwnerSettings defaultSettings = OwnerSettings.builder()
                .owner(owner)
                .notifyNewBooking(true)
                .notifyCancellation(true)
                .notifyOnScan(true)
                .dailyRevenueReport(true)
                .requireOtpWithdrawal(false)
                .sessionTimeoutMinutes(30)
                .defaultBookingView("grid")
                .build();
        return ownerSettingsRepository.save(defaultSettings);
    }

    private OwnerSettingsDto mapToDto(OwnerSettings s) {
        return OwnerSettingsDto.builder()
                .notifyNewBooking(s.getNotifyNewBooking() != null ? s.getNotifyNewBooking() : true)
                .notifyCancellation(s.getNotifyCancellation() != null ? s.getNotifyCancellation() : true)
                .notifyOnScan(s.getNotifyOnScan() != null ? s.getNotifyOnScan() : true)
                .dailyRevenueReport(s.getDailyRevenueReport() != null ? s.getDailyRevenueReport() : true)
                .requireOtpWithdrawal(s.getRequireOtpWithdrawal() != null ? s.getRequireOtpWithdrawal() : false)
                .sessionTimeoutMinutes(s.getSessionTimeoutMinutes() != null ? s.getSessionTimeoutMinutes() : 30)
                .defaultBookingView(s.getDefaultBookingView() != null ? s.getDefaultBookingView() : "grid")
                .build();
    }
}
