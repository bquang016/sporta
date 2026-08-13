import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';
import { Facility } from '../../../entities/facility';

interface SearchHistoryDropdownProps {
  query: string;
  history: string[];
  suggestions?: Facility[];
  visible: boolean;
  onSelectHistory: (item: string) => void;
  onSelectSuggestion?: (item: Facility) => void;
  onRemoveHistory: (item: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export function SearchHistoryDropdown({
  query,
  history,
  suggestions = [],
  visible,
  onSelectHistory,
  onSelectSuggestion,
  onClose
}: SearchHistoryDropdownProps) {
  const hasQuery = query.trim().length > 0;
  
  if (!visible || (!hasQuery && history.length === 0) || (hasQuery && suggestions.length === 0)) return null;

  return (
    <>
      {/* Overlay để khi bấm ra ngoài sẽ đóng dropdown */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      <View style={styles.container}>
        {hasQuery ? (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={() => onSelectSuggestion && onSelectSuggestion(item)}
              >
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryOpacity10 }]}>
                  <MaterialIcons name="sports" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>{item.location}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={() => onSelectHistory(item)}
              >
                <View style={styles.iconCircle}>
                  <MaterialIcons name="history" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item}</Text>
                  <Text style={styles.itemSubtitle}>Lịch sử tìm kiếm</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: -SCREEN_HEIGHT,
    left: -SCREEN_WIDTH,
    right: -SCREEN_WIDTH,
    bottom: -SCREEN_HEIGHT,
    backgroundColor: 'transparent',
    zIndex: 99,
  },
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
    maxHeight: 350,
  },
  list: {
    flexGrow: 0,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceDim,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  itemSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
});
