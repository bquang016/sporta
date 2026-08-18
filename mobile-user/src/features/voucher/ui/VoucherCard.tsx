import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Voucher, UserVoucher, VoucherScope, DiscountType, VoucherStatus } from '../types';

interface VoucherCardProps {
  voucher: Voucher;
  userVoucher?: UserVoucher;
  onPress?: () => void;
  onCollect?: () => void;
  isCollecting?: boolean;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ 
  voucher, 
  userVoucher, 
  onPress, 
  onCollect,
  isCollecting = false
}) => {
  const isSystem = voucher.voucherScope === VoucherScope.SYSTEM;
  const isCollected = !!userVoucher;
  const isUsed = userVoucher?.status === 'USED';
  const isExpired = voucher.isExpired || userVoucher?.status === 'EXPIRED';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const discountText = voucher.discountType === DiscountType.FIXED_AMOUNT
    ? formatCurrency(voucher.discountValue)
    : `${voucher.discountValue}%`;

  const maxDiscountText = voucher.maxDiscountAmount 
    ? `Giảm tối đa ${formatCurrency(voucher.maxDiscountAmount)}` 
    : '';

  const getLeftColor = () => {
    if (isUsed || isExpired) return COLORS.outlineVariant;
    return isSystem ? COLORS.primary : COLORS.secondary;
  };

  const getLeftTextColor = () => {
    if (isUsed || isExpired) return COLORS.onSurfaceVariant;
    return isSystem ? COLORS.onPrimary : COLORS.onSecondary;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, (isUsed || isExpired) && styles.containerDisabled]} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Left Part - Discount Value */}
      <View style={[styles.leftPart, { backgroundColor: getLeftColor() }]}>
        <Text style={[styles.discountValue, { color: getLeftTextColor() }]}>
          {voucher.discountType === DiscountType.FIXED_AMOUNT ? 'Giảm' : 'Giảm'}
        </Text>
        <Text style={[styles.discountAmount, { color: getLeftTextColor() }]} numberOfLines={1} adjustsFontSizeToFit>
          {discountText}
        </Text>
        {isSystem ? (
          <Text style={[styles.scopeText, { color: getLeftTextColor() }]}>Sporta</Text>
        ) : (
          <Text style={[styles.scopeText, { color: getLeftTextColor() }]}>Cụm sân</Text>
        )}
        
        {/* Decorative cutouts */}
        <View style={[styles.cutout, styles.cutoutTop]} />
        <View style={[styles.cutout, styles.cutoutBottom]} />
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dashedLine} />
      </View>

      {/* Right Part - Details */}
      <View style={styles.rightPart}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={2}>{voucher.name}</Text>
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={styles.conditionText}>Đơn tối thiểu {formatCurrency(voucher.minOrderAmount)}</Text>
          {!!maxDiscountText && <Text style={styles.conditionText}>{maxDiscountText}</Text>}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.outline} />
            <Text style={styles.dateText}>
              HSD: {new Date(voucher.endDate).toLocaleString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>

          {/* Action Button */}
          {onCollect && !isCollected && !isExpired && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={onCollect}
              disabled={isCollecting}
            >
              <Text style={styles.actionBtnText}>{isCollecting ? 'Đang lưu...' : 'Lưu'}</Text>
            </TouchableOpacity>
          )}

          {isCollected && !isUsed && !isExpired && (
            <View style={[styles.actionBtn, styles.collectedBtn]}>
              <Text style={styles.collectedBtnText}>Đã lưu</Text>
            </View>
          )}

          {isUsed && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Đã dùng</Text>
            </View>
          )}

          {isExpired && !isUsed && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Hết hạn</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    height: 110,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  leftPart: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    position: 'relative',
  },
  discountValue: {
    ...TYPOGRAPHY.labelSmall,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  discountAmount: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    textAlign: 'center',
  },
  scopeText: {
    ...TYPOGRAPHY.labelSmall,
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  cutout: {
    position: 'absolute',
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    zIndex: 2,
  },
  cutoutTop: {
    top: -6,
  },
  cutoutBottom: {
    bottom: -6,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  dashedLine: {
    height: '200%',
    width: 1,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    borderStyle: 'dashed',
  },
  rightPart: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  headerRow: {
    marginBottom: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },
  detailsRow: {
    flex: 1,
  },
  conditionText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.outline,
    fontSize: 10,
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 100,
  },
  actionBtnText: {
    color: COLORS.white,
    ...TYPOGRAPHY.labelSmall,
    fontWeight: 'bold',
  },
  collectedBtn: {
    backgroundColor: COLORS.surfaceVariant,
  },
  collectedBtnText: {
    color: COLORS.onSurfaceVariant,
    ...TYPOGRAPHY.labelSmall,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: 'bold',
  }
});
