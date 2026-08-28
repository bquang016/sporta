import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

interface BalanceCardProps {
  balance: number;
  formattedBalance: string;
  onTopUpPress: () => void;
  isLoading?: boolean;
}

export function BalanceCard({ balance, formattedBalance, onTopUpPress, isLoading }: BalanceCardProps) {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);

  const displayBalance = isLoading
    ? '••••••••'
    : showBalance
    ? formattedBalance.replace(' VNĐ', '')
    : '••••••••';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#064E3B', '#033B2C', '#01241B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Background Decorative Rings */}
        <View style={styles.cardAuraLarge} />
        <View style={styles.cardAuraSmall} />

        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <View style={styles.walletIconCircle}>
              <MaterialCommunityIcons name="wallet-outline" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Ví Thể Thao Sporta</Text>
              <Text style={styles.cardSubtitle}>Tài khoản chính • PayOS</Text>
            </View>
          </View>

          {/* Show/Hide Balance Toggle */}
          <TouchableOpacity
            onPress={() => setShowBalance(!showBalance)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#A7F3D0"
            />
          </TouchableOpacity>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
              {displayBalance}
            </Text>
            {showBalance && !isLoading && (
              <Text style={styles.currencyBadge}>VNĐ</Text>
            )}
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          {/* Top Up Primary Button */}
          <TouchableOpacity
            style={styles.topUpBtn}
            activeOpacity={0.85}
            onPress={onTopUpPress}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#FED01B', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topUpBtnGradient}
            >
              <MaterialCommunityIcons name="plus-circle" size={18} color="#064E3B" />
              <Text style={styles.topUpBtnText}>Nạp tiền ngay</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Vouchers Button */}
          <TouchableOpacity
            style={styles.voucherBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/vouchers')}
          >
            <MaterialCommunityIcons name="ticket-percent-outline" size={17} color="#FFFFFF" />
            <Text style={styles.voucherBtnText}>Ưu đãi & Voucher</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 12,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardAuraLarge: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(254, 208, 27, 0.08)',
  },
  cardAuraSmall: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 1,
    fontWeight: '500',
  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    marginBottom: 20,
    zIndex: 2,
  },
  balanceLabel: {
    fontSize: 11.5,
    color: '#D1FAE5',
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    gap: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  currencyBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FED01B',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 2,
  },
  topUpBtn: {
    flex: 1.2,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#FED01B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  topUpBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 6,
  },
  topUpBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.2,
  },
  voucherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  voucherBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

