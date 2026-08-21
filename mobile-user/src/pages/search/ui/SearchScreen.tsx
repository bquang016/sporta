import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard, Dimensions, Animated, PanResponder } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { useDebounce } from '../../../shared/lib/useDebounce';
import { SearchBar } from '../../../features/search-bar';
import { FacilityCard, Facility, useFacilities } from '../../../entities/facility';
import { VenueDetailModal } from '../../../features/venue-detail';
import { FilterModal } from './FilterModal';
import { FilterState } from './FilterModal';
import { MapViewComponent } from './MapViewComponent';
import { Button } from '../../../shared/ui';
import { SearchHistoryDropdown } from './SearchHistoryDropdown';
import { MapDisplayOptions, MapDisplayMode } from './MapDisplayOptions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
});

const AnimatedPopupCard = ({ 
  facility, 
  onClose, 
  onOpenDetail 
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
    <Animated.View style={[styles.selectedCardContainer, { transform: [{ translateY }] }]} pointerEvents="box-none">
      <View style={styles.selectedCardWrapper}>
        <FacilityCard
          facility={facility}
          style={{ width: '100%' }}
          onPress={() => onOpenDetail(facility)}
          onBookPress={() => onOpenDetail(facility)}
        />
        <TouchableOpacity style={styles.closeCardBtn} onPress={closeCard}>
          <MaterialIcons name="close" size={20} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openFilter?: string }>();

  const { facilities, loading, error, refetch } = useFacilities();

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
  const [activeRadius, setActiveRadius] = useState<number | null>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const mapRef = useRef<any>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const handleMyLocationPress = async () => {
    if (location?.coords) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    } else {
      setLocationLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
          mapRef.current?.animateToRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      } catch (e) {
        console.error('Failed to get location', e);
      } finally {
        setLocationLoading(false);
      }
    }
  };

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
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    };
    fetchInitialLocation();
  }, []);

  const saveSearchToHistory = async (term: string) => {
    if (!term.trim()) return;
    try {
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('@sporta_search_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  };

  const removeHistoryItem = async (term: string) => {
    try {
      const newHistory = searchHistory.filter(h => h !== term);
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

  useEffect(() => {
    if (debouncedSearchText) {
      saveSearchToHistory(debouncedSearchText);
    }
  }, [debouncedSearchText]);
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
  }, [params.openFilter]); // Lắng nghe sự thay đổi của params

  // AND filtering logic
  const filteredFacilities = useMemo(() => {
    const baseFiltered = facilities.filter(facility => {
      // 1. Text Search
      if (debouncedSearchText && !facility.name.toLowerCase().includes(debouncedSearchText.toLowerCase())) {
        return false;
      }
      // 2. Sport Filter
      if (appliedFilters.sport && appliedFilters.sport !== 'Tất cả' && facility.sport !== appliedFilters.sport) {
        return false;
      }
      // 3. Area Filter
      if (appliedFilters.area && appliedFilters.area !== 'Tất cả' && facility.area !== appliedFilters.area) {
        return false;
      }
      // 4. Price Filter
      if (appliedFilters.priceRange && appliedFilters.priceRange !== 'Tất cả' && facility.priceCategory !== appliedFilters.priceRange) {
        return false;
      }
      // 5. Rating Filter
      if (appliedFilters.rating > 0 && facility.rating < appliedFilters.rating) {
        return false;
      }

      // 6. Radius Filter
      if (activeRadius && location && location.coords) {
        if (!facility.latitude || !facility.longitude) return false;
        const distance = getDistance(location.coords.latitude, location.coords.longitude, facility.latitude, facility.longitude);
        if (distance > activeRadius) return false;
      }

      return true;
    });

    return baseFiltered;
  }, [debouncedSearchText, appliedFilters, facilities, activeRadius, location]);

  const applyBackendFilters = (currentFilters: FilterState) => {
    let criteria: any = {};
    if (currentFilters.date && currentFilters.time) {
      const d = currentFilters.date;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      criteria.bookingDate = dateStr;
      
      const timeStr = currentFilters.time; // "12:00"
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
    setActiveRadius(null);
    applyBackendFilters(defaultF);
  };

  const handleNearMePress = async (radius: number) => {
    if (activeRadius === radius) {
      setActiveRadius(null);
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

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setActiveRadius(radius);
    } catch (error) {
      alert('Không thể lấy vị trí hiện tại');
    } finally {
      setLocationLoading(false);
    }
  };

  const activeFilterCount = Object.entries(appliedFilters).filter(([k, v]) => {
    if (v === '' || v === 0 || v === 'Tất cả' || v === undefined) return false;
    if (k === 'date' && v instanceof Date) {
      const today = new Date();
      return v.getDate() !== today.getDate() || v.getMonth() !== today.getMonth() || v.getFullYear() !== today.getFullYear();
    }
    return true;
  }).length + (activeRadius ? 1 : 0);

  return (
    <View style={styles.container}>
      {viewMode === 'map' && (
        <View style={StyleSheet.absoluteFill}>
          {!loading && !error && (
            <MapViewComponent
              facilities={filteredFacilities}
              userLocation={location?.coords}
              onMarkerPress={(facility) => {
                setSelectedFacilityId(facility.id);
                if (facility.latitude && facility.longitude) {
                  mapRef.current?.animateToRegion({
                    latitude: facility.latitude,
                    longitude: facility.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }, 500);
                }
              }}
              onMapPress={() => {
                setSelectedFacilityId(null);
                Keyboard.dismiss();
              }}
              displayMode={pinDisplayMode}
              distances={
                location?.coords ? Object.fromEntries(
                  filteredFacilities.map(f => {
                    if (!f.latitude || !f.longitude) return [f.id, 0];
                    return [f.id, getDistance(location.coords.latitude, location.coords.longitude, f.latitude, f.longitude)];
                  })
                ) : {}
              }
              isFullScreen={true}
              mapRef={mapRef}
              selectedFacilityId={selectedFacilityId}
            />
          )}

          {/* Map Selected Facility Card */}
          {selectedFacilityId && (
            (() => {
              const facility = filteredFacilities.find(f => f.id === selectedFacilityId);
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

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']} pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}
        >
          {/* Header Section */}
          <View style={[styles.header, viewMode === 'map' && styles.headerMapMode]} pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}>
            <View style={styles.headerTop} pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>

              <View style={styles.searchWrapper} pointerEvents={viewMode === 'map' ? 'box-none' : 'auto'}>
              <SearchBar
                autoFocus={false}
                value={searchText}
                onChangeText={setSearchText}
                onFilterPress={() => setFilterVisible(true)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  // Delay blurring slightly to allow clicking on dropdown items
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
              <SearchHistoryDropdown
                query={searchText}
                history={searchHistory}
                suggestions={filteredFacilities.slice(0, 5)}
                visible={isSearchFocused && (searchHistory.length > 0 || searchText.length > 0)}
                onSelectHistory={(item) => {
                  setSearchText(item);
                  setIsSearchFocused(false);
                  Keyboard.dismiss();
                }}
                onSelectSuggestion={(facility) => {
                  setSearchText(facility.name);
                  setIsSearchFocused(false);
                  Keyboard.dismiss();
                  if (viewMode === 'map') {
                    setSelectedFacilityId(facility.id);
                    if (facility.latitude && facility.longitude) {
                      mapRef.current?.animateToRegion({
                        latitude: facility.latitude,
                        longitude: facility.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      }, 500);
                    }
                  }
                }}
                onRemoveHistory={removeHistoryItem}
                onClearHistory={clearHistory}
                onClose={() => {
                  setIsSearchFocused(false);
                  Keyboard.dismiss();
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.viewToggleBtn}
              onPress={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
            >
              <MaterialIcons
                name={viewMode === 'list' ? 'map' : 'view-list'}
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Quick Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickChipsWrapper} contentContainerStyle={styles.quickChipsContainer}>
            <TouchableOpacity
              style={[styles.quickChip, activeRadius === 3 && styles.quickChipActive]}
              onPress={() => handleNearMePress(3)}
            >
              <MaterialIcons name="my-location" size={16} color={activeRadius === 3 ? COLORS.primary : COLORS.onSurfaceVariant} />
              <Text style={[styles.quickChipText, activeRadius === 3 && styles.quickChipTextActive]}>
                {locationLoading && activeRadius === 3 ? 'Đang định vị...' : 'Gần tôi < 3km'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickChip, 
                appliedFilters.sport === 'Bóng đá' && styles.quickChipActive,
                { paddingVertical: 6, paddingLeft: 6, paddingRight: 16 }
              ]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Bóng đá';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Bóng đá'});
                setFilters({...filters, sport: isSelected ? '' : 'Bóng đá'});
              }}
            >
              <View style={[styles.chipIconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
                <MaterialIcons name="sports-soccer" size={16} color={COLORS.primary} />
              </View>
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Bóng đá' && styles.quickChipTextActive]}>Bóng đá</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickChip, 
                appliedFilters.sport === 'Pickleball' && styles.quickChipActive,
                { paddingVertical: 6, paddingLeft: 6, paddingRight: 16 }
              ]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Pickleball';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Pickleball'});
                setFilters({...filters, sport: isSelected ? '' : 'Pickleball'});
              }}
            >
              <View style={[styles.chipIconContainer, { backgroundColor: `${COLORS.secondary}15` }]}>
                <MaterialIcons name="sports-tennis" size={16} color={COLORS.secondary} />
              </View>
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Pickleball' && styles.quickChipTextActive]}>Pickleball</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickChip, 
                appliedFilters.sport === 'Cầu lông' && styles.quickChipActive,
                { paddingVertical: 6, paddingLeft: 6, paddingRight: 16 }
              ]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Cầu lông';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Cầu lông'});
                setFilters({...filters, sport: isSelected ? '' : 'Cầu lông'});
              }}
            >
              <View style={[styles.chipIconContainer, { backgroundColor: `#1565C015` }]}>
                <MaterialCommunityIcons name="badminton" size={16} color="#1565C0" />
              </View>
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Cầu lông' && styles.quickChipTextActive]}>Cầu lông</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickChip, 
                appliedFilters.sport === 'Bóng rổ' && styles.quickChipActive,
                { paddingVertical: 6, paddingLeft: 6, paddingRight: 16 }
              ]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Bóng rổ';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Bóng rổ'});
                setFilters({...filters, sport: isSelected ? '' : 'Bóng rổ'});
              }}
            >
              <View style={[styles.chipIconContainer, { backgroundColor: `#E6510015` }]}>
                <MaterialIcons name="sports-basketball" size={16} color="#E65100" />
              </View>
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Bóng rổ' && styles.quickChipTextActive]}>Bóng rổ</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>



        {/* Results Section */}
        {loading ? (
          <View style={styles.listContainer}>
            {/* Skeleton Loading simulation */}
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.cardWrapper, { height: 120, backgroundColor: COLORS.surfaceDim, borderRadius: 12, marginBottom: SPACING.md }]} />
            ))}
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
            <Text style={[styles.loadingText, { color: COLORS.error, marginTop: SPACING.sm }]}>{error}</Text>
          </View>
        ) : filteredFacilities.length > 0 ? (
          viewMode === 'list' ? (
            <FlatList
              data={filteredFacilities}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <FacilityCard
                    facility={item}
                    style={styles.fullWidthCard}
                    onPress={() => handleOpenVenueDetail(item)}
                    onBookPress={() => handleOpenVenueDetail(item)}
                  />
                </View>
              )}
            />
          ) : (
            <View style={{ flex: 1 }} pointerEvents="box-none">
              <MapDisplayOptions 
                mode={pinDisplayMode} 
                onChange={setPinDisplayMode} 
              />
              <TouchableOpacity
                style={styles.myLocationFloatingBtn}
                onPress={handleMyLocationPress}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <MaterialIcons name="my-location" size={24} color={location ? COLORS.primary : COLORS.onSurfaceVariant} />
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={64} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyDesc}>Không tìm thấy sân phù hợp. Vui lòng thử thay đổi bộ lọc!</Text>
            <Button
              title="Xóa bộ lọc"
              variant="primary"
              style={styles.clearBtn}
              onPress={handleClearFilters}
            />
          </View>
        )}

        <FilterModal
          visible={isFilterVisible}
          onClose={() => setFilterVisible(false)}
          filters={filters}
          onFilterChange={setFilters}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />
      </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Floating Venue Detail Modal (60fps) */}
      <VenueDetailModal
        visible={isDetailModalVisible}
        venueId={selectedModalVenueId || (selectedModalVenue?.id ? String(selectedModalVenue.id) : null)}
        initialFacility={selectedModalVenue}
        onClose={handleCloseVenueDetail}
        onBookNow={(venueId) => router.push(`/booking/${venueId}`)}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: SPACING.xs,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 0,
  },
  selectedCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.marginMobile,
    zIndex: 10,
  },
  selectedCardWrapper: {
    width: '100%',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  closeCardBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 4,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerMapMode: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    zIndex: 999,
  },
  quickChipsWrapper: {
    marginTop: SPACING.sm,
  },
  quickChipsContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    gap: 4,
  },
  quickChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity10,
  },
  chipIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  quickChipTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  viewToggleBtn: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  backBtn: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 999,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  filterBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.onSurface,
  },
  listContainer: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
  },
  cardWrapper: {
    width: '100%',
  },
  fullWidthCard: {
    width: '100%',
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
    marginTop: SPACING.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginTop: SPACING.md,
  },
  emptyDesc: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  clearBtn: {
    minWidth: 120,
  },
  myLocationFloatingBtn: {
    position: 'absolute',
    right: SPACING.marginMobile,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceDim,
    zIndex: 10,
  }
});
