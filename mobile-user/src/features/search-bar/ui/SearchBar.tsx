import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  onPress?: () => void;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  hasActiveFilter?: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  onPress,
  autoFocus = false,
  onFocus,
  onBlur,
  hasActiveFilter = false,
  placeholder = 'Tìm sân bóng, kèo đấu, câu lạc bộ...',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchBarBox,
          isFocused && styles.searchBarBoxFocused,
        ]}
      >
        {/* Search Touch / Input Area */}
        <TouchableOpacity
          style={styles.inputTouchArea}
          activeOpacity={onPress ? 0.78 : 1}
          onPress={onPress}
        >
          <View style={styles.searchIconCircle}>
            <Ionicons
              name="search"
              size={17}
              color={isFocused ? COLORS.primary : COLORS.onSurfaceVariant}
            />
          </View>

          <View style={styles.inputWrapper} pointerEvents={onPress ? 'none' : 'auto'}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={COLORS.outline}
              value={value}
              onChangeText={onChangeText}
              autoFocus={autoFocus}
              editable={!onPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.verticalDivider} />

        {/* Filter Trigger Button */}
        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilter && styles.filterBtnActive]}
          onPress={onFilterPress}
          activeOpacity={0.75}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={hasActiveFilter ? '#003527' : COLORS.onSurface}
          />
          {hasActiveFilter && <View style={styles.filterActiveDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.2,
    borderColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.full,
    paddingLeft: SPACING.xs,
    paddingRight: SPACING.xs,
    height: 48,
  },
  searchBarBoxFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  input: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontSize: 13.5,
    fontWeight: '500',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: COLORS.secondary,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
});