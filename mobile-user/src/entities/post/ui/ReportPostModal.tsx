import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReportPostModal = React.memo(({ visible, onClose }: ReportPostModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const REASONS = [
    '⚡ Kèo đấu ảo / Không có thật',
    '🚨 Spam hoặc quảng cáo sai sự thật',
    '💬 Ngôn từ xúc phạm, thiếu văn hóa',
    '💸 Lừa đảo tiền đặt cọc sân',
    '❌ Khác',
  ];

  const handleSubmitReport = () => {
    if (!selectedReason) {
      Alert.alert('Sporta', 'Vui lòng chọn lý do báo cáo.');
      return;
    }

    Alert.alert(
      'Cảm ơn bạn đã báo cáo! 🙏',
      'Đội ngũ quản trị Sporta sẽ kiểm tra bài viết này trong thời gian sớm nhất để duy trì môi trường thể thao văn minh.',
      [{ text: 'Đóng', onPress: onClose }]
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Báo cáo bài viết vi phạm</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.subTitle}>
              Hãy chọn lý do bạn muốn báo cáo bài viết này với Ban quản trị Sporta:
            </Text>

            <View style={styles.reasonsList}>
              {REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                      {reason}
                    </Text>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? COLORS.primary : COLORS.outline}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, !selectedReason && styles.submitBtnDisabled]}
              disabled={!selectedReason}
              activeOpacity={0.85}
              onPress={handleSubmitReport}
            >
              <Text style={styles.submitBtnText}>Gửi báo cáo vi phạm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: SPACING.md,
  },
  subTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
  },
  reasonsList: {
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  reasonItemSelected: {
    backgroundColor: COLORS.primaryOpacity08,
    borderColor: COLORS.primary,
  },
  reasonText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  reasonTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  submitBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
