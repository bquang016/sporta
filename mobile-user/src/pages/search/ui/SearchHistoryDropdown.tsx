import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Facility } from '../../../entities/facility';

interface SearchHistoryDropdownProps {
  query: string;
  history: string[];
  suggestions?: Facility[];
  featuredVenues?: Facility[];
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
  featuredVenues = [],
  visible,
  onSelectHistory,
  onSelectSuggestion,
  onRemoveHistory,
  onClearHistory,
  onClose,
}: SearchHistoryDropdownProps) {
  const hasQuery = query.trim().length > 0;
  const hasHistory = history && history.length > 0;
  const hasFeatured = featuredVenues && featuredVenues.length > 0;

  if (!visible) {
    return null;
  }

  if (hasQuery && suggestions.length === 0) {
    return null;
  }

  if (!hasQuery && !hasHistory && !hasFeatured) {
    return null;
  }

  return (
    <>
      {/* Overlay to close dropdown when tapping outside */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.container}>
        {hasQuery ? (
          /* ── Query Autocomplete Suggestions ── */
          <FlatList
            data={suggestions}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.7}
                onPress={() => onSelectSuggestion && onSelectSuggestion(item)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.venueThumb} />
                ) : (
                  <View style={styles.iconCircle}>
                    <Ionicons name="search-outline" size={16} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.subInfoRow}>
                    {item.sport ? (
                      <Text style={styles.sportBadgeSmall}>{item.sport}</Text>
                    ) : null}
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {item.location || item.area || 'Hà Nội'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          />
        ) : (
          /* ── History & Featured Venues ── */
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Lịch sử tìm kiếm gần đây */}
            {hasHistory ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="time-outline" size={15} color={COLORS.onSurfaceVariant} />
                    <Text style={styles.sectionHeaderTitle}>Tìm kiếm gần đây</Text>
                  </View>
                  <TouchableOpacity onPress={onClearHistory} activeOpacity={0.7}>
                    <Text style={styles.clearAllText}>Xóa tất cả</Text>
                  </TouchableOpacity>
                </View>

                {history.slice(0, 5).map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.historyRow}
                    activeOpacity={0.7}
                    onPress={() => onSelectHistory(term)}
                  >
                    <View style={styles.historyIconCircle}>
                      <Ionicons name="search" size={14} color={COLORS.outline} />
                    </View>
                    <Text style={styles.historyText} numberOfLines={1}>
                      {term}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => onRemoveHistory(term)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={16} color={COLORS.outline} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* 2. Gợi ý sân thể thao nổi bật */}
            {hasFeatured ? (
              <View style={[styles.sectionBlock, hasHistory && styles.sectionBlockBorder]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="sparkles" size={14} color="#D97706" />
                    <Text style={styles.sectionHeaderTitle}>Gợi ý sân thể thao quanh bạn</Text>
                  </View>
                </View>

                {featuredVenues.slice(0, 4).map((venue) => (
                  <TouchableOpacity
                    key={venue.id}
                    style={styles.featuredVenueRow}
                    activeOpacity={0.75}
                    onPress={() => onSelectSuggestion && onSelectSuggestion(venue)}
                  >
                    <Image
                      source={{
                        uri:
                          venue.imageUrl ||
                          '',
                      }}
                      style={styles.featuredThumb}
                    />
                    <View style={styles.featuredContent}>
                      <Text style={styles.featuredName} numberOfLines={1}>
                        {venue.name}
                      </Text>
                      <View style={styles.featuredMetaRow}>
                        <Text style={styles.sportBadgeSmall}>{venue.sport || 'Thể thao'}</Text>
                        {venue.distance && venue.distance !== '-- km' ? (
                          <Text style={styles.featuredDistance}>• {venue.distance}</Text>
                        ) : null}
                        {venue.rating > 0 ? (
                          <View style={styles.ratingBadgeMini}>
                            <Ionicons name="star" size={10} color="#D97706" />
                            <Text style={styles.ratingTextMini}>{venue.rating.toFixed(1)}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.featuredPrice}>{venue.price}/h</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.outline} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </ScrollView>
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
    marginTop: 6,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    zIndex: 100,
    maxHeight: 380,
    overflow: 'hidden',
  },
  list: {
    flexGrow: 0,
  },
  sectionBlock: {
    paddingVertical: 6,
  },
  sectionBlockBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
  },
  historyIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  historyText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  removeBtn: {
    padding: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  venueThumb: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.md,
    marginRight: 10,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportBadgeSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  featuredVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
    gap: 10,
  },
  featuredThumb: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  featuredContent: {
    flex: 1,
    gap: 2,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredDistance: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  ratingBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingTextMini: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  featuredPrice: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
