import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { fetchActiveFacilities } from '../../../entities/facility/api/facilityApi';
import { VenueResponse } from '../../../entities/facility/model/facility.types';
import { Facility } from '../../../entities/facility/ui/FacilityCard';

const PAGE_SIZE = 8;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export interface NearbyVenueItem extends Facility {
  rawDistanceKm: number | null;
  openingTime?: string | null;
  closingTime?: string | null;
}

export function useNearbyVenues() {
  const [allVenues, setAllVenues] = useState<NearbyVenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('Tất cả');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal State
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<Facility | null>(null);
  const [isVenueModalVisible, setIsVenueModalVisible] = useState(false);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        try {
          const geocodes = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (geocodes && geocodes.length > 0) {
            const place = geocodes[0];
            const nameParts = [place.district || place.subregion, place.city || place.region].filter(Boolean);
            if (nameParts.length > 0) {
              setLocationAddress(nameParts.join(', '));
            }
          }
        } catch (_) {}
        return loc.coords;
      }
    } catch (e) {
      console.log('Không thể lấy vị trí người dùng:', e);
    }
    return null;
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [locCoords, data] = await Promise.all([
        fetchLocation(),
        fetchActiveFacilities(),
      ]);

      const userLat = locCoords?.latitude || userLocation?.latitude;
      const userLng = locCoords?.longitude || userLocation?.longitude;

      const mapped: NearbyVenueItem[] = (data || []).map((venue: VenueResponse) => {
        let rawDistance: number | null = null;
        let distanceStr = '-- km';

        if (userLat != null && userLng != null && venue.latitude != null && venue.longitude != null) {
          rawDistance = calculateDistance(userLat, userLng, venue.latitude, venue.longitude);
          distanceStr = `${rawDistance.toFixed(1)} km`;
        }

        let priceCategory = 'Dưới 300k';
        const minP = venue.minPrice || 0;
        if (minP >= 300000 && minP <= 500000) {
          priceCategory = '300k - 500k';
        } else if (minP > 500000) {
          priceCategory = 'Trên 500k';
        }

        return {
          id: venue.id,
          name: venue.name,
          rating: venue.averageRating != null && venue.averageRating > 0 ? Math.round(venue.averageRating * 10) / 10 : 0,
          location: venue.location || (venue as any).addressDetail || 'Hà Nội',
          distance: distanceStr,
          rawDistanceKm: rawDistance,
          price: venue.minPrice != null ? `${Number(venue.minPrice).toLocaleString('vi-VN')} VND` : '0 VND',
          status: venue.status === 'ACTIVE' ? 'Còn chỗ' : 'Đóng cửa',
          statusType: venue.status === 'ACTIVE' ? 'success' : 'warning',
          imageUrl: venue.coverImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
          sport: venue.sportName || 'Thể thao',
          area: venue.district || venue.location || 'Khu vực khác',
          priceCategory,
          latitude: venue.latitude,
          longitude: venue.longitude,
          openingTime: venue.openingTime,
          closingTime: venue.closingTime,
        };
      });

      // Sắp xếp tăng dần theo khoảng cách (sân gần nhất lên đầu)
      mapped.sort((a, b) => {
        if (a.rawDistanceKm != null && b.rawDistanceKm != null) {
          return a.rawDistanceKm - b.rawDistanceKm;
        }
        if (a.rawDistanceKm != null) return -1;
        if (b.rawDistanceKm != null) return 1;
        return 0;
      });

      setAllVenues(mapped);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sân gần bạn.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLocation]);

  useEffect(() => {
    loadData();
  }, []);

  // Filter theo môn thể thao
  const filteredVenues = useMemo(() => {
    if (!selectedSport || selectedSport === 'Tất cả') {
      return allVenues;
    }
    return allVenues.filter((v) => v.sport === selectedSport);
  }, [allVenues, selectedSport]);

  // Lazy Load Pagination (cắt theo page * PAGE_SIZE)
  const displayedVenues = useMemo(() => {
    return filteredVenues.slice(0, page * PAGE_SIZE);
  }, [filteredVenues, page]);

  const hasMore = displayedVenues.length < filteredVenues.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    // Simulating instant batch render with smooth state update
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 200);
  }, [loadingMore, hasMore, loading]);

  const handleOpenVenueModal = (venue: NearbyVenueItem) => {
    setSelectedVenueId(String(venue.id));
    setSelectedFacilityForModal(venue);
    setIsVenueModalVisible(true);
  };

  const handleCloseVenueModal = () => {
    setIsVenueModalVisible(false);
    setSelectedVenueId(null);
    setSelectedFacilityForModal(null);
  };

  return {
    allVenues,
    filteredVenues,
    displayedVenues,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    selectedSport,
    setSelectedSport,
    locationAddress,
    userLocation,
    onRefresh: () => loadData(true),
    loadMore,
    // Modal
    selectedVenueId,
    selectedFacilityForModal,
    isVenueModalVisible,
    handleOpenVenueModal,
    handleCloseVenueModal,
  };
}
