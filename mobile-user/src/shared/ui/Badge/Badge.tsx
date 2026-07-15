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
    backgroundColor: COLORS.primaryOpacity10,
  },
  success_flat: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  warning: {
    backgroundColor: COLORS.secondaryOpacity15,
  },
  error: {
    backgroundColor: COLORS.errorContainer,
  },
  info: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  gold: {
    backgroundColor: COLORS.secondaryOpacity15,
  },
  silver: {
    backgroundColor: COLORS.grayOpacity10,
  },
  full: {
    backgroundColor: COLORS.grayOpacity20,
  },
  default: {
    backgroundColor: COLORS.grayOpacity10,
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
    color: COLORS.primary,
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
