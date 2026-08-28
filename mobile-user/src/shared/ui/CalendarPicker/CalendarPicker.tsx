import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../config/theme';
import { Button } from '../Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarPickerProps {
  visible: boolean;
  selectedDate: Date;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/**
 * Returns an array of Date | null representing the calendar grid for the given
 * month/year (null = empty filler cell before the 1st day).
 */
const buildCalendarGrid = (year: number, month: number): (Date | null)[] => {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d));
  }
  return grid;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarPicker({
  visible,
  selectedDate,
  minimumDate,
  onConfirm,
  onClose,
}: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate));
  const [pendingDate, setPendingDate] = useState(() => new Date(selectedDate));

  const minDay = minimumDate ? startOfDay(minimumDate) : null;

  const goToPrevMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleDayPress = (day: Date) => {
    if (minDay && startOfDay(day) < minDay) return;
    setPendingDate(new Date(day));
  };

  const handleConfirm = () => {
    onConfirm(pendingDate);
    onClose();
  };

  const handleClose = () => {
    // Reset pending to current selectedDate on dismiss
    setPendingDate(new Date(selectedDate));
    setViewDate(new Date(selectedDate));
    onClose();
  };

  const grid = buildCalendarGrid(viewDate.getFullYear(), viewDate.getMonth());

  // Can we go back? Only if there is at least one selectable day in the prev month
  const canGoPrev = (() => {
    if (!minDay) return true;
    const prevMonthLastDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0);
    return startOfDay(prevMonthLastDay) >= minDay;
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* ── Header ─────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn ngày</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* ── Month Navigator ────────────────────────── */}
          <View style={styles.navigator}>
            <TouchableOpacity
              onPress={goToPrevMonth}
              disabled={!canGoPrev}
              style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}
              hitSlop={8}
            >
              <MaterialIcons
                name="chevron-left"
                size={28}
                color={canGoPrev ? COLORS.primary : COLORS.outlineVariant}
              />
            </TouchableOpacity>

            <Text style={styles.monthLabel}>
              {MONTHS_VI[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Text>

            <TouchableOpacity onPress={goToNextMonth} hitSlop={8} style={styles.navBtn}>
              <MaterialIcons name="chevron-right" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* ── Day-of-week Headers ────────────────────── */}
          <View style={styles.dowRow}>
            {DAYS_OF_WEEK.map(d => (
              <View key={d} style={styles.dowCell}>
                <Text style={[styles.dowText, d === 'CN' && styles.sundayText]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* ── Calendar Grid ──────────────────────────── */}
          <View style={styles.grid}>
            {grid.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const today = new Date();
              const isDisabled = minDay ? startOfDay(day) < minDay : false;
              const isSelected = isSameDay(day, pendingDate);
              const isToday = isSameDay(day, today);
              const isSunday = day.getDay() === 0;

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={styles.dayCell}
                  onPress={() => handleDayPress(day)}
                  disabled={isDisabled}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayInner,
                      isSelected && styles.daySelected,
                      isToday && !isSelected && styles.dayToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isDisabled && styles.dayTextDisabled,
                        isSelected && styles.dayTextSelected,
                        isSunday && !isSelected && !isDisabled && styles.sundayText,
                        isToday && !isSelected && styles.dayTextToday,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Confirm Button ─────────────────────────── */}
          <Button 
            title="Xác nhận"
            variant="primary"
            size="md"
            onPress={handleConfirm}
            style={styles.confirmBtn}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const DAY_SIZE = 40;
const GRID_COLUMNS = 7;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    paddingBottom: SPACING.md,
    overflow: 'hidden',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },

  // ── Month Navigator
  navigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  navBtn: {
    padding: SPACING.xs,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  monthLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700' as const,
  },

  // ── Day-of-week row
  dowRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.xs,
  },
  dowCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dowText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },

  // ── Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  dayCell: {
    width: `${100 / GRID_COLUMNS}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayInner: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: COLORS.primary,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    letterSpacing: 0,
  },
  dayTextDisabled: {
    color: COLORS.outlineVariant,
  },
  dayTextSelected: {
    color: COLORS.onPrimary,
  },
  dayTextToday: {
    color: COLORS.primary,
  },
  sundayText: {
    color: COLORS.error,
  },

  // ── Confirm
  confirmBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
});
