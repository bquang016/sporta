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

  // Embedded Calendar Grid calculation
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const startCol = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Mon ... 6 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateObj: Date | null; isPast: boolean; isSelected: boolean }> = [];
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
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>Ngày kết thúc biểu quyết</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.toggleBtn}
        >
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'calendar-outline'}
            size={14}
            color={COLORS.primary}
          />
          <Text style={styles.toggleBtnText}>
            {isExpanded ? 'Đóng lịch' : 'Mở lịch'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Summary Card */}
      <TouchableOpacity
        style={[styles.dateSelectorCard, isExpanded && styles.dateSelectorCardActive]}
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.dateSelectorLeft}>
          <View style={styles.calendarIconCircle}>
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.dateSelectorSub}>Chạm để chọn ngày</Text>
            <Text style={styles.dateSelectorTitle}>{formatDateDisplay(selectedDate)}</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-forward'}
          size={16}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {/* Embedded Calendar View */}
      {isExpanded && (
        <View style={styles.embeddedCalendarCard}>
          {/* Month Header */}
          <View style={styles.calendarMonthHeader}>
            <TouchableOpacity
              style={[styles.calendarNavBtn, isAtCurrentMonth && styles.calendarNavBtnDisabled]}
              disabled={isAtCurrentMonth}
              onPress={handlePrevMonth}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={isAtCurrentMonth ? '#CBD5E1' : '#1E293B'}
              />
            </TouchableOpacity>

            <Text style={styles.calendarMonthTitle}>
              Tháng {viewMonth + 1}, {viewYear}
            </Text>

            <TouchableOpacity
              style={styles.calendarNavBtn}
              onPress={handleNextMonth}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={16} color="#1E293B" />
            </TouchableOpacity>
          </View>

          {/* Weekday Row */}
          <View style={styles.calendarWeekdaysRow}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wd, i) => (
              <Text key={i} style={styles.calendarWeekdayText}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.calendarDaysGrid}>
            {calendarGrid.map((cell, index) => {
              if (!cell.day) {
                return <View key={index} style={styles.calendarDayEmpty} />;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDayCell,
                    cell.isSelected && styles.calendarDayCellSelected,
                  ]}
                  disabled={cell.isPast}
                  onPress={() => cell.dateObj && handleSelectDay(cell.dateObj)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      cell.isPast && styles.calendarDayTextPast,
                      cell.isSelected && styles.calendarDayTextSelected,
                    ]}
                  >
                    {cell.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.calendarDoneBtn}
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.calendarDoneBtnText}>Xác nhận ngày</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
    color: '#1E293B',
    fontSize: 13,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  toggleBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
  },
  dateSelectorCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  calendarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorSub: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10.5,
  },
  dateSelectorTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 13,
    marginTop: 1,
  },
  embeddedCalendarCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 8,
  },
  calendarNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavBtnDisabled: {
    opacity: 0.3,
  },
  calendarMonthTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  calendarWeekdayText: {
    width: 32,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayEmpty: {
    width: 32,
    height: 32,
    marginVertical: 2,
  },
  calendarDayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  calendarDayTextPast: {
    color: '#CBD5E1',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calendarDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  calendarDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
