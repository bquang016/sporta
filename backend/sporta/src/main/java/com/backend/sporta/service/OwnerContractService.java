package com.backend.sporta.service;

import com.backend.sporta.dto.OwnerContractDto;
import com.backend.sporta.entity.Owner;
import com.backend.sporta.entity.OwnerContract;
import com.backend.sporta.entity.User;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.OwnerContractRepository;
import com.backend.sporta.repository.OwnerRepository;
import com.backend.sporta.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OwnerContractService {

    @Autowired
    private OwnerContractRepository ownerContractRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    public List<OwnerContractDto> getMyContracts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", 404));

        Owner owner = ownerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException("Owner not found", 404));

        List<OwnerContract> contracts = ownerContractRepository.findByOwnerId(owner.getId());

        return contracts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private OwnerContractDto mapToDto(OwnerContract contract) {
        return OwnerContractDto.builder()
                .id(contract.getId())
                .contractCode(contract.getContractCode())
                .venueName(contract.getVenue().getName())
                .digitalSignatureHash(contract.getDigitalSignatureHash())
                .signedIpAddress(contract.getSignedIpAddress())
                .signedAt(contract.getSignedAt())
                .status(contract.getStatus())
                .createdAt(contract.getCreatedAt())
                .ownerFullName(contract.getOwner().getFullName())
                .ownerIdCard(contract.getOwner().getIdNumber())
                .venueAddress(contract.getVenue().getLocation())
                .build();
    }
}
