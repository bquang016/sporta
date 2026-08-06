import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export interface FilterState {
  time: string;
  sport: string;
  area: string;
  priceRange: string;
  rating: number;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
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
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showStartPicker, setShowStartPicker] = React.useState(false);
  const [showEndPicker, setShowEndPicker] = React.useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Chọn ngày';
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (date?: Date) => {
    if (!date) return 'Chọn giờ';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
              onPress={() => updateFilter(key, option === 'Tất cả' || option === 0 ? (typeof option === 'number' ? 0 : '') : option)}
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
          
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Timeslot Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lịch trống</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                  <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
                  <Text style={styles.dateBtnText}>{formatDate(filters.date)}</Text>
                </TouchableOpacity>

                <View style={styles.timeRow}>
                  <TouchableOpacity style={[styles.dateBtn, { flex: 1 }]} onPress={() => setShowStartPicker(true)}>
                    <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                    <Text style={styles.dateBtnText}>{formatTime(filters.startTime)}</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 8 }}>-</Text>
                  <TouchableOpacity style={[styles.dateBtn, { flex: 1 }]} onPress={() => setShowEndPicker(true)}>
                    <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                    <Text style={styles.dateBtnText}>{formatTime(filters.endTime)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Date/Time Pickers (Android needs separate modal/logic, iOS uses inline but we use default for simplicity) */}
            {showDatePicker && (
              <DateTimePicker
                value={filters.date || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) updateFilter('date', selectedDate);
                }}
              />
            )}
            {showStartPicker && (
              <DateTimePicker
                value={filters.startTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowStartPicker(Platform.OS === 'ios');
                  if (selectedTime) updateFilter('startTime', selectedTime);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={filters.endTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (selectedTime) updateFilter('endTime', selectedTime);
                }}
              />
            )}

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
    maxHeight: '80%',
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
  datePickerContainer: {
    gap: SPACING.md,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  dateBtnText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
