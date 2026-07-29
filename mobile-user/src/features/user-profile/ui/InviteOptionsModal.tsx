import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface InviteOptionsModalProps {
  visible: boolean;
  userName: string;
  onSelectInviteClub: () => void;
  onSelectInviteMatch: () => void;
  onClose: () => void;
}

export const InviteOptionsModal = React.memo(({
  visible,
  userName,
  onSelectInviteClub,
  onSelectInviteMatch,
  onClose,
}: InviteOptionsModalProps) => {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      sheetAnim.setValue(300);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropAnim, sheetAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Animated Smooth Fade-In Dark Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Animated Slide-Up Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <SafeAreaView>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Gửi lời mời cho {userName}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={styles.body}>
              {/* Option 1: Invite to Club */}
              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.8}
                onPress={() => {
                  handleClose();
                  setTimeout(onSelectInviteClub, 200);
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryOpacity10 }]}>
                  <Ionicons name="people" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.optionTextGroup}>
                  <Text style={styles.optionTitle}>Mời vào câu lạc bộ</Text>
                  <Text style={styles.optionSub}>Gửi lời mời gia nhập CLB bạn đang tham gia</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.outline} />
              </TouchableOpacity>

              {/* Option 2: Invite to Match */}
              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.8}
                onPress={() => {
                  handleClose();
                  setTimeout(onSelectInviteMatch, 200);
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: COLORS.secondaryOpacity15 }]}>
                  <Ionicons name="trophy" size={24} color={COLORS.secondary} />
                </View>
                <View style={styles.optionTextGroup}>
                  <Text style={styles.optionTitle}>Mời tham gia trận</Text>
                  <Text style={styles.optionSub}>Tạo kèo giao lưu & chọn khung giờ thi đấu</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.outline} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
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
    gap: SPACING.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextGroup: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  optionSub: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
  },
});
