import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface PollDatePickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function PollDatePicker({
  selectedDate,
  onSelectDate,
}: PollDatePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => selectedDate.getMonth()); // 0 - 11

  const formatDateDisplay = (d: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dayName}, ${dd}/${mm}/${yyyy}`;
  };

  // Embedded Calendar Grid calculation (7-column strict grid)
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const startCol = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Mon ... 6 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateObj: Date | null; isPast: boolean; isSelected: boolean }> = [];
    
    // Leading empty cells
    for (let i = 0; i < startCol; i++) {
      cells.push({ day: null, dateObj: null, isPast: false, isSelected: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);
      const isPast = cellDate < today;
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getFullYear() === viewYear;

      cells.push({ day, dateObj: cellDate, isPast, isSelected });
    }

    // Trailing empty cells to complete the 7-column grid
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const remaining = 7 - remainder;
      for (let i = 0; i < remaining; i++) {
        cells.push({ day: null, dateObj: null, isPast: false, isSelected: false });
      }
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate]);

  const now = new Date();
  const isAtCurrentMonth = viewYear === now.getFullYear() && viewMonth <= now.getMonth();

  const handlePrevMonth = () => {
    if (isAtCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (d: Date) => {
    onSelectDate(d);
  };

  return (
    <View style={styles.container}>
      {/* Date Card Header */}
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardActive]}
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.leftCol}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>Ngày kết thúc biểu quyết</Text>
            <Text style={styles.subtitle}>{formatDateDisplay(selectedDate)}</Text>
          </View>
        </View>

        <View style={styles.togglePill}>
          <Text style={styles.togglePillText}>
            {isExpanded ? 'Đóng' : 'Đổi ngày'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={COLORS.primary}
          />
        </View>
      </TouchableOpacity>

      {/* Embedded Calendar Dropdown */}
      {isExpanded && (
        <View style={styles.calendarCard}>
          {/* Month Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={[styles.navBtn, isAtCurrentMonth && styles.navBtnDisabled]}
              disabled={isAtCurrentMonth}
              onPress={handlePrevMonth}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={isAtCurrentMonth ? '#CBD5E1' : COLORS.onSurface}
              />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              Tháng {viewMonth + 1}, {viewYear}
            </Text>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={handleNextMonth}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Weekday Row */}
          <View style={styles.weekdaysRow}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wd, i) => (
              <View key={i} style={styles.weekdayCol}>
                <Text style={styles.weekdayText}>{wd}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid - Strict 7 Columns */}
          <View style={styles.daysGrid}>
            {calendarGrid.map((cell, index) => {
              if (!cell.day) {
                return <View key={index} style={styles.dayCol} />;
              }

              return (
                <View key={index} style={styles.dayCol}>
                  <TouchableOpacity
                    style={[
                      styles.dayCircle,
                      cell.isSelected && styles.dayCircleSelected,
                    ]}
                    disabled={cell.isPast}
                    onPress={() => cell.dateObj && handleSelectDay(cell.dateObj)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        cell.isPast && styles.dayTextPast,
                        cell.isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={15} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>Xác nhận ngày này</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '600',
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  togglePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  calendarCard: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  monthTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayCol: {
    width: '14.285%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCol: {
    width: '14.285%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  dayTextPast: {
    color: '#CBD5E1',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  doneBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
