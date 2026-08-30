package com.backend.sporta.service;

import com.backend.sporta.dto.OwnerProfileDto;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class OwnerProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public OwnerProfileDto getOwnerProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        Owner owner = ownerRepository.findByUserId(user.getId()).orElse(null);

        Venue primaryVenue = null;
        if (owner != null) {
            List<Venue> venues = venueRepository.findByOwnerId(owner.getId());
            if (!venues.isEmpty()) {
                primaryVenue = venues.get(0);
            }
        }

        String openHoursStr = "05:00 - 23:00";
        if (primaryVenue != null && primaryVenue.getOpeningTime() != null && primaryVenue.getClosingTime() != null) {
            openHoursStr = String.format("%s - %s",
                    primaryVenue.getOpeningTime().toString().substring(0, 5),
                    primaryVenue.getClosingTime().toString().substring(0, 5));
        }

        return OwnerProfileDto.builder()
                .name(user.getFullName() != null ? user.getFullName() : (owner != null ? owner.getFullName() : "Chủ sân"))
                .email(user.getEmail())
                .phone(user.getPhoneNumber() != null ? user.getPhoneNumber() : (owner != null ? owner.getPhoneNumber() : ""))
                .role("Chủ sân")
                .venueId(primaryVenue != null ? primaryVenue.getId() : null)
                .facilityName(primaryVenue != null ? primaryVenue.getName() : "Cụm sân Sporta")
                .address(primaryVenue != null ? (primaryVenue.getAddressDetail() != null ? primaryVenue.getAddressDetail() : primaryVenue.getLocation()) : "")
                .openHours(openHoursStr)
                .description(primaryVenue != null && primaryVenue.getDescription() != null ? primaryVenue.getDescription() : "")
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Transactional
    public OwnerProfileDto updateOwnerProfile(String email, OwnerProfileDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            user.setFullName(dto.getName().trim());
        }
        if (dto.getPhone() != null) {
            user.setPhoneNumber(dto.getPhone().trim());
        }
        userRepository.save(user);

        Owner owner = ownerRepository.findByUserId(user.getId()).orElse(null);
        if (owner != null) {
            if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
                owner.setFullName(dto.getName().trim());
            }
            if (dto.getPhone() != null) {
                owner.setPhoneNumber(dto.getPhone().trim());
            }
            ownerRepository.save(owner);
        }

        if (owner != null) {
            List<Venue> venues = venueRepository.findByOwnerId(owner.getId());
            if (!venues.isEmpty()) {
                Venue venue = venues.get(0);
                if (dto.getFacilityName() != null && !dto.getFacilityName().trim().isEmpty()) {
                    venue.setName(dto.getFacilityName().trim());
                }
                if (dto.getAddress() != null) {
                    venue.setAddressDetail(dto.getAddress().trim());
                    venue.setLocation(dto.getAddress().trim());
                }
                if (dto.getDescription() != null) {
                    venue.setDescription(dto.getDescription().trim());
                }
                if (dto.getOpenHours() != null && dto.getOpenHours().contains("-")) {
                    try {
                        String[] parts = dto.getOpenHours().split("-");
                        String open = parts[0].trim();
                        String close = parts[1].trim();
                        if (open.length() == 5) open = open + ":00";
                        if (close.length() == 5) close = close + ":00";
                        venue.setOpeningTime(LocalTime.parse(open));
                        venue.setClosingTime(LocalTime.parse(close));
                    } catch (Exception e) {
                        // Ignore parse error if invalid format
                    }
                }
                venueRepository.save(venue);
            }
        }

        return getOwnerProfile(email);
    }
}
