import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface PollMaxPlayersStepperProps {
  value: number;
  minPlayers: number;
  onChange: (value: number) => void;
  sportName?: string;
}

export function PollMaxPlayersStepper({
  value,
  minPlayers,
  onChange,
  sportName,
}: PollMaxPlayersStepperProps) {
  const isMinReached = value <= minPlayers;

  const handleDecrease = () => {
    if (!isMinReached) {
      onChange(Math.max(minPlayers, value - 1));
    }
  };

  const handleIncrease = () => {
    onChange(value + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>Số lượng thành viên ra sân tối đa</Text>
        <Text style={styles.fieldHint}>
          Tối thiểu{sportName ? ` môn ${sportName}` : ''}: {minPlayers} người
        </Text>
      </View>

      <View style={styles.stepperContainer}>
        {/* Decrease Button */}
        <TouchableOpacity
          style={[styles.stepperBtn, isMinReached && styles.stepperBtnDisabled]}
          disabled={isMinReached}
          onPress={handleDecrease}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={18}
            color={isMinReached ? '#CBD5E1' : '#1E293B'}
          />
        </TouchableOpacity>

        {/* Value Display */}
        <View style={styles.stepperValueBox}>
          <Text style={styles.stepperValueText}>{value}</Text>
          <Text style={styles.stepperSubText}>thành viên</Text>
        </View>

        {/* Increase Button */}
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={handleIncrease}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color="#1E293B" />
        </TouchableOpacity>
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
  fieldHint: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  stepperValueBox: {
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
});
