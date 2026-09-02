import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

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
  const handleDecreaseHour = () => {
    onChangeHour(selectedHour === 0 ? 23 : selectedHour - 1);
  };

  const handleIncreaseHour = () => {
    onChangeHour(selectedHour === 23 ? 0 : selectedHour + 1);
  };

  const handleDecreaseMinute = () => {
    onChangeMinute(selectedMinute === 0 ? 45 : selectedMinute - 15);
  };

  const handleIncreaseMinute = () => {
    onChangeMinute(selectedMinute === 45 ? 0 : selectedMinute + 15);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>Giờ kết thúc biểu quyết</Text>
        <Text style={styles.timePreview}>
          {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.timePickerContainer}>
        {/* Hour Stepper Box */}
        <View style={styles.timeUnitBox}>
          <Text style={styles.timeUnitLabel}>Giờ (00 - 23)</Text>
          <View style={styles.timeStepper}>
            <TouchableOpacity
              style={styles.timeStepperBtn}
              onPress={handleDecreaseHour}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={16} color="#1E293B" />
            </TouchableOpacity>

            <Text style={styles.timeValueText}>
              {String(selectedHour).padStart(2, '0')}
            </Text>

            <TouchableOpacity
              style={styles.timeStepperBtn}
              onPress={handleIncreaseHour}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Separator Colon */}
        <Text style={styles.timeColon}>:</Text>

        {/* Minute Stepper Box */}
        <View style={styles.timeUnitBox}>
          <Text style={styles.timeUnitLabel}>Phút (bước 15p)</Text>
          <View style={styles.timeStepper}>
            <TouchableOpacity
              style={styles.timeStepperBtn}
              onPress={handleDecreaseMinute}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={16} color="#1E293B" />
            </TouchableOpacity>

            <Text style={styles.timeValueText}>
              {String(selectedMinute).padStart(2, '0')}
            </Text>

            <TouchableOpacity
              style={styles.timeStepperBtn}
              onPress={handleIncreaseMinute}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={16} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  timePreview: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 10,
    gap: 12,
  },
  timeUnitBox: {
    alignItems: 'center',
  },
  timeUnitLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  timeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  timeStepperBtn: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 12,
  },
  timeColon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 16,
  },
});
