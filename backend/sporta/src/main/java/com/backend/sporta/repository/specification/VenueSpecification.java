package com.backend.sporta.repository.specification;

import com.backend.sporta.dto.VenueSearchCriteriaDTO;
import com.backend.sporta.entity.Venue;
import com.backend.sporta.enums.ApprovalStatus;
import com.backend.sporta.enums.VenueStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class VenueSpecification {

    public static Specification<Venue> buildSearchSpecification(VenueSearchCriteriaDTO criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Luôn chỉ trả về sân đang hoạt động và đã duyệt
            predicates.add(cb.equal(root.get("status"), VenueStatus.ACTIVE));
            predicates.add(cb.equal(root.get("approvalStatus"), ApprovalStatus.APPROVED));

            if (criteria.getKeyword() != null && !criteria.getKeyword().trim().isEmpty()) {
                String likePattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), likePattern);
                Predicate locationLike = cb.like(cb.lower(root.get("location")), likePattern);
                predicates.add(cb.or(nameLike, locationLike));
            }

            if (criteria.getSportIds() != null && !criteria.getSportIds().isEmpty()) {
                predicates.add(root.get("sport").get("id").in(criteria.getSportIds()));
            }

            if (criteria.getProvince() != null && !criteria.getProvince().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("province"), criteria.getProvince()));
            }

            if (criteria.getDistrict() != null && !criteria.getDistrict().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("district"), criteria.getDistrict()));
            }

            if (criteria.getMinPrice() != null) {
                // venue.minPrice >= criteria.minPrice OR venue.maxPrice >= criteria.minPrice
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxPrice"), criteria.getMinPrice()));
            }

            if (criteria.getMaxPrice() != null) {
                // venue.minPrice <= criteria.maxPrice
                predicates.add(cb.lessThanOrEqualTo(root.get("minPrice"), criteria.getMaxPrice()));
            }
            
            // Level 2: LBS Bounding Box Filter
            if (criteria.getUserLat() != null && criteria.getUserLng() != null && criteria.getRadiusKm() != null) {
                double radiusKm = criteria.getRadiusKm();
                // 1 độ vĩ độ ~ 111.32 km
                double deltaLat = radiusKm / 111.32;
                // 1 độ kinh độ ~ 111.32 * cos(latitude) km
                double deltaLng = radiusKm / (111.32 * Math.cos(Math.toRadians(criteria.getUserLat())));
                
                double minLat = criteria.getUserLat() - deltaLat;
                double maxLat = criteria.getUserLat() + deltaLat;
                double minLng = criteria.getUserLng() - deltaLng;
                double maxLng = criteria.getUserLng() + deltaLng;
                
                predicates.add(cb.between(root.get("latitude"), minLat, maxLat));
                predicates.add(cb.between(root.get("longitude"), minLng, maxLng));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
