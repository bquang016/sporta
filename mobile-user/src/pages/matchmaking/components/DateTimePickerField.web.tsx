/**
 * DateTimePickerField.web.tsx
 * Web fallback: dùng HTML <input type="date"> và <input type="time">
 * Metro tự động resolve .web.tsx cho platform web.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function toLocalDateString(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalTimeString(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function DateTimePickerField({ value, onChange }: Props) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y, m, d] = e.target.value.split('-').map(Number);
    const next = new Date(value);
    next.setFullYear(y, m - 1, d);
    onChange(next);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, min] = e.target.value.split(':').map(Number);
    const next = new Date(value);
    next.setHours(h, min, 0, 0);
    onChange(next);
  };

  const todayStr = toLocalDateString(new Date());

  return (
    <View style={styles.dateTimeRow}>
      {/* Date Input */}
      <View style={styles.pickerBox}>
        <View style={styles.pickerIconRow}>
          <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
          <Text style={styles.pickerLabel}>NGÀY</Text>
        </View>
        <input
          type="date"
          value={toLocalDateString(value)}
          min={todayStr}
          onChange={handleDateChange}
          style={webInputStyle as any}
        />
        <Text style={styles.pickerSub}>
          {value.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Time Input */}
      <View style={styles.pickerBox}>
        <View style={styles.pickerIconRow}>
          <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
          <Text style={styles.pickerLabel}>GIỜ BẮT ĐẦU</Text>
        </View>
        <input
          type="time"
          value={toLocalTimeString(value)}
          onChange={handleTimeChange}
          style={webInputStyle as any}
        />
        <Text style={styles.pickerSub}>Giờ địa phương</Text>
      </View>
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  fontFamily: 'Hanken Grotesk, sans-serif',
  fontSize: 20,
  fontWeight: 800,
  color: '#064E3B',
  border: 'none',
  background: 'transparent',
  outline: 'none',
  cursor: 'pointer',
  padding: '2px 0',
  width: '100%',
};

const styles = StyleSheet.create({
  dateTimeRow: { flexDirection: 'row', gap: SPACING.sm },
  pickerBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    padding: SPACING.md,
    gap: 4,
  },
  pickerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pickerLabel: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pickerSub: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.outline,
  },
});
