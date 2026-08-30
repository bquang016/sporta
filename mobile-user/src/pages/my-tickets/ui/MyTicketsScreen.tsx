import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const unusedCount = useMemo(() => tickets.filter((t) => t.status === 'UNUSED').length, [tickets]);
  const usedCount = useMemo(() => tickets.filter((t) => t.status !== 'UNUSED').length, [tickets]);
  const totalCount = tickets.length;

  const handleCardPress = (ticket: UserTicket) => {
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Tab filter
      if (activeTab === 'UNUSED' && t.status !== 'UNUSED') return false;
      if (activeTab === 'USED' && t.status === 'UNUSED') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const venueMatch = t.venueName?.toLowerCase().includes(q);
        const courtMatch = t.courtName?.toLowerCase().includes(q);
        const codeMatch = t.shortCode?.toLowerCase().includes(q);
        const orderMatch = String(t.orderCode || '').toLowerCase().includes(q);
        if (!venueMatch && !courtMatch && !codeMatch && !orderMatch) return false;
      }

      return true;
    });
  }, [tickets, activeTab, searchQuery]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile' as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── 1. CLEAN APP HEADER (Matching Profile Screen) ── */}
      {showHeader && (
        <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back-ios" size={19} color={COLORS.onSurface} />
            </TouchableOpacity>

            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>Vé Của Tôi</Text>
            </View>

            <TouchableOpacity onPress={refetch} style={styles.refreshBtn} activeOpacity={0.7}>
              <MaterialIcons name="refresh" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* ── 2. QUICK STATS DASHBOARD STRIP ── */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[styles.statCard, activeTab === 'UNUSED' && styles.statCardActive]}
          onPress={() => setActiveTab('UNUSED')}
          activeOpacity={0.8}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <MaterialIcons name="confirmation-number" size={16} color="#059669" />
          </View>
          <View style={styles.statTextCol}>
            <Text style={styles.statNum}>{unusedCount}</Text>
            <Text style={styles.statLabel}>Khả dụng</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, activeTab === 'USED' && styles.statCardActive]}
          onPress={() => setActiveTab('USED')}
          activeOpacity={0.8}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#F1F5F9' }]}>
            <MaterialIcons name="task-alt" size={16} color="#64748B" />
          </View>
          <View style={styles.statTextCol}>
            <Text style={styles.statNum}>{usedCount}</Text>
            <Text style={styles.statLabel}>Đã chơi</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, activeTab === 'ALL' && styles.statCardActive]}
          onPress={() => setActiveTab('ALL')}
          activeOpacity={0.8}
        >
          <View style={[styles.statIconCircle, { backgroundColor: '#FFFBEB' }]}>
            <MaterialIcons name="receipt-long" size={16} color="#D97706" />
          </View>
          <View style={styles.statTextCol}>
            <Text style={styles.statNum}>{totalCount}</Text>
            <Text style={styles.statLabel}>Tổng số vé</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── 3. SEARCH & TAB FILTER CHIPS ── */}
      <View style={styles.filterSection}>
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={19} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên sân, cụm sân, mã vé..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <MaterialIcons name="cancel" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Filter Chips */}
        <View style={styles.tabChipsRow}>
          <TouchableOpacity
            style={[styles.chip, activeTab === 'ALL' && styles.chipActive]}
            onPress={() => setActiveTab('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeTab === 'ALL' && styles.chipTextActive]}>
              Tất cả ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, activeTab === 'UNUSED' && styles.chipActive]}
            onPress={() => setActiveTab('UNUSED')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeTab === 'UNUSED' && styles.chipTextActive]}>
              Chưa dùng ({unusedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, activeTab === 'USED' && styles.chipActive]}
            onPress={() => setActiveTab('USED')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeTab === 'USED' && styles.chipTextActive]}>
              Lịch sử ({usedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 4. MAIN TICKET LIST ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
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
            <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <MaterialIcons name="confirmation-number" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? 'Không tìm thấy vé phù hợp'
                : activeTab === 'UNUSED'
                ? 'Không có vé nào đang chờ sử dụng'
                : activeTab === 'USED'
                ? 'Chưa có vé nào trong lịch sử'
                : 'Bạn chưa có vé xé nào'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery.trim()
                ? `Không có kết quả nào trùng khớp với từ khóa "${searchQuery}".`
                : activeTab === 'UNUSED'
                ? 'Các vé sau khi mua thành công sẽ xuất hiện tại đây để bạn quét mã nhận sân.'
                : 'Tìm kiếm các ca xé vé gần bạn để tham gia giao lưu và thi đấu thể thao.'}
            </Text>

            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/ticket-sessions' as any)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="search" size={18} color="#FFFFFF" />
              <Text style={styles.exploreBtnText}>Tìm Ca Xé Vé Ngay</Text>
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

      {/* ── 5. FLOATING TICKET DETAIL QR MODAL ── */}
      <TicketQrModal
        visible={qrModalVisible}
        ticket={selectedTicket}
        onClose={() => setQrModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* ── Header ── */
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  /* ── Stats Strip ── */
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextCol: {
    gap: 1,
  },
  statNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },

  /* ── Filter & Search Section ── */
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  tabChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#064E3B',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* ── Scroll List ── */
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 14,
  },

  /* ── State Views ── */
  centerContainer: {
    paddingVertical: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryBtn: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 4,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#064E3B',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 8,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default MyTicketsScreen;
