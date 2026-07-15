import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_WIDTH = 50;
const SLOT_HEIGHT = 50;
const HEADER_HEIGHT = 44;
const FROZEN_COL_WIDTH = 100;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFullDate = (date: Date): string => {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return `${days[date.getDay()]}, ${date.getDate()} Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export function BookingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { facilityId } = useLocalSearchParams<{ facilityId: string }>();

  // ── Date state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // ── Menu state
  const [showMenu, setShowMenu] = useState(false);

  // ── Time state (for red line)
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Selected slots: key = `${courtId}|${time}`
  const [selectedSlotKeys, setSelectedSlotKeys] = useState<Set<string>>(new Set());

  const scrollViewRef = useRef<ScrollView>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // ── Fetch venue detail + schedule
  const { venue, slots, loading, error, refetch } = useVenueDetail(
    facilityId ?? null,
    selectedDate,
  );

  // ── Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Reset selection when date changes
  useEffect(() => {
    setSelectedSlotKeys(new Set());
    setHasScrolled(false);
  }, [selectedDate]);

  const handlePrevDay = () => {
    if (isToday(selectedDate)) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // ── Group slots by courtId for grid rendering
  const courtIds = useMemo(() => {
    if (!venue) return [];
    return venue.courts.map(c => c.id);
  }, [venue]);

  const times = useMemo(() => {
    if (!slots.length) return [];
    // Collect unique times from first court (all courts share same time grid)
    const firstCourtId = courtIds[0];
    if (!firstCourtId) return [];
    return slots
      .filter(s => s.courtId === firstCourtId)
      .map(s => s.time)
      .sort();
  }, [slots, courtIds]);

  // ── Quick lookup: `${courtId}|${time}` → SlotInfo
  const slotMap = useMemo(() => {
    const map = new Map<string, SlotInfo>();
    slots.forEach(s => map.set(`${s.courtId}|${s.time}`, s));
    return map;
  }, [slots]);

  // ── Red line position
  const startHour = useMemo(() => {
    if (!times.length) return 5;
    const [h] = times[0].split(':').map(Number);
    return h;
  }, [times]);

  const redLinePosition = useMemo(() => {
    if (!isToday(selectedDate)) return null;
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    if (nowH < startHour) return null;
    return ((nowH - startHour) * 60 + nowM) * (SLOT_WIDTH / 30);
  }, [currentTime, selectedDate, startHour]);

  // ── Auto-scroll to now
  useEffect(() => {
    if (!loading && times.length > 0 && redLinePosition !== null && scrollViewRef.current && !hasScrolled) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, redLinePosition - SLOT_WIDTH * 1.5),
          animated: true,
        });
        setHasScrolled(true);
      }, 500);
    }
  }, [loading, times.length, redLinePosition, hasScrolled]);

  // ── Toggle slot selection
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

    // Encode selected slots as JSON param
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

  // ── Legend
  const renderLegendItem = (color: string, label: string) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );

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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Calendar Modal */}
      <CalendarPicker
        visible={showCalendar}
        selectedDate={selectedDate}
        minimumDate={new Date()}
        onConfirm={date => {
          setSelectedDate(date);
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

        {/* Date selector */}
        <View style={styles.dateSelectorWrapper}>
          <TouchableOpacity
            onPress={handlePrevDay}
            style={styles.dateArrowBtn}
            disabled={isToday(selectedDate)}
          >
            <MaterialIcons
              name="chevron-left"
              size={28}
              color={isToday(selectedDate) ? COLORS.outlineVariant : COLORS.onSurface}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateSelectorCenter}
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
            <Text style={styles.dateText}>{formatFullDate(selectedDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextDay} style={styles.dateArrowBtn}>
            <MaterialIcons name="chevron-right" size={28} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Legends */}
        <View style={styles.legendRow}>
          {renderLegendItem(COLORS.surface, 'Trống')}
          {renderLegendItem(COLORS.error, 'Đã đặt')}
          {renderLegendItem(COLORS.surfaceVariant, 'Khoá')}
          {renderLegendItem(COLORS.secondary, 'Đang chọn')}
          {renderLegendItem((COLORS as any).purple, 'Xé vé')}
        </View>

        {/* Grid */}
        {times.length === 0 ? (
          <View style={styles.emptyGrid}>
            <Text style={styles.stateText}>Không có khung giờ nào cho ngày này</Text>
          </View>
        ) : (
          <View style={styles.gridOuterContainer}>
            {/* Frozen left column */}
            <View style={styles.frozenColumn}>
              <View style={[styles.headerCell, { height: HEADER_HEIGHT }]}>
                <Text style={styles.cellText}>Giờ</Text>
              </View>
              {venue.courts.map(court => (
                <View key={court.id} style={[styles.courtCell, { backgroundColor: COLORS.surfaceContainerLow }]}>
                  <Text style={styles.courtNameText} numberOfLines={4}>{court.name}</Text>
                </View>
              ))}
            </View>

            {/* Scrollable area */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollableGridContent}
            >
              <View style={styles.scrollableGridWrapper}>
                {/* Time header */}
                <View style={styles.gridRow}>
                  {times.map(time => (
                    <View key={`header-${time}`} style={[styles.timeHeaderCell, { height: HEADER_HEIGHT }]}>
                      <Text style={styles.cellText}>{time}</Text>
                    </View>
                  ))}
                </View>

                {/* Slot rows */}
                {venue.courts.map(court => (
                  <View key={court.id} style={styles.gridRow}>
                    {times.map(time => {
                      const slot = slotMap.get(`${court.id}|${time}`);
                      const isSelected = selectedSlotKeys.has(`${court.id}|${time}`);
                      const status = slot?.status ?? 'locked';
                      const isOwnerSplit = slot?.isOwnerSplit;

                      let bgColor = COLORS.surface;
                      if (isSelected) bgColor = COLORS.secondary;
                      else if (status === 'booked') bgColor = COLORS.error;
                      else if (status === 'locked') bgColor = COLORS.surfaceVariant;
                      else if (isOwnerSplit) bgColor = (COLORS as any).purple;

                      return (
                        <TouchableOpacity
                          key={`${court.id}-${time}`}
                          style={[styles.slotCell, { backgroundColor: bgColor }]}
                          onPress={() => slot && toggleSlot(slot)}
                          activeOpacity={status === 'available' ? 0.7 : 1}
                        />
                      );
                    })}
                  </View>
                ))}

                {/* Red line */}
                {redLinePosition !== null && (
                  <View style={[styles.redLine, { left: redLinePosition }]}>
                    <View style={styles.redLineDot} />
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
        <View style={{ height: SPACING.xl }} />
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  phoneText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },
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

  dateSelectorWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, paddingHorizontal: SPACING.sm },
  dateArrowBtn: { padding: SPACING.xs },
  dateSelectorCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, backgroundColor: COLORS.surfaceContainerLow, borderRadius: BORDER_RADIUS.full },
  dateText: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },

  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.base, gap: SPACING.md, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendBox: { width: 16, height: 16, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.outlineVariant },
  legendText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },

  emptyGrid: { padding: SPACING.xl, alignItems: 'center' },

  gridOuterContainer: {
    flexDirection: 'row', borderWidth: 1, borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default, overflow: 'hidden', marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  frozenColumn: {
    width: FROZEN_COL_WIDTH, borderRightWidth: 1, borderRightColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest, zIndex: 2,
  },
  headerCell: { justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant, backgroundColor: COLORS.surface },
  courtCell: { height: SLOT_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  courtNameText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurface },
  scrollableGridContent: { flexGrow: 1 },
  scrollableGridWrapper: { position: 'relative' },
  gridRow: { flexDirection: 'row' },
  timeHeaderCell: {
    width: SLOT_WIDTH, justifyContent: 'center', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant,
    borderRightWidth: 1, borderRightColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  cellText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurface },
  slotCell: {
    width: SLOT_WIDTH, height: SLOT_HEIGHT,
    borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant,
    borderRightWidth: 1, borderRightColor: COLORS.outlineVariant,
  },
  redLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: COLORS.error, zIndex: 10, alignItems: 'center' },
  redLineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, marginTop: HEADER_HEIGHT / 2 - 4 },

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
