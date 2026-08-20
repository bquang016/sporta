import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { COLORS, SPACING } from '../../../shared/config/theme';
import { 
  getWalletBalance, 
  getWalletTransactions, 
  topUpWallet,
  checkPaymentStatus,
  TopUpRequest,
  TopUpResponse
} from '../../../features/wallet/api/walletApi';
import { BalanceCard } from '../../../features/wallet/ui/BalanceCard';
import { TransactionList } from '../../../features/wallet/ui/TransactionList';
import { TopUpSheet } from '../../../features/wallet/ui/TopUpSheet';
import { TopUpSuccessModal } from '../../../features/wallet/ui/TopUpSuccessModal';

export function WalletScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isTopUpSheetVisible, setIsTopUpSheetVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { 
    data: balanceData, 
    isLoading: isLoadingBalance,
    refetch: refetchBalance 
  } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: getWalletBalance,
  });

  const { 
    data: transactionsData, 
    isLoading: isLoadingTxns,
    refetch: refetchTxns,
    isRefetching
  } = useQuery({
    queryKey: ['wallet_transactions'],
    queryFn: () => getWalletTransactions(0, 50), // fetch recent 50 for now
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const topUpMutation = useMutation<TopUpResponse, Error, TopUpRequest>({
    mutationFn: (data: TopUpRequest) => topUpWallet(data),
    onSuccess: async (res) => {
      setIsTopUpSheetVisible(false);
      if (res.checkoutUrl) {
        // Use openAuthSessionAsync to automatically close browser on redirect
        const returnUrl = Linking.createURL('/payment/success');
        const result = await WebBrowser.openAuthSessionAsync(res.checkoutUrl, returnUrl);
        
        // After browser closes, sync status explicitly
        if (result.type === 'success' || result.type === 'cancel' || result.type === 'dismiss') {
          try {
            const statusRes = await checkPaymentStatus(res.orderCode);
            if (statusRes.status === 'PAID' || statusRes.status === 'COMPLETED') {
              setSuccessAmount(res.amount);
              setIsSuccessModalVisible(true);
            }
          } catch (e) {
            console.log("Failed to sync payment status", e);
          }
          // Refresh to get updated balance
          handleRefresh();
        }
      }
    },
    onError: (error: any) => {
      Alert.alert('Lỗi nạp tiền', error.message || 'Không thể tạo phiên thanh toán');
    }
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
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        
        {/* Top Section with Balance Card */}
        <View style={styles.topSection}>
          <BalanceCard 
            balance={balanceData?.balance || 0}
            formattedBalance={balanceData?.formattedBalance || '0 VNĐ'}
            isLoading={isLoadingBalance}
            onTopUpPress={() => setIsTopUpSheetVisible(true)}
          />
        </View>

        {/* Bottom Section with Transactions */}
        <TransactionList 
          transactions={transactionsData || []}
          onRefresh={handleRefresh}
          refreshing={isRefetching}
        />

        {/* Bottom Sheet */}
        <TopUpSheet 
          visible={isTopUpSheetVisible}
          onClose={() => setIsTopUpSheetVisible(false)}
          onTopUp={handleTopUpSubmit}
          isSubmitting={topUpMutation.isPending}
        />

        {/* Success Modal */}
        <TopUpSuccessModal 
          visible={isSuccessModalVisible}
          amount={successAmount}
          onClose={() => setIsSuccessModalVisible(false)}
        />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  safeArea: {
    flex: 1,
  },
  topSection: {
    paddingBottom: SPACING.xl,
    backgroundColor: '#f9f9ff',
  }
});
