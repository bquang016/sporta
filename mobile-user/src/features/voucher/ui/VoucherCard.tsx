import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Voucher, UserVoucher, VoucherScope, DiscountType } from '../types';

interface VoucherCardProps {
  voucher?: Voucher;
  userVoucher?: UserVoucher;
  isCollected?: boolean;
  onPress?: () => void;
  onUsePress?: () => void;
  onCollect?: () => void;
  isCollecting?: boolean;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ 
  voucher, 
  userVoucher, 
  isCollected = false,
  onPress,
  onUsePress,
  onCollect,
  isCollecting = false,
}) => {
  const router = useRouter();

  const vName = userVoucher?.voucherName || voucher?.name || userVoucher?.voucher?.name || 'Mã giảm giá Sporta';
  const vCode = userVoucher?.voucherCode || voucher?.code || userVoucher?.voucher?.code || '';
  const vDiscountType = userVoucher?.discountType || voucher?.discountType || userVoucher?.voucher?.discountType || DiscountType.PERCENTAGE;
  const vDiscountValue = userVoucher?.discountValue ?? voucher?.discountValue ?? userVoucher?.voucher?.discountValue ?? 0;
  const vMaxDiscount = userVoucher?.maxDiscountAmount ?? voucher?.maxDiscountAmount ?? userVoucher?.voucher?.maxDiscountAmount ?? null;
  const vMinOrder = userVoucher?.minOrderAmount ?? voucher?.minOrderAmount ?? userVoucher?.voucher?.minOrderAmount ?? 0;
  const vScope = userVoucher?.voucherScope || voucher?.voucherScope || userVoucher?.voucher?.voucherScope || VoucherScope.SYSTEM;
  const vEndDate = userVoucher?.endDate || voucher?.endDate || userVoucher?.voucher?.endDate || '';
  const venueIds = userVoucher?.venueIds || voucher?.venueIds || userVoucher?.voucher?.venueIds;

  // Quantity / Progress calculation
  const totalQty = userVoucher?.totalQuantity ?? voucher?.totalQuantity ?? 100;
  const usedQty = userVoucher?.usedQuantity ?? voucher?.usedQuantity ?? 0;
  const remainingQty = userVoucher?.remainingQuantity ?? voucher?.remainingQuantity ?? Math.max(0, totalQty - usedQty);

  const usedPercentage = totalQty > 0 ? Math.min(100, Math.round((usedQty / totalQty) * 100)) : 0;
  const remainingPercentage = Math.max(0, 100 - usedPercentage);
  const isUrgent = remainingPercentage <= 30 && remainingPercentage > 0;
  const isSoldOut = totalQty > 0 && usedQty >= totalQty;

  const vStartDate = userVoucher?.startDate || voucher?.startDate || userVoucher?.voucher?.startDate || '';
  const isUpcoming = vStartDate ? new Date(vStartDate).getTime() > Date.now() : false;

  const isSystem = vScope === VoucherScope.SYSTEM;
  const isCollectedCard = isCollected || !!userVoucher;
  const isUsed = userVoucher?.status === 'USED';
  const isExpired = userVoucher?.status === 'EXPIRED' || (voucher && voucher.isExpired) || (vEndDate ? new Date(vEndDate).getTime() < Date.now() : false);
  const isAvailableToUse = !isUsed && !isExpired && !isUpcoming && !isSoldOut;

  const formatCurrency = (val: number | null | undefined) => {
    if (!val) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const discountValueText = vDiscountType === DiscountType.FIXED_AMOUNT
    ? (vDiscountValue >= 1000 ? `${Math.round(vDiscountValue / 1000)}k` : `${vDiscountValue}đ`)
    : `${vDiscountValue}%`;

  const maxDiscountText = vMaxDiscount 
    ? `Tối đa ${formatCurrency(vMaxDiscount)}` 
    : '';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleUseNow = () => {
    if (onUsePress) {
      onUsePress();
    } else if (venueIds && venueIds.length > 0) {
      router.push(`/booking/${venueIds[0]}`);
    } else {
      router.push('/search');
    }
  };

  const getLeftBg = () => {
    if (isUsed || isExpired || isSoldOut) return '#94A3B8';
    return isSystem ? '#004D40' : '#1E293B';
  };

  const getProgressColor = () => {
    if (isUsed || isExpired || isSoldOut) return '#CBD5E1';
    if (isUrgent) return '#EF4444';
    return '#10B981';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, (isUsed || isExpired || isSoldOut) && styles.containerDisabled]} 
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* ── Left Ticket Stub ── */}
      <View style={[styles.leftStub, { backgroundColor: getLeftBg() }]}>
        <View style={styles.scopeTag}>
          <Text style={styles.scopeTagText}>{isSystem ? 'SPORTA' : 'CỤM SÂN'}</Text>
        </View>

        <View style={styles.discountWrap}>
          <Text style={styles.discountLabel}>GIẢM</Text>
          <Text style={styles.discountBigNumber} numberOfLines={1} adjustsFontSizeToFit>
            {discountValueText}
          </Text>
        </View>

        <Text style={styles.minOrderLeft} numberOfLines={1}>
          Đơn từ {Math.round(vMinOrder / 1000)}k
        </Text>

        {/* Half-circle punch cutouts */}
        <View style={[styles.cutout, styles.cutoutTop]} />
        <View style={[styles.cutout, styles.cutoutBottom]} />
      </View>

      {/* ── Right Content Area ── */}
      <View style={styles.rightBody}>
        {/* Title & Code Badge */}
        <View style={styles.headerRow}>
          <Text style={[styles.voucherTitle, (isUsed || isExpired) && styles.disabledText]} numberOfLines={1}>
            {vName}
          </Text>
          {vCode ? (
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{vCode}</Text>
            </View>
          ) : null}
        </View>

        {/* Conditions */}
        <View style={styles.conditionRow}>
          <Text style={styles.conditionText}>
            Đơn tối thiểu {formatCurrency(vMinOrder)}
            {maxDiscountText ? ` · ${maxDiscountText}` : ''}
          </Text>
        </View>

        {/* ── Stamp Seal: ĐÃ THU THẬP (State 2) ── */}
        {isCollectedCard && !isExpired && !isUsed && !isSoldOut && (
          <View style={styles.collectedStamp}>
            <View style={styles.collectedStampInner}>
              <Ionicons name="checkmark-done" size={12} color="#059669" />
              <Text style={styles.collectedStampText}>ĐÃ THU THẬP</Text>
            </View>
          </View>
        )}

        {/* ── Stamp Seal: HẾT LƯỢT SỬ DỤNG ── */}
        {isSoldOut && (
          <View style={styles.soldOutStamp}>
            <View style={styles.soldOutStampInner}>
              <Ionicons name="close-circle" size={12} color="#DC2626" />
              <Text style={styles.soldOutStampText}>HẾT LƯỢT DÙNG</Text>
            </View>
          </View>
        )}

        {/* ── Progress Bar: Remaining Quantity ── */}
        {!isUsed && !isExpired && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <View style={styles.fomoRow}>
                <Ionicons
                  name={isUrgent ? 'flame' : 'ticket-outline'}
                  size={12}
                  color={isUrgent ? '#EF4444' : COLORS.primary}
                />
                <Text style={[styles.progressLabel, isUrgent && styles.progressLabelUrgent]}>
                  {isSoldOut
                    ? 'Đã hết số lượng sử dụng'
                    : isUrgent
                    ? `Sắp hết! Còn ${remainingPercentage}% (${remainingQty} mã)`
                    : `Đã dùng ${usedPercentage}% · Còn ${remainingQty} mã`}
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(5, usedPercentage)}%`,
                    backgroundColor: getProgressColor(),
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* ── Footer Row: Expiry Date + Action Button ── */}
        <View style={styles.footerRow}>
          <View style={styles.expiryRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.outline} />
            <Text style={styles.expiryText}>HSD: {formatDate(vEndDate)}</Text>
          </View>

          {/* Action Area */}
          {isUsed ? (
            <View style={styles.statusBadgeGrey}>
              <Text style={styles.statusBadgeGreyText}>Đã sử dụng</Text>
            </View>
          ) : isExpired ? (
            <View style={styles.statusBadgeGrey}>
              <Text style={styles.statusBadgeGreyText}>Hết hạn</Text>
            </View>
          ) : isSoldOut ? (
            <View style={styles.statusBadgeSoldOut}>
              <Text style={styles.statusBadgeSoldOutText}>Hết lượt dùng</Text>
            </View>
          ) : isCollectedCard && isUpcoming ? (
            <View style={styles.statusBadgeUpcoming}>
              <Ionicons name="time-outline" size={12} color="#D97706" />
              <Text style={styles.statusBadgeUpcomingText}>Chưa bắt đầu</Text>
            </View>
          ) : isCollectedCard ? (
            <TouchableOpacity 
              style={styles.useNowBtn}
              onPress={handleUseNow}
              activeOpacity={0.8}
            >
              <Text style={styles.useNowBtnText}>Dùng ngay</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          ) : onCollect ? (
            <TouchableOpacity 
              style={styles.collectBtn}
              onPress={onCollect}
              disabled={isCollecting}
              activeOpacity={0.8}
            >
              <Text style={styles.collectBtnText}>{isCollecting ? 'Đang lưu...' : (isUpcoming ? 'Lưu trước' : 'Lưu mã')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 104,
  },
  containerDisabled: {
    opacity: 0.65,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  leftStub: {
    width: 98,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: COLORS.surfaceContainerHigh,
    borderStyle: 'dashed',
  },
  scopeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  scopeTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  discountWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: -2,
  },
  discountBigNumber: {
    color: '#FED01B',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  minOrderLeft: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9.5,
    fontWeight: '600',
  },
  cutout: {
    position: 'absolute',
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  cutoutTop: {
    top: -6,
  },
  cutoutBottom: {
    bottom: -6,
  },
  rightBody: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  voucherTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 14,
    flex: 1,
  },
  disabledText: {
    color: COLORS.onSurfaceVariant,
  },
  codeBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  codeBadgeText: {
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  conditionRow: {
    marginVertical: 2,
  },
  conditionText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11.5,
    fontWeight: '500',
  },
  progressSection: {
    marginVertical: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  fomoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  progressLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  progressLabelUrgent: {
    color: '#EF4444',
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.8,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    color: COLORS.outline,
    fontSize: 11,
    fontWeight: '500',
  },
  useNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  useNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  collectBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  collectBtnText: {
    color: '#003527',
    fontSize: 11.5,
    fontWeight: '800',
  },
  statusBadgeGrey: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeGreyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusBadgeUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeUpcomingText: {
    color: '#D97706',
    fontSize: 10.5,
    fontWeight: '700',
  },
  collectedStamp: {
    position: 'absolute',
    right: 8,
    top: 24,
    zIndex: 5,
    transform: [{ rotate: '-10deg' }],
  },
  collectedStampInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  collectedStampText: {
    color: '#059669',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  soldOutStamp: {
    position: 'absolute',
    right: 8,
    top: 24,
    zIndex: 5,
    transform: [{ rotate: '-10deg' }],
  },
  soldOutStampInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  soldOutStampText: {
    color: '#DC2626',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  statusBadgeSoldOut: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 0.8,
    borderColor: '#FECACA',
  },
  statusBadgeSoldOutText: {
    color: '#DC2626',
    fontSize: 10.5,
    fontWeight: '800',
  },
});
