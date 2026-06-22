import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, onFilterPress, onPress, editable = true, autoFocus = false }: SearchBarProps) {
  const content = (
    <View style={styles.searchContainer}>
      <MaterialIcons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder="Tìm sân, trận đấu hoặc câu lạc bộ..."
        placeholderTextColor={COLORS.outlineVariant}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoFocus={autoFocus}
        pointerEvents={editable ? 'auto' : 'none'}
      />
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={onFilterPress} 
        activeOpacity={0.8}
      >
        <MaterialIcons name="tune" size={20} color={COLORS.onPrimary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
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
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    height: 48,
    position: 'relative',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: COLORS.onSurface,
    paddingRight: 40, // Space for the tune button on the right
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
