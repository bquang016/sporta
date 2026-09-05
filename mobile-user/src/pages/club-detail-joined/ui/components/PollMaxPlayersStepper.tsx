import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

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
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={styles.iconBox}>
          <Ionicons name="people-outline" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.title}>Quân số ra sân tối đa</Text>
          <Text style={styles.subtitle}>
            Tối thiểu{sportName ? ` môn ${sportName}` : ''}: {minPlayers} người
          </Text>
        </View>
      </View>

      {/* Integrated Stepper Widget */}
      <View style={styles.stepperWidget}>
        <TouchableOpacity
          style={[styles.stepperBtn, isMinReached && styles.stepperBtnDisabled]}
          disabled={isMinReached}
          onPress={handleDecrease}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={16}
            color={isMinReached ? '#CBD5E1' : COLORS.onSurface}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.valueWrap}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={handleIncrease}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
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
    ...TYPOGRAPHY.titleSm,
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  stepperWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },
  valueWrap: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
});
