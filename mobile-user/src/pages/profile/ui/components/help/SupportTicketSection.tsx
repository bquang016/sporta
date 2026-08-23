import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';
import { Button } from '../../../../../shared/ui';
import { SupportTicketItem, SupportTicketStatusType } from '../../../../../shared/api/supportTicketApi';

export interface TicketItem extends SupportTicketItem {}

interface SupportTicketSectionProps {
  tickets: SupportTicketItem[];
  onOpenCreateTicketModal: () => void;
  onConfirmResolved?: (id: string) => void;
  onReopenTicket?: (id: string) => void;
  onCancelTicket?: (id: string) => void;
  onReplyTicket?: (id: string) => void;
}

const getStatusConfig = (status: SupportTicketStatusType) => {
  switch (status) {
    case 'NEW':
      return {
        label: 'Mới tiếp nhận',
        icon: 'fiber-new' as const,
        bg: 'rgba(30, 136, 229, 0.1)',
        color: '#1E88E5',
        border: 'rgba(30, 136, 229, 0.25)',
      };
    case 'IN_PROGRESS':
      return {
        label: 'Đang xử lý',
        icon: 'schedule' as const,
        bg: 'rgba(255, 160, 0, 0.1)',
        color: '#FFA000',
        border: 'rgba(255, 160, 0, 0.25)',
      };
    case 'PENDING_CUSTOMER':
      return {
        label: 'Chờ phản hồi',
        icon: 'question-answer' as const,
        bg: 'rgba(142, 36, 170, 0.1)',
        color: '#8E24AA',
        border: 'rgba(142, 36, 170, 0.25)',
      };
    case 'RESOLVED':
      return {
        label: 'Đã giải quyết',
        icon: 'check-circle' as const,
        bg: 'rgba(46, 125, 50, 0.1)',
        color: '#2E7D32',
        border: 'rgba(46, 125, 50, 0.25)',
      };
    case 'CLOSED':
      return {
        label: 'Đã đóng',
        icon: 'task-alt' as const,
        bg: 'rgba(112, 121, 116, 0.1)',
        color: COLORS.outline,
        border: 'rgba(112, 121, 116, 0.25)',
      };
    case 'REJECTED':
    default:
      return {
        label: 'Đã từ chối',
        icon: 'cancel' as const,
        bg: 'rgba(211, 47, 47, 0.1)',
        color: '#D32F2F',
        border: 'rgba(211, 47, 47, 0.25)',
      };
  }
};

