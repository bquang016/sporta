import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Voucher, DiscountType } from '../types';
import { useCollectVoucher } from '../hooks';

interface VoucherBannerProps {
  voucher: Voucher;
  width: number;
}

export const VoucherBanner: React.FC<VoucherBannerProps> = ({ voucher, width }) => {
  const { collectVoucher, loading } = useCollectVoucher();

  const handleCollect = () => {
    collectVoucher(voucher.id, () => {
      // Could show a toast here
    });
  };

  const discountText = voucher.discountType === DiscountType.FIXED_AMOUNT 
    ? `${(voucher.discountValue / 1000)}k` 
    : `${voucher.discountValue}%`;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={[styles.container, { width }]}
      onPress={handleCollect}
      disabled={loading}
    >
      <ImageBackground
        source={voucher.bannerImageUrl ? { uri: voucher.bannerImageUrl } : require('../../../../assets/auth/sport_auth_hero.jpg')}
        style={styles.imageCard}
        imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
      >
        <View style={styles.overlay}>
          <View style={styles.cardHeader}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Mã Sporta</Text>
            </View>
            <MaterialIcons name="local-offer" size={24} color="rgba(255, 255, 255, 0.9)" />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.title} numberOfLines={1}>
              Giảm {discountText} - {voucher.name}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              Nhấn để lưu mã ngay!
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
  },
  imageCard: {
    width: '100%',
    height: 115,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: COLORS.white,
    ...TYPOGRAPHY.labelSm,
    fontWeight: 'bold',
  },
  cardBody: {
    marginTop: 'auto',
  },
  title: {
    color: COLORS.white,
    ...TYPOGRAPHY.titleMd,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
  },
});
