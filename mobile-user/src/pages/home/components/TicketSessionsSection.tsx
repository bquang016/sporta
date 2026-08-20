import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { TicketSession, SportLevel } from '../../../entities/ticket/model/ticket.types';

interface TicketSessionsSectionProps {
  sessions: TicketSession[];
  loading: boolean;
  error?: string | null;
}

function getSportIcon(sport: string | undefined): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    'Bóng đá': 'football-outline',
    'Bóng rổ': 'basketball-outline',
    'Cầu lông': 'tennisball-outline',
    'Pickleball': 'tennisball-outline',
    'Tennis': 'tennisball-outline',
    'Bóng chuyền': 'baseball-outline',
  };
  return (sport && map[sport]) ? map[sport] : 'ticket-outline';
}

function getSportLevelLabel(level: SportLevel): string {
  switch (level) {
    case 'WEAK': return 'Mới chơi';
    case 'WEAK_AVERAGE': return 'Yếu - TB';
    case 'AVERAGE': return 'Trung bình';
    case 'AVERAGE_GOOD': return 'Bán chuyên';
    case 'GOOD': return 'Chuyên nghiệp';
    default: return 'Mọi trình độ';
  }
}

function formatPlayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

interface TicketCardProps {
  session: TicketSession;
  onPress: () => void;
}

function TicketSessionCardItem({ session, onPress }: TicketCardProps) {
  const remainingSlots = session.maxSlots - session.bookedSlots;
  const isFull = remainingSlots <= 0 || session.status === 'FULL';
  const fillPct = Math.min(100, Math.round((session.bookedSlots / session.maxSlots) * 100));

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* ── Top Header of Card: Venue & Sport Tag ── */}
      <View style={styles.cardHeader}>
        {session.coverImage ? (
          <Image source={{ uri: session.coverImage }} style={styles.venueImage} />
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons name={getSportIcon(session.sportName)} size={20} color={COLORS.primary} />
          </View>
        )}

        <View style={styles.venueInfoCol}>
          <View style={styles.tagRow}>
            <View style={styles.levelTag}>
              <Text style={styles.levelTagText}>{getSportLevelLabel(session.sportLevel)}</Text>
            </View>
            <View style={[styles.statusTag, isFull ? styles.statusTagFull : styles.statusTagOpen]}>
              <Text style={[styles.statusTagText, isFull ? styles.statusTagTextFull : styles.statusTagTextOpen]}>
                {isFull ? 'Hết chỗ' : `Còn ${remainingSlots} slot`}
              </Text>
            </View>
          </View>
          <Text style={styles.venueName} numberOfLines={1}>
            {session.venueName}
          </Text>
          <Text style={styles.courtName} numberOfLines={1}>
            Sân: {session.courtName}
          </Text>
        </View>
      </View>

      {/* ── Mid Details: Time, Location ── */}
      <View style={styles.midInfo}>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={COLORS.primary} />
          <Text style={styles.timeText}>
            {session.startTime} - {session.endTime} • {formatPlayDate(session.playDate)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.onSurfaceVariant} />
          <Text style={styles.locationText} numberOfLines={1}>
            {session.venueAddress || session.venueLocation || 'Địa điểm thể thao'}
          </Text>
        </View>
      </View>

      {/* ── Slot Progress Bar ── */}
      <View style={styles.slotSection}>
        <View style={styles.slotTrack}>
          <View
            style={[
              styles.slotFill,
              { width: `${fillPct}%` },
              isFull && styles.slotFillFull,
            ]}
          />
        </View>
        <Text style={styles.slotRatioText}>
          {session.bookedSlots}/{session.maxSlots} người đã tham gia
        </Text>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Bottom Price & CTA ── */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>
            {session.pricePerTicket.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.priceUnit}>/vé</Text>
        </View>

        <TouchableOpacity
          style={[styles.buyBtn, isFull && styles.buyBtnDisabled]}
          onPress={onPress}
          activeOpacity={0.8}
          disabled={isFull}
        >
          <Text style={[styles.buyBtnText, isFull && styles.buyBtnTextDisabled]}>
            {isFull ? 'Hết vé' : 'Xem vé'}
          </Text>
          {!isFull && <Ionicons name="arrow-forward" size={12} color="#003527" />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export function TicketSessionsSection({ sessions, loading, error }: TicketSessionsSectionProps) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <Ionicons name="ticket-outline" size={17} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Sân Chơi Xé Vé</Text>
            <Text style={styles.sectionSub}>Ghé sân chơi lẻ · Tiết kiệm chi phí</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/ticket-sessions')}
          style={styles.seeAllButton}
          activeOpacity={0.75}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Content Body ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} size="small" />
          <Text style={styles.loadingText}>Đang tải danh sách ca xé vé...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="ticket-outline" size={28} color={COLORS.outlineVariant} />
          <Text style={styles.emptyText}>Chưa có ca xé vé nào đang mở</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
          decelerationRate="fast"
        >
          {sessions.slice(0, 8).map((session) => (
            <TicketSessionCardItem
              key={session.id}
              session={session}
              onPress={() => router.push(`/ticket-sessions/${session.id}` as any)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.xs + 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  sectionSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  seeAllText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 11.5,
  },
  scrollList: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  card: {
    width: 245,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md - 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  venueImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfoCol: {
    flex: 1,
    gap: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  levelTag: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  levelTagText: {
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: '800',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusTagOpen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusTagFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statusTagText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  statusTagTextOpen: {
    color: '#059669',
  },
  statusTagTextFull: {
    color: '#EF4444',
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 13.5,
  },
  courtName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  midInfo: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: 8,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: COLORS.onSurface,
    fontSize: 11.5,
    fontWeight: '700',
  },
  locationText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10.5,
    flex: 1,
  },
  slotSection: {
    gap: 4,
  },
  slotTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
  },
  slotFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  slotFillFull: {
    backgroundColor: '#EF4444',
  },
  slotRatioText: {
    color: COLORS.outline,
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  priceValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 15,
  },
  priceUnit: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  buyBtnText: {
    color: '#003527',
    fontSize: 11.5,
    fontWeight: '900',
  },
  buyBtnTextDisabled: {
    color: COLORS.outline,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SPACING.md,
  },
  loadingText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  errorBox: {
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
});
