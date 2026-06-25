import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Club } from '../../../../entities/club';

export interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  onShare: () => void;
  copied: boolean;
  onCopy: () => void;
}

export function InviteModal({ visible, onClose, club, onShare, copied, onCopy }: InviteModalProps) {
  const shareUrl = `https://sporta.vn/clubs/join/${club.id}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertModalContent}>
          <MaterialIcons name="share" size={48} color={COLORS.primary} style={styles.modalAlertIcon} />
          <Text style={styles.alertModalTitle}>Mời bạn bè tham gia</Text>
          <Text style={styles.alertModalMessage}>
            Gửi liên kết dưới đây để mời bạn bè tham gia câu lạc bộ "{club.name}" của bạn.
          </Text>
          
          {/* Link Container */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
              {shareUrl}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.inviteModalActions}>
            <TouchableOpacity 
              style={[styles.inviteModalBtn, styles.copyBtn]} 
              onPress={onCopy}
              activeOpacity={0.8}
            >
              <MaterialIcons name={copied ? "check" : "content-copy"} size={16} color={COLORS.white} />
              <Text style={styles.copyBtnText}>
                {copied ? "Đã sao chép" : "Sao chép"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.inviteModalBtn, styles.shareBtn]} 
              onPress={onShare}
              activeOpacity={0.8}
            >
              <MaterialIcons name="send" size={16} color={COLORS.primary} />
              <Text style={styles.shareBtnText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
 
          <TouchableOpacity 
            style={styles.closeInviteBtn} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeInviteText}>Đóng</Text>
          </TouchableOpacity>
        </View>
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
    padding: SPACING.xl,
  },
  alertModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalAlertIcon: {
    marginBottom: SPACING.md,
  },
  alertModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  linkContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  linkText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
  },
  inviteModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  inviteModalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: BORDER_RADIUS.default,
    gap: SPACING.xs + 2,
  },
  copyBtn: {
    backgroundColor: COLORS.primary,
  },
  copyBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.white,
  },
  shareBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  shareBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.primary,
  },
  closeInviteBtn: {
    paddingVertical: SPACING.xs,
    width: '100%',
    alignItems: 'center',
  },
  closeInviteText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
});
