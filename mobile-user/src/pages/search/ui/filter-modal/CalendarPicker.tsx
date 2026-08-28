import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../../shared/config/theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CalendarPickerProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarPicker({ selectedDate, onSelectDate }: CalendarPickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialDate = selectedDate || today;
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [isExpanded, setIsExpanded] = useState(false);

  // When selectedDate changes externally (if it does), we might want to collapse. Not strictly necessary.

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleSelectDate = (date: Date) => {
    onSelectDate(date);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= todayMonth) {
      setCurrentMonth(prev);
    }
  };

  const calendarWeeks = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    days.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === days.length - 1) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [currentMonth]);

  const monthYearStr = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const formatDateLabel = () => {
    const d = selectedDate || today;
    const isToday = d.getTime() === today.getTime();
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (isToday) return `Hôm nay, ${dateStr}`;
    return dateStr;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.summaryRow} 
        activeOpacity={0.7} 
        onPress={toggleExpand}
      >
        <MaterialIcons name="event" size={20} color={COLORS.primary} />
        <Text style={styles.summaryText}>{formatDateLabel()}</Text>
        <MaterialIcons 
          name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={24} 
          color={COLORS.onSurfaceVariant} 
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
              <MaterialIcons name="chevron-left" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthYearStr}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.weekRow}>
            {weekDays.map(day => (
              <View key={day} style={styles.dayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarWeeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map((date: Date | null, dayIndex: number) => {
                  if (!date) {
                    return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
                  }

                  const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                  const isPast = date < today;

                  return (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.dayCell,
                        styles.dayButton,
                        isSelected && styles.selectedDay
                      ]}
                      disabled={isPast}
                      onPress={() => handleSelectDate(date)}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isPast && styles.pastDayText
                      ]}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  summaryText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  calendarContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceDim,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.xs,
  },
  monthText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  weekDayText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  daysGrid: {
    // Không cần wrap vì đã chia thành các tuần (weekRow)
  },
  dayCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  pastDayText: {
    color: COLORS.outlineVariant,
  }
});
