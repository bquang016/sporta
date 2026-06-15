import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../config/theme';

export type BadgeVariant = 
  | 'success' 
  | 'success_flat' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'gold' 
  | 'silver' 
  | 'full' 
  | 'default';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  text,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const badgeStyles = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const badgeTextStyles = [
    styles.textBase,
    styles[`text_${variant}` as keyof typeof styles],
    styles[`text_${size}` as keyof typeof styles],
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={badgeTextStyles}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  // Variants
  success: {
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
  },
  success_flat: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  warning: {
    backgroundColor: COLORS.secondaryContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  error: {
    backgroundColor: COLORS.errorContainer,
  },
  info: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  gold: {
    backgroundColor: 'rgba(115, 92, 0, 0.1)',
  },
  silver: {
    backgroundColor: 'rgba(112, 121, 116, 0.1)',
  },
  full: {
    backgroundColor: 'rgba(112, 121, 116, 0.2)',
  },
  default: {
    backgroundColor: 'rgba(112, 121, 116, 0.1)',
  },

  // Text Base
  textBase: {
    fontWeight: '700',
  },

  // Text Sizes
  text_sm: {
    fontSize: 10,
  },
  text_md: {
    fontSize: 12,
  },

  // Text Variants
  text_success: {
    color: COLORS.primary,
  },
  text_success_flat: {
    color: '#2D6A4F',
  },
  text_warning: {
    color: COLORS.onSecondaryContainer,
  },
  text_error: {
    color: COLORS.error,
  },
  text_info: {
    color: '#0066CC',
  },
  text_gold: {
    color: COLORS.secondary,
  },
  text_silver: {
    color: COLORS.outline,
  },
  text_full: {
    color: COLORS.outline,
  },
  text_default: {
    color: COLORS.outline,
  },
});
