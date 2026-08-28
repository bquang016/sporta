import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';

export type BookingTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export interface FilterTabItem {
  id: BookingTab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export const FILTER_TABS: FilterTabItem[] = [
  { id: 'all', label: 'Tất cả', icon: 'list-alt' },
  { id: 'upcoming', label: 'Sắp diễn ra', icon: 'event' },
  { id: 'completed', label: 'Hoàn thành', icon: 'task-alt' },
  { id: 'cancelled', label: 'Đã hủy', icon: 'cancel' },
];

interface BookingFilterTabsProps {
  activeTab: BookingTab;
  onTabChange: (tab: BookingTab) => void;
  counts: Record<BookingTab, number>;
}

export function BookingFilterTabs({ activeTab, onTabChange, counts }: BookingFilterTabsProps) {
  return (
    <View style={styles.tabsWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              activeOpacity={0.8}
              onPress={() => onTabChange(tab.id)}
            >
              <MaterialIcons 
                name={tab.icon} 
                size={18} 
                color={isActive ? COLORS.primary : COLORS.onSurfaceVariant} 
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.badgeCount, isActive && styles.badgeCountActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsWrapper: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  tabsScrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.xs + 2,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: SPACING.xs,
  },
  tabChipActive: {
    backgroundColor: COLORS.primaryOpacity12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  badgeCount: {
    backgroundColor: COLORS.outlineVariant,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeCountActive: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: COLORS.white,
  },
});
