import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

interface BalanceCardProps {
  balance: number;
  formattedBalance: string;
  onTopUpPress: () => void;
  isLoading?: boolean;
}

export function BalanceCard({ balance, formattedBalance, onTopUpPress, isLoading }: BalanceCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, '#00261b']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#bfc9c3" />
            <Text style={styles.title}>Số dư ví Sporta</Text>
          </View>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.currencySymbol}>đ</Text>
          <Text style={styles.balanceText} numberOfLines={1} adjustsFontSizeToFit>
            {isLoading ? '---' : formattedBalance.replace(' VNĐ', '')}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Khả dụng</Text>
            <Text style={styles.infoValue}>Có thể dùng thanh toán</Text>
          </View>
          <TouchableOpacity 
            style={styles.topUpBtn} 
            activeOpacity={0.8}
            onPress={onTopUpPress}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
            <Text style={styles.topUpBtnText}>Nạp tiền</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.labelMd,
    color: '#bfc9c3', // onSurfaceVariant equivalent for dark bg
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  currencySymbol: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.secondary,
    marginTop: 4,
    marginRight: 4,
  },
  balanceText: {
    ...TYPOGRAPHY.headlineXl,
    color: '#ffffff',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#bfc9c3',
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    color: '#ffffff',
    marginTop: 2,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  topUpBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
