import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TicketSession } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { getSportLevelLabel } from '../../../shared/lib/utils/elo';

interface TicketSessionCardProps {
  session: TicketSession;
  onPress: () => void;
  onBuyPress: () => void;
}

export function TicketSessionCard({ session, onPress, onBuyPress }: TicketSessionCardProps) {
  const remainingSlots = session.maxSlots - session.bookedSlots;
  const isFull = remainingSlots <= 0 || session.status === 'FULL';


  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.88}
    >
      {/* Upper info container */}
      <View style={styles.contentRow}>
        {/* Cover Image or Sport Icon */}
        {session.coverImage ? (
          <Image source={{ uri: session.coverImage }} style={styles.image} />
        ) : (
          <View style={styles.imageFallback}>
            <MaterialIcons name="confirmation-number" size={32} color={COLORS.primary} />
          </View>
        )}

        <View style={styles.infoCol}>
          {/* Header Row: Venue name & Sport level badge */}
          <View style={styles.titleRow}>
            <Text style={styles.venueName} numberOfLines={1}>
              {session.venueName}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{getSportLevelLabel(session.sportLevel)}</Text>
            </View>
          </View>

          {/* Court Name */}
          <Text style={styles.courtName} numberOfLines={1}>
            Sân: <Text style={styles.courtNameBold}>{session.courtName}</Text>
          </Text>

          {/* Address / Location */}
          <View style={styles.iconTextRow}>
            <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {session.venueAddress || session.venueLocation || 'Địa điểm gần bạn'}
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.iconTextRow}>
            <MaterialIcons name="access-time" size={14} color={COLORS.onSurfaceVariant} />
            <Text style={styles.timeText}>
              {session.startTime} - {session.endTime} • {formatDate(session.playDate)}
            </Text>
          </View>

          {/* Host Team Banner if present */}
          {session.hasHostTeam && (
            <View style={styles.hostTeamBanner}>
              <MaterialIcons name="shield" size={12} color="#4338CA" />
              <Text style={styles.hostTeamText} numberOfLines={1}>
                Đối đầu: <Text style={{ fontWeight: '800', color: '#312E81' }}>{session.hostTeamName || 'Đội Sân Nhà'}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Footer Row: Slots & Price & CTA */}
      <View style={styles.footerRow}>
        {/* Slots status badge */}
        <View style={[
          styles.slotBadge, 
          isFull ? styles.slotBadgeFull : styles.slotBadgeAvailable
        ]}>
          <MaterialIcons 
            name={isFull ? "error-outline" : "groups"} 
            size={14} 
            color={isFull ? COLORS.error : COLORS.primary} 
          />
          <Text style={[
            styles.slotBadgeText,
            isFull ? styles.slotBadgeTextFull : styles.slotBadgeTextAvailable
          ]}>
            {isFull ? 'HẾT SLOT' : `Còn ${remainingSlots}/${session.maxSlots} slot trống`}
          </Text>
        </View>

        {/* Price & Buy Button */}
        <View style={styles.actionGroup}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>{session.pricePerTicket.toLocaleString('vi-VN')}đ</Text>
            <Text style={styles.priceUnit}>/ vé</Text>
          </View>

          <TouchableOpacity
            style={[styles.buyBtn, isFull && styles.buyBtnDisabled]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.buyBtnText, isFull && styles.buyBtnTextDisabled]}>
              {isFull ? 'Hết vé' : 'Xem chi tiết'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: SPACING.xs,
  },
  contentRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  imageFallback: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  venueName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    flex: 1,
    fontSize: 15,
  },
  levelBadge: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  courtName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  courtNameBold: {
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    flex: 1,
  },
  timeText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginVertical: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  slotBadgeAvailable: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  slotBadgeFull: {
    backgroundColor: COLORS.errorOpacity10,
  },
  slotBadgeText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 11,
    fontWeight: '700',
  },
  slotBadgeTextAvailable: {
    color: COLORS.primary,
  },
  slotBadgeTextFull: {
    color: COLORS.error,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  priceUnit: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },
  buyBtn: {
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow #FED01B
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  buyBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary, // Deep Emerald text
    fontWeight: '800',
    fontSize: 13,
  },
  buyBtnTextDisabled: {
    color: COLORS.outline,
  },
  hostTeamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderColor: '#C7D2FE',
  },
  hostTeamText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#3730A3',
    fontWeight: '600',
  },
});
