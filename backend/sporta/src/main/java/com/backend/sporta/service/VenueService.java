package com.backend.sporta.service;

import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
