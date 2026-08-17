import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { ClubSummaryVM } from '../../../entities/match/model/match.types';

interface ClubSelectorProps {
  clubs: ClubSummaryVM[];
  selectedClubId?: string;
  onSelectClub: (club: ClubSummaryVM) => void;
}

export function ClubSelector({ clubs, selectedClubId, onSelectClub }: ClubSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chọn CLB đại diện</Text>
      <Text style={styles.subtext}>
        CLB cần có tối thiểu <Text style={{ fontWeight: '700' }}>8 thành viên ACTIVE</Text> để tìm đối thủ hoặc gửi yêu cầu ghép trận.
      </Text>

      <View style={styles.clubList}>
        {clubs.map((club) => {
          const isSelected = selectedClubId === club.id;
          const isEligible = club.activeMemberCount >= 8;

          return (
            <TouchableOpacity
              key={club.id}
              disabled={!isEligible}
              activeOpacity={0.8}
              onPress={() => isEligible && onSelectClub(club)}
              style={[
                styles.clubCard,
                isSelected && styles.clubCardSelected,
                !isEligible && styles.clubCardDisabled,
              ]}
            >
              <View style={styles.clubHeader}>
                <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                  <Text style={styles.avatarText}>{club.name.charAt(4) || 'C'}</Text>
                </View>

                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubMeta}>
                    {club.sportName} • {club.activeMemberCount} thành viên ACTIVE • {club.clubElo} Elo
                  </Text>
                </View>

                {isSelected && (
                  <MaterialIcons name="check-circle" size={22} color={COLORS.primary} />
                )}
              </View>

              {!isEligible ? (
                <View style={styles.warningBox}>
                  <MaterialIcons name="warning" size={16} color="#D97706" />
                  <Text style={styles.warningText}>
                    {club.activeMemberCount}/8 thành viên — Cần thêm {8 - club.activeMemberCount} thành viên nữa để ghép trận.
                  </Text>
                </View>
              ) : (
                <View style={styles.eligibleBox}>
                  <MaterialIcons name="verified" size={14} color={COLORS.primary} />
                  <Text style={styles.eligibleText}>Đủ điều kiện đại diện ghép trận</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  clubList: {
    gap: SPACING.sm,
  },
  clubCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 8,
  },
  clubCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
  },
  clubCardDisabled: {
    opacity: 0.7,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelected: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '700',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontSize: 14,
  },
  clubMeta: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: BORDER_RADIUS.sm,
  },
  warningText: {
    ...TYPOGRAPHY.labelSm,
    color: '#92400E',
    fontSize: 11,
    flex: 1,
  },
  eligibleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eligibleText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});
