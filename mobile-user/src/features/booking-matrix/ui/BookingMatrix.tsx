import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import type { VenueDetail, SlotInfo } from '../../../entities/facility/model/facility.types';

const SLOT_WIDTH = 50;
const SLOT_HEIGHT = 50;
const HEADER_HEIGHT = 44;
const FROZEN_COL_WIDTH = 100;

export interface BookingMatrixProps {
  venue: VenueDetail;
  slots: SlotInfo[];
  selectedDate: Date;
  selectedSlotKeys: Set<string>;
  onToggleSlot: (slot: SlotInfo) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenCalendar: () => void;
}

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

export function BookingMatrix({
  venue,
  slots,
  selectedDate,
  selectedSlotKeys,
  onToggleSlot,
  onPrevDay,
  onNextDay,
  onOpenCalendar,
}: BookingMatrixProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setHasScrolled(false);
  }, [selectedDate]);

  const courtIds = useMemo(() => {
    return venue.courts.map(c => c.id);
  }, [venue]);

  const times = useMemo(() => {
    if (!slots.length) return [];
    const firstCourtId = courtIds[0];
    if (!firstCourtId) return [];
    return slots
      .filter(s => s.courtId === firstCourtId)
      .map(s => s.time)
      .sort();
  }, [slots, courtIds]);

  const slotMap = useMemo(() => {
    const map = new Map<string, SlotInfo>();
    slots.forEach(s => map.set(`${s.courtId}|${s.time}`, s));
    return map;
  }, [slots]);

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

  useEffect(() => {
    if (times.length > 0 && redLinePosition !== null && scrollViewRef.current && !hasScrolled) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, redLinePosition - SLOT_WIDTH * 1.5),
          animated: true,
        });
        setHasScrolled(true);
      }, 500);
    }
  }, [times.length, redLinePosition, hasScrolled]);

  const renderLegendItem = (color: string, label: string) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendBox, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );

  return (
    <View>
      {/* Date selector */}
      <View style={styles.dateSelectorWrapper}>
        <TouchableOpacity
          onPress={onPrevDay}
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
          onPress={onOpenCalendar}
          activeOpacity={0.7}
        >
          <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
          <Text style={styles.dateText}>{formatFullDate(selectedDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNextDay} style={styles.dateArrowBtn}>
          <MaterialIcons name="chevron-right" size={28} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Legends */}
      <View style={styles.legendRow}>
        {renderLegendItem(COLORS.surface, 'Trống')}
        {renderLegendItem(COLORS.error, 'Đã đặt')}
        {renderLegendItem(COLORS.surfaceVariant, 'Khoá')}
        {renderLegendItem(COLORS.secondary, 'Đang chọn')}
        {renderLegendItem(COLORS.sportTeal, 'Xé vé')}
        {renderLegendItem('#F59E0B', 'Giữ chỗ')}
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
                    const isHold = status === 'MATCHMAKING_HOLD';
                    const isMatchmaking = status === 'matchmaking' || isOwnerSplit || Boolean(slot?.ticketSessionId);

                    let bgColor = COLORS.surface;
                    if (isSelected) bgColor = COLORS.secondary;
                    else if (isHold) bgColor = '#F59E0B';
                    else if (isMatchmaking) bgColor = COLORS.sportTeal;
                    else if (status === 'booked') bgColor = COLORS.error;
                    else if (status === 'locked') bgColor = COLORS.surfaceVariant;

                    return (
                      <TouchableOpacity
                        key={`${court.id}-${time}`}
                        style={[
                          styles.slotCell,
                          { backgroundColor: bgColor },
                          (isMatchmaking || isHold) && styles.matchmakingSlot,
                        ]}
                        onPress={() => slot && onToggleSlot(slot)}
                        activeOpacity={0.7}
                      >
                        {isHold ? (
                          <MaterialIcons name="timer" size={16} color="#FFFFFF" />
                        ) : isMatchmaking ? (
                          <MaterialIcons name="confirmation-number" size={16} color="#FFFFFF" />
                        ) : null}
                      </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  dateSelectorWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, paddingHorizontal: SPACING.sm },
  dateArrowBtn: { padding: SPACING.xs },
  dateSelectorCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, backgroundColor: COLORS.surfaceContainerLow, borderRadius: BORDER_RADIUS.full },
  dateText: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },

  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.base, gap: SPACING.md, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendBox: { width: 16, height: 16, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.outlineVariant },
  legendText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },

  emptyGrid: { padding: SPACING.xl, alignItems: 'center' },
  stateText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant, marginTop: SPACING.md, textAlign: 'center' },

  gridOuterContainer: {
    flexDirection: 'row', borderWidth: 1, borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginTop: SPACING.md,
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
  matchmakingSlot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  redLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: COLORS.error, zIndex: 10, alignItems: 'center' },
  redLineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, marginTop: HEADER_HEIGHT / 2 - 4 },
});
