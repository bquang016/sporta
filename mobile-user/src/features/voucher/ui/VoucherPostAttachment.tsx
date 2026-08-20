import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Voucher, DiscountType } from '../types';
import { useCollectVoucher } from '../hooks';

interface VoucherPostAttachmentProps {
  voucher: Voucher;
}

export const VoucherPostAttachment = React.memo(({ voucher }: VoucherPostAttachmentProps) => {
  const { collectVoucher, loading } = useCollectVoucher();

  const handleCollect = () => {
    collectVoucher(voucher.id, () => {
      // Show success
    });
  };

  const discountText = voucher.discountType === DiscountType.FIXED_AMOUNT 
    ? `${(voucher.discountValue / 1000)}k` 
    : `${voucher.discountValue}%`;

  return (
    <View style={styles.cardWrapper}>
      {/* Top Banner Stripe */}
      <View style={styles.topBannerStripe}>
        <View style={styles.partnerBadge}>
          <Ionicons name="ribbon" size={13} color="#D97706" />
          <Text style={styles.partnerBadgeText}>MÃ KHUYẾN MÃI</Text>
        </View>

        <View style={styles.discountBadge}>
          <MaterialCommunityIcons name="ticket-percent" size={14} color="#FFFFFF" />
          <Text style={styles.discountBadgeText}>GIẢM {discountText}</Text>
        </View>
      </View>

      {/* Main Voucher Body */}
      <View style={styles.voucherBody}>
        <View style={styles.infoCol}>
          <Text style={styles.venueName} numberOfLines={1}>
            {voucher.name}
          </Text>

          <View style={styles.addressRow}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.grayText} />
            <Text style={styles.addressText} numberOfLines={1}>
              Đơn tối thiểu {voucher.minOrderAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={handleCollect} disabled={loading}>
          <Ionicons name="download-outline" size={15} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>{loading ? 'Đang lưu...' : 'Lưu mã ngay'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FAFAFA',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginVertical: SPACING.xs,
    overflow: 'hidden',
  },
  topBannerStripe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: '#D97706',
    fontWeight: 'bold',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  discountBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  voucherBody: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.grayText,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  ctaButtonText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
  },
});
