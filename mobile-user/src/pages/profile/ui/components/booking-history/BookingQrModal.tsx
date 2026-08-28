import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';
import { BookingItem } from '../../../../../shared/api/bookings';

interface BookingQrModalProps {
  visible: boolean;
  booking: BookingItem | null;
  onClose: () => void;
}

export function BookingQrModal({ visible, booking, onClose }: BookingQrModalProps) {
  if (!booking) return null;

  const detail = booking.details?.[0];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.qrContainer}>
          <View style={styles.qrCard}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialIcons name="close" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <Text style={styles.qrTitle}>Mã QR Check-in Đối Soát</Text>
            <Text style={styles.qrSubtitle}>Đưa mã này cho chủ sân khi tới nhận sân</Text>

            <View style={styles.qrFrame}>
              <Image 
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.bookingCode}` }} 
                style={styles.qrImage}
              />
            </View>

            <Text style={styles.bookingCodeText}>{booking.bookingCode}</Text>
            
            <View style={styles.infoBox}>
              <Text style={styles.venueNameText}>{booking.venueName}</Text>
              <Text style={styles.courtDetailText}>{detail?.courtName || booking.courtName}</Text>
              <Text style={styles.timeText}>
                ⏰ {detail?.startTime} - {detail?.endTime} • Ngày {detail?.bookingDate}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.marginMobile,
  },
  qrContainer: {
    width: '100%',
    maxWidth: 340,
  },
  qrCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  qrSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  qrFrame: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.xs,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  bookingCodeText: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  infoBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
  },
  venueNameText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  courtDetailText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  timeText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
