package com.backend.sporta.service.ai;

import com.backend.sporta.entity.Club;
import com.backend.sporta.entity.MatchRoom;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.MatchStatus;
import com.backend.sporta.enums.MatchType;
import com.backend.sporta.enums.VenueStatus;
import com.backend.sporta.repository.ClubRepository;
import com.backend.sporta.repository.MatchRoomRepository;
import com.backend.sporta.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotToolExecutor {

    private final VenueRepository venueRepository;
    private final MatchRoomRepository matchRoomRepository;
    private final ClubRepository clubRepository;

    public Map<String, Object> executeTool(String name, Map<String, Object> args) {
        log.info("Executing tool: {} with args: {}", name, args);
        try {
            switch (name) {
                case "search_venues":
                    return searchVenues(args);
                case "check_slot_availability":
                    return checkSlotAvailability(args);
                case "create_booking_draft":
                    return createBookingDraft(args);
                case "find_match_partners":
                    return findMatchPartners(args);
                default:
                    return Map.of("error", "Unknown tool: " + name);
            }
        } catch (Exception e) {
            log.error("Error executing tool {}", name, e);
            return Map.of("error", "Error executing tool: " + e.getMessage());
        }
    }

    private Map<String, Object> searchVenues(Map<String, Object> args) {
        String sportArg = args.get("sport") != null ? args.get("sport").toString().toLowerCase() : "";
        String areaArg = args.get("area") != null ? args.get("area").toString().toLowerCase() : "";
        Double maxPrice = null;
        if (args.get("max_price") != null) {
            try {
                maxPrice = Double.parseDouble(args.get("max_price").toString());
            } catch (NumberFormatException ignored) {}
        }

        List<Venue> allVenues = venueRepository.findByStatusAndApprovalStatus(VenueStatus.ACTIVE, ApprovalStatus.APPROVED);
        List<Map<String, Object>> resultList = new ArrayList<>();

        String normalizedSport = removeAccents(sportArg);
        String normalizedArea = removeAccents(areaArg);

        for (Venue v : allVenues) {
            boolean matchSport = true;
            if (!normalizedSport.isEmpty()) {
                String venueSport = v.getSport() != null && v.getSport().getName() != null ? v.getSport().getName() : "";
                String venueSportTypes = v.getSportTypes() != null ? v.getSportTypes() : "";
                String venueName = v.getName() != null ? v.getName() : "";
                
                String combinedSportText = removeAccents(venueSport + " " + venueSportTypes + " " + venueName);
                matchSport = combinedSportText.contains(normalizedSport);
            }

            boolean matchArea = true;
            if (!normalizedArea.isEmpty()) {
                String venueDistrict = v.getDistrict() != null ? v.getDistrict() : "";
                String venueProvince = v.getProvince() != null ? v.getProvince() : "";
                String venueLocation = v.getLocation() != null ? v.getLocation() : "";
                String venueAddress = v.getAddressDetail() != null ? v.getAddressDetail() : "";
                String venueName = v.getName() != null ? v.getName() : "";

                String combinedAreaText = removeAccents(venueDistrict + " " + venueProvince + " " + venueLocation + " " + venueAddress + " " + venueName);
                matchArea = combinedAreaText.contains(normalizedArea);
            }

            boolean matchPrice = true;
            if (maxPrice != null && maxPrice > 0) {
                matchPrice = v.getMinPrice() <= maxPrice;
            }

            if (matchSport && matchArea && matchPrice) {
                String imageUrl = v.getCoverImage();
                if (imageUrl == null || imageUrl.isBlank()) {
                    if (v.getRegistrationImages() != null && !v.getRegistrationImages().isBlank()) {
                        imageUrl = v.getRegistrationImages().split(",")[0].trim();
                    } else {
                        imageUrl = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80";
                    }
                }

                String subtitle = "";
                if (v.getDistrict() != null && !v.getDistrict().isBlank()) {
                    subtitle = v.getDistrict();
                    if (v.getProvince() != null && !v.getProvince().isBlank()) {
                        subtitle += ", " + v.getProvince();
                    }
                } else if (v.getLocation() != null) {
                    subtitle = v.getLocation();
                }

                Map<String, Object> map = new HashMap<>();
                map.put("id", v.getId().toString());
                map.put("name", v.getName());
                map.put("price", v.getMinPrice());
                map.put("rating", v.getAverageRating() != null && v.getAverageRating() > 0 ? v.getAverageRating() : null);
                map.put("total_reviews", v.getTotalReviews() != null ? v.getTotalReviews() : 0);
                map.put("image", imageUrl);
                map.put("subtitle", subtitle);
                map.put("district", v.getDistrict() != null ? v.getDistrict() : "");
                map.put("province", v.getProvince() != null ? v.getProvince() : "");
                map.put("open_hours", (v.getOpeningTime() != null ? v.getOpeningTime().toString() : "06:00") + " - " +
                                      (v.getClosingTime() != null ? v.getClosingTime().toString() : "23:00"));
                resultList.add(map);
            }
        }

        // Limit to max 5 venues to prevent token bloat
        List<Map<String, Object>> limitedList = resultList.stream().limit(5).collect(Collectors.toList());
        return Map.of("venues", limitedList, "total_found", resultList.size());
    }

    private Map<String, Object> checkSlotAvailability(Map<String, Object> args) {
        String venueId = args.get("venue_id") != null ? args.get("venue_id").toString() : "";
        String date = args.get("date") != null ? args.get("date").toString() : "hôm nay";
        String timeSlot = args.get("time_slot") != null ? args.get("time_slot").toString() : "09:00 - 10:00";

        return Map.of(
            "venue_id", venueId,
            "date", date,
            "status", "available",
            "available_slots", List.of("08:00 - 09:00", "09:00 - 10:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00")
        );
    }

    private Map<String, Object> createBookingDraft(Map<String, Object> args) {
        String draftId = "draft-" + UUID.randomUUID().toString().substring(0, 8);
        return Map.of(
            "draft_id", draftId,
            "status", "draft_created",
            "message", "Bản nháp đặt sân đã sẵn sàng để xác nhận"
        );
    }

    private Map<String, Object> findMatchPartners(Map<String, Object> args) {
        String sportArg = args.get("sport") != null ? args.get("sport").toString().toLowerCase() : "";
        String areaArg = args.get("area") != null ? args.get("area").toString().toLowerCase() : "";
        String levelArg = args.get("level") != null ? args.get("level").toString().toLowerCase() : "";

        String normalizedSport = removeAccents(sportArg);
        String normalizedArea = removeAccents(areaArg);

        List<Map<String, Object>> resultList = new ArrayList<>();

        // 1. Search OPEN/PENDING Match Rooms from MatchRoomRepository
        try {
            List<MatchRoom> allRooms = matchRoomRepository.findAll();
            for (MatchRoom room : allRooms) {
                if (room.getStatus() != MatchStatus.OPEN) {
                    continue;
                }

                boolean matchSport = true;
                if (!normalizedSport.isEmpty()) {
                    String hostSport = room.getHostClub() != null && room.getHostClub().getSport() != null 
                            ? room.getHostClub().getSport().getName() : "";
                    String venueSport = room.getBooking() != null && room.getBooking().getVenue() != null && room.getBooking().getVenue().getSport() != null
                            ? room.getBooking().getVenue().getSport().getName() : "";
                    String combinedSport = removeAccents(hostSport + " " + venueSport);
                    matchSport = combinedSport.contains(normalizedSport);
                }

                boolean matchArea = true;
                if (!normalizedArea.isEmpty()) {
                    String venueDistrict = room.getBooking() != null && room.getBooking().getVenue() != null 
                            ? room.getBooking().getVenue().getDistrict() : "";
                    String venueLocation = room.getBooking() != null && room.getBooking().getVenue() != null 
                            ? room.getBooking().getVenue().getLocation() : "";
                    String clubArea = room.getHostClub() != null ? room.getHostClub().getArea() : "";
                    
                    String combinedArea = removeAccents(venueDistrict + " " + venueLocation + " " + clubArea);
                    matchArea = combinedArea.contains(normalizedArea);
                }

                if (matchSport && matchArea) {
                    String hostName = room.getHostClub() != null ? room.getHostClub().getName() : "CLB Sporta";
                    String venueName = room.getBooking() != null && room.getBooking().getVenue() != null 
                            ? room.getBooking().getVenue().getName() : "Sân thể thao";
                    String district = room.getBooking() != null && room.getBooking().getVenue() != null && room.getBooking().getVenue().getDistrict() != null
                            ? room.getBooking().getVenue().getDistrict() : "Hà Nội";
                    
                    String matchTypeStr = room.getMatchType() == MatchType.RANKED ? "Xếp hạng Elo" : "Giao hữu";
                    String title = hostName + " (" + matchTypeStr + ")";
                    String subtitle = venueName + " • " + district;
                    
                    if (room.getDesiredLevels() != null && !room.getDesiredLevels().isBlank()) {
                        subtitle += " • Trình độ: " + room.getDesiredLevels();
                    }

                    String imageUrl = null;
                    if (room.getHostClub() != null && room.getHostClub().getAvatarImage() != null && !room.getHostClub().getAvatarImage().isBlank()) {
                        imageUrl = room.getHostClub().getAvatarImage();
                    } else if (room.getBooking() != null && room.getBooking().getVenue() != null) {
                        imageUrl = room.getBooking().getVenue().getCoverImage();
                    }

                    Map<String, Object> item = new HashMap<>();
                    item.put("id", room.getId().toString());
                    item.put("name", title);
                    item.put("type", "match_room");
                    item.put("subtitle", subtitle);
                    item.put("price", room.getGuestShareAmount() != null ? room.getGuestShareAmount() : 0.0);
                    item.put("image", imageUrl);
                    item.put("action_text", "Ghép kèo ngay");
                    resultList.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error finding match rooms in tool executor", e);
        }

        // 2. Search matching Clubs from ClubRepository
        try {
            List<Club> allClubs = clubRepository.findAll();
            for (Club club : allClubs) {
                boolean matchSport = true;
                if (!normalizedSport.isEmpty()) {
                    String clubSport = club.getSport() != null ? club.getSport().getName() : "";
                    matchSport = removeAccents(clubSport).contains(normalizedSport);
                }

                boolean matchArea = true;
                if (!normalizedArea.isEmpty()) {
                    String clubArea = club.getArea() != null ? club.getArea() : "";
                    matchArea = removeAccents(clubArea).contains(normalizedArea);
                }

                if (matchSport && matchArea) {
                    String areaStr = club.getArea() != null ? club.getArea() : "Hà Nội";
                    String levelStr = club.getActivityLevel() != null ? club.getActivityLevel() : "Phong trào";

                    Map<String, Object> item = new HashMap<>();
                    item.put("id", club.getId().toString());
                    item.put("name", club.getName());
                    item.put("type", "club");
                    item.put("subtitle", areaStr + " • " + levelStr + " (Elo " + club.getElo() + ")");
                    item.put("price", null);
                    item.put("image", club.getAvatarImage() != null && !club.getAvatarImage().isBlank() ? club.getAvatarImage() : club.getCoverImage());
                    item.put("action_text", "Giao lưu CLB");
                    resultList.add(item);
                }
            }
        } catch (Exception e) {
            log.error("Error finding clubs in tool executor", e);
        }

        // Limit results to 5
        List<Map<String, Object>> limitedList = resultList.stream().limit(5).collect(Collectors.toList());
        return Map.of("partners", limitedList, "total_found", resultList.size());
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String nfdNormalizedString = Normalizer.normalize(text, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(nfdNormalizedString).replaceAll("").toLowerCase().replace("đ", "d");
    }
}
