import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MatchAttachmentData } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface MatchCardAttachmentProps {
  data: MatchAttachmentData;
  onJoinMatch?: () => void;
}

export const MatchCardAttachment = React.memo(({
  data,
  onJoinMatch,
}: MatchCardAttachmentProps) => {
  // Sport Specific UI Config (Tint Color, Watermark Icon, Sport Badge Color)
  const getSportStyleConfig = () => {
    switch (data.sportName) {
      case 'Bóng đá':
        return {
          bgColor: '#F8FAFC', // Crisp soft white
          borderColor: '#E2E8F0',
          badgeBg: '#E2E8F0',
          badgeText: '#334155',
          iconName: 'football-outline' as const,
          watermarkIcon: 'soccer' as const,
          watermarkColor: '#94A3B8',
        };
      case 'Cầu lông':
      case 'Đánh cầu':
        return {
          bgColor: '#F0F9FF', // Soft sky blue tint
          borderColor: '#BAE6FD',
          badgeBg: '#E0F2FE',
          badgeText: '#0284C7',
          iconName: 'fitness-outline' as const,
          watermarkIcon: 'badminton' as const,
          watermarkColor: '#38BDF8',
        };
      case 'Bóng rổ':
        return {
          bgColor: '#FFF7ED', // Soft orange tint
          borderColor: '#FFEDD5',
          badgeBg: '#FFEDD5',
          badgeText: '#EA580C',
          iconName: 'basketball-outline' as const,
          watermarkIcon: 'basketball' as const,
          watermarkColor: '#FB923C',
        };
      case 'Pickleball':
      default:
        return {
          bgColor: '#FEFCE8', // Soft pastel yellow tint
          borderColor: '#FEF08A',
          badgeBg: '#FEF08A',
          badgeText: '#854D0E',
          iconName: 'tennisball-outline' as const,
          watermarkIcon: 'tennis-ball' as const,
          watermarkColor: '#FACC15',
        };
    }
  };

  const config = getSportStyleConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
      {/* ── Background Subtle Sport Watermark Vector Outline (Không quá sặc sỡ) ── */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <MaterialCommunityIcons
          name={config.watermarkIcon}
          size={120}
          color={config.watermarkColor}
          style={styles.watermarkIcon}
        />
      </View>

      {/* ── Header Banner ── */}
      <View style={styles.cardHeader}>
        <View style={[styles.sportBadge, { backgroundColor: config.badgeBg }]}>
          {data.sportName === 'Cầu lông' || data.sportName === 'Đánh cầu' ? (
            <MaterialCommunityIcons name="badminton" size={16} color={config.badgeText} />
          ) : (
            <Ionicons name={config.iconName} size={15} color={config.badgeText} />
          )}
          <Text style={[styles.sportBadgeText, { color: config.badgeText }]}>{data.sportName}</Text>
        </View>

        <View style={styles.slotsBadge}>
          <Ionicons name="time-outline" size={13} color="#D97706" />
          <Text style={styles.slotsBadgeText}>Còn {data.slotsLeft} suất trống</Text>
        </View>
      </View>

      {/* ── Main Info Rows ── */}
      <View style={styles.infoContent}>
        {/* Time Slot */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.timeSlotText} numberOfLines={1}>
            {data.timeSlot}
          </Text>
        </View>

        {/* Venue Name if present */}
        {data.venueName ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.grayText} />
            <Text style={styles.venueText} numberOfLines={1}>
              {data.venueName}
            </Text>
          </View>
        ) : null}

        {/* Level & Price Meta Column Fix (Tự điều chỉnh layout chống tràn 100%) */}
        <View style={styles.metaWrapContainer}>
          {/* Level Chip */}
          <View style={styles.metaChipBlock}>
            <Text style={styles.metaLabel}>Trình độ:</Text>
            <Text style={styles.metaValue} numberOfLines={1} ellipsizeMode="tail">
              {data.level}
            </Text>
          </View>

          {/* Price Chip */}
          <View style={styles.metaChipBlock}>
            <Text style={styles.metaLabel}>Tiền sân:</Text>
            <Text style={styles.priceValue} numberOfLines={1} ellipsizeMode="tail">
              {data.pricePerSlot}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Action CTA Button ── */}
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onJoinMatch}>
        <Ionicons name="flash" size={16} color="#FFFFFF" />
        <Text style={styles.ctaButtonText}>Giao lưu ngay</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    right: -25,
    bottom: -25,
    opacity: 0.14, // Subtle watermark outline opacity
  },
  watermarkIcon: {
    transform: [{ rotate: '-15deg' }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    zIndex: 1,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  sportBadgeText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 13,
    fontWeight: '800',
  },
  slotsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.default,
    gap: 4,
  },
  slotsBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  infoContent: {
    gap: 6,
    marginVertical: 4,
    zIndex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeSlotText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '700',
    flex: 1,
  },
  venueText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },

  // Layout Fix Chống Tràn 100%
  metaWrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  metaChipBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    gap: 4,
    flexShrink: 1,
  },
  metaLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  metaValue: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '700',
    flexShrink: 1,
  },
  priceValue: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
    flexShrink: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 10,
    marginTop: 6,
    gap: 6,
    zIndex: 1,
  },
  ctaButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
