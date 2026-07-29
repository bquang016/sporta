import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SportProfileItem } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserSportsCardProps {
  sportsProfiles: SportProfileItem[];
  onSelectSport: (sport: SportProfileItem) => void;
}

export const UserSportsCard = React.memo(({
  sportsProfiles,
  onSelectSport,
}: UserSportsCardProps) => {
  if (!sportsProfiles || sportsProfiles.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>HỒ SƠ BỘ MÔN THỂ THAO</Text>

      <View style={styles.cardsList}>
        {sportsProfiles.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.summaryCard}
            activeOpacity={0.85}
            onPress={() => onSelectSport(item)}
          >
            {/* Header row: Icon, Sport Name, Arrow indicator */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={
                    item.sportName === 'Bóng đá'
                      ? 'football'
                      : item.sportName === 'Pickleball'
                      ? 'tennisball'
                      : 'fitness'
                  }
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.titleGroup}>
                <Text style={styles.sportName}>{item.sportName}</Text>
                <Text style={styles.sportMetaText}>
                  {item.matchesCount || 35} trận đấu • {item.activitiesCount || 90} hoạt động
                </Text>
              </View>

              <View style={styles.detailBtn}>
                <Text style={styles.detailBtnText}>Chi tiết</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </View>
            </View>

            {/* DUPR & Ratings Quick Highlights Row */}
            <View style={styles.highlightsRow}>
              {item.duprSingles ? (
                <View style={styles.highlightBadge}>
                  <View style={styles.duprMiniTag}>
                    <Text style={styles.duprMiniTagText}>DUPR</Text>
                  </View>
                  <Text style={styles.highlightScore}>{item.duprSingles}</Text>
                </View>
              ) : null}

              {item.ratingValue ? (
                <View style={styles.highlightBadge}>
                  <Text style={styles.highlightLabel}>Trình độ:</Text>
                  <Text style={styles.highlightValue}>{item.ratingValue}</Text>
                </View>
              ) : null}

              {item.position ? (
                <View style={styles.highlightBadge}>
                  <Text style={styles.highlightLabel}>Vị trí:</Text>
                  <Text style={styles.highlightValue}>{item.position}</Text>
                </View>
              ) : null}
            </View>

            {/* Top 3 Skill pills preview */}
            {item.skillTags && item.skillTags.length > 0 && (
              <View style={styles.skillPillsRow}>
                {item.skillTags.slice(0, 3).map((tag) => (
                  <View key={tag.id} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{tag.label}</Text>
                  </View>
                ))}
                {item.skillTags.length > 3 && (
                  <Text style={styles.moreSkillsText}>+{item.skillTags.length - 3} kỹ năng</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.background,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
    letterSpacing: 0.6,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  cardsList: {
    gap: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceContainerHigh,
    gap: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
  },
  sportName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  sportMetaText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  detailBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 4,
  },
  duprMiniTag: {
    backgroundColor: '#1E293B',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  duprMiniTagText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  highlightScore: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  highlightLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  highlightValue: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  skillPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  skillPill: {
    backgroundColor: '#FACC15',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  skillPillText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700',
  },
  moreSkillsText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
});
