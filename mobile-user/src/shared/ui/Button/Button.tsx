import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TouchableOpacityProps,
  StyleProp
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof MaterialIcons.glyphMap | React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  children,
  ...rest
}: ButtonProps) {
  const isButtonDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    isButtonDisabled && styles[`${variant}Disabled` as keyof typeof styles],
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`text_${variant}` as keyof typeof styles],
    styles[`text_${size}` as keyof typeof styles],
    isButtonDisabled && styles[`text_${variant}Disabled` as keyof typeof styles],
    textStyle,
  ];

  const renderIcon = () => {
    if (!icon || loading) return null;
    if (React.isValidElement(icon)) return icon;

    // Get color based on variant and disabled state
    let iconColor = COLORS.onSecondary;
    if (variant === 'secondary' || variant === 'outline' || variant === 'text' || variant === 'ghost') {
      iconColor = isButtonDisabled ? COLORS.outline : COLORS.primary;
    }

    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

    return (
      <MaterialIcons 
        name={icon as keyof typeof MaterialIcons.glyphMap} 
        size={iconSize} 
        color={iconColor} 
      />
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={
            variant === 'primary' 
              ? COLORS.onSecondary 
              : COLORS.primary
          } 
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          
          {title ? (
            <Text style={textStyles}>{title}</Text>
          ) : (
            children
          )}

          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.secondary, // Yellow Accent
    borderRadius: BORDER_RADIUS.md, // 12px for primary CTAs per design
  },
  secondary: {
    backgroundColor: COLORS.primary, // Deep Emerald
    borderRadius: BORDER_RADIUS.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },

  // Disabled Variants
  primaryDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  secondaryDisabled: {
    borderColor: COLORS.outlineVariant,
  },
  outlineDisabled: {
    borderColor: COLORS.outlineVariant,
  },
  textDisabled: {},
  ghostDisabled: {},

  // Sizes
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  lg: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },

  // Text Base
  textBase: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
    textAlign: 'center',
  },

  // Text Variants
  text_primary: {
    color: COLORS.onSecondary, // Black text on yellow background
  },
  text_secondary: {
    color: COLORS.onPrimary, // White text on Deep Emerald
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_text: {
    color: COLORS.primary,
  },
  text_ghost: {
    color: COLORS.primary,
  },

  // Text Disabled Variants
  text_primaryDisabled: {
    color: COLORS.outline,
  },
  text_secondaryDisabled: {
    color: COLORS.outline,
  },
  text_outlineDisabled: {
    color: COLORS.outline,
  },
  text_textDisabled: {
    color: COLORS.outline,
  },
  text_ghostDisabled: {
    color: COLORS.outline,
  },

  // Text Sizes
  text_sm: {
    fontSize: TYPOGRAPHY.labelSm.fontSize,
    lineHeight: TYPOGRAPHY.labelSm.lineHeight,
  },
  text_md: {
    fontSize: TYPOGRAPHY.labelMd.fontSize,
    lineHeight: TYPOGRAPHY.labelMd.lineHeight,
  },
  text_lg: {
    fontSize: TYPOGRAPHY.labelMd.fontSize + 2,
    lineHeight: TYPOGRAPHY.labelMd.lineHeight + 2,
  },
});
