import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { CalendarPicker } from '../../../shared/ui/CalendarPicker';
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
  const handleContinue = () => {
    if (!venue || selectedSlotList.length === 0) return;

    const slotsParam = encodeURIComponent(JSON.stringify(selectedSlotList));
    router.push({
      pathname: '/booking/payment' as any,
      params: {
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location,
        venuePhone: venue.ownerPhone ?? '',
        bookingDate: selectedDate.toISOString().split('T')[0],
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

      <ScrollView style={styles.content} bounces={false}>
        {/* Venue Info */}
        <Card style={styles.venueCard} padding="md">
          <View style={styles.venueCardContent}>
            <View style={styles.venueInfoContent}>
              <Text style={styles.venueName} numberOfLines={2}>{venue.name}</Text>
              {venue.ownerPhone ? (
                <View style={styles.venuePhoneRow}>
                  <MaterialIcons name="phone" size={16} color={COLORS.secondary} />
                  <Text style={styles.venuePhoneText}>{venue.ownerPhone}</Text>
                </View>
              ) : null}
              {venue.location ? (
                <View style={styles.venueLocationRow}>
                  <MaterialIcons name="location-on" size={16} color={COLORS.secondary} />
                  <Text style={styles.venueLocationText} numberOfLines={2}>{venue.location}</Text>
                </View>
              ) : null}
            </View>
            {venue.coverImage ? (
              <Image source={{ uri: venue.coverImage }} style={styles.venueImage} />
            ) : (
              <View style={[styles.venueImage, styles.venueImagePlaceholder]}>
                <MaterialIcons name="image" size={32} color={COLORS.whiteOpacity70} />
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

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
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
        />
      </View>
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
  venueCard: { marginBottom: SPACING.md, backgroundColor: COLORS.primary, borderWidth: 0 },
  venueCardContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  venueInfoContent: { flex: 1, gap: SPACING.xs },
  venueName: { ...TYPOGRAPHY.headlineMd, color: COLORS.secondary },
  venuePhoneRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  venuePhoneText: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary },
  venueLocationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs },
  venueLocationText: { ...TYPOGRAPHY.labelSm, color: COLORS.onPrimary, flex: 1, marginTop: 2, opacity: 0.9 },
  venueImage: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primaryOpacity15 },
  venueImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.outlineVariant,
  },
  priceContainer: { flex: 1 },
  selectedCountText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },
  totalPriceText: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },

  modalOverlay: { flex: 1, backgroundColor: COLORS.blackOpacity15 },
  menuDropdown: {
    position: 'absolute', right: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.default,
    minWidth: 160, paddingVertical: SPACING.xs,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  menuItemText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface },
  menuDivider: { height: 1, backgroundColor: COLORS.outlineVariant, marginHorizontal: SPACING.sm, marginVertical: SPACING.xs },
});
