import { useState, useEffect } from 'react';
import { fetchActiveFacilities } from '../api/facilityApi';
import { VenueResponse } from './facility.types';
import { geocodeAddress } from '../../../features/map-search/api/facilitySearchApi';

// Tọa độ mặc định: Trung tâm Hà Nội
export const HANOI_COORDINATE = {
  latitude: 21.028511,
  longitude: 105.804817,
};

export interface MapVenue {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sportName: string;
  price: string;
  rating: number;
  location: string;
  coverImage: string | null;
  status: string;
  minPrice: number;
  maxPrice: number;
}

export const useMapFacilities = () => {
  const [venues, setVenues] = useState<MapVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadVenues = async () => {
      try {
        setLoading(true);
        const data: VenueResponse[] = await fetchActiveFacilities();

        const mappedVenues: MapVenue[] = [];

        for (const venue of data) {
          let lat = venue.latitude;
          let lng = venue.longitude;

          // Fallback: Nếu không có tọa độ, gọi API Geocoding
          if (lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng))) {
            if (venue.location) {
              try {
                const geo = await geocodeAddress(venue.location);
                if (geo) {
                  lat = geo.latitude;
                  lng = geo.longitude;
                }
              } catch {
                // Ignore geocoding errors for single venue
              }
            }
          }

          const numLat = Number(lat);
          const numLng = Number(lng);

          // Vẫn không có tọa độ hợp lệ -> Bỏ qua để tránh crash MapView
          if (!isFinite(numLat) || !isFinite(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
            continue;
          }

          mappedVenues.push({
            id: venue.id,
            name: venue.name || 'Sân thể thao',
            latitude: numLat,
            longitude: numLng,
            sportName: venue.sportName || 'Thể thao',
            price:
              venue.minPrice != null
                ? `${Number(venue.minPrice).toLocaleString('vi-VN')} VND/h`
                : '0 VND/h',
            rating: venue.averageRating != null && venue.averageRating > 0 ? Math.round(venue.averageRating * 10) / 10 : 0,
            location: venue.location || '',
            coverImage: venue.coverImage || null,
            status: venue.status,
            minPrice: venue.minPrice ?? 0,
            maxPrice: venue.maxPrice ?? 0,
          });
        }

        if (isMounted) {
          setVenues(mappedVenues);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Không thể tải dữ liệu sân');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  return { venues, loading, error };
};

