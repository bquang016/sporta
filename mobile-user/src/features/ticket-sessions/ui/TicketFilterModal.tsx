import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TicketFilterState, SportLevel } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface TicketFilterModalProps {
  visible: boolean;
  filters: TicketFilterState;
  onClose: () => void;
  onApply: (filters: TicketFilterState) => void;
  onReset: () => void;
}

export function TicketFilterModal({ visible, filters, onClose, onApply, onReset }: TicketFilterModalProps) {
  const [radius, setRadius] = useState<number | undefined>(filters.radiusKm);
  const [timeSlot, setTimeSlot] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>(filters.timeSlot || 'ALL');
  const [sportLevel, setSportLevel] = useState<SportLevel | undefined>(filters.sportLevel || 'ALL');

  const RADIUS_OPTIONS = [
    { label: 'Tất cả', value: undefined },
    { label: '< 2 km', value: 2 },
    { label: '< 5 km', value: 5 },
    { label: '< 10 km', value: 10 },
  ];

  const TIME_SLOT_OPTIONS = [
    { label: 'Tất cả khung giờ', value: 'ALL' as const },
    { label: 'Sáng (06:00 - 12:00)', value: 'MORNING' as const },
    { label: 'Chiều (12:00 - 18:00)', value: 'AFTERNOON' as const },
    { label: 'Tối (18:00 - 23:00)', value: 'EVENING' as const },
  ];

  const LEVEL_OPTIONS = [
    { label: 'Tất cả trình độ', value: 'ALL' as const },
    { label: 'Yếu (< 900)', value: 'WEAK' as const },
    { label: 'Trung bình - Yếu (900 - 1199)', value: 'WEAK_AVERAGE' as const },
    { label: 'Trung bình (1200 - 1499)', value: 'AVERAGE' as const },
    { label: 'Trung bình - Khá (1500 - 1799)', value: 'AVERAGE_GOOD' as const },
    { label: 'Bán chuyên (1800 - 2099)', value: 'GOOD' as const },
    { label: 'Chuyên nghiệp (≥ 2100)', value: 'PRO' as const },
  ];

  const handleApply = () => {
    onApply({
      radiusKm: radius,
      timeSlot,
      sportLevel,
    });
    onClose();
  };

  const handleReset = () => {
    setRadius(undefined);
    setTimeSlot('ALL');
    setSportLevel('ALL');
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Sheet Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <MaterialIcons name="tune" size={20} color={COLORS.primary} />
                  <Text style={styles.headerTitle}>Bộ Lọc Xé Vé</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <MaterialIcons name="close" size={22} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 1. Distance Radius Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Khoảng cách bán kính</Text>
                  <View style={styles.chipGrid}>
                    {RADIUS_OPTIONS.map((item) => {
                      const isSelected = radius === item.value;
                      return (
                        <TouchableOpacity
                          key={item.label}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          onPress={() => setRadius(item.value)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Time Slot Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Khung giờ mong muốn</Text>
                  <View style={styles.chipColumn}>
                    {TIME_SLOT_OPTIONS.map((item) => {
                      const isSelected = timeSlot === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[styles.chipFullWidth, isSelected && styles.chipSelected]}
                          onPress={() => setTimeSlot(item.value)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {item.label}
                          </Text>
                          {isSelected && <MaterialIcons name="check" size={16} color={COLORS.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Sport Level Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Trình độ tối thiểu</Text>
                  <View style={styles.chipGrid}>
                    {LEVEL_OPTIONS.map((item) => {
                      const isSelected = sportLevel === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[styles.chip, isSelected && styles.chipSelected]}
                          onPress={() => setSportLevel(item.value)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles.resetBtnText}>Đặt lại</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
                  <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterSection: {
    marginVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chipColumn: {
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipFullWidth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary, // Deep Emerald
    fontWeight: '800',
    fontSize: 14,
  },
});
