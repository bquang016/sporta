import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserTicket } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface MyTicketCardProps {
  ticket: UserTicket;
  onPress: () => void;
}

export function MyTicketCard({ ticket, onPress }: MyTicketCardProps) {
  const isUnused = ticket.status === 'UNUSED';
  const isUsed = ticket.status === 'USED';
  const isRefunded = ticket.status === 'REFUNDED';

  const getStatusLabel = () => {
    if (isUnused) return 'Chưa sử dụng';
    if (isUsed) return 'Đã check-in';
    if (isRefunded) return 'Đã hoàn trả';
    return ticket.status;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.headerRow}>
        <View style={styles.venueContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="ticket" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.venueName} numberOfLines={1}>
            {ticket.venueName}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isUnused && styles.statusBadgeUnused,
            isUsed && styles.statusBadgeUsed,
            isRefunded && styles.statusBadgeRefunded,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              isUnused && styles.statusBadgeTextUnused,
              isUsed && styles.statusBadgeTextUsed,
              isRefunded && styles.statusBadgeTextRefunded,
            ]}
          >
            {getStatusLabel()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <View style={styles.courtRow}>
            <Text style={styles.courtName}>Sân: {ticket.courtName}</Text>
            {ticket.quantity && ticket.quantity > 1 ? (
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityBadgeText}>{ticket.quantity} vé (slot)</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.onSurfaceVariant} />
            <Text style={styles.timeText}>
              {ticket.startTime} - {ticket.endTime} • {formatDate(ticket.playDate)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.qrBtn} onPress={onPress} activeOpacity={0.8}>
          <Ionicons name="qr-code-outline" size={16} color={COLORS.onSecondary} />
          <Text style={styles.qrBtnText}>Mã QR</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeUnused: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusBadgeUsed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  statusBadgeRefunded: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusBadgeTextUnused: {
    color: '#059669',
  },
  statusBadgeTextUsed: {
    color: COLORS.outline,
  },
  statusBadgeTextRefunded: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    gap: 4,
    flex: 1,
  },
  courtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  courtName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 13,
  },
  quantityBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  quantityBadgeText: {
    fontSize: 10.5,
    color: COLORS.primary,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  qrBtnText: {
    color: COLORS.onSecondary,
    fontWeight: '900',
    fontSize: 12,
  },
});
