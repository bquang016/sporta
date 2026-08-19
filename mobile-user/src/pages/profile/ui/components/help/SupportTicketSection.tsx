import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';
import { Button } from '../../../../../shared/ui';

export interface TicketItem {
  id: string;
  code: string;
  type: string;
  bookingCode?: string;
  title: string;
  description: string;
  imageUri?: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  response?: string;
}

interface SupportTicketSectionProps {
  tickets: TicketItem[];
  onOpenCreateTicketModal: () => void;
}

export function SupportTicketSection({ tickets, onOpenCreateTicketModal }: SupportTicketSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Danh Sách Yêu Cầu Hỗ Trợ (Tickets)</Text>
        <TouchableOpacity style={styles.createBtn} onPress={onOpenCreateTicketModal}>
          <MaterialIcons name="add" size={18} color={COLORS.white} />
          <Text style={styles.createBtnText}>Tạo Ticket</Text>
        </TouchableOpacity>
      </View>

      {tickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="confirmation-number" size={48} color={COLORS.outline} />
          <Text style={styles.emptyTitle}>Bạn chưa gửi yêu cầu hỗ trợ nào</Text>
          <Text style={styles.emptySub}>Gửi ticket để được phản hồi chính thức từ ban quản trị Sporta.</Text>
          <Button 
            title="Gửi yêu cầu hỗ trợ ngay"
            variant="primary"
            style={{ marginTop: SPACING.md }}
            onPress={onOpenCreateTicketModal}
          />
        </View>
      ) : (
        tickets.map((t) => {
          const isResponded = t.status === 'responded';
          const isClosed = t.status === 'closed';

          return (
            <View key={t.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View style={styles.ticketCodeRow}>
                  <Text style={styles.ticketCode}>{t.code}</Text>
                  <View style={[
                    styles.statusBadge,
                    isResponded && styles.statusBadgeResponded,
                    isClosed && styles.statusBadgeClosed
                  ]}>
                    <Text style={[
                      styles.statusText,
                      isResponded && styles.statusTextResponded,
                      isClosed && styles.statusTextClosed
                    ]}>
                      {isResponded ? 'Đã phản hồi' : isClosed ? 'Đã đóng' : 'Đang xử lý'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketTime}>{t.createdAt}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.ticketTitle}>{t.title}</Text>
              <Text style={styles.ticketDesc}>{t.description}</Text>

              {t.imageUri && (
                <Image source={{ uri: t.imageUri }} style={styles.ticketImg} />
              )}

              {t.response && (
                <View style={styles.responseBox}>
                  <View style={styles.responseTitleRow}>
                    <MaterialIcons name="support-agent" size={16} color={COLORS.primary} />
                    <Text style={styles.responseTitle}>Phản hồi từ CSKH Sporta:</Text>
                  </View>
                  <Text style={styles.responseText}>{t.response}</Text>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 4,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 2,
  },
  createBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: SPACING.sm,
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ticketCode: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgeResponded: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  statusBadgeClosed: {
    backgroundColor: COLORS.outlineVariant,
  },
  statusText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
  },
  statusTextResponded: {
    color: COLORS.primary,
  },
  statusTextClosed: {
    color: COLORS.onSurfaceVariant,
  },
  ticketTime: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs,
  },
  ticketTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  ticketDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  ticketImg: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs + 2,
  },
  responseBox: {
    backgroundColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  responseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  responseText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
    marginTop: 4,
    lineHeight: 18,
  },
});
