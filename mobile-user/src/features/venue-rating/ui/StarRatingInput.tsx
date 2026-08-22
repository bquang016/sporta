import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../shared/config/theme';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

/**
 * Reusable interactive star rating input.
 * Renders 5 tappable stars. Tapping a star sets the rating.
 */
export function StarRatingInput({
  value,
  onChange,
  size = 36,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !disabled && onChange(star)}
          activeOpacity={0.7}
          disabled={disabled}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel={`Chon ${star} sao`}
        >
          <MaterialIcons
            name={star <= value ? 'star' : 'star-border'}
            size={size}
            color={star <= value ? COLORS.secondary : COLORS.outlineVariant}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
});
