package com.backend.sporta.service;

import com.backend.sporta.dto.UpdateUserProfileRequest;
import com.backend.sporta.dto.UserProfileDto;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserProfileDto getUserProfile(Long userId);
    UserProfileDto updateUserProfile(Long userId, UpdateUserProfileRequest request, MultipartFile avatar);
    void softDeleteAccount(Long userId);
}
