import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface PollTimePickerProps {
  selectedHour: number;
  selectedMinute: number;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
}

export function PollTimePicker({
  selectedHour,
  selectedMinute,
  onChangeHour,
  onChangeMinute,
}: PollTimePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Construct a Date object for the DateTimePicker
  const timeDate = new Date();
  timeDate.setHours(selectedHour, selectedMinute, 0, 0);

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setIsExpanded(false);
    }
    if (date) {
      onChangeHour(date.getHours());
      onChangeMinute(date.getMinutes());
    }
  };

  const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Time Card Header */}
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardActive]}
        activeOpacity={0.8}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.leftCol}>
          <View style={styles.iconBox}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Giờ kết thúc biểu quyết</Text>
        </View>

        <View style={styles.timePill}>
          <Text style={styles.timePillText}>{formattedTime}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={COLORS.primary}
          />
        </View>
      </TouchableOpacity>

      {/* iOS Wheel Spinner / Time Picker Dropdown */}
      {isExpanded && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={timeDate}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            textColor={COLORS.onSurface}
            style={styles.picker}
          />

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setIsExpanded(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              <Text style={styles.doneBtnText}>Xác nhận giờ</Text>
            </TouchableOpacity>
          )}
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
  title: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timePillText: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  picker: {
    width: '100%',
    height: 160,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    width: '100%',
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
