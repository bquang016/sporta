import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Animated,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { useDebounce } from '../../../shared/lib/useDebounce';
import { SearchBar } from '../../../features/search-bar';
import { FacilityCard, Facility, useFacilities } from '../../../entities/facility';
import { VenueDetailModal } from '../../../features/venue-detail';
import { FilterModal, FilterState } from './FilterModal';
import { MapViewComponent } from './MapViewComponent';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';
import { MapDisplayOptions, MapDisplayMode } from './MapDisplayOptions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
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

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDefaultFilters = (): FilterState => ({
  date: getToday(),
  time: '',
  sport: '',
  area: '',
  priceRange: '',
  rating: 0,
  maxDistanceKm: null,
  amenities: [],
});

const AnimatedPopupCard = ({
  facility,
  onClose,
  onOpenDetail,
}: {
  facility: Facility;
  onClose: () => void;
  onOpenDetail: (facility: Facility) => void;
}) => {
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [facility.id]);

  const closeCard = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View
      style={[styles.selectedCardContainer, { transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <View style={styles.selectedCardWrapper}>
        <FacilityCard
          facility={facility}
          style={{ width: '100%' }}
          onPress={() => onOpenDetail(facility)}
          onBookPress={() => onOpenDetail(facility)}
        />
        <TouchableOpacity style={styles.closeCardBtn} onPress={closeCard}>
          <MaterialIcons name="close" size={18} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openFilter?: string; autoFocus?: string }>();
  const insets = useSafeAreaInsets();

  const { facilities, loading, error, refetch } = useFacilities();

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Venue Detail Modal State
  const [selectedModalVenueId, setSelectedModalVenueId] = useState<string | null>(null);
  const [selectedModalVenue, setSelectedModalVenue] = useState<Facility | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const handleOpenVenueDetail = (facility: Facility) => {
    setSelectedModalVenueId(String(facility.id));
    setSelectedModalVenue(facility);
    setIsDetailModalVisible(true);
  };

  const handleCloseVenueDetail = () => {
    setIsDetailModalVisible(false);
  };

  // Map Display Mode
  const [pinDisplayMode, setPinDisplayMode] = useState<MapDisplayMode>('sport');

  // Location State
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const mapRef = useRef<any>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const lastMarkerPressTime = useRef<number>(0);

  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(getDefaultFilters());

  // Mở modal nếu Home yêu cầu
  useEffect(() => {
    if (params.openFilter === 'true') {
      const timer = setTimeout(() => {
        setFilterVisible(true);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [params.openFilter]);

  // Load history & initial GPS
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await AsyncStorage.getItem('@sporta_search_history');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (e) {
        console.error('Failed to load search history', e);
      }
    };
    loadHistory();

    const fetchInitialLocation = async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation(loc);
        }
      } catch (_) {}
    };
    fetchInitialLocation();
  }, []);

  const saveSearchToHistory = async (term: string) => {
    if (!term.trim()) return;
    try {
      const newHistory = [term, ...searchHistory.filter((h) => h !== term)].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('@sporta_search_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  };

  const removeHistoryItem = async (term: string) => {
    try {
      const newHistory = searchHistory.filter((h) => h !== term);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('@sporta_search_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to remove history item', e);
    }
  };

  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem('@sporta_search_history');
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  const handleSubmitSearch = (textToSave?: string) => {
    const term = (textToSave || searchText).trim();
    if (term) {
      saveSearchToHistory(term);
      setIsSearchFocused(false);
      Keyboard.dismiss();
    }
  };

  // AND filtering logic
  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      // 1. Text Search (Name, Sport, Area, Address)
      if (debouncedSearchText) {
        const q = debouncedSearchText.toLowerCase();
        const matchesName = facility.name.toLowerCase().includes(q);
        const matchesSport = (facility.sport || '').toLowerCase().includes(q);
        const matchesArea = (facility.area || facility.location || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSport && !matchesArea) {
          return false;
        }
      }

      // 2. Sport Filter
      if (appliedFilters.sport && appliedFilters.sport !== 'Tất cả') {
        if (facility.sport !== appliedFilters.sport) return false;
      }

      // 3. Area Filter
      if (appliedFilters.area && appliedFilters.area !== 'Tất cả') {
        const areaStr = (facility.area || facility.location || '').toLowerCase();
        if (!areaStr.includes(appliedFilters.area.toLowerCase())) return false;
      }

      // 4. Price Filter
      if (appliedFilters.priceRange && appliedFilters.priceRange !== 'Tất cả') {
        const priceNum = parseInt(facility.price.replace(/[^\d]/g, ''), 10) * 1000;
        if (appliedFilters.priceRange === 'Dưới 200k' && priceNum > 200000) return false;
        if (appliedFilters.priceRange === '200k - 400k' && (priceNum < 200000 || priceNum > 400000)) return false;
        if (appliedFilters.priceRange === '400k - 600k' && (priceNum < 400000 || priceNum > 600000)) return false;
        if (appliedFilters.priceRange === 'Trên 600k' && priceNum < 600000) return false;
      }

      // 5. Rating Filter
      if (appliedFilters.rating > 0) {
        if ((facility.rating || 0) < appliedFilters.rating) return false;
      }

      // 6. Max Distance Filter
      if (appliedFilters.maxDistanceKm && location?.coords) {
        if (!facility.latitude || !facility.longitude) return false;
        const dist = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          facility.latitude,
          facility.longitude
        );
        if (dist > appliedFilters.maxDistanceKm) return false;
      }

      return true;
    });
  }, [debouncedSearchText, appliedFilters, facilities, location]);

  const applyBackendFilters = (currentFilters: FilterState) => {
    let criteria: any = {};
    if (currentFilters.date && currentFilters.time) {
      const d = currentFilters.date;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      criteria.bookingDate = dateStr;

      const timeStr = currentFilters.time;
      criteria.startTime = `${timeStr}:00`;

      const hour = parseInt(timeStr.split(':')[0], 10);
      const nextHour = hour + 1;
      criteria.endTime = `${String(nextHour).padStart(2, '0')}:00:00`;
    }
    if (refetch) {
      refetch(criteria);
    }
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setFilterVisible(false);
    applyBackendFilters(filters);
  };

  const handleResetFilter = () => {
    const defaultF = getDefaultFilters();
    setFilters(defaultF);
    setAppliedFilters(defaultF);
    setFilterVisible(false);
    applyBackendFilters(defaultF);
  };

  const handleClearFilters = () => {
    setSearchText('');
    const defaultF = getDefaultFilters();
    setFilters(defaultF);
    setAppliedFilters(defaultF);
    applyBackendFilters(defaultF);
  };

  const handleNearMePress = async (radius: number) => {
    if (appliedFilters.maxDistanceKm === radius) {
      const updated = { ...appliedFilters, maxDistanceKm: null };
      setAppliedFilters(updated);
      setFilters(updated);
      return;
    }

    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần cấp quyền vị trí để tìm sân quanh đây');
        setLocationLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      const updated = { ...appliedFilters, maxDistanceKm: radius };
      setAppliedFilters(updated);
      setFilters(updated);
    } catch (error) {
      alert('Không thể lấy vị trí hiện tại');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMyLocationPress = async () => {
    if (location?.coords) {
      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        800
      );
    } else {
      setLocationLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
          mapRef.current?.animateToRegion(
            {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            },
            800
          );
        }
      } catch (e) {
        console.error('Failed to get location', e);
      } finally {
        setLocationLoading(false);
      }
    }
  };

  const activeFilterCount = Object.entries(appliedFilters).filter(([k, v]) => {
    if (v === '' || v === 0 || v === 'Tất cả' || v === undefined || v === null) return false;
    if (Array.isArray(v) && v.length === 0) return false;
    if (k === 'date' && v instanceof Date) {
      const today = new Date();
      return (
        v.getDate() !== today.getDate() ||
        v.getMonth() !== today.getMonth() ||
        v.getFullYear() !== today.getFullYear()
      );
    }
    return true;
  }).length;

  const onRefresh = async () => {
    setRefreshing(true);
    if (refetch) await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Map View Background (if in map mode) */}
      {viewMode === 'map' && (
        <View style={StyleSheet.absoluteFill}>
          {!loading && !error && (
            <MapViewComponent
              facilities={filteredFacilities}
              userLocation={location?.coords}
              onMarkerPress={(facility) => {
                lastMarkerPressTime.current = Date.now();
                setSelectedFacilityId(facility.id);
                if (facility.latitude && facility.longitude) {
                  mapRef.current?.animateToRegion(
                    {
                      latitude: facility.latitude,
                      longitude: facility.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.02,
                    },
                    500
                  );
                }
              }}
              onMapPress={() => {
                if (Date.now() - lastMarkerPressTime.current < 400) return;
                setSelectedFacilityId(null);
                Keyboard.dismiss();
              }}
              displayMode={pinDisplayMode}
              distances={
                location?.coords
                  ? Object.fromEntries(
                      filteredFacilities.map((f) => {
                        if (!f.latitude || !f.longitude) return [f.id, 0];
                        return [
                          f.id,
                          calculateDistance(
                            location.coords.latitude,
                            location.coords.longitude,
                            f.latitude,
                            f.longitude
                          ),
                        ];
                      })
                    )
                  : {}
              }
              isFullScreen={true}
              mapRef={mapRef}
              selectedFacilityId={selectedFacilityId}
            />
          )}

          {/* Map Selected Facility Card */}
          {selectedFacilityId && (
            (() => {
              const facility = filteredFacilities.find((f) => f.id === selectedFacilityId);
              if (!facility) return null;
              return (
                <AnimatedPopupCard
                  facility={facility}
                  onClose={() => setSelectedFacilityId(null)}
                  onOpenDetail={handleOpenVenueDetail}
                />
              );
            })()
          )}
        </View>
      )}

      {/* Safe Area Header & Search Content */}
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
        pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}
        >
          {/* ── Top Bar with Search & View Toggle ── */}
          <View
            style={[styles.header, viewMode === 'map' && styles.headerMapMode]}
            pointerEvents="box-none"
          >
            <View style={styles.headerTop} pointerEvents="box-none">
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.backBtn, viewMode === 'map' && styles.backBtnMapMode]}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>

              {/* Central SearchBar */}
              <View
                style={styles.searchWrapper}
                pointerEvents="box-none"
              >
                <SearchBar
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={() => handleSubmitSearch()}
                  onClear={() => setSearchText('')}
                  onFilterPress={() => setFilterVisible(true)}
                  hasActiveFilter={activeFilterCount > 0}
                  activeFilterCount={activeFilterCount}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsSearchFocused(false), 250);
                  }}
                  autoFocus={params.autoFocus === 'true'}
                  placeholder="Tìm sân, địa điểm, môn thể thao..."
                />

                {/* History & Suggestion Dropdown */}
                <SearchHistoryDropdown
                  query={searchText}
                  history={searchHistory}
                  suggestions={filteredFacilities.slice(0, 6)}
                  featuredVenues={facilities.slice(0, 4)}
                  visible={
                    isSearchFocused &&
                    (searchHistory.length > 0 || searchText.length > 0 || facilities.length > 0)
                  }
                  onSelectHistory={(item) => {
                    setSearchText(item);
                    handleSubmitSearch(item);
                  }}
                  onSelectSuggestion={(facility) => {
                    setSearchText(facility.name);
                    handleSubmitSearch(facility.name);
                    handleOpenVenueDetail(facility);
                  }}
                  onRemoveHistory={removeHistoryItem}
                  onClearHistory={clearHistory}
                  onClose={() => {
                    setIsSearchFocused(false);
                    Keyboard.dismiss();
                  }}
                />
              </View>

              {/* View Toggle Button (List <-> Map) */}
              <TouchableOpacity
                style={[
                  styles.viewToggleBtn,
                  viewMode === 'map' ? styles.viewToggleBtnActive : styles.viewToggleBtnList,
                ]}
                onPress={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={viewMode === 'list' ? 'map' : 'list'}
                  size={20}
                  color={viewMode === 'map' ? COLORS.white : COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {/* ── Quick Filter Chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickChipsWrapper}
              contentContainerStyle={styles.quickChipsContainer}
              pointerEvents="box-none"
            >
              {/* Radius Chip */}
              <TouchableOpacity
                style={[
                  styles.quickChip,
                  viewMode === 'map' && styles.quickChipMapMode,
                  appliedFilters.maxDistanceKm === 3 && styles.quickChipActive,
                ]}
                onPress={() => handleNearMePress(3)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="my-location"
                  size={14}
                  color={appliedFilters.maxDistanceKm === 3 ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.quickChipText,
                    appliedFilters.maxDistanceKm === 3 && styles.quickChipTextActive,
                  ]}
                >
                  {locationLoading && appliedFilters.maxDistanceKm === 3 ? 'Đang định vị...' : '< 3km'}
                </Text>
              </TouchableOpacity>

              {/* Sport Chips */}
              {[
                { name: 'Bóng đá', icon: 'sports-soccer' },
                { name: 'Pickleball', icon: 'sports-tennis' },
                { name: 'Cầu lông', icon: 'badminton', isMci: true },
                { name: 'Bóng rổ', icon: 'sports-basketball' },
              ].map((s) => {
                const isSelected = appliedFilters.sport === s.name;
                return (
                  <TouchableOpacity
                    key={s.name}
                    style={[
                      styles.quickChip,
                      viewMode === 'map' && styles.quickChipMapMode,
                      isSelected && styles.quickChipActive,
                    ]}
                    onPress={() => {
                      const updated = {
                        ...appliedFilters,
                        sport: isSelected ? '' : s.name,
                      };
                      setAppliedFilters(updated);
                      setFilters(updated);
                    }}
                    activeOpacity={0.8}
                  >
                    {s.isMci ? (
                      <MaterialCommunityIcons
                        name="badminton"
                        size={14}
                        color={isSelected ? COLORS.white : COLORS.onSurfaceVariant}
                      />
                    ) : (
                      <MaterialIcons
                        name={s.icon as any}
                        size={14}
                        color={isSelected ? COLORS.white : COLORS.onSurfaceVariant}
                      />
                    )}
                    <Text
                      style={[
                        styles.quickChipText,
                        isSelected && styles.quickChipTextActive,
                      ]}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* 4.0+ Rating Chip */}
              <TouchableOpacity
                style={[
                  styles.quickChip,
                  viewMode === 'map' && styles.quickChipMapMode,
                  appliedFilters.rating === 4.0 && styles.quickChipActive,
                ]}
                onPress={() => {
                  const updated = {
                    ...appliedFilters,
                    rating: appliedFilters.rating === 4.0 ? 0 : 4.0,
                  };
                  setAppliedFilters(updated);
                  setFilters(updated);
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={appliedFilters.rating === 4.0 ? COLORS.white : '#D97706'}
                />
                <Text
                  style={[
                    styles.quickChipText,
                    appliedFilters.rating === 4.0 && styles.quickChipTextActive,
                  ]}
                >
                  4.0+ Sao
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* ── Results Content ── */}
          {loading ? (
            <View style={styles.listContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
              <Text style={styles.loadingText}>Đang tải danh sách sân...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerState}>
              <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
              <Text style={[styles.loadingText, { color: COLORS.error, marginTop: SPACING.sm }]}>
                {error}
              </Text>
            </View>
          ) : filteredFacilities.length > 0 ? (
            viewMode === 'list' ? (
              <FlatList
                data={filteredFacilities}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={styles.listSummaryRow}>
                    <Text style={styles.listSummaryText}>
                      Tìm thấy <Text style={styles.boldNum}>{filteredFacilities.length}</Text> cụm sân
                    </Text>
                    {activeFilterCount > 0 && (
                      <TouchableOpacity onPress={handleClearFilters} activeOpacity={0.7}>
                        <Text style={styles.clearFilterLink}>Xóa bộ lọc ({activeFilterCount})</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.cardWrapper}>
                    <FacilityCard
                      facility={item}
                      onPress={() => handleOpenVenueDetail(item)}
                      onBookPress={() => {
                        router.push(('/booking/' + item.id) as any);
                      }}
                    />
                  </View>
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                  />
                }
              />
            ) : (
              <View style={{ flex: 1 }} pointerEvents="box-none">
                <MapDisplayOptions mode={pinDisplayMode} onChange={setPinDisplayMode} />
                <TouchableOpacity
                  style={styles.myLocationFloatingBtn}
                  onPress={handleMyLocationPress}
                  activeOpacity={0.85}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialIcons
                      name="my-location"
                      size={22}
                      color={location ? COLORS.primary : COLORS.onSurfaceVariant}
                    />
                  )}
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <MaterialIcons name="search-off" size={42} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy sân phù hợp</Text>
              <Text style={styles.emptyDesc}>
                Vui lòng thử tìm kiếm với từ khóa khác hoặc thiết lập lại bộ lọc.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearFilters}
                activeOpacity={0.85}
              >
                <Text style={styles.clearBtnText}>Xóa tất cả bộ lọc</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Filter Modal ── */}
          <FilterModal
            visible={isFilterVisible}
            onClose={() => setFilterVisible(false)}
            filters={filters}
            onFilterChange={setFilters}
            onApply={handleApplyFilter}
            onReset={handleResetFilter}
            totalResultsCount={filteredFacilities.length}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Venue Detail Modal (60fps) ── */}
      <VenueDetailModal
        visible={isDetailModalVisible}
        venueId={
          selectedModalVenueId ||
          (selectedModalVenue?.id ? String(selectedModalVenue.id) : null)
        }
        initialFacility={selectedModalVenue}
        onClose={handleCloseVenueDetail}
        onBookNow={(venueId) => {
          handleCloseVenueDetail();
          router.push(('/booking/' + venueId) as any);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 100,
  },
  headerMapMode: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    paddingTop: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: 8,
    zIndex: 110,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnMapMode: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 120,
  },
  viewToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleBtnList: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  viewToggleBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  quickChipsWrapper: {
    marginTop: 8,
  },
  quickChipsContainer: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    paddingBottom: 4,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  quickChipMapMode: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  quickChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  quickChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 36,
    paddingTop: 8,
  },
  listSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  listSummaryText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  boldNum: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  clearFilterLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  selectedCardContainer: {
    position: 'absolute',
    bottom: 24,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
  },
  selectedCardWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeCardBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  myLocationFloatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 40,
    gap: 8,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleLg,
    fontWeight: '800',
    fontSize: 16,
    color: COLORS.onSurface,
  },
  emptyDesc: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 19,
    fontSize: 12.5,
  },
  clearBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 8,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
