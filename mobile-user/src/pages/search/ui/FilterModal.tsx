import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { CalendarPicker } from './filter-modal/CalendarPicker';
import { TimeScrollPicker } from './filter-modal/TimeScrollPicker';

export interface FilterState {
  sport: string;
  area: string;
  priceRange: string;
  rating: number;
  date?: Date;
  time?: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
}

const SPORTS = ['Tất cả', 'Bóng đá', 'Pickleball', 'Bóng rổ', 'Cầu lông', 'Tennis'];
const AREAS = ['Tất cả', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Hoàng Mai'];
const PRICES = ['Tất cả', 'Dưới 300k', '300k - 500k', 'Trên 500k'];
const RATINGS = [0, 1, 2, 3, 4, 5]; // 0 means all

export function FilterModal({ visible, onClose, filters, onFilterChange, onApply, onReset }: FilterModalProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const isTodaySelected = () => {
    if (!filters.date) return true; // Default to today
    const today = new Date();
    return (
      filters.date.getDate() === today.getDate() &&
      filters.date.getMonth() === today.getMonth() &&
      filters.date.getFullYear() === today.getFullYear()
    );
  };

  const renderChips = (title: string, options: any[], selected: any, key: keyof FilterState) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipContainer}>
        {options.map((option) => {
          const isSelected = selected === option || (selected === '' && option === 'Tất cả') || (selected === 0 && option === 0);
          const label = typeof option === 'number' && option > 0 ? `${option} Sao+` : option === 0 ? 'Tất cả' : option;
          
          return (
            <TouchableOpacity 
              key={option} 
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => {
                if (isSelected) {
                  updateFilter(key, typeof option === 'number' ? 0 : '');
                } else {
                  updateFilter(key, option === 'Tất cả' || option === 0 ? (typeof option === 'number' ? 0 : '') : option);
                }
              }}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bộ lọc</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            {/* Lịch trống */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ngày</Text>
              <CalendarPicker 
                selectedDate={filters.date} 
                onSelectDate={(date) => updateFilter('date', date)} 
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giờ</Text>
              <TimeScrollPicker 
                selectedTime={filters.time}
                onSelectTime={(time) => updateFilter('time', time)}
                isToday={isTodaySelected()}
              />
            </View>

            {renderChips('Môn thể thao', SPORTS, filters.sport, 'sport')}
            {renderChips('Khu vực', AREAS, filters.area, 'area')}
            {renderChips('Tầm giá', PRICES, filters.priceRange, 'priceRange')}
            {renderChips('Đánh giá', RATINGS, filters.rating, 'rating')}
          </ScrollView>
          
          <View style={styles.footer}>
            <Button 
              title="Thiết lập lại" 
              variant="outline" 
              style={styles.footerBtn} 
              onPress={onReset} 
            />
            <Button 
              title="Áp dụng" 
              variant="primary" 
              style={styles.footerBtn} 
              onPress={onApply} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  scrollArea: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity10,
  },
  chipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  footerBtn: {
    flex: 1,
  },
});
