import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  onFilterPress?: () => void;
  onPress?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  hasActiveFilter?: boolean;
  activeFilterCount?: number;
  showFilterButton?: boolean;
  placeholder?: string;
  containerStyle?: any;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  onFilterPress,
  onPress,
  onClear,
  autoFocus = false,
  onFocus,
  onBlur,
  hasActiveFilter = false,
  activeFilterCount = 0,
  showFilterButton = true,
  placeholder = 'Tìm sân bóng, kèo đấu, câu lạc bộ...',
  containerStyle,
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

  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  const isFilterActive = hasActiveFilter || activeFilterCount > 0;

  return (
    <View style={[styles.container, containerStyle]}>
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
          <View style={[styles.searchIconCircle, isFocused && styles.searchIconCircleFocused]}>
            <Ionicons
              name="search"
              size={17}
              color={isFocused ? COLORS.primary : COLORS.outline}
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
              onSubmitEditing={onSubmitEditing}
              returnKeyType="search"
            />
          </View>

          {/* Clear Text Button (when editable and value exists) */}
          {!onPress && value && value.length > 0 ? (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={17} color={COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>

        {/* Filter Trigger Button */}
        {showFilterButton && onFilterPress ? (
          <>
            <View style={styles.verticalDivider} />
            <TouchableOpacity
              style={[
                styles.filterBtn,
                isFilterActive && styles.filterBtnActive,
              ]}
              onPress={onFilterPress}
              activeOpacity={0.75}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={isFilterActive ? COLORS.white : COLORS.onSurface}
              />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              ) : isFilterActive ? (
                <View style={styles.filterActiveDot} />
              ) : null}
            </TouchableOpacity>
          </>
        ) : null}
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: BORDER_RADIUS.full,
    paddingLeft: 6,
    paddingRight: 6,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBarBoxFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 4,
  },
  searchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  searchIconCircleFocused: {
    backgroundColor: COLORS.primaryOpacity10,
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
  clearBtn: {
    padding: 6,
    marginRight: 2,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginHorizontal: 4,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
});
