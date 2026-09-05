package com.backend.sporta.controller;

import com.backend.sporta.dto.UpdateUserProfileRequest;
import com.backend.sporta.dto.UserProfileDto;
import com.backend.sporta.entity.User;
import com.backend.sporta.repository.UserRepository;
import com.backend.sporta.exception.CustomException;
import com.backend.sporta.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        
        UserProfileDto profile = userService.getUserProfile(user.getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping({"/{id}/public", "/{id}"})
    public ResponseEntity<com.backend.sporta.dto.PublicUserProfileResponse> getPublicUserProfile(@PathVariable Long id) {
        com.backend.sporta.dto.PublicUserProfileResponse profile = userService.getPublicUserProfile(id);
        System.out.println("DEBUG PUBLIC PROFILE FOR ID " + id + ": privateMode=" + profile.getPrivateMode());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @RequestPart(value = "data", required = false) String dataStr,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        
        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        if (dataStr != null && !dataStr.isEmpty()) {
            try {
                request = objectMapper.readValue(dataStr, UpdateUserProfileRequest.class);
            } catch (Exception e) {
                System.err.println("Error parsing UpdateUserProfileRequest: " + e.getMessage());
                // Ignore parsing errors and just proceed with empty request
            }
        }
        
        UserProfileDto updatedProfile = userService.updateUserProfile(user.getId(), request, avatar);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/sports-elo")
    public ResponseEntity<java.util.List<com.backend.sporta.dto.UserSportOverviewDto>> getSportsEloOverview() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        java.util.List<com.backend.sporta.dto.UserSportOverviewDto> res = userService.getSportsEloOverview(user.getId());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/sports-elo")
    public ResponseEntity<java.util.List<com.backend.sporta.dto.UserSportOverviewDto>> updateSportLevel(
            @RequestBody com.backend.sporta.dto.UpdateUserSportLevelRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        java.util.List<com.backend.sporta.dto.UserSportOverviewDto> res = userService.updateSportLevel(user.getId(), request);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/ranked-match-history")
    public ResponseEntity<java.util.List<com.backend.sporta.dto.RankedMatchHistoryItemDto>> getRankedMatchHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        java.util.List<com.backend.sporta.dto.RankedMatchHistoryItemDto> res = userService.getRankedMatchHistory(user.getId());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));
        
        userService.softDeleteAccount(user.getId());
        return ResponseEntity.ok().build();
    }
}
