import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserClubItem {
  clubId: number;
  clubName: string;
  avatarImage?: string;
  coverImage?: string;
  sportName?: string;
  role?: string;
  membersCount?: number;
  elo?: number;
}

interface UserClubsCardProps {
  clubs?: UserClubItem[];
  onClubPress?: (club: UserClubItem) => void;
}

export const UserClubsCard = React.memo(({ clubs, onClubPress }: UserClubsCardProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const displayClubs = clubs || [];

  if (displayClubs.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="people-outline" size={18} color={COLORS.primary} />
          <Text style={styles.title}>Các câu lạc bộ đã tham gia</Text>
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Chưa tham gia câu lạc bộ nào</Text>
        </View>
      </View>
    );
  }

  // Display at most 2 clubs outside unless expanded
  const visibleClubs = isExpanded ? displayClubs : displayClubs.slice(0, 2);
  const hasMore = displayClubs.length > 2;

  const getRoleLabel = (role?: string) => {
    if (!role) return 'Thành viên';
    if (role === 'ADMIN' || role === 'Trưởng nhóm') return 'Trưởng nhóm';
    if (role === 'SUB_LEADER' || role === 'Phó nhóm') return 'Phó nhóm';
    return 'Thành viên';
  };

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <Ionicons name="people-outline" size={18} color={COLORS.primary} />
          <Text style={styles.title}>Các câu lạc bộ đã tham gia</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{displayClubs.length}</Text>
        </View>
      </View>

      {/* Clubs List */}
      <View style={styles.list}>
        <View>
          {visibleClubs.map((club, index) => (
          <TouchableOpacity
            key={`${club.clubId}-${index}`}
            style={[
              styles.clubItem,
              index < visibleClubs.length - 1 && styles.itemBorder,
            ]}
            activeOpacity={0.7}
            onPress={() => onClubPress?.(club)}
          >
            {/* Club Avatar */}
            <Image
              source={
                club.avatarImage && typeof club.avatarImage === 'string' && !club.avatarImage.startsWith('blob:')
                  ? { uri: club.avatarImage }
                  : require('../../../../assets/logo/club/699x699__1_-removebg-preview.png')
              }
              style={styles.clubAvatar}
            />

            {/* Club Information */}
            <View style={styles.clubInfo}>
              <Text style={styles.clubName} numberOfLines={1}>
                {club.clubName}
              </Text>

              <View style={styles.metaRow}>
                {club.sportName && (
                  <View style={styles.sportBadge}>
                    <Text style={styles.sportBadgeText}>{club.sportName}</Text>
                  </View>
                )}
                <Text style={styles.roleText}>• {getRoleLabel(club.role)}</Text>
              </View>

              <Text style={styles.memberCountText}>
                {club.membersCount || 1} thành viên
              </Text>
            </View>

            {/* Chevron Navigate Arrow */}
            <View style={styles.actionChevron}>
              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            </View>
          </TouchableOpacity>
        ))}
        </View>
      </View>

      {/* "Xem tất cả" / "Thu gọn" Button */}
      {hasMore && (
        <TouchableOpacity
          style={styles.expandButton}
          activeOpacity={0.8}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? 'Thu gọn' : `Xem tất cả (${displayClubs.length} câu lạc bộ)`}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  title: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  countText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  list: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  clubAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  clubInfo: {
    flex: 1,
    gap: 2,
  },
  clubName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sportBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  roleText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  memberCountText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11,
    color: '#64748B',
  },
  actionChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    gap: 4,
  },
  expandButtonText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySm,
    color: '#94A3B8',
    fontSize: 13,
  },
});
