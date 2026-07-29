import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuthRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  /** Tiêu đề động theo ngữ cảnh hành động */
  actionTitle?: string;
  /** Mô tả động theo ngữ cảnh hành động */
  actionDescription?: string;
  /** Icon Ionicons cho hành động */
  actionIcon?: string;
}

/**
 * Modal bottom sheet yêu cầu đăng nhập.
 * Hiển thị khi user chưa đăng nhập cố thực hiện hành động cần auth.
 */
export function AuthRequiredModal({
  visible,
  onClose,
  actionTitle = 'Đăng nhập để tiếp tục',
  actionDescription = 'Bạn cần đăng nhập để sử dụng tính năng này.',
  actionIcon = 'lock-closed-outline',
}: AuthRequiredModalProps) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        gs.dy > 8 && Math.abs(gs.dy) > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100 || gs.vy > 0.6) {
          animateClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 12,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleLogin = () => {
    animateClose();
    setTimeout(() => router.push('/auth/login' as any), 250);
  };

  const handleRegister = () => {
    animateClose();
    setTimeout(() => router.push('/auth/register' as any), 250);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleRow}>
            <View style={styles.dragHandle} />
          </View>

          {/* Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name={actionIcon as any} size={30} color={COLORS.primary} />
          </View>

          {/* Text content */}
          <Text style={styles.title}>{actionTitle}</Text>
          <Text style={styles.description}>{actionDescription}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.loginBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={18} color={COLORS.onPrimary} />
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerBtn}
              activeOpacity={0.85}
              onPress={handleRegister}
            >
              <Text style={styles.registerBtnText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </View>

          {/* Skip */}
          <TouchableOpacity onPress={animateClose} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Để sau</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dragHandleRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: COLORS.onSurfaceVariant,
    opacity: 0.25,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryOpacity08,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryOpacity15,
  },
  title: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.lg,
  },
  buttonGroup: {
    width: '100%',
    gap: SPACING.sm,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    gap: 8,
  },
  loginBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  registerBtn: {
    height: 50,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: SPACING.md,
    paddingVertical: 8,
  },
  skipText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
  },
});