export function SupportTicketSection({ 
  tickets, 
  onOpenCreateTicketModal,
  onConfirmResolved,
  onReopenTicket,
  onCancelTicket,
  onReplyTicket
}: SupportTicketSectionProps) {
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

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
          const cfg = getStatusConfig(t.status);
          const isResolved = t.status === 'RESOLVED';
          const canCancel = t.status === 'NEW' || t.status === 'IN_PROGRESS';

          return (
            <View key={t.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View style={styles.ticketCodeRow}>
                  <Text style={styles.ticketCode}>{t.ticketCode}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: cfg.bg, borderColor: cfg.border }
                  ]}>
                    <MaterialIcons 
                      name={cfg.icon} 
                      size={12} 
                      color={cfg.color} 
                      style={{ marginRight: 3 }}
                    />
                    <Text style={[styles.statusText, { color: cfg.color }]}>
                      {cfg.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketTime}>{formatDate(t.createdAt)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.typeTitleRow}>
                <Text style={styles.ticketTypeTag}>{t.ticketType}</Text>
                {t.bookingCode && (
                  <Text style={styles.bookingCodeTag}>Mã đơn: {t.bookingCode}</Text>
                )}
              </View>

              <Text style={styles.ticketTitle}>{t.title}</Text>
              <Text style={styles.ticketDesc}>{t.description}</Text>

              {t.imageUrl && !t.imageUrl.startsWith('blob:') && (() => {
                const images = t.imageUrl.split(',').map((s) => s.trim()).filter(Boolean);
                if (images.length === 0) return null;
                return (
                  <View style={styles.ticketImagesGrid}>
                    {images.map((imgUrl, imgIdx) => (
                      <TouchableOpacity 
                        key={imgIdx} 
                        onPress={() => setSelectedPreviewImage(imgUrl)}
                        activeOpacity={0.85}
                        style={styles.ticketGridImgWrapper}
                      >
                        <Image source={{ uri: imgUrl }} style={styles.ticketGridImg} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })()}

              {t.adminNote && (
                <View style={[
                  styles.responseBox,
                  t.status === 'REJECTED' && styles.responseBoxRejected,
                  t.status === 'RESOLVED' && styles.responseBoxResolved
                ]}>
                  <View style={styles.responseTitleRow}>
                    <MaterialIcons 
                      name="support-agent" 
                      size={16} 
                      color={t.status === 'REJECTED' ? COLORS.error : t.status === 'RESOLVED' ? '#2E7D32' : COLORS.primary} 
                    />
                    <Text style={[
                      styles.responseTitle,
                      t.status === 'REJECTED' && { color: COLORS.error },
                      t.status === 'RESOLVED' && { color: '#2E7D32' }
                    ]}>
                      Phản hồi từ Ban Quản Trị ({t.processedBy || 'Admin'}):
                    </Text>
                  </View>
                  <Text style={styles.responseText}>{t.adminNote}</Text>
                </View>
              )}

              {/* Action buttons for User */}
              {isResolved && (
                <View style={styles.resolvedActionBox}>
                  {onConfirmResolved && (
                    <TouchableOpacity 
                      style={styles.confirmResolvedBtn}
                      onPress={() => onConfirmResolved(t.id)}
                    >
                      <MaterialIcons name="check-circle-outline" size={16} color={COLORS.white} />
                      <Text style={styles.confirmResolvedBtnText}>Hài lòng & Đóng Ticket</Text>
                    </TouchableOpacity>
                  )}

                  {onReopenTicket && (
                    <TouchableOpacity 
                      style={styles.reopenTicketBtn}
                      onPress={() => onReopenTicket(t.id)}
                    >
                      <MaterialIcons name="replay" size={16} color="#E65100" />
                      <Text style={styles.reopenTicketBtnText}>Chưa hài lòng (Yêu cầu hỗ trợ tiếp)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {t.status === 'PENDING_CUSTOMER' && onReplyTicket && (
                <TouchableOpacity 
                  style={styles.replyTicketBtn}
                  onPress={() => onReplyTicket(t.id)}
                >
                  <MaterialIcons name="reply" size={16} color={COLORS.white} />
                  <Text style={styles.replyTicketBtnText}>Phản hồi & Bổ sung thông tin</Text>
                </TouchableOpacity>
              )}

              {canCancel && onCancelTicket && (
                <TouchableOpacity 
                  style={styles.cancelTicketBtn}
                  onPress={() => onCancelTicket(t.id)}
                >
                  <MaterialIcons name="close" size={14} color={COLORS.error} />
                  <Text style={styles.cancelTicketBtnText}>Hủy yêu cầu hỗ trợ này</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      {/* Full Image Preview Modal */}
      <Modal 
        visible={!!selectedPreviewImage} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setSelectedPreviewImage(null)}
      >
        <View style={styles.fullImageOverlay}>
          <TouchableOpacity 
            style={styles.fullImageCloseBtn} 
            onPress={() => setSelectedPreviewImage(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {selectedPreviewImage && (
            <Image 
              source={{ uri: selectedPreviewImage }} 
              style={styles.fullImagePreview} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusBadgePending: {
    backgroundColor: COLORS.secondaryOpacity10,
    borderWidth: 1,
    borderColor: COLORS.secondaryOpacity20,
  },
  statusBadgeApproved: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
  },
  statusBadgeRejected: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.2)',
  },
  statusText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPending: {
    color: COLORS.brandGold,
  },
  statusTextApproved: {
    color: COLORS.success,
  },
  statusTextRejected: {
    color: COLORS.error,
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
  typeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  ticketTypeTag: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bookingCodeTag: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
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
    height: 140,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs + 2,
  },
  ticketImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
    marginTop: SPACING.xs + 4,
  },
  ticketGridImgWrapper: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  ticketGridImg: {
    width: '100%',
    height: '100%',
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  fullImageCloseBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImagePreview: {
    width: '100%',
    height: '80%',
  },
  responseBox: {
    backgroundColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  responseBoxRejected: {
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
    borderColor: 'rgba(211, 47, 47, 0.15)',
  },
  responseBoxResolved: {
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderColor: 'rgba(46, 125, 50, 0.15)',
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
  resolvedActionBox: {
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  replyTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E24AA',
    paddingVertical: SPACING.xs + 4,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    gap: 6,
  },
  replyTicketBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  confirmResolvedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  confirmResolvedBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  reopenTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230, 81, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(230, 81, 0, 0.3)',
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  reopenTicketBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#E65100',
    fontWeight: '700',
    fontSize: 12,
  },
  cancelTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs + 2,
    gap: 4,
  },
  cancelTicketBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 11,
  },
});
