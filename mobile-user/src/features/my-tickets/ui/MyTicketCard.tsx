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
    if (isUnused) return 'Khả dụng';
    if (isUsed) return 'Đã Check-in';
    if (isRefunded) return 'Đã hoàn trả';
    return ticket.status;
  };

  const getSportIcon = (): keyof typeof MaterialIcons.glyphMap => {
    const text = `${ticket.venueName || ''} ${ticket.courtName || ''}`.toLowerCase();
    if (
      text.includes('bóng đá') ||
      text.includes('football') ||
      text.includes('soccer') ||
      text.includes('futsal') ||
      text.includes('sân 7') ||
      text.includes('sân 5') ||
      text.includes('sân 11')
    ) {
      return 'sports-soccer';
    }
    if (text.includes('cầu lông') || text.includes('badminton')) {
      return 'sports-tennis';
    }
    if (text.includes('tennis') || text.includes('quần vợt')) {
      return 'sports-tennis';
    }
    if (text.includes('bóng rổ') || text.includes('basketball')) {
      return 'sports-basketball';
    }
    if (text.includes('bóng chuyền') || text.includes('volleyball')) {
      return 'sports-volleyball';
    }
    if (text.includes('pickleball')) {
      return 'sports-tennis';
    }
    return 'sports-soccer';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayName = days[dateObj.getDay()];
      return `${dayName}, ${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
      {/* ── CARD TOP: VENUE & STATUS ── */}
      <View style={styles.cardHeader}>
        <View style={styles.venueBlock}>
          <View style={styles.iconCircle}>
            <MaterialIcons name={getSportIcon()} size={18} color="#064E3B" />
          </View>
          <View style={styles.venueNameCol}>
            <Text style={styles.venueName} numberOfLines={1}>
              {ticket.venueName}
            </Text>
            <Text style={styles.courtName} numberOfLines={1}>
              Sân: {ticket.courtName} {ticket.quantity && ticket.quantity > 1 ? `• ${ticket.quantity} vé` : ''}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            isUnused && styles.statusBadgeUnused,
            isUsed && styles.statusBadgeUsed,
            isRefunded && styles.statusBadgeRefunded,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isUnused ? '#10B981' : isUsed ? '#94A3B8' : '#EF4444' },
            ]}
          />
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

      {/* ── PERFORATED TICKET NOTCHES ── */}
      <View style={styles.perforatedRow}>
        <View style={[styles.cutoutCircle, styles.cutoutLeft]} />
        <View style={styles.dashedDivider} />
        <View style={[styles.cutoutCircle, styles.cutoutRight]} />
      </View>

      {/* ── CARD MIDDLE: TIME & ADDRESS ── */}
      <View style={styles.cardBody}>
        {/* Match Time & Date */}
        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={16} color="#D97706" />
          <Text style={styles.infoTimeText}>
            {ticket.startTime} - {ticket.endTime} • <Text style={styles.infoDateSpan}>{formatDate(ticket.playDate)}</Text>
          </Text>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#64748B" />
          <Text style={styles.infoAddressText} numberOfLines={1}>
            {ticket.venueAddress || ticket.venueName}
          </Text>
        </View>
      </View>

      {/* ── CARD FOOTER: SHORTCODE & QR BUTTON ── */}
      <View style={styles.cardFooter}>
        <View style={styles.shortCodePill}>
          <Text style={styles.shortCodeLabel}>Mã vé:</Text>
          <Text style={styles.shortCodeText}>#{ticket.shortCode}</Text>
        </View>

        <TouchableOpacity style={styles.qrActionBtn} onPress={onPress} activeOpacity={0.82}>
          <MaterialIcons name="qr-code" size={16} color="#FFFFFF" />
          <Text style={styles.qrActionBtnText}>Mã QR Nhận Sân</Text>
          <MaterialIcons name="chevron-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#002B1F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },

  /* ── Header ── */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  venueBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueNameCol: {
    flex: 1,
    gap: 1,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  courtName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  statusBadgeUnused: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeUsed: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeRefunded: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextUnused: {
    color: '#064E3B',
  },
  statusBadgeTextUsed: {
    color: '#64748B',
  },
  statusBadgeTextRefunded: {
    color: '#DC2626',
  },

  /* ── Perforated Notches ── */
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 14,
    position: 'relative',
  },
  cutoutCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cutoutLeft: {
    left: -8,
  },
  cutoutRight: {
    right: -8,
  },
  dashedDivider: {
    flex: 1,
    marginHorizontal: 14,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },

  /* ── Body ── */
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoDateSpan: {
    color: '#059669',
    fontWeight: '700',
  },
  infoAddressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
  },

  /* ── Footer ── */
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  shortCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shortCodeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  shortCodeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  qrActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#064E3B',
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: 12,
  },
  qrActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MyTicketCard;
