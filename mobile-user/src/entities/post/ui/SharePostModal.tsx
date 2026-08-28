import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Share as RNShare,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SharePostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onOptionSelected?: (option: 'copy_link' | 'share_profile' | 'send_chat' | 'native_share') => void;
}

export function SharePostModal({
  visible,
  post,
  onClose,
  onOptionSelected,
}: SharePostModalProps) {
  if (!visible || !post) return null;

  return (
    <SharePostModalContent
      visible={visible}
      post={post}
      onClose={onClose}
      onOptionSelected={onOptionSelected}
    />
  );
}

function SharePostModalContent({
  visible,
  post,
  onClose,
  onOptionSelected,
}: {
  visible: boolean;
  post: Post;
  onClose: () => void;
  onOptionSelected?: (option: 'copy_link' | 'share_profile' | 'send_chat' | 'native_share') => void;
}) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      backdropAnim.setValue(0);
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, backdropAnim]);

  const animateClose = (callback?: () => void) => {
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
    ]).start(() => {
      onClose();
      if (callback) callback();
    });
  };

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 100 || gestureState.vy > 0.5) {
            animateClose();
          } else {
            resetPosition();
          }
        },
      }),
    [],
  );

  const handleNativeShare = async () => {
    try {
      await RNShare.share({
        message: `[Sporta] ${post.author.name}: "${post.content.slice(0, 100)}..."`,
        url: `https://sporta.app/post/${post.id}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleSelect = (key: 'copy_link' | 'share_profile' | 'send_chat' | 'native_share') => {
    animateClose(() => {
      if (key === 'native_share') {
        handleNativeShare();
      }
      if (onOptionSelected) {
        onOptionSelected(key);
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => animateClose()}>
      <View style={styles.modalRoot}>
        {/* Animated Fade Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => animateClose()} />
        </Animated.View>

        {/* Animated Sheet */}
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <Text style={styles.headerTitle}>Chia sẻ bài viết</Text>

          {/* Options Grid / List */}
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => handleSelect('copy_link')}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryOpacity08 }]}>
                <Ionicons name="link-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>Sao chép liên kết</Text>
                <Text style={styles.optionSub}>Lưu liên kết bài viết vào bộ nhớ tạm</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => handleSelect('share_profile')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="repeat-outline" size={22} color="#0284C7" />
              </View>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>Chia sẻ lên Trang cá nhân</Text>
                <Text style={styles.optionSub}>Đăng lại bài viết này trên feed của bạn</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => handleSelect('send_chat')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="paper-plane-outline" size={21} color="#D97706" />
              </View>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>Gửi tin nhắn riêng</Text>
                <Text style={styles.optionSub}>Gửi thẻ bài viết cho bạn bè trong Chat</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => handleSelect('native_share')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="share-variant-outline" size={22} color="#7C3AED" />
              </View>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>Chia sẻ qua ứng dụng khác...</Text>
                <Text style={styles.optionSub}>Gửi qua Zalo, Messenger, SMS hoặc ứng dụng khác</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => animateClose()}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: COLORS.onSurfaceVariant,
    opacity: 0.3,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  optionsList: {
    gap: 10,
    marginBottom: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextGroup: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  optionSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
});
