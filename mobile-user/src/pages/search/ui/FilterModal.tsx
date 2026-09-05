import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { CalendarPicker } from './filter-modal/CalendarPicker';
import { TimeScrollPicker } from './filter-modal/TimeScrollPicker';

export interface FilterState {
  sport: string;
  area: string;
  priceRange: string;
  rating: number;
  maxDistanceKm?: number | null;
  amenities?: string[];
  date?: Date;
  time?: string;
  sortBy?: 'DISTANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'POPULAR';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  totalResultsCount?: number;
}

const SPORTS = [
  { label: 'Tất cả', icon: 'sports' },
  { label: 'Bóng đá', icon: 'sports-soccer' },
  { label: 'Pickleball', icon: 'sports-tennis' },
  { label: 'Cầu lông', icon: 'badminton', isMci: true },
  { label: 'Tennis', icon: 'sports-tennis' },
  { label: 'Bóng rổ', icon: 'sports-basketball' },
  { label: 'Bóng chuyền', icon: 'sports-volleyball' },
];

const AREAS = [
  'Tất cả',
  'Cầu Giấy',
  'Đống Đa',
  'Ba Đình',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Thanh Xuân',
  'Hai Bà Trưng',
  'Tây Hồ',
  'Hoàng Mai',
  'Long Biên',
  'Hà Đông',
];

const PRICES = ['Tất cả', 'Dưới 200k', '200k - 400k', '400k - 600k', 'Trên 600k'];

const RATINGS = [
  { value: 0, label: 'Tất cả' },
  { value: 4.5, label: '4.5+ ⭐ Xuất sắc' },
  { value: 4.0, label: '4.0+ ⭐ Rất tốt' },
  { value: 3.5, label: '3.5+ ⭐ Tốt' },
];

const DISTANCES = [
  { value: null, label: 'Tất cả' },
  { value: 3, label: '< 3 km' },
  { value: 5, label: '< 5 km' },
  { value: 10, label: '< 10 km' },
  { value: 15, label: '< 15 km' },
];

const AMENITIES_LIST = [
  'Bãi đỗ ô tô',
  'Đèn chiếu sáng đêm',
  'Điều hòa / Trong nhà',
  'Nước uống miễn phí',
  'Cho thuê dụng cụ',
  'Phòng tắm nóng lạnh',
];

export function FilterModal({
  visible,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onReset,
  totalResultsCount,
}: FilterModalProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const current = filters.amenities || [];
    if (current.includes(amenity)) {
      updateFilter('amenities', current.filter((a) => a !== amenity));
    } else {
      updateFilter('amenities', [...current, amenity]);
    }
  };

  const isTodaySelected = () => {
    if (!filters.date) return true;
    const today = new Date();
    return (
      filters.date.getDate() === today.getDate() &&
      filters.date.getMonth() === today.getMonth() &&
      filters.date.getFullYear() === today.getFullYear()
    );
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
              {activeCount > 0 && (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{activeCount} đang chọn</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={onReset} style={styles.resetBtn} activeOpacity={0.7}>
                <Ionicons name="refresh" size={15} color={COLORS.primary} />
                <Text style={styles.resetBtnText}>Đặt lại</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <MaterialIcons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Filter Sections Scroll ── */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Môn Thể Thao */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="football-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Môn thể thao</Text>
              </View>
              <View style={styles.chipContainer}>
                {SPORTS.map((s) => {
                  const isSelected =
                    filters.sport === s.label ||
                    (!filters.sport && s.label === 'Tất cả');

                  return (
                    <TouchableOpacity
                      key={s.label}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => updateFilter('sport', s.label === 'Tất cả' ? '' : s.label)}
                      activeOpacity={0.8}
                    >
                      {s.isMci ? (
                        <MaterialCommunityIcons
                          name="badminton"
                          size={15}
                          color={isSelected ? COLORS.white : COLORS.onSurfaceVariant}
                        />
                      ) : (
                        <MaterialIcons
                          name={s.icon as any}
                          size={15}
                          color={isSelected ? COLORS.white : COLORS.onSurfaceVariant}
                        />
                      )}
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Thời Gian & Lịch Trống */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Ngày & Giờ mong muốn</Text>
              </View>

              <CalendarPicker
                selectedDate={filters.date}
                onSelectDate={(date) => updateFilter('date', date)}
              />

              <View style={{ marginTop: 10 }}>
                <TimeScrollPicker
                  selectedTime={filters.time}
                  onSelectTime={(time) => updateFilter('time', time)}
                  isToday={isTodaySelected()}
                />
              </View>
            </View>

            {/* 3. Khu Vực / Quận Huyện */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons name="location-on" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Khu vực / Quận huyện</Text>
              </View>
              <View style={styles.chipContainer}>
                {AREAS.map((area) => {
                  const isSelected =
                    filters.area === area || (!filters.area && area === 'Tất cả');
                  return (
                    <TouchableOpacity
                      key={area}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => updateFilter('area', area === 'Tất cả' ? '' : area)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {area}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Khoảng Giá */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Mức giá (đ/giờ)</Text>
              </View>
              <View style={styles.chipContainer}>
                {PRICES.map((price) => {
                  const isSelected =
                    filters.priceRange === price ||
                    (!filters.priceRange && price === 'Tất cả');
                  return (
                    <TouchableOpacity
                      key={price}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() =>
                        updateFilter('priceRange', price === 'Tất cả' ? '' : price)
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Bán Kính / Khoảng Cách */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <MaterialIcons name="near-me" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Bán kính quanh bạn</Text>
              </View>
              <View style={styles.chipContainer}>
                {DISTANCES.map((d) => {
                  const isSelected = filters.maxDistanceKm === d.value;
                  return (
                    <TouchableOpacity
                      key={d.label}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => updateFilter('maxDistanceKm', d.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 6. Điểm Đánh Giá */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star-outline" size={16} color="#D97706" />
                <Text style={styles.sectionTitle}>Đánh giá chất lượng</Text>
              </View>
              <View style={styles.chipContainer}>
                {RATINGS.map((r) => {
                  const isSelected =
                    filters.rating === r.value || (!filters.rating && r.value === 0);
                  return (
                    <TouchableOpacity
                      key={r.label}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => updateFilter('rating', r.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 7. Tiện Ích Đi Kèm */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Tiện ích sân bãi</Text>
              </View>
              <View style={styles.chipContainer}>
                {AMENITIES_LIST.map((amenity) => {
                  const isSelected = (filters.amenities || []).includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleAmenity(amenity)}
                      activeOpacity={0.8}
                    >
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                      ) : null}
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* ── Footer Actions ── */}
          <View style={[styles.footer, { paddingBottom: Math.max(SPACING.md, 20) }]}>
            <TouchableOpacity
              style={styles.footerResetBtn}
              onPress={onReset}
              activeOpacity={0.8}
            >
              <Text style={styles.footerResetText}>Đặt lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerApplyBtn}
              onPress={onApply}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={18} color={COLORS.white} />
              <Text style={styles.footerApplyText}>
                {totalResultsCount != null
                  ? `Xem ${totalResultsCount} kết quả`
                  : 'Áp dụng bộ lọc'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl * 1.2,
    borderTopRightRadius: BORDER_RADIUS.xl * 1.2,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  activePill: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
  },
  activePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  resetBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: COLORS.surface,
  },
  footerResetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  footerResetText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  footerApplyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
  },
  footerApplyText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
});
