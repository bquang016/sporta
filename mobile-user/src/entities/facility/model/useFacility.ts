import { useState, useEffect } from 'react';
import { fetchActiveFacilities } from '../api/facilityApi';
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

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        const data: VenueResponse[] = await fetchActiveFacilities();
        
        let userLat: number | null = null;
        let userLng: number | null = null;
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            userLat = loc.coords.latitude;
            userLng = loc.coords.longitude;
          }
        } catch (e) {
          console.log('Could not fetch location for distance', e);
        }
        
        // Map VenueResponse to Facility
        const mappedFacilities: Facility[] = data.map((venue) => {
          let priceCategory = 'Dưới 300k';
          const minP = venue.minPrice || 0;
          if (minP >= 300000 && minP <= 500000) {
            priceCategory = '300k - 500k';
          } else if (minP > 500000) {
            priceCategory = 'Trên 500k';
          }

          let distanceStr = '-- km';
          if (userLat != null && userLng != null && venue.latitude != null && venue.longitude != null) {
            const dist = getDistance(userLat, userLng, venue.latitude, venue.longitude);
            distanceStr = `${dist.toFixed(1)} km`;
          }

          // Hardcode default values for missing data fields
          return {
            id: venue.id,
            name: venue.name,
            rating: 4.5, // Mock value
            location: venue.location,
            distance: distanceStr,
            price: venue.minPrice != null ? `${Math.round(venue.minPrice / 1000)}k` : 'Liên hệ',
            status: venue.status === 'ACTIVE' ? 'Còn chỗ' : 'Đóng cửa',
            statusType: venue.status === 'ACTIVE' ? 'success' : 'warning',
            imageUrl: venue.coverImage || 'https://via.placeholder.com/300x160?text=No+Image',
            sport: venue.sportName || 'Khác',
            area: venue.location || 'Khác',
            priceCategory: priceCategory,
            latitude: venue.latitude,
            longitude: venue.longitude,
          };
        });

        setFacilities(mappedFacilities);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, []);

  return { facilities, loading, error };
};
