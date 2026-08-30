import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { UserTicket } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface TicketQrModalProps {
  visible: boolean;
  ticket: UserTicket | null;
  onClose: () => void;
}

export function TicketQrModal({ visible, ticket, onClose }: TicketQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const isUnused = ticket.status === 'UNUSED';
  const isUsed = ticket.status === 'USED';
  const isRefunded = ticket.status === 'REFUNDED';

  const getStatusLabel = () => {
    if (isUnused) return 'CHƯA SỬ DỤNG';
    if (isUsed) return 'ĐÃ CHECK-IN';
    if (isRefunded) return 'ĐÃ HOÀN TRẢ';
    return ticket.status;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[dateObj.getDay()];
      return `${dayName}, ${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const handleCopyShortCode = async () => {
    if (!ticket.shortCode) return;
    await Clipboard.setStringAsync(ticket.shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(ticket.venueAddress || ticket.venueName);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  // QR server API to render high res QR code image
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    ticket.qrCodeToken || ticket.ticketId
  )}`;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.cardContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.headerIconWrap}>
                    <Ionicons name="ticket" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.headerTitle}>Vé Thể Thao Điện Tử</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={22} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* ── Status Badge ── */}
                <View
                  style={[
                    styles.statusBadge,
                    isUnused && styles.statusBadgeUnused,
                    isUsed && styles.statusBadgeUsed,
                    isRefunded && styles.statusBadgeRefunded,
                  ]}
                >
                  <Ionicons
                    name={isUnused ? 'qr-code-outline' : isUsed ? 'checkmark-circle' : 'close-circle'}
                    size={15}
                    color={isUnused ? '#059669' : isUsed ? COLORS.outline : COLORS.error}
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

                {/* ── QR Ticket Frame (Ticket Stub) ── */}
                <View style={styles.ticketStubWrapper}>
                  {/* QR Image */}
                  <View style={styles.qrImageContainer}>
                    <Image
                      source={{ uri: qrImageUrl }}
                      style={[styles.qrImage, isUsed && { opacity: 0.25 }]}
                      resizeMode="contain"
                    />

                    {/* Stamp Overlay if USED */}
                    {isUsed && (
                      <View style={styles.usedStampOverlay}>
                        <View style={styles.usedStampCircle}>
                          <Ionicons name="checkmark-done-circle" size={44} color="#059669" />
                          <Text style={styles.usedStampText}>ĐÃ CHECK-IN</Text>
                          <Text style={styles.usedStampSub}>HỢP LỆ</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Perforated Divider Line */}
                  <View style={styles.notchDividerRow}>
                    <View style={[styles.notch, styles.notchLeft]} />
                    <View style={styles.dashedLine} />
                    <View style={[styles.notch, styles.notchRight]} />
                  </View>

                  {/* ShortCode Box with Quick Copy */}
                  <View style={styles.shortCodeContainer}>
                    <View style={styles.shortCodeTextGroup}>
                      <Text style={styles.shortCodeLabel}>MÃ CHECK-IN THỦ CÔNG</Text>
                      <Text style={styles.shortCodeValue}>{ticket.shortCode}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.copyBtn, copied && styles.copyBtnActive]}
                      onPress={handleCopyShortCode}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={copied ? 'checkmark' : 'copy-outline'}
                        size={14}
                        color={copied ? '#059669' : COLORS.primary}
                      />
                      <Text style={[styles.copyBtnText, copied && styles.copyBtnTextActive]}>
                        {copied ? 'Đã chép' : 'Sao chép'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── Ticket Detail Breakdown ── */}
                <View style={styles.detailsCard}>
                  {/* Venue & Court */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                      <Ionicons name="football-outline" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Cụm sân & Sân thi đấu</Text>
                      <Text style={styles.detailValueBold}>{ticket.venueName}</Text>
                      <View style={styles.courtBadgeTag}>
                        <Text style={styles.courtBadgeTagText}>
                          {ticket.courtName} {ticket.quantity && ticket.quantity > 1 ? `(${ticket.quantity} suất vé)` : ''}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Address */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                      <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Địa chỉ sân</Text>
                      <Text style={styles.detailAddressText}>
                        {ticket.venueAddress || 'Tại cơ sở sân thể thao'}
                      </Text>
                      <TouchableOpacity style={styles.mapsLinkBtn} onPress={openGoogleMaps} activeOpacity={0.8}>
                        <Ionicons name="navigate-outline" size={13} color={COLORS.primary} />
                        <Text style={styles.mapsLinkText}>Mở bản đồ Google Maps</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Date & Time Slot */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconBox}>
                      <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                    </View>
                    <View style={styles.detailTextCol}>
                      <Text style={styles.detailLabel}>Khung giờ & Ngày chơi</Text>
                      <Text style={styles.detailValueBold}>
                        {ticket.startTime} - {ticket.endTime}
                      </Text>
                      <Text style={styles.detailDateText}>{formatDate(ticket.playDate)}</Text>
                    </View>
                  </View>
                </View>

                {/* ── Check-in Instruction Notice ── */}
                <View style={styles.noticeBox}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.noticeText}>
                    Vui lòng đưa mã QR này hoặc đọc mã ShortCode cho chủ sân/quản lý để quét check-in trước giờ thi đấu.
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
    alignItems: 'center',
    gap: 12,
  },

  /* Status Badge */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
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
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
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

  /* Ticket Stub */
  ticketStubWrapper: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qrImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    position: 'relative',
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.md,
  },
  usedStampOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usedStampCircle: {
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    transform: [{ rotate: '-10deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usedStampText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 1,
    marginTop: 2,
  },
  usedStampSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },

  /* Notch Divider */
  notchDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    position: 'relative',
  },
  notch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  notchLeft: {
    left: -10,
  },
  notchRight: {
    right: -10,
  },
  dashedLine: {
    flex: 1,
    marginHorizontal: 18,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    borderStyle: 'dashed',
  },

  /* ShortCode Box */
  shortCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  shortCodeTextGroup: {
    gap: 2,
  },
  shortCodeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.6,
  },
  shortCodeValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  copyBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  copyBtnTextActive: {
    color: '#059669',
  },

  /* Details Card */
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  detailTextCol: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  detailValueBold: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSurface,
  },
  courtBadgeTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 2,
  },
  courtBadgeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailAddressText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
  mapsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mapsLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  detailDateText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  /* Notice */
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryOpacity08,
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },
  noticeText: {
    fontSize: 11.5,
    color: COLORS.primary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
});
