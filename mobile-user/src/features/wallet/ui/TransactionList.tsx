import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { WalletTransactionResponse } from '../api/walletApi';

interface TransactionListProps {
  transactions: WalletTransactionResponse[];
  onRefresh: () => void;
  refreshing: boolean;
}

export function TransactionList({ transactions, onRefresh, refreshing }: TransactionListProps) {
  const renderItem = ({ item }: { item: WalletTransactionResponse }) => {
    const isPositive = item.transactionType === 'TOP_UP' || item.transactionType === 'BOOKING_REFUND';
    const amountColor = isPositive ? '#16a34a' : COLORS.onSurface; // green for positive, dark for negative
    const iconName = isPositive ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = isPositive ? '#16a34a' : COLORS.outline;
    
    // Format date string to display
    const dateObj = new Date(item.createdAt);
    const dateStr = dateObj.toLocaleDateString('vi-VN');
    const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <View style={[styles.iconBox, { backgroundColor: isPositive ? '#dcfce7' : '#f1f5f9' }]}>
            <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
            <Text style={styles.time}>{timeStr} - {dateStr}</Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isPositive ? '+' : '-'}{item.amount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
      
      {transactions.length === 0 && !refreshing ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={48} color={COLORS.outlineVariant} />
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -SPACING.md,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  listContent: {
    paddingBottom: SPACING.xl * 2,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  desc: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  time: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.3,
    marginVertical: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurfaceVariant,
  }
});
