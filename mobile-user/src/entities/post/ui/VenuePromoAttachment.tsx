import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VenuePromoAttachmentData } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface VenuePromoAttachmentProps {
  data: VenuePromoAttachmentData;
  onBookVenue?: () => void;
}

export const VenuePromoAttachment = React.memo(({
  data,
  onBookVenue,
}: VenuePromoAttachmentProps) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handlePressBook = () => {
    if (onBookVenue) {
      onBookVenue();
    } else {
      router.push('/search');
    }
  };

  const handleCopyCode = () => {
    if (!data.discountCode) return;
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  return (
    <View style={styles.cardWrapper}>
      {/* Top Banner Stripe */}
      <View style={styles.topBannerStripe}>
        <View style={styles.partnerBadge}>
          <Ionicons name="ribbon" size={13} color="#D97706" />
          <Text style={styles.partnerBadgeText}>ĐỐI TÁC CHÍNH THỨC</Text>
        </View>

        {data.discountPercent && (
          <View style={styles.discountBadge}>
            <MaterialCommunityIcons name="ticket-percent" size={14} color="#FFFFFF" />
            <Text style={styles.discountBadgeText}>{data.discountPercent}</Text>
          </View>
        )}
      </View>

      {/* Main Voucher Body */}
      <View style={styles.voucherBody}>
        <View style={styles.infoCol}>
          <Text style={styles.venueName} numberOfLines={1}>
            {data.venueName}
          </Text>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.grayText} />
            <Text style={styles.addressText} numberOfLines={1}>
              {data.address}
            </Text>
          </View>
        </View>

        {/* Promo Code Dashed Ticket Box */}
        {data.discountCode && (
          <View style={styles.couponContainer}>
            <View style={styles.couponDashedBox}>
              <Text style={styles.couponLabel}>MÃ ƯU ĐÃI</Text>
              <Text style={styles.couponCodeText}>{data.discountCode}</Text>
            </View>

            <TouchableOpacity style={styles.copyBtn} activeOpacity={0.7} onPress={handleCopyCode}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={14}
                color={copied ? '#10B981' : COLORS.primary}
              />
              <Text style={[styles.copyBtnText, copied && { color: '#10B981' }]}>
                {copied ? 'Đã chép' : 'Sao chép'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={handlePressBook}>
          <Ionicons name="calendar" size={15} color="#FFFFFF" />
          <Text style={styles.ctaButtonText}>Đặt sân ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FFFDF5',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  topBannerStripe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
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
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 10.5,
    color: '#B45309',
    letterSpacing: 0.5,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  discountBadgeText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  voucherBody: {
    padding: SPACING.md,
    gap: 10,
  },
  infoCol: {
    gap: 3,
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  couponDashedBox: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
  },
  couponLabel: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 9.5,
    color: COLORS.grayText,
    letterSpacing: 0.5,
  },
  couponCodeText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
    marginTop: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.default,
    gap: 4,
  },
  copyBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 10,
    gap: 6,
  },
  ctaButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
