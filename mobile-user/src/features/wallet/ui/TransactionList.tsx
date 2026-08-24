import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { WalletTransactionResponse } from '../api/walletApi';

interface TransactionListProps {
  transactions: WalletTransactionResponse[];
  onRefresh: () => void;
  refreshing: boolean;
}

type FilterType = 'ALL' | 'TOP_UP' | 'PAYMENT' | 'REFUND';

export function TransactionList({ transactions, onRefresh, refreshing }: TransactionListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<WalletTransactionResponse | null>(null);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'ALL') return transactions;
    if (activeFilter === 'TOP_UP') {
      return transactions.filter((t) => t.transactionType === 'TOP_UP');
    }
    if (activeFilter === 'PAYMENT') {
      return transactions.filter(
        (t) =>
          t.transactionType === 'BOOKING_PAYMENT' ||
          t.transactionType === 'COMMISSION_DEDUCT' ||
          t.transactionType === 'WITHDRAWAL'
      );
    }
    if (activeFilter === 'REFUND') {
      return transactions.filter((t) => t.transactionType === 'BOOKING_REFUND');
    }
    return transactions;
  }, [transactions, activeFilter]);

  const renderItem = ({ item }: { item: WalletTransactionResponse }) => {
    const isPositive =
      item.transactionType === 'TOP_UP' || item.transactionType === 'BOOKING_REFUND';
    const amountVal = item.amount ?? Math.abs(item.balanceAfter - item.balanceBefore);
    const amountColor = isPositive ? '#059669' : '#0F172A';
    const amountPrefix = isPositive ? '+' : '-';

    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'arrow-up-right';
    let iconBg = '#F1F5F9';
    let iconColor = '#64748B';
    let typeLabel = 'Thanh toán';

    if (item.transactionType === 'TOP_UP') {
      iconName = 'arrow-down-left';
      iconBg = '#ECFDF5';
      iconColor = '#059669';
      typeLabel = 'Nạp tiền';
    } else if (item.transactionType === 'BOOKING_REFUND') {
      iconName = 'refresh';
      iconBg = '#EFF6FF';
      iconColor = '#2563EB';
      typeLabel = 'Hoàn tiền';
    } else if (item.transactionType === 'BOOKING_PAYMENT') {
      iconName = 'ticket-confirmation-outline';
      iconBg = '#FFFBEB';
      iconColor = '#D97706';
      typeLabel = 'Đặt sân';
    }

    const dateObj = new Date(item.createdAt);
    const dateStr = dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = dateObj.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => setSelectedTxn(item)}
      >
        <View style={styles.itemLeft}>
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.desc} numberOfLines={1}>
              {item.description || typeLabel}
            </Text>
            <View style={styles.timeRow}>
              <Text style={styles.typeBadge}>{typeLabel}</Text>
              <Text style={styles.timeDot}>•</Text>
              <Text style={styles.time}>
                {timeStr}, {dateStr}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemRight}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountPrefix}
            {amountVal.toLocaleString('vi-VN')}đ
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title & Filter Tabs */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Lịch Sử Giao Dịch</Text>
        
        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'ALL' && styles.filterPillActive]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'ALL' && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'TOP_UP' && styles.filterPillActive]}
            onPress={() => setActiveFilter('TOP_UP')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'TOP_UP' && styles.filterTextActive]}>
              Nạp tiền
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'PAYMENT' && styles.filterPillActive]}
            onPress={() => setActiveFilter('PAYMENT')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'PAYMENT' && styles.filterTextActive]}>
              Đặt sân
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'REFUND' && styles.filterPillActive]}
            onPress={() => setActiveFilter('REFUND')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'REFUND' && styles.filterTextActive]}>
              Hoàn tiền
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List / Empty State */}
      {filteredTransactions.length === 0 && !refreshing ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="receipt-text-outline" size={40} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
          <Text style={styles.emptySub}>
            Các giao dịch nạp tiền, đặt sân và hoàn tiền sẽ hiển thị tại đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* ========================================================
          TRANSACTION RECEIPT DETAIL MODAL
         ======================================================== */}
      {selectedTxn && (
        <Modal
          transparent
          visible={!!selectedTxn}
          animationType="fade"
          onRequestClose={() => setSelectedTxn(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedTxn(null)}
          >
            <TouchableOpacity
              style={styles.modalCard}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Receipt Header */}
              <View style={styles.modalHeader}>
                <View
                  style={[
                    styles.modalIconCircle,
                    {
                      backgroundColor:
                        selectedTxn.transactionType === 'TOP_UP'
                          ? '#ECFDF5'
                          : selectedTxn.transactionType === 'BOOKING_REFUND'
                          ? '#EFF6FF'
                          : '#FFFBEB',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedTxn.transactionType === 'TOP_UP'
                        ? 'arrow-down-left'
                        : selectedTxn.transactionType === 'BOOKING_REFUND'
                        ? 'refresh'
                        : 'ticket-confirmation-outline'
                    }
                    size={28}
                    color={
                      selectedTxn.transactionType === 'TOP_UP'
                        ? '#059669'
                        : selectedTxn.transactionType === 'BOOKING_REFUND'
                        ? '#2563EB'
                        : '#D97706'
                    }
                  />
                </View>

                <Text style={styles.modalAmount}>
                  {selectedTxn.transactionType === 'TOP_UP' ||
                  selectedTxn.transactionType === 'BOOKING_REFUND'
                    ? '+'
                    : '-'}
                  {(
                    selectedTxn.amount ??
                    Math.abs(selectedTxn.balanceAfter - selectedTxn.balanceBefore)
                  ).toLocaleString('vi-VN')}
                  đ
                </Text>
                <Text style={styles.modalStatus}>Giao dịch thành công</Text>
              </View>

              {/* Receipt Details Table */}
              <View style={styles.modalDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nội dung</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {selectedTxn.description || 'Giao dịch ví'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Thời gian</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedTxn.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Số dư trước</Text>
                  <Text style={styles.detailValue}>
                    {selectedTxn.balanceBefore.toLocaleString('vi-VN')}đ
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Số dư sau</Text>
                  <Text style={[styles.detailValue, { color: '#059669', fontWeight: '800' }]}>
                    {selectedTxn.balanceAfter.toLocaleString('vi-VN')}đ
                  </Text>
                </View>

                {selectedTxn.referenceId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mã tham chiếu</Text>
                    <Text style={[styles.detailValue, { fontSize: 12, color: '#64748B' }]}>
                      {selectedTxn.referenceId}
                    </Text>
                  </View>
                )}
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedTxn(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: SPACING.marginMobile,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  headerSection: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  desc: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  typeBadge: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  timeDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  time: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  modalStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  modalDetails: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
  },
  modalCloseBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#064E3B',
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

