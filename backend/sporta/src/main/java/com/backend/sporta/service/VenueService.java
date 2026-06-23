package com.backend.sporta.service;

import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import java.util.List;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    public List<Venue> getVenuesByOwnerEmail(String email) {
        return venueRepository.findByOwnerUserEmail(email);
    }

    @Transactional
    public Venue createVenue(String name, String location, String description, String email) {
        Owner owner = ownerRepository.findByUserEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin chủ sở hữu", 404));

        Venue venue = Venue.builder()
                .owner(owner)
                .name(name)
                .location(location)
                .description(description)
                .build();

        return venueRepository.save(venue);
    }

    @Transactional
    public Venue updateVenueStatus(UUID id, VenueStatus status, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null || 
            !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        venue.setStatus(status);
        return venueRepository.save(venue);
    }

    @Transactional
    public Venue updateVenue(UUID id, String name, String location, String description, String email) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin cụm sân", 404));

        if (venue.getOwner() == null || venue.getOwner().getUser() == null || 
            !venue.getOwner().getUser().getEmail().equals(email)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa cụm sân này", 403);
        }

        venue.setName(name);
        venue.setLocation(location);
        venue.setDescription(description);
        return venueRepository.save(venue);
    }
}
