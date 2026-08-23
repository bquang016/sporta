import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { fetchRecommendedVenues, recordRecommendationClick } from '../../../entities/facility/api/facilityApi';
import { RecommendedVenue } from '../../../entities/facility/model/facility.types';
import { Facility } from '../../../entities/facility/ui/FacilityCard';

const PAGE_SIZE = 8;

export function useRecommendedVenues() {
  const [allVenues, setAllVenues] = useState<RecommendedVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('Tất cả');
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
        return loc.coords;
      }
    } catch (e) {
      console.log('Không thể lấy vị trí cho gợi ý:', e);
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
      const locCoords = await fetchLocation();
      const data = await fetchRecommendedVenues({
        lat: locCoords?.latitude,
        lng: locCoords?.longitude,
        limit: 40,
      });

      setAllVenues(data || []);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách gợi ý sân.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Filter theo môn thể thao
  const filteredVenues = useMemo(() => {
    if (!selectedSport || selectedSport === 'Tất cả') {
      return allVenues;
    }
    return allVenues.filter((v) => v.sportName === selectedSport);
  }, [allVenues, selectedSport]);

  // Lazy load slice
  const displayedVenues = useMemo(() => {
    return filteredVenues.slice(0, page * PAGE_SIZE);
  }, [filteredVenues, page]);

  const hasMore = displayedVenues.length < filteredVenues.length;

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 200);
  }, [loadingMore, hasMore, loading]);

  const handleOpenVenueModal = (venue: RecommendedVenue) => {
    // Record impression / click
    recordRecommendationClick(venue.id).catch(() => {});

    setSelectedVenueId(String(venue.id));
    const facility: Facility = {
      id: venue.id,
      name: venue.name,
      rating: venue.averageRating != null && venue.averageRating > 0 ? Math.round(venue.averageRating * 10) / 10 : 0,
      location: venue.location || (venue as any).addressDetail || 'Hà Nội',
      distance: venue.distanceKm != null ? `${venue.distanceKm} km` : '-- km',
      price: venue.minPrice != null ? `${Number(venue.minPrice).toLocaleString('vi-VN')} VND` : '0 VND',
      status: venue.status === 'ACTIVE' ? 'Còn chỗ' : 'Đóng cửa',
      statusType: venue.status === 'ACTIVE' ? 'success' : 'warning',
      imageUrl: venue.coverImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      sport: venue.sportName || 'Thể thao',
      area: venue.district || venue.location || 'Khu vực khác',
      priceCategory: 'Tất cả',
      latitude: venue.latitude,
      longitude: venue.longitude,
    };
    setSelectedFacilityForModal(facility);
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
