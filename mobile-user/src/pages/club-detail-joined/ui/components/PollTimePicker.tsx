import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface PollTimePickerProps {
  selectedHour: number;
  selectedMinute: number;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
}

const QUICK_PRESETS = [
  { h: 12, m: 0, label: '12:00' },
  { h: 17, m: 0, label: '17:00' },
  { h: 18, m: 0, label: '18:00' },
  { h: 19, m: 0, label: '19:00' },
  { h: 20, m: 0, label: '20:00' },
  { h: 21, m: 0, label: '21:00' },
  { h: 22, m: 0, label: '22:00' },
];

export function PollTimePicker({
  selectedHour,
  selectedMinute,
  onChangeHour,
  onChangeMinute,
}: PollTimePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

  const adjustHour = (delta: number) => {
    let next = selectedHour + delta;
    if (next < 0) next = 23;
    if (next > 23) next = 0;
    onChangeHour(next);
  };

  const adjustMinute = (delta: number) => {
    let next = selectedMinute + delta;
    if (next < 0) next = 55;
    if (next > 59) next = 0;
    onChangeMinute(next);
  };

  const handleSelectPreset = (h: number, m: number) => {
    onChangeHour(h);
    onChangeMinute(m);
  };

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
          <View>
            <Text style={styles.title}>Giờ kết thúc biểu quyết</Text>
            <Text style={styles.subtitle}>Thời điểm tự động khóa bình chọn</Text>
          </View>
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

      {/* Universal Interactive Time Selector (Works seamlessly on Web, Android, iOS) */}
      {isExpanded && (
        <View style={styles.pickerContainer}>
          {/* Quick Presets Carousel */}
          <Text style={styles.presetSectionTitle}>Giờ phổ biến:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsRow}
          >
            {QUICK_PRESETS.map((p, idx) => {
              const isSelected = selectedHour === p.h && selectedMinute === p.m;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  activeOpacity={0.75}
                  onPress={() => handleSelectPreset(p.h, p.m)}
                >
                  <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Digital Time Adjustment Box */}
          <View style={styles.digitalTunerBox}>
            {/* Hour Column */}
            <View style={styles.tunerCol}>
              <TouchableOpacity
                style={styles.tunerBtn}
                activeOpacity={0.7}
                onPress={() => adjustHour(+1)}
              >
                <Ionicons name="chevron-up" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              
              <View style={styles.timeDisplayCard}>
                <Text style={styles.timeDigitText}>
                  {String(selectedHour).padStart(2, '0')}
                </Text>
                <Text style={styles.timeUnitLabel}>Giờ</Text>
              </View>

              <TouchableOpacity
                style={styles.tunerBtn}
                activeOpacity={0.7}
                onPress={() => adjustHour(-1)}
              >
                <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <Text style={styles.colonSeparator}>:</Text>

            {/* Minute Column */}
            <View style={styles.tunerCol}>
              <TouchableOpacity
                style={styles.tunerBtn}
                activeOpacity={0.7}
                onPress={() => adjustMinute(+5)}
              >
                <Ionicons name="chevron-up" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              
              <View style={styles.timeDisplayCard}>
                <Text style={styles.timeDigitText}>
                  {String(selectedMinute).padStart(2, '0')}
                </Text>
                <Text style={styles.timeUnitLabel}>Phút</Text>
              </View>

              <TouchableOpacity
                style={styles.tunerBtn}
                activeOpacity={0.7}
                onPress={() => adjustMinute(-5)}
              >
                <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Close / Confirm Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>Xác nhận: {formattedTime}</Text>
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
  title: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
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
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  presetSectionTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  digitalTunerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    marginVertical: 10,
    gap: 16,
  },
  tunerCol: {
    alignItems: 'center',
  },
  tunerBtn: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeDisplayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 6,
    minWidth: 64,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  timeDigitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeUnitLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  colonSeparator: {
    fontSize: 24,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    width: '100%',
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  doneBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
