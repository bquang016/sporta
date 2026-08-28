import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTicketSessions } from '../../../entities/ticket/model/useTicketSessions';
import { TicketSessionCard } from '../../../features/ticket-sessions/ui/TicketSessionCard';
import { TicketFilterModal } from '../../../features/ticket-sessions/ui/TicketFilterModal';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export function TicketSessionsScreen() {
  const router = useRouter();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    sessions,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useTicketSessions();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleSearchSubmit = () => {
    updateFilters({ keyword: searchQuery });
  };

  const handleSessionPress = (sessionId: string) => {
    router.push(`/ticket-sessions/${sessionId}` as any);
  };

  const handleBuyPress = (sessionId: string) => {
    router.push(`/ticket-payment/${sessionId}` as any);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  const hasActiveFilters = Boolean(filters.radiusKm || (filters.timeSlot && filters.timeSlot !== 'ALL') || (filters.sportLevel && filters.sportLevel !== 'ALL'));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh Sách Xé Vé</Text>
        <TouchableOpacity 
          onPress={() => setFilterModalVisible(true)} 
          style={[styles.filterIconBtn, hasActiveFilters && styles.filterIconBtnActive]}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="tune" 
            size={20} 
            color={hasActiveFilters ? COLORS.white : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar & Filter Strip */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên sân, khu vực..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); updateFilters({ keyword: undefined }); }}>
              <MaterialIcons name="cancel" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity 
          style={[styles.filterChipBtn, hasActiveFilters && styles.filterChipBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="filter-list" size={18} color={hasActiveFilters ? COLORS.white : COLORS.primary} />
          <Text style={[styles.filterChipText, hasActiveFilters && styles.filterChipTextActive]}>
            Lọc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {loading && sessions.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách ca xé vé...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="confirmation-number" size={64} color={COLORS.surfaceContainerHigh} />
            <Text style={styles.emptyTitle}>Chưa có ca xé vé nào</Text>
            <Text style={styles.emptySub}>
              {hasActiveFilters ? 'Không tìm thấy ca xé vé phù hợp bộ lọc của bạn. Hãy thử thay đổi tiêu chí.' : 'Hiện tại các cụm sân chưa mở lượt xé vé mới. Vui lòng quay lại sau.'}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.resetFilterBtn} onPress={() => { resetFilters(); setSearchQuery(''); }}>
                <Text style={styles.resetFilterText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.resultCountText}>
              Tìm thấy <Text style={styles.resultCountBold}>{sessions.length}</Text> ca xé vé đang mở
            </Text>

            {sessions.map((session) => (
              <TicketSessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session.id)}
                onBuyPress={() => handleBuyPress(session.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <TicketFilterModal
        visible={filterModalVisible}
        filters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApply={(newFilters) => updateFilters(newFilters)}
        onReset={resetFilters}
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
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconBtnActive: {
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    height: 42,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  filterChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
  },
  filterChipBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  listContainer: {
    gap: SPACING.xs,
  },
  resultCountText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  resultCountBold: {
    color: COLORS.primary,
    fontWeight: '700',
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
  resetFilterBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  resetFilterText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary,
    fontWeight: '800',
  },
});
