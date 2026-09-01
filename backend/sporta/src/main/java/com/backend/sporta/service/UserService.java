package com.backend.sporta.service;

import com.backend.sporta.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface UserService {
    UserProfileDto getUserProfile(Long userId);
    PublicUserProfileResponse getPublicUserProfile(Long userId);
    UserProfileDto updateUserProfile(Long userId, UpdateUserProfileRequest request, MultipartFile avatar);

    List<UserSportOverviewDto> getSportsEloOverview(Long userId);
    List<UserSportOverviewDto> updateSportLevel(Long userId, UpdateUserSportLevelRequest request);
    List<RankedMatchHistoryItemDto> getRankedMatchHistory(Long userId);
}
