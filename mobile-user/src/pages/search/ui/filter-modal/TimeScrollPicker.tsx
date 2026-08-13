import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../../shared/config/theme';

interface TimeScrollPickerProps {
  selectedTime?: string; // Format "HH:00"
  onSelectTime: (time: string) => void;
  isToday?: boolean;
}

// Generate hours from 06:00 to 23:00 outside component so reference is stable
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  return `${hour.toString().padStart(2, '0')}:00`;
});

export function TimeScrollPicker({ selectedTime, onSelectTime, isToday }: TimeScrollPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const currentHour = new Date().getHours();

  useEffect(() => {
    let indexToScroll = -1;

    if (selectedTime) {
      indexToScroll = HOURS.indexOf(selectedTime);
    } else if (isToday) {
      // Find the next available hour slot
      const nextHour = currentHour + 1;
      const nextTimeStr = `${nextHour.toString().padStart(2, '0')}:00`;
      indexToScroll = HOURS.indexOf(nextTimeStr);
      
      // If nextHour is beyond available hours, we scroll to the end or do nothing
      if (indexToScroll === -1 && nextHour <= 23) {
        // Fallback: if somehow nextHour is valid but not in HOURS
      }
    }

    if (indexToScroll !== -1 && scrollViewRef.current) {
      // Approximate scroll to index
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: indexToScroll * 80, animated: true });
      }, 100);
    }
  }, [selectedTime, isToday, currentHour]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {HOURS.map((timeStr) => {
          const hourNum = parseInt(timeStr.split(':')[0], 10);
          const isPast = isToday && hourNum <= currentHour;
          const isSelected = selectedTime === timeStr;

          return (
            <TouchableOpacity
              key={timeStr}
              style={[
                styles.timeChip,
                isSelected && styles.timeChipActive,
                isPast && styles.timeChipPast,
              ]}
              disabled={isPast}
              onPress={() => onSelectTime(isSelected ? '' : timeStr)}
            >
              <Text
                style={[
                  styles.timeText,
                  isSelected && styles.timeTextActive,
                  isPast && styles.timeTextPast,
                ]}
              >
                {timeStr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  scrollContent: {
    gap: SPACING.sm,
    paddingHorizontal: 2, // avoid clipping shadow/border
  },
  timeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    minWidth: 70,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipPast: {
    backgroundColor: COLORS.surfaceDim,
    borderColor: COLORS.surfaceDim,
  },
  timeText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  timeTextActive: {
    color: COLORS.white,
  },
  timeTextPast: {
    color: COLORS.outlineVariant,
  }
});
