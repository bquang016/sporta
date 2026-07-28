import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
    if (isUsed) return 'Đã sử dụng';
    if (isRefunded) return 'Đã hoàn trả';
    return ticket.status;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.88}
    >
      <View style={styles.headerRow}>
        <View style={styles.venueContainer}>
          <MaterialIcons name="confirmation-number" size={20} color={COLORS.primary} />
          <Text style={styles.venueName} numberOfLines={1}>
            {ticket.venueName}
          </Text>
        </View>

        <View style={[
          styles.statusBadge,
          isUnused && styles.statusBadgeUnused,
          isUsed && styles.statusBadgeUsed,
          isRefunded && styles.statusBadgeRefunded,
        ]}>
          <Text style={[
            styles.statusBadgeText,
            isUnused && styles.statusBadgeTextUnused,
            isUsed && styles.statusBadgeTextUsed,
            isRefunded && styles.statusBadgeTextRefunded,
          ]}>
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
            <MaterialIcons name="access-time" size={14} color={COLORS.onSurfaceVariant} />
            <Text style={styles.timeText}>
              {ticket.startTime} - {ticket.endTime} • {formatDate(ticket.playDate)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.qrBtn} onPress={onPress} activeOpacity={0.8}>
          <MaterialIcons name="qr-code-scanner" size={18} color={COLORS.onSecondary} />
          <Text style={styles.qrBtnText}>Mã QR</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    gap: SPACING.xs,
    flex: 1,
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeUnused: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  statusBadgeUsed: {
    backgroundColor: COLORS.grayOpacity10,
  },
  statusBadgeRefunded: {
    backgroundColor: COLORS.errorOpacity10,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
    fontSize: 10,
  },
  statusBadgeTextUnused: {
    color: COLORS.primary,
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
    marginVertical: SPACING.sm,
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
    fontWeight: '600',
    fontSize: 13,
  },
  quantityBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  quantityBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  qrBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary,
    fontWeight: '800',
    fontSize: 12,
  },
});
