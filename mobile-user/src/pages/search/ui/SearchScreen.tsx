import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';
import { SearchBar } from '../../../features/search-bar';
import { FacilityCard, Facility } from '../../../entities/facility';
import { FilterModal, FilterState } from './FilterModal';
import { Button } from '../../../shared/ui';

// MOCK DATA
const MOCK_FACILITIES: (Facility & { sport: string; area: string; priceCategory: string })[] = [
  {
    id: 'f1',
    name: 'Sân bóng Cầu Giấy',
    rating: 4.5,
    location: '123 Xuân Thủy',
    area: 'Cầu Giấy',
    distance: '1.2km',
    price: '300k',
    priceCategory: '300k - 500k',
    sport: 'Bóng đá',
    status: 'Còn chỗ',
    statusType: 'success',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRI_WbsF_oyNYiLMb9oK7Dm3y6w39BRYXwgKn4BIuRp7CQ9vb-2NUDL_Fi2bYTm1AGCX8AkcWgfKPcjwP9ba_vXQ--Ro7V-RZMOzvRKSIz3YF985plPNcZoJ2CUCgNb_OMUB6q5yYYbUEd6gxEcPZzhNrQWwrc956zxXGydvPDXN6mk8L-5wHs7UtYzZbtQ8_zlH90kYKNbQ0KgcAto4dmTlMzNATIjHtfNvaokJY_yshJWhunjucTicKeRKwqNyRMG3SHJdgmKMw',
  },
  {
    id: 'f2',
    name: 'Sân Pickleball Đống Đa',
    rating: 4.8,
    location: '45 Chùa Bộc',
    area: 'Đống Đa',
    distance: '2.5km',
    price: '150k',
    priceCategory: 'Dưới 300k',
    sport: 'Pickleball',
    status: 'Sắp hết',
    statusType: 'warning',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9VjV_Boq-m-L6DQCrUi4TuqXv4ziB_UMEyaSBpCC06D-VhJMf8k0VKDy7cFwJjwZzWqF5MObMpDYZ0bFGvZg3GEbKCaxJc_-K_Sxn3ZAX506_WXTQHUHoeNB75WPXy_R8yDDxK1a4TRDnwUFxwW3GizSR5XXOzrAcdysQLwWOgGUWkiMv9Fsl5Rmi44-ntayXHeMh66KzQzRGm5EN0qgehvk2-x43HOXiUnNotg3zUP9LfRD4u7kT4EcyjgydihqR3aGqF9yEmCo',
  },
  {
    id: 'f3',
    name: 'Nhà thi đấu Hai Bà Trưng',
    rating: 4.2,
    location: '89 Đại Cồ Việt',
    area: 'Hai Bà Trưng',
    distance: '4.0km',
    price: '600k',
    priceCategory: 'Trên 500k',
    sport: 'Bóng rổ',
    status: 'Còn chỗ',
    statusType: 'success',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRI_WbsF_oyNYiLMb9oK7Dm3y6w39BRYXwgKn4BIuRp7CQ9vb-2NUDL_Fi2bYTm1AGCX8AkcWgfKPcjwP9ba_vXQ--Ro7V-RZMOzvRKSIz3YF985plPNcZoJ2CUCgNb_OMUB6q5yYYbUEd6gxEcPZzhNrQWwrc956zxXGydvPDXN6mk8L-5wHs7UtYzZbtQ8_zlH90kYKNbQ0KgcAto4dmTlMzNATIjHtfNvaokJY_yshJWhunjucTicKeRKwqNyRMG3SHJdgmKMw',
  },
  {
    id: 'f4',
    name: 'Sân Tennis Thanh Xuân',
    rating: 3.5,
    location: '12 Khuất Duy Tiến',
    area: 'Thanh Xuân',
    distance: '5.2km',
    price: '200k',
    priceCategory: 'Dưới 300k',
    sport: 'Tennis',
    status: 'Còn chỗ',
    statusType: 'success',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9VjV_Boq-m-L6DQCrUi4TuqXv4ziB_UMEyaSBpCC06D-VhJMf8k0VKDy7cFwJjwZzWqF5MObMpDYZ0bFGvZg3GEbKCaxJc_-K_Sxn3ZAX506_WXTQHUHoeNB75WPXy_R8yDDxK1a4TRDnwUFxwW3GizSR5XXOzrAcdysQLwWOgGUWkiMv9Fsl5Rmi44-ntayXHeMh66KzQzRGm5EN0qgehvk2-x43HOXiUnNotg3zUP9LfRD4u7kT4EcyjgydihqR3aGqF9yEmCo',
  },
];

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

  const [searchText, setSearchText] = useState('');
  const [isFilterVisible, setFilterVisible] = useState(false);
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
    return MOCK_FACILITIES.filter(facility => {
      // 1. Text Search
      if (searchText && !facility.name.toLowerCase().includes(searchText.toLowerCase())) {
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

      return true;
    });
  }, [searchText, appliedFilters]);

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
  };

  const activeFilterCount = Object.values(appliedFilters).filter(v => v !== '' && v !== 0 && v !== 'Tất cả').length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <SearchBar
              autoFocus={false} // TẮT HOÀN TOÀN AUTOFOCUS CHỐNG LAG
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
        </View>

        {/* Results Section */}
        {filteredFacilities.length > 0 ? (
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 0,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: SPACING.xs,
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
});
