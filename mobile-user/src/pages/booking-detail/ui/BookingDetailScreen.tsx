import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { CalendarPicker } from '../../../shared/ui/CalendarPicker';
import { AuthRequiredModal } from '../../../shared/ui/AuthRequiredModal';
import { loadNativeUserSessionAsync } from '../../../shared/lib/userSession';
import { useVenueDetail } from '../../../entities/facility/model/useVenueDetail';
import type { SlotInfo } from '../../../entities/facility/model/facility.types';
import { BookingMatrix } from '../../../features/booking-matrix';

export function BookingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { facilityId } = useLocalSearchParams<{ facilityId: string }>();

  // ── State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<Set<string>>(new Set());
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [ticketSessionModal, setTicketSessionModal] = useState<{
    visible: boolean;
    courtName: string;
    time: string;
    ticketSessionId?: string;
  }>({ visible: false, courtName: '', time: '' });

  // ── Fetch venue detail + schedule
  const { venue, slots, loading, error, refetch } = useVenueDetail(
    facilityId ?? null,
    selectedDate,
  );

  // ── Reset selection when date changes
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    setSelectedSlotKeys(new Set());
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    handleDateChange(newDate);
  };

  const toggleSlot = (slot: SlotInfo) => {
    if (slot.status === 'matchmaking' || slot.isOwnerSplit || slot.ticketSessionId) {
      setTicketSessionModal({
        visible: true,
        courtName: slot.courtName,
        time: slot.time,
        ticketSessionId: slot.ticketSessionId,
      });
      return;
    }
    if (slot.status !== 'available') return;
    const key = `${slot.courtId}|${slot.time}`;
    setSelectedSlotKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Quick lookup: `${courtId}|${time}` → SlotInfo
  const slotMap = useMemo(() => {
    const map = new Map<string, SlotInfo>();
    slots.forEach(s => map.set(`${s.courtId}|${s.time}`, s));
    return map;
  }, [slots]);

  // ── Compute summary
  const selectedSlotList = useMemo(() => {
    return Array.from(selectedSlotKeys)
      .map(key => slotMap.get(key))
      .filter((s): s is SlotInfo => !!s);
  }, [selectedSlotKeys, slotMap]);

  const totalPrice = useMemo(
    () => selectedSlotList.reduce((sum, s) => sum + s.price, 0),
    [selectedSlotList],
  );

  // ── Navigate to Payment
  const handleContinue = async () => {
    if (!venue || selectedSlotList.length === 0) return;

    const session = await loadNativeUserSessionAsync();
    if (!session.isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }

    const slotsParam = encodeURIComponent(JSON.stringify(selectedSlotList));
    router.push({
      pathname: '/booking/payment' as any,
      params: {
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location,
        venuePhone: venue.ownerPhone ?? '',
        venueImage: venue.coverImage ?? '',
        venueSport: venue.sportName || 'Thể thao',
        bookingDate: (() => {
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
        })(),
        slotsParam,
        totalPrice: String(totalPrice),
      },
    });
  };

  // ── Loading / Error states
  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.stateText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !venue) {
    return (
      <View style={styles.centerState}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.stateText}>{error ?? 'Không tìm thấy sân'}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Calendar Modal */}
      <CalendarPicker
        visible={showCalendar}
        selectedDate={selectedDate}
        minimumDate={new Date()}
        onConfirm={date => {
          handleDateChange(date);
        }}
        onClose={() => setShowCalendar(false)}
      />

      {/* Header */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1}>Đặt sân</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowMenu(true)}
          >
            <MaterialIcons name="more-vert" size={24} color={COLORS.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent={true} animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuDropdown, { top: insets.top + 48 }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); /* handle share */ }}>
              <MaterialIcons name="share" size={20} color={COLORS.onSurface} />
              <Text style={styles.menuItemText}>Chia sẻ sân</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); /* handle report */ }}>
              <MaterialIcons name="report" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Báo cáo sân</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Ticket Session Info Modal */}
      <Modal
        visible={ticketSessionModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTicketSessionModal(prev => ({ ...prev, visible: false }))}
      >
        <TouchableOpacity
          style={styles.modalOverlayCenter}
          activeOpacity={1}
          onPress={() => setTicketSessionModal(prev => ({ ...prev, visible: false }))}
        >
          <View style={styles.tsModalCard}>
            <View style={styles.tsModalHeader}>
              <View style={styles.tsModalIconBox}>
                <MaterialIcons name="confirmation-number" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.tsModalTitle}>Khung giờ Xé Vé</Text>
            </View>

            <Text style={styles.tsModalBody}>
              Khung giờ <Text style={{ fontWeight: '800' }}>{ticketSessionModal.time}</Text> tại <Text style={{ fontWeight: '800' }}>{ticketSessionModal.courtName}</Text> đang diễn ra Lượt trận Xé vé ghép cặp.
              {'\n\n'}
              Bạn không thể đặt trọn sân ở khung giờ này, nhưng có thể tham gia mua vé lẻ!
            </Text>

            <View style={styles.tsModalActions}>
              <TouchableOpacity
                style={styles.tsModalSecondaryBtn}
                onPress={() => setTicketSessionModal(prev => ({ ...prev, visible: false }))}
                activeOpacity={0.7}
              >
                <Text style={styles.tsModalSecondaryText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tsModalPrimaryBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setTicketSessionModal(prev => ({ ...prev, visible: false }));
                  if (ticketSessionModal.ticketSessionId) {
                    router.push(`/ticket-sessions/${ticketSessionModal.ticketSessionId}` as any);
                  } else {
                    router.push('/(tabs)/ticket-sessions' as any);
                  }
                }}
              >
                <Text style={styles.tsModalPrimaryText}>Xem ca xé vé</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} bounces={false}>
        {/* Venue Info */}
        <Card style={styles.venueCard} padding="md">
          <View style={styles.venueCardContent}>
            <View style={styles.venueInfoContent}>
              <Text style={styles.venueName} numberOfLines={2}>{venue.name}</Text>
              {venue.ownerPhone ? (
                <View style={styles.venuePhoneRow}>
                  <MaterialIcons name="phone" size={16} color={COLORS.primary} />
                  <Text style={styles.venuePhoneText}>{venue.ownerPhone}</Text>
                </View>
              ) : null}
              {venue.location ? (
                <View style={styles.venueLocationRow}>
                  <MaterialIcons name="location-on" size={16} color={COLORS.primary} />
                  <Text style={styles.venueLocationText} numberOfLines={2}>{venue.location}</Text>
                </View>
              ) : null}
            </View>
            {venue.coverImage ? (
              <Image source={{ uri: venue.coverImage }} style={styles.venueImage} />
            ) : (
              <View style={[styles.venueImage, styles.venueImagePlaceholder]}>
                <MaterialIcons name="image" size={32} color={COLORS.onSurfaceVariant} />
              </View>
            )}
          </View>
        </Card>

        {/* Feature: Booking Matrix */}
        <BookingMatrix
          venue={venue}
          slots={slots}
          selectedDate={selectedDate}
          selectedSlotKeys={selectedSlotKeys}
          onToggleSlot={toggleSlot}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onOpenCalendar={() => setShowCalendar(true)}
        />
      </ScrollView>

      {/* Floating Bottom bar */}
      <View style={[styles.bottomBarWrapper, { bottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }]}>
        <BlurView intensity={90} tint="light" style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.selectedCountText}>
              Đã chọn: {selectedSlotList.length} khung giờ
            </Text>
            <Text style={styles.totalPriceText}>
              {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <Button
            title="Tiếp tục"
            icon={<MaterialIcons name="arrow-forward" size={20} color={COLORS.onSecondary} />}
            iconPosition="right"
            onPress={handleContinue}
            disabled={selectedSlotList.length === 0}
            style={styles.continueBtn}
          />
        </BlurView>
      </View>

      {/* Auth Required Guard */}
      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        actionTitle="Đăng nhập để đặt sân"
        actionDescription="Vui lòng đăng nhập tài khoản Sporta để tiếp tục đặt lịch sân và hoàn tất đặt chỗ."
        actionIcon="sports-tennis"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  stateText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant, marginTop: SPACING.md, textAlign: 'center' },
  retryBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
  },
  retryText: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary },

  headerWrapper: { backgroundColor: COLORS.primary, borderBottomWidth: 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary },
  iconBtn: { padding: SPACING.xs },

  content: { flex: 1, padding: SPACING.md },
  contentContainer: { paddingBottom: 120 },
  venueCard: { 
    marginBottom: SPACING.md, 
    backgroundColor: COLORS.surface, 
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  venueCardContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  venueInfoContent: { flex: 1, gap: SPACING.xs },
  venueName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  venuePhoneRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  venuePhoneText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  venueLocationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs },
  venueLocationText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant, flex: 1, marginTop: 2 },
  venueImage: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.surfaceVariant },
  venueImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },

  bottomBarWrapper: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  continueBtn: {
    paddingHorizontal: SPACING.lg,
  },
  priceContainer: { flex: 1 },
  selectedCountText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },
  totalPriceText: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },

  modalOverlay: { flex: 1, backgroundColor: COLORS.blackOpacity15 },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  menuDropdown: {
    position: 'absolute', right: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.default,
    minWidth: 160, paddingVertical: SPACING.xs,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  menuItemText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface },
  menuDivider: { height: 1, backgroundColor: COLORS.outlineVariant, marginHorizontal: SPACING.sm, marginVertical: SPACING.xs },

  tsModalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    width: '85%',
    maxWidth: 360,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tsModalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryOpacity12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tsModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  tsModalBody: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  tsModalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
  },
  tsModalSecondaryBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  tsModalSecondaryText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  tsModalPrimaryBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.primary,
  },
  tsModalPrimaryText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
