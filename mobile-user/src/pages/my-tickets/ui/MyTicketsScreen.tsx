import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserTickets } from '../../../entities/ticket/model/useUserTickets';
import { UserTicket } from '../../../entities/ticket/model/ticket.types';
import { MyTicketCard } from '../../../features/my-tickets/ui/MyTicketCard';
import { TicketQrModal } from '../../../features/my-tickets/ui/TicketQrModal';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export function MyTicketsScreen({ showHeader = true }: { showHeader?: boolean }) {
  const router = useRouter();
  const { tickets, loading, error, refetch } = useUserTickets();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNUSED' | 'USED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const handleCardPress = (ticket: UserTicket) => {
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'UNUSED') return t.status === 'UNUSED';
    if (activeTab === 'USED') return t.status === 'USED' || t.status === 'REFUNDED';
    return true;
  });

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Optional Header when opened standalone */}
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vé Của Tôi</Text>
          <TouchableOpacity onPress={refetch} style={styles.refreshBtn} activeOpacity={0.7}>
            <MaterialIcons name="refresh" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Segment Control */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'ALL' && styles.tabItemActive]}
          onPress={() => setActiveTab('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
            Tất cả ({tickets.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'UNUSED' && styles.tabItemActive]}
          onPress={() => setActiveTab('UNUSED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'UNUSED' && styles.tabTextActive]}>
            Chưa dùng ({tickets.filter((t) => t.status === 'UNUSED').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'USED' && styles.tabItemActive]}
          onPress={() => setActiveTab('USED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'USED' && styles.tabTextActive]}>
            Lịch sử ({tickets.filter((t) => t.status !== 'UNUSED').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {loading && tickets.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải vé của bạn...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="confirmation-number" size={64} color={COLORS.surfaceContainerHigh} />
            <Text style={styles.emptyTitle}>Chưa có vé xé nào</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'ALL'
                ? 'Bạn chưa mua vé xé nào. Hãy tìm các ca xé vé gần bạn và trải nghiệm ngay!'
                : activeTab === 'UNUSED'
                ? 'Bạn không có vé nào đang chờ sử dụng.'
                : 'Bạn chưa có vé nào trong lịch sử đã sử dụng.'}
            </Text>

            <TouchableOpacity 
              style={styles.exploreBtn} 
              onPress={() => router.push('/ticket-sessions' as any)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="search" size={18} color={COLORS.onSecondary} />
              <Text style={styles.exploreBtnText}>Tìm vé xé ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredTickets.map((ticket) => (
              <MyTicketCard
                key={ticket.ticketId}
                ticket={ticket}
                onPress={() => handleCardPress(ticket)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* QR Ticket Detail Modal */}
      <TicketQrModal
        visible={qrModalVisible}
        ticket={selectedTicket}
        onClose={() => setQrModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  refreshBtn: {
    padding: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  tabText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  listContainer: {
    gap: SPACING.xs,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    fontSize: 13,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  exploreBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary,
    fontWeight: '800',
  },
});
