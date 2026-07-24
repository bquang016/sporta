import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserTicket } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface TicketQrModalProps {
  visible: boolean;
  ticket: UserTicket | null;
  onClose: () => void;
}

export function TicketQrModal({ visible, ticket, onClose }: TicketQrModalProps) {
  if (!ticket) return null;

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

  // QR server API to render high res QR code image
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(ticket.qrCodeToken || ticket.ticketId)}`;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.cardContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <MaterialIcons name="confirmation-number" size={24} color={COLORS.primary} />
                  <Text style={styles.headerTitle}>Vé Điện Tử Xé Vé</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <MaterialIcons name="close" size={22} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Badge */}
                <View style={[
                  styles.statusBadge,
                  isUnused && styles.statusBadgeUnused,
                  isUsed && styles.statusBadgeUsed,
                  isRefunded && styles.statusBadgeRefunded,
                ]}>
                  <MaterialIcons 
                    name={isUnused ? "qr-code-scanner" : isUsed ? "check-circle" : "cancel"} 
                    size={16} 
                    color={isUnused ? COLORS.primary : isUsed ? COLORS.outline : COLORS.error} 
                  />
                  <Text style={[
                    styles.statusBadgeText,
                    isUnused && styles.statusBadgeTextUnused,
                    isUsed && styles.statusBadgeTextUsed,
                    isRefunded && styles.statusBadgeTextRefunded,
                  ]}>
                    {getStatusLabel()}
                  </Text>
                </View>

                {/* QR Code Container */}
                <View style={styles.qrWrapper}>
                  <Image source={{ uri: qrImageUrl }} style={styles.qrImage} />
                  
                  {/* Short code manual check-in fallback */}
                  <View style={styles.shortCodeContainer}>
                    <Text style={styles.shortCodeLabel}>Mã check-in thủ công:</Text>
                    <Text style={styles.shortCodeValue}>{ticket.shortCode}</Text>
                  </View>
                </View>

                {/* Ticket Details */}
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="sports-tennis" size={18} color={COLORS.primary} />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Cụm sân / Sân chơi</Text>
                      <Text style={styles.detailValue}>{ticket.venueName}</Text>
                      <Text style={styles.detailSub}>{ticket.courtName} {ticket.quantity && ticket.quantity > 1 ? `• (${ticket.quantity} slot vé)` : ''}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Địa chỉ sân</Text>
                      <Text style={styles.detailValue}>{ticket.venueAddress || 'Tại cụm sân'}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Giờ chơi & Ngày</Text>
                      <Text style={styles.detailValue}>
                        {ticket.startTime} - {ticket.endTime}
                      </Text>
                      <Text style={styles.detailSub}>{formatDate(ticket.playDate)}</Text>
                    </View>
                  </View>
                </View>

                {/* Notice instructions */}
                <View style={styles.noticeBox}>
                  <MaterialIcons name="info-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.noticeText}>
                    Đưa mã QR hoặc nhập mã ShortCode cho lễ tân/chủ sân để quét check-in vào cổng.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 16,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
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
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
    fontSize: 12,
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
  qrWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    width: '100%',
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.md,
  },
  shortCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
  },
  shortCodeLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  shortCodeValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 15,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  detailTextCol: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
  },
  detailValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 13,
  },
  detailSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryOpacity06,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  noticeText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontSize: 11,
    flex: 1,
  },
});
