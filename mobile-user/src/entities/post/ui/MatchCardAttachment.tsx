import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export interface MatchCardAttachmentProps {
  data: {
    matchRoomId?: string;
    clubId?: string | number;
    clubName?: string;
    clubAvatar?: string;
    sportName?: string;
    content?: string;
    venueId?: string;
    venueName?: string;
    venue?: any;
    timeSlot?: string;
    playDate?: string;
    startTime?: string;
    endTime?: string;
    targetLevel?: string;
    level?: string;
    totalPrice?: number;
    memberFee?: string;
    memberFeeAmount?: number;
    note?: string;
    pricePerSlot?: string;
    slotsNeeded?: number;
    currentSlots?: number;
    slotsLeft?: number;
    matchStatus?: string;
    guestClubName?: string;
    guestClubAvatar?: string;
    isJoined?: boolean;
  };
  onJoinMatch?: () => void;
  onLeaveMatch?: () => void;
  onClubPress?: () => void;
  onVenuePress?: (venueId?: string, venueName?: string) => void;
  isLoading?: boolean;
}

export const MatchCardAttachment = React.memo(({
  data,
  onJoinMatch,
  onLeaveMatch,
  onClubPress,
  onVenuePress,
  isLoading,
}: MatchCardAttachmentProps) => {
  const sportName = data.sportName || 'Pickleball';
  const isFull =
    data.matchStatus === 'FULL' ||
    data.matchStatus === 'MATCHED' ||
    data.matchStatus === 'COMPLETED' ||
    Boolean(data.guestClubName);
  const isExpired = data.matchStatus === 'EXPIRED' || data.matchStatus === 'CANCELLED';
  const isJoined = data.isJoined === true;

  const totalSlots =
    data.slotsNeeded || (data.slotsLeft ? data.slotsLeft + (data.currentSlots || 0) : 4);
  const currentSlots = data.currentSlots || 0;
  const slotsRemaining = Math.max(0, totalSlots - currentSlots);

  // Sport Specific UI Config
  const getSportStyleConfig = () => {
    switch (sportName) {
      case 'Bóng đá':
      case 'Đá bóng':
        return {
          bgColor: '#F8FAFC',
          borderColor: '#E2E8F0',
          badgeBg: '#E2E8F0',
          badgeText: '#1E293B',
          accentColor: '#2563EB',
          iconName: 'football-outline' as const,
          watermarkIcon: 'soccer' as const,
          watermarkColor: '#94A3B8',
        };
      case 'Cầu lông':
      case 'Đánh cầu':
        return {
          bgColor: '#F0F9FF',
          borderColor: '#BAE6FD',
          badgeBg: '#E0F2FE',
          badgeText: '#0284C7',
          accentColor: '#0284C7',
          iconName: 'fitness-outline' as const,
          watermarkIcon: 'badminton' as const,
          watermarkColor: '#38BDF8',
        };
      case 'Bóng rổ':
        return {
          bgColor: '#FFF7ED',
          borderColor: '#FFEDD5',
          badgeBg: '#FFEDD5',
          badgeText: '#EA580C',
          accentColor: '#EA580C',
          iconName: 'basketball-outline' as const,
          watermarkIcon: 'basketball' as const,
          watermarkColor: '#FB923C',
        };
      case 'Tennis':
        return {
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
          badgeBg: '#D1FAE5',
          badgeText: '#059669',
          accentColor: '#059669',
          iconName: 'tennisball-outline' as const,
          watermarkIcon: 'tennis' as const,
          watermarkColor: '#34D399',
        };
      case 'Pickleball':
      default:
        return {
          bgColor: '#FEFCE8',
          borderColor: '#FEF08A',
          badgeBg: '#FEF08A',
          badgeText: '#854D0E',
          accentColor: '#D97706',
          iconName: 'tennisball-outline' as const,
          watermarkIcon: 'tennis-ball' as const,
          watermarkColor: '#FACC15',
        };
    }
  };

  const config = getSportStyleConfig();

  // Format Total Price
  const formattedTotalPrice =
    data.totalPrice != null && data.totalPrice > 0
      ? `${Number(data.totalPrice).toLocaleString('vi-VN')}đ`
      : null;

  // Format Member Fee / Split Fee
  const formattedSplitFee =
    data.memberFee ||
    (data.memberFeeAmount != null && data.memberFeeAmount > 0
      ? `${Number(data.memberFeeAmount).toLocaleString('vi-VN')}đ`
      : data.pricePerSlot);

  // Time & Date format helper
  const displayTime =
    data.timeSlot ||
    (data.playDate
      ? `${data.playDate} • ${data.startTime || ''} - ${data.endTime || ''}`
      : 'Thời gian linh hoạt');

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
      {/* Background Watermark */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <MaterialCommunityIcons
          name={config.watermarkIcon}
          size={130}
          color={config.watermarkColor}
          style={styles.watermarkIcon}
        />
      </View>

      {/* ── 1. Top Badges Row (Sport & Slot Status) ── */}
      <View style={styles.topBadgeRow}>
        <View style={styles.leftBadges}>
          {/* Sport Badge */}
          <View style={[styles.sportBadge, { backgroundColor: config.badgeBg }]}>
            {sportName === 'Cầu lông' || sportName === 'Đánh cầu' ? (
              <MaterialCommunityIcons name="badminton" size={15} color={config.badgeText} />
            ) : (
              <Ionicons name={config.iconName} size={14} color={config.badgeText} />
            )}
            <Text style={[styles.sportBadgeText, { color: config.badgeText }]}>{sportName}</Text>
          </View>
        </View>

        {/* Match Status Badge */}
        {isExpired ? (
          <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.statusBadgeText, { color: '#64748B' }]}>Kèo đã kết thúc</Text>
          </View>
        ) : isFull ? (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
            <Text style={[styles.statusBadgeText, { color: '#16A34A' }]}>
              {data.guestClubName ? `Đã ghép: ${data.guestClubName}` : 'Đã có đối thủ'}
            </Text>
          </View>
        ) : isJoined ? (
          <View style={[styles.statusBadge, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="paper-plane" size={13} color="#0284C7" />
            <Text style={[styles.statusBadgeText, { color: '#0284C7' }]}>
              Đã gửi yêu cầu
            </Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="flame" size={13} color="#D97706" />
            <Text style={[styles.statusBadgeText, { color: '#B45309' }]}>
              Đang tìm đối thủ
            </Text>
          </View>
        )}
      </View>

      {/* ── 2. Message / Note for Opponent (Ghi chú cho đối thủ từ MatchRoom.java) ── */}
      {data.note ? (
        <View style={styles.messageBox}>
          <Ionicons name="chatbox-ellipses-outline" size={15} color={COLORS.primary} style={styles.quoteIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noteLabelTitle}>Ghi chú cho đối thủ:</Text>
            <Text style={styles.messageText} numberOfLines={3}>
              "{data.note}"
            </Text>
          </View>
        </View>
      ) : null}

      {/* ── 3. Match Details Grid ── */}
      <View style={styles.detailsContainer}>
        {/* Host Club Row */}
        {data.clubName ? (
          <TouchableOpacity
            style={styles.detailRow}
            activeOpacity={0.7}
            onPress={onClubPress}
            disabled={!onClubPress}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
              {data.clubAvatar ? (
                <Image source={{ uri: data.clubAvatar }} style={styles.clubRowAvatar} />
              ) : (
                <Ionicons name="shield-checkmark" size={16} color="#4F46E5" />
              )}
            </View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Câu lạc bộ tạo kèo</Text>
              <Text style={styles.detailMainValue} numberOfLines={1}>
                {data.clubName}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}

        {/* Date & Time Slot */}
        <View style={styles.detailRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
          </View>
          <View style={styles.detailTextWrapper}>
            <Text style={styles.detailLabel}>Ngày & Giờ thi đấu</Text>
            <Text style={styles.detailMainValue} numberOfLines={1}>
              {displayTime}
            </Text>
          </View>
        </View>

        {/* Venue Location */}
        {data.venueName ? (
          <TouchableOpacity
            style={styles.detailRow}
            activeOpacity={0.7}
            onPress={() => onVenuePress && onVenuePress(data.venueId || data.venue?.id, data.venueName)}
            disabled={!onVenuePress}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Ionicons name="location-outline" size={15} color="#2563EB" />
            </View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Địa điểm & Sân</Text>
              <Text style={styles.detailMainValue} numberOfLines={1}>
                {data.venueName}
              </Text>
            </View>
            {onVenuePress && <Ionicons name="chevron-forward" size={16} color="#94A3B8" />}
          </TouchableOpacity>
        ) : null}

        {/* Target Level & Financial Breakdown (Two Columns) */}
        <View style={styles.gridTwoCols}>
          {/* Target Level */}
          <View style={styles.gridCard}>
            <View style={styles.gridCardHeader}>
              <Ionicons name="speedometer-outline" size={13} color="#64748B" />
              <Text style={styles.gridCardLabel}>Trình độ</Text>
            </View>
            <Text style={styles.gridCardValue} numberOfLines={1}>
              {data.targetLevel || data.level || 'Giao lưu vui vẻ'}
            </Text>
          </View>

          {/* Total Court Price */}
          {formattedTotalPrice ? (
            <View style={styles.gridCard}>
              <View style={styles.gridCardHeader}>
                <Ionicons name="receipt-outline" size={13} color="#64748B" />
                <Text style={styles.gridCardLabel}>Tổng giá sân</Text>
              </View>
              <Text style={styles.gridCardValue} numberOfLines={1}>
                {formattedTotalPrice}
              </Text>
            </View>
          ) : null}

          {/* Split Fee / Per Slot Fee */}
          {formattedSplitFee ? (
            <View style={[styles.gridCard, styles.gridCardHighlight]}>
              <View style={styles.gridCardHeader}>
                <Ionicons name="wallet-outline" size={13} color="#059669" />
                <Text style={[styles.gridCardLabel, { color: '#059669', fontWeight: '700' }]}>
                  Tiền sau chia
                </Text>
              </View>
              <Text style={styles.splitFeeValue} numberOfLines={2}>
                {formattedSplitFee}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── 4. CTA Action Button ── */}
      {isJoined ? (
        <TouchableOpacity
          style={[styles.ctaButton, styles.ctaButtonJoined]}
          activeOpacity={0.85}
          disabled={isLoading}
          onPress={onLeaveMatch}
        >
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.ctaButtonTextJoined}>
            {isLoading ? 'Đang xử lý...' : 'Đã gửi yêu cầu ghép kèo'}
          </Text>
        </TouchableOpacity>
      ) : isExpired ? (
        <View style={[styles.ctaButton, styles.ctaButtonDisabled]}>
          <Text style={styles.ctaButtonTextDisabled}>Kèo đấu đã quá giờ</Text>
        </View>
      ) : isFull ? (
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: '#0F172A' }]}
          activeOpacity={0.85}
          onPress={onJoinMatch}
        >
          <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>Xem chi tiết trận đấu</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          disabled={isLoading}
          onPress={onJoinMatch}
        >
          <Ionicons name="flash" size={16} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>
            {isLoading ? 'Đang xử lý...' : 'Gửi đơn ghép kèo'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.md,
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  watermarkContainer: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.12,
  },
  watermarkIcon: {
    transform: [{ rotate: '-12deg' }],
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 1,
  },
  leftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flexShrink: 1,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '800',
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    maxWidth: 150,
  },
  clubAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  clubRowAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  clubNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    gap: 6,
    alignItems: 'flex-start',
    zIndex: 1,
  },
  quoteIcon: {
    marginTop: 2,
  },
  noteLabelTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  messageText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12.5,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 18,
    flex: 1,
  },
  detailsContainer: {
    gap: 8,
    zIndex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 1,
  },
  detailMainValue: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  gridTwoCols: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  gridCardHighlight: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  gridCardLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  gridCardValue: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  splitFeeValue: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 12.5,
    color: '#059669',
    fontWeight: '800',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaButtonText: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ctaButtonJoined: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonTextJoined: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    color: '#059669',
    fontWeight: '800',
  },
  ctaButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonTextDisabled: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
  },
});
