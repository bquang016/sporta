import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING } from '../../../shared/config/theme';
import {
  getWalletBalance,
  getWalletTransactions,
  topUpWallet,
  checkPaymentStatus,
  TopUpRequest,
  TopUpResponse,
} from '../../../features/wallet/api/walletApi';
import { BalanceCard } from '../../../features/wallet/ui/BalanceCard';
import { TransactionList } from '../../../features/wallet/ui/TransactionList';
import { TopUpSheet } from '../../../features/wallet/ui/TopUpSheet';
import { TopUpSuccessModal } from '../../../features/wallet/ui/TopUpSuccessModal';

const HEADER_HEIGHT = 56;

export function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isTopUpSheetVisible, setIsTopUpSheetVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);

  // ─── Queries ────────────────────────────────────────────────────────────────
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: getWalletBalance,
  });

  const {
    data: transactionsData,
    isLoading: isLoadingTxns,
    refetch: refetchTxns,
    isRefetching,
  } = useQuery({
    queryKey: ['wallet_transactions'],
    queryFn: () => getWalletTransactions(0, 50),
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const topUpMutation = useMutation<TopUpResponse, Error, TopUpRequest>({
    mutationFn: (data: TopUpRequest) => topUpWallet(data),
    onSuccess: async (res) => {
      setIsTopUpSheetVisible(false);
      if (res.checkoutUrl) {
        const returnUrl = Linking.createURL('/payment/success');
        const result = await WebBrowser.openAuthSessionAsync(res.checkoutUrl, returnUrl);

        if (
          result.type === 'success' ||
          result.type === 'cancel' ||
          result.type === 'dismiss'
        ) {
          try {
            const statusRes = await checkPaymentStatus(res.orderCode);
            if (statusRes.status === 'PAID' || statusRes.status === 'COMPLETED') {
              setSuccessAmount(res.amount);
              setIsSuccessModalVisible(true);
            }
          } catch (e) {
            console.log('Failed to sync payment status', e);
          }
          handleRefresh();
        }
      }
    },
    onError: (error: any) => {
      Alert.alert('Lỗi nạp tiền', error.message || 'Không thể tạo phiên thanh toán');
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    refetchBalance();
    refetchTxns();
  }, [refetchBalance, refetchTxns]);

  const handleTopUpSubmit = (amount: number) => {
    topUpMutation.mutate({ amount });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Fixed Status Bar Background */}
      <View style={[styles.statusBarBackground, { height: insets.top }]} />

      {/* ========================================================
          SYNCHRONIZED APP HEADER WITH BACK NAVIGATION
         ======================================================== */}
      <View style={[styles.headerBar, { marginTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ví Sporta</Text>

        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.rightIconBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="refresh-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* ========================================================
          MAIN SCREEN CONTENT
         ======================================================== */}
      <View style={styles.mainContent}>
        {/* Top Section with Balance Card */}
        <BalanceCard
          balance={balanceData?.balance || 0}
          formattedBalance={balanceData?.formattedBalance || '0 VNĐ'}
          isLoading={isLoadingBalance}
          onTopUpPress={() => setIsTopUpSheetVisible(true)}
        />

        {/* Bottom Section with Transactions */}
        <TransactionList
          transactions={transactionsData || []}
          onRefresh={handleRefresh}
          refreshing={isRefetching}
        />
      </View>

      {/* Top Up Bottom Sheet */}
      <TopUpSheet
        visible={isTopUpSheetVisible}
        onClose={() => setIsTopUpSheetVisible(false)}
        onTopUp={handleTopUpSubmit}
        isSubmitting={topUpMutation.isPending}
      />

      {/* Top Up Success Celebration Modal */}
      <TopUpSuccessModal
        visible={isSuccessModalVisible}
        amount={successAmount}
        onClose={() => setIsSuccessModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    zIndex: 10,
  },
  headerBar: {
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 9,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  rightIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainContent: {
    flex: 1,
  },
});

