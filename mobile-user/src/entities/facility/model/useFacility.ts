import { useState, useEffect, useCallback } from 'react';
import { fetchActiveFacilities, searchVenues, VenueSearchCriteriaDTO } from '../api/facilityApi';
import { VenueResponse } from './facility.types';
import { Facility } from '../ui/FacilityCard';
import * as Location from 'expo-location';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const useFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacilities = useCallback(async (criteria?: VenueSearchCriteriaDTO) => {
    try {
      setLoading(true);
      
      const data: VenueResponse[] = criteria && Object.keys(criteria).length > 0
        ? await searchVenues(criteria)
        : await fetchActiveFacilities();
        
        let userLat: number | null = null;
        let userLng: number | null = null;
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            userLat = loc.coords.latitude;
            userLng = loc.coords.longitude;
          }
        } catch (e) {
          console.log('Could not fetch location for distance', e);
        }
        
        // Map VenueResponse to Facility
        const mappedFacilities: Facility[] = (data || []).map((venue) => {
          let priceCategory = 'Dưới 200k';
          const minP = venue.minPrice || 0;
          if (minP >= 200000 && minP <= 400000) {
            priceCategory = '200k - 400k';
          } else if (minP > 400000 && minP <= 600000) {
            priceCategory = '400k - 600k';
          } else if (minP > 600000) {
            priceCategory = 'Trên 600k';
          }

          let rawDist: number | null = null;
          let distanceStr = '-- km';
          if (userLat != null && userLng != null && venue.latitude != null && venue.longitude != null) {
            rawDist = getDistance(userLat, userLng, venue.latitude, venue.longitude);
            distanceStr = `${rawDist.toFixed(1)} km`;
          }

          // Hardcode default values for missing data fields
          return {
            id: venue.id,
            name: venue.name,
            rating: venue.averageRating != null && venue.averageRating > 0 ? Math.round(venue.averageRating * 10) / 10 : 0,
            location: venue.location || (venue as any).addressDetail || 'Hà Nội',
            distance: distanceStr,
            rawDistanceKm: rawDist,
            price: venue.minPrice != null ? `${Number(venue.minPrice).toLocaleString('vi-VN')} VND` : '0 VND',
            status: venue.status === 'ACTIVE' ? 'Còn chỗ' : 'Đóng cửa',
            statusType: venue.status === 'ACTIVE' ? 'success' : 'warning',
            imageUrl: venue.coverImage || '',
            sport: venue.sportName || 'Khác',
            area: venue.district || venue.location || 'Khác',
            priceCategory: priceCategory,
            latitude: venue.latitude,
            longitude: venue.longitude,
            openingTime: venue.openingTime,
            closingTime: venue.closingTime,
          };
        });

        // Sắp xếp tăng dần theo khoảng cách (sân gần nhất lên đầu)
        mappedFacilities.sort((a, b) => {
          if (a.rawDistanceKm != null && b.rawDistanceKm != null) {
            return a.rawDistanceKm - b.rawDistanceKm;
          }
          if (a.rawDistanceKm != null) return -1;
          if (b.rawDistanceKm != null) return 1;
          return 0;
        });

        setFacilities(mappedFacilities);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  return { facilities, loading, error, refetch: loadFacilities };
};
