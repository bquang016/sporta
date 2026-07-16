package com.backend.sporta.service;

import com.backend.sporta.dto.UpdateUserProfileRequest;
import com.backend.sporta.dto.UserProfileDto;
import com.backend.sporta.entity.User;
import com.backend.sporta.entity.UserSport;
import com.backend.sporta.dto.UserSportDto;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.repository.UserSportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        return mapToProfileDto(user);
    }

    @Override
    @Transactional
    public UserProfileDto updateUserProfile(Long userId, UpdateUserProfileRequest request, MultipartFile avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }
        
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        
        if (request.getHeight() != null) {
            user.setHeight(request.getHeight());
        }
        
        if (request.getWeight() != null) {
            user.setWeight(request.getWeight());
        }

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = fileStorageService.uploadFile(avatar, "avatar");
            user.setAvatarUrl(avatarUrl);
        }

        user = userRepository.save(user);

        return mapToProfileDto(user);
    }

    private UserProfileDto mapToProfileDto(User user) {
        List<UserSport> userSports = userSportRepository.findByUserId(user.getId());
        List<UserSportDto> sportsDto = userSports.stream().map(us -> {
            return UserSportDto.builder()
                .id(us.getId())
                .sportId(us.getSport().getId())
                .sportName(us.getSport().getName())
                .sportIcon(null)
                .level(us.getLevel())
                .build();
        }).collect(Collectors.toList());

        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .height(user.getHeight())
                .weight(user.getWeight())
                .role(user.getRole())
                .status(user.getStatus())
                .sports(sportsDto)
                .build();
    }
}
