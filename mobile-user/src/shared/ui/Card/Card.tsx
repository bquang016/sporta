import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  GestureResponderEvent,
  StyleProp
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../config/theme';

export type CardVariant = 'default' | 'outline' | 'ghost';

export interface CardProps {
  variant?: CardVariant;
  padding?: keyof typeof SPACING | number;
  onPress?: (event: GestureResponderEvent) => void;
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  onPress,
  activeOpacity = 0.8,
  style,
  children,
  ...rest
}: CardProps) {
  const paddingVal = typeof padding === 'number' ? padding : SPACING[padding] || SPACING.md;

  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: paddingVal },
    onPress && styles.interactive,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={activeOpacity}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.default,
  },
  default: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  interactive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
