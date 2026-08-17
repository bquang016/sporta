import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MatchRoomVM } from '../../../entities/match/model/match.types';

interface MatchCardProps {
  room: MatchRoomVM;
  onPress: () => void;
}

export function MatchCard({ room, onPress }: MatchCardProps) {
  const isRanked = room.matchType === 'RANKED';
  const host = room.hostClub;
  const booking = room.booking;

  // Fee split calculation: Performance Incentive (Winning team pays less)
  const getFeeSplitLabel = () => {
    if (room.hostSharePercent === 50) return 'Chia đôi 50/50';
    if (room.hostSharePercent === 70 || room.guestSharePercent === 30) return '🔥 Đội Thắng chỉ trả 30%';
    if (room.hostSharePercent === 100 || room.guestSharePercent === 0) return '🏆 Đội Thắng MIỄN 100% tiền sân';
    return `Thắng trả ${room.guestSharePercent}%`;
  };

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.card}>
      {/* Top Badge Bar (No text overlap) */}
      <View style={styles.topBadgeBar}>
        <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
          <Text style={[styles.typeBadgeText, isRanked ? styles.rankedBadgeText : styles.friendlyBadgeText]}>
            {isRanked ? '🏆 Xếp hạng' : '🤝 Giao hữu'}
          </Text>
        </View>

        {room.balanceLabel && (
          <View style={styles.balanceChip}>
            <MaterialIcons name="bolt" size={13} color="#D97706" />
            <Text style={styles.balanceChipText}>{room.balanceLabel}</Text>
          </View>
        )}

        <View style={styles.incentiveChip}>
          <Ionicons name="flame" size={13} color={COLORS.primary} />
          <Text style={styles.incentiveChipText}>{getFeeSplitLabel()}</Text>
        </View>
      </View>

      {/* Host Club Row */}
      <View style={styles.hostRow}>
        <View style={styles.avatarContainer}>
          {host.avatarUrl ? (
            <Image source={{ uri: host.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{host.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.activeDot} />
        </View>

        <View style={styles.hostInfo}>
          <View style={styles.hostNameRow}>
            <Text style={styles.hostName} numberOfLines={1}>
              {host.name}
            </Text>
            <MaterialIcons name="verified" size={14} color={COLORS.primary} />
          </View>

          <View style={styles.eloPillRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>{host.levelLabel}</Text>
            </View>
            <Text style={styles.eloText}>{host.clubElo} Elo</Text>
            <Text style={styles.crpText}>• {host.crp} CRP</Text>
          </View>
        </View>
      </View>

      {/* Venue Location & Time */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="football-outline" size={14} color={COLORS.primary} />
          </View>
          <Text style={styles.detailText} numberOfLines={1}>
            {booking.sportName} • {booking.format} ({booking.facilityName})
          </Text>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
          </View>
          <Text style={styles.detailText} numberOfLines={1}>
            {booking.date} • <Text style={{ fontWeight: '800', color: COLORS.onSurface }}>{booking.startTime} - {booking.endTime}</Text>
          </Text>
        </View>
      </View>

      {/* Fee Split & Action Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.feeBox}>
          <Text style={styles.feeLabel}>Giá tiền sân:</Text>
          <Text style={styles.feeValue}>{booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
        </View>

        <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Ghép Kèo</Text>
          <MaterialIcons name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 10,
  },
  topBadgeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  rankedBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  friendlyBadge: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  typeBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '800',
  },
  rankedBadgeText: {
    color: '#92400E',
  },
  friendlyBadgeText: {
    color: '#075985',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  balanceChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  incentiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  incentiveChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  hostInfo: {
    flex: 1,
    gap: 2,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
    flexShrink: 1,
  },
  eloPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelTag: {
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  levelTagText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  eloText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  crpText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  detailsContainer: {
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  feeBox: {
    flex: 1,
  },
  feeLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  feeValue: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
});
