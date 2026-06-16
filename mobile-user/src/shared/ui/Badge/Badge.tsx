import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

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
    backgroundColor: 'rgba(6, 78, 59, 0.1)', // Green at 10%
  },
  success_flat: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  warning: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)', // Accent Yellow at 15%
  },
  error: {
    backgroundColor: COLORS.errorContainer,
  },
  info: {
    backgroundColor: 'rgba(0, 102, 204, 0.08)',
  },
  gold: {
    backgroundColor: 'rgba(115, 92, 0, 0.1)',
  },
  silver: {
    backgroundColor: 'rgba(116, 120, 120, 0.1)',
  },
  full: {
    backgroundColor: 'rgba(116, 120, 120, 0.2)',
  },
  default: {
    backgroundColor: 'rgba(116, 120, 120, 0.1)',
  },

  // Text Base
  textBase: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
  },

  // Text Sizes
  text_sm: {
    fontSize: TYPOGRAPHY.labelSm.fontSize - 1,
    lineHeight: TYPOGRAPHY.labelSm.lineHeight - 1,
  },
  text_md: {
    fontSize: TYPOGRAPHY.labelSm.fontSize,
    lineHeight: TYPOGRAPHY.labelSm.lineHeight,
  },

  // Text Variants
  text_success: {
    color: COLORS.primary,
  },
  text_success_flat: {
    color: COLORS.primary,
  },
  text_warning: {
    color: COLORS.tertiary,
  },
  text_error: {
    color: COLORS.error,
  },
  text_info: {
    color: '#0066CC',
  },
  text_gold: {
    color: COLORS.tertiary,
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
