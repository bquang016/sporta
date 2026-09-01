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
import com.backend.sporta.dto.PublicUserProfileResponse;
import com.backend.sporta.entity.Booking;
import com.backend.sporta.entity.ClubMember;
import com.backend.sporta.enums.ClubMemberStatus;
import com.backend.sporta.repository.BookingRepository;
import com.backend.sporta.repository.ClubMemberRepository;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSportRepository userSportRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ClubMemberRepository clubMemberRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        return mapToProfileDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", 404));

        // 1. Calculate booking statistics by sport
        List<Booking> userBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int totalBookings = userBookings != null ? userBookings.size() : 0;

        Map<Long, PublicUserProfileResponse.SportBookingStatDto> sportStatsMap = new HashMap<>();

        if (userBookings != null) {
            for (Booking booking : userBookings) {
                if (booking.getVenue() != null && booking.getVenue().getSport() != null) {
                    var sport = booking.getVenue().getSport();
                    sportStatsMap.putIfAbsent(sport.getId(), PublicUserProfileResponse.SportBookingStatDto.builder()
                            .sportId(sport.getId())
                            .sportName(sport.getName())
                            .sportIcon(null)
                            .bookingCount(0)
                            .percentage(0)
                            .build());

                    var stat = sportStatsMap.get(sport.getId());
                    stat.setBookingCount(stat.getBookingCount() + 1);
                }
            }
        }

        // Also add user sports registered if they don't have bookings yet
        List<UserSport> userSports = userSportRepository.findByUserId(userId);
        if (userSports != null) {
            for (UserSport us : userSports) {
                if (us.getSport() != null && !sportStatsMap.containsKey(us.getSport().getId())) {
                    sportStatsMap.put(us.getSport().getId(), PublicUserProfileResponse.SportBookingStatDto.builder()
                            .sportId(us.getSport().getId())
                            .sportName(us.getSport().getName())
                            .sportIcon(null)
                            .bookingCount(0)
                            .percentage(0)
                            .build());
                }
            }
        }

        List<PublicUserProfileResponse.SportBookingStatDto> sportsList = new ArrayList<>(sportStatsMap.values());
        if (totalBookings > 0) {
            for (var stat : sportsList) {
                int pct = (int) Math.round(((double) stat.getBookingCount() / totalBookings) * 100);
                stat.setPercentage(pct);
            }
        }
        sportsList.sort((a, b) -> Integer.compare(b.getBookingCount(), a.getBookingCount()));

        // 2. Fetch Joined Clubs
        List<ClubMember> clubMembers = clubMemberRepository.findByUserId(userId);
        List<PublicUserProfileResponse.UserClubSummaryDto> joinedClubs = new ArrayList<>();
        if (clubMembers != null) {
            for (ClubMember member : clubMembers) {
                if (member.getStatus() == ClubMemberStatus.APPROVED && member.getClub() != null) {
                    var club = member.getClub();
                    long memberCount = clubMemberRepository.countByClubIdAndStatus(club.getId(), ClubMemberStatus.APPROVED);
                    joinedClubs.add(PublicUserProfileResponse.UserClubSummaryDto.builder()
                            .clubId(club.getId())
                            .clubName(club.getName())
                            .avatarImage(club.getAvatarImage())
                            .coverImage(club.getCoverImage())
                            .sportName(club.getSport() != null ? club.getSport().getName() : null)
                            .role(member.getRole() != null ? member.getRole().name() : "MEMBER")
                            .membersCount((int) memberCount)
                            .elo(club.getElo() != null ? club.getElo() : 1200)
                            .build());
                }
            }
        }

        // 3. User joined year
        int joinedYear = user.getCreatedAt() != null ? user.getCreatedAt().getYear() : 2025;

        return PublicUserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .height(user.getHeight())
                .weight(user.getWeight())
                .joinedYear(joinedYear)
                .role(user.getRole() != null ? user.getRole().name() : "PLAYER")
                .totalBookings(totalBookings)
                .reputationScore(100)
                .sports(sportsList)
                .joinedClubs(joinedClubs)
                .build();
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
        
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            try {
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth().trim()));
            } catch (Exception e) {
                // Ignore parse error
            }
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
