import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
      <View style={styles.headerRow}>
        <View style={styles.sectionIconCircle}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>1. Chọn CLB Đại Diện</Text>
          <Text style={styles.subtext}>
            CLB cần có tối thiểu <Text style={{ fontWeight: '800', color: COLORS.primary }}>8 thành viên ACTIVE</Text> để đăng bài tìm đối thủ.
          </Text>
        </View>
      </View>

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
                {club.avatarUrl ? (
                  <Image source={{ uri: club.avatarUrl }} style={[styles.avatar, isSelected && styles.avatarSelected]} />
                ) : (
                  <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                    <Text style={styles.avatarText}>{club.name.charAt(0) || 'C'}</Text>
                  </View>
                )}

                <View style={styles.clubInfo}>
                  <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                  <View style={styles.clubMetaRow}>
                    <View style={styles.sportBadge}>
                      <Text style={styles.sportBadgeText}>{club.sportName || 'Thể thao'}</Text>
                    </View>
                    <Text style={styles.clubMetaText}>• {club.activeMemberCount} thành viên</Text>
                    <Text style={styles.eloText}>• {club.clubElo} Elo</Text>
                  </View>
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
              </View>

              {!isLeaderOrSub ? (
                <View style={styles.warningBoxRed}>
                  <Ionicons name="close-circle" size={15} color="#DC2626" />
                  <Text style={styles.warningTextRed}>
                    Chỉ Trưởng nhóm / Phó nhóm mới có quyền đại diện CLB tạo bài ghép trận.
                  </Text>
                </View>
              ) : !isMemberCountEligible ? (
                <View style={styles.warningBoxAmber}>
                  <Ionicons name="alert-circle" size={15} color="#D97706" />
                  <Text style={styles.warningTextAmber}>
                    {club.activeMemberCount}/8 thành viên — Cần thêm {8 - club.activeMemberCount} thành viên nữa để đủ điều kiện.
                  </Text>
                </View>
              ) : (
                <View style={styles.eligibleBox}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
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
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  clubList: {
    gap: 8,
  },
  clubCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  clubCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
  },
  clubCardDisabled: {
    opacity: 0.6,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelected: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  clubInfo: {
    flex: 1,
    gap: 3,
  },
  clubName: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 14,
  },
  clubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  sportBadge: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.sm,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '700',
  },
  clubMetaText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  eloText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  warningBoxRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  warningTextRed: {
    ...TYPOGRAPHY.labelSm,
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  warningBoxAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningTextAmber: {
    ...TYPOGRAPHY.labelSm,
    color: '#B45309',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  eligibleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  eligibleText: {
    ...TYPOGRAPHY.labelSm,
    color: '#059669',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
