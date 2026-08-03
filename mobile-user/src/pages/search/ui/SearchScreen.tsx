import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';
import { useDebounce } from '../../../shared/lib/useDebounce';
import { SearchBar } from '../../../features/search-bar';
import { FacilityCard, Facility, useFacilities } from '../../../entities/facility';
import { FilterModal, FilterState } from './FilterModal';
import { MapViewComponent } from './MapViewComponent';
import { Button } from '../../../shared/ui';

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

const DEFAULT_FILTERS: FilterState = {
  time: '',
  sport: '',
  area: '',
  priceRange: '',
  rating: 0,
};

export function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openFilter?: string }>();

  const { facilities, loading, error } = useFacilities();

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Location State
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeRadius, setActiveRadius] = useState<number | null>(null);

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);

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

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setFilterVisible(false);
  };

  const handleResetFilter = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setFilterVisible(false);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setActiveRadius(null);
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

  const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '' && v !== 0 && v !== 'Tất cả').length + (activeRadius ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>

            <View style={styles.searchWrapper}>
              <SearchBar
                autoFocus={false}
                value={searchText}
                onChangeText={setSearchText}
                onFilterPress={() => setFilterVisible(true)}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
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
              style={[styles.quickChip, activeRadius === 5 && styles.quickChipActive]}
              onPress={() => handleNearMePress(5)}
            >
              <Text style={[styles.quickChipText, activeRadius === 5 && styles.quickChipTextActive]}>&lt; 5km</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickChip, appliedFilters.sport === 'Bóng đá' && styles.quickChipActive]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Bóng đá';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Bóng đá'});
                setFilters({...filters, sport: isSelected ? '' : 'Bóng đá'});
              }}
            >
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Bóng đá' && styles.quickChipTextActive]}>Bóng đá</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickChip, appliedFilters.sport === 'Pickleball' && styles.quickChipActive]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Pickleball';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Pickleball'});
                setFilters({...filters, sport: isSelected ? '' : 'Pickleball'});
              }}
            >
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Pickleball' && styles.quickChipTextActive]}>Pickleball</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickChip, appliedFilters.sport === 'Cầu lông' && styles.quickChipActive]} 
              onPress={() => {
                const isSelected = appliedFilters.sport === 'Cầu lông';
                setAppliedFilters({...appliedFilters, sport: isSelected ? '' : 'Cầu lông'});
                setFilters({...filters, sport: isSelected ? '' : 'Cầu lông'});
              }}
            >
              <Text style={[styles.quickChipText, appliedFilters.sport === 'Cầu lông' && styles.quickChipTextActive]}>Cầu lông</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Results Section */}
        {searchText.length === 0 && searchHistory.length > 0 ? (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Tìm kiếm gần đây</Text>
              <TouchableOpacity onPress={clearHistory}>
                <Text style={styles.clearHistoryText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchHistory}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.historyItemRow}>
                  <TouchableOpacity
                    style={styles.historyItemContent}
                    onPress={() => setSearchText(item)}
                  >
                    <MaterialIcons name="history" size={20} color={COLORS.outlineVariant} />
                    <Text style={styles.historyItemText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeHistoryItem(item)} style={styles.historyRemoveBtn}>
                    <MaterialIcons name="close" size={18} color={COLORS.outlineVariant} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ) : loading ? (
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
                    onPress={() => router.push(`/booking/${item.id}`)}
                    onBookPress={() => router.push(`/booking/${item.id}`)}
                  />
                </View>
              )}
            />
          ) : (
            <MapViewComponent
              facilities={filteredFacilities}
              userLocation={location?.coords}
              onMarkerPress={(facility) => router.push(`/booking/${facility.id}`)}
            />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: SPACING.xs,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
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
  historyContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceDim,
  },
  historyTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
  },
  clearHistoryText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceDim,
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  historyItemText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  historyRemoveBtn: {
    padding: SPACING.xs,
  },
});
