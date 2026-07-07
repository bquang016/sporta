import { useState, useEffect } from 'react';
import { fetchActiveFacilities } from '../api/facilityApi';
import { VenueResponse } from './facility.types';
import { Facility } from '../ui/FacilityCard';

export const useFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        const data: VenueResponse[] = await fetchActiveFacilities();
        
        // Map VenueResponse to Facility
        const mappedFacilities: Facility[] = data.map((venue) => {
          // Hardcode default values for missing data fields
          return {
            id: venue.id,
            name: venue.name,
            rating: 4.5, // Mock value
            location: venue.location,
            distance: '2.0km', // Mock value
            price: venue.minPrice != null ? `${Math.round(venue.minPrice / 1000)}k` : 'Liên hệ',
            status: venue.status === 'ACTIVE' ? '🟢 Còn chỗ' : '🔴 Đóng cửa',
            statusType: venue.status === 'ACTIVE' ? 'success' : 'warning',
            imageUrl: venue.coverImage || 'https://via.placeholder.com/300x160?text=No+Image',
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
