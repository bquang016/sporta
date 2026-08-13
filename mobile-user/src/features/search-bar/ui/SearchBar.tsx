import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  onPress?: () => void; // Nếu có onPress, nó sẽ tự hiểu là nút bấm
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onFilterPress,
  onPress,
  autoFocus = false,
  onFocus,
  onBlur
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderStyle = {
    borderColor: isFocused ? COLORS.primary : 'transparent',
  };

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
      <View style={[styles.searchContainer, borderStyle]}>

        {/* VÙNG NHẬP LIỆU (HOẶC NÚT BẤM) */}
        <TouchableOpacity
          style={styles.inputTouchArea}
          activeOpacity={onPress ? 0.8 : 1}
          onPress={onPress}
        >
          <MaterialIcons name="search" size={24} color={COLORS.outline} style={styles.searchIcon} />

          {/* Khóa pointerEvents nếu đang làm nút bấm để TouchableOpacity nhận sự kiện */}
          <View style={styles.inputWrapper} pointerEvents={onPress ? 'none' : 'auto'}>
            <TextInput
              style={styles.input}
              placeholder="Tìm sân, trận đấu hoặc câu lạc bộ..."
              placeholderTextColor={COLORS.outlineVariant}
              value={value}
              onChangeText={onChangeText}
              autoFocus={autoFocus}
              editable={!onPress} // Khóa không cho nhập nếu đây là nút bấm (ở Home)
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </View>
        </TouchableOpacity>

        {/* NÚT FILTER SONG SONG */}
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.8}>
          <MaterialIcons name="tune" size={20} color={COLORS.white} />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    height: 48,
    position: 'relative',
  },
  inputTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    height: '100%',
  },
  input: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    paddingRight: 48, // Chừa chỗ cho nút filter
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  filterButton: {
    position: 'absolute',
    right: 4,
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});