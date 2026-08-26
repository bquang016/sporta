import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Ionicons } from '@expo/vector-icons';
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
        CLB cần có tối thiểu <Text style={{ fontWeight: '800', color: COLORS.primary }}>8 thành viên ACTIVE</Text> để tìm đối thủ hoặc gửi yêu cầu ghép trận.
      </Text>

      <View style={styles.clubList}>
        {clubs.map((club) => {
          const isSelected = selectedClubId === club.id;
          const isLeaderOrSub = club.isLeaderOrSubLeader ?? (club.userStatus === 'ADMIN' || club.userStatus === 'SUB_LEADER' || !club.userStatus);
          const isMemberCountEligible = club.activeMemberCount >= 8;
          const isEligible = isLeaderOrSub && isMemberCountEligible;

          return (
            <TouchableOpacity
              key={club.id}
              disabled={!isEligible}
              activeOpacity={0.88}
              onPress={() => isEligible && onSelectClub(club)}
              style={[
                styles.clubCard,
                isSelected && styles.clubCardSelected,
                !isEligible && styles.clubCardDisabled,
              ]}
            >
              <View style={styles.clubHeader}>
                <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                  <Text style={styles.avatarText}>{club.name.charAt(0) || 'C'}</Text>
                </View>

                <View style={styles.clubInfo}>
                  <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                  <Text style={styles.clubMeta} numberOfLines={1}>
                    {club.sportName} • {club.activeMemberCount} thành viên ACTIVE • {club.clubElo} Elo
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                )}
              </View>

              {!isLeaderOrSub ? (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={[styles.warningText, { color: '#991B1B' }]}>
                    Chỉ Trưởng nhóm / Phó nhóm mới có quyền đại diện CLB tạo bài ghép trận.
                  </Text>
                </View>
              ) : !isMemberCountEligible ? (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={16} color="#D97706" />
                  <Text style={styles.warningText}>
                    {club.activeMemberCount}/8 thành viên — Cần thêm {8 - club.activeMemberCount} thành viên nữa để ghép trận.
                  </Text>
                </View>
              ) : (
                <View style={styles.eligibleBox}>
                  <Ionicons name="checkmark-done" size={15} color={COLORS.primary} />
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
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: SPACING.sm,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  clubList: {
    gap: SPACING.sm,
    marginTop: 4,
  },
  clubCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    gap: 8,
  },
  clubCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  clubCardDisabled: {
    opacity: 0.65,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontWeight: '800',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  warningText: {
    ...TYPOGRAPHY.labelSm,
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
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
    fontWeight: '700',
  },
});
