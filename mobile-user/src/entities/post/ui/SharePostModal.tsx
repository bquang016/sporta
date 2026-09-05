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
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { sharePostApi } from '../../../shared/api/posts';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SharePostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onOptionSelected?: (option: 'copy_link' | 'native_share') => void;
}

export function SharePostSheet({
  visible,
  post,
  onClose,
  onOptionSelected,
}: SharePostModalProps) {
  if (!visible || !post) return null;

  return (
    <SharePostContent
      visible={visible}
      post={post}
      onClose={onClose}
      onOptionSelected={onOptionSelected}
    />
  );
}

export function SharePostModal(props: SharePostModalProps) {
  if (!props.visible || !props.post) return null;

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="none"
      onRequestClose={props.onClose}
    >
      <SharePostContent
        visible={props.visible}
        post={props.post}
        onClose={props.onClose}
        onOptionSelected={props.onOptionSelected}
      />
    </Modal>
  );
}

function SharePostContent({
  visible,
  post,
  onClose,
  onOptionSelected,
}: {
  visible: boolean;
  post: Post;
  onClose: () => void;
  onOptionSelected?: (option: 'copy_link' | 'native_share') => void;
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
          if (gestureState.dy > 80 || gestureState.vy > 0.5) {
            animateClose();
          } else {
            resetPosition();
          }
        },
      }),
    [],
  );

  const postUrl = `https://sporta.app/posts/${post.id}`;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(postUrl);
      sharePostApi(post.id).catch(() => {});
    } catch (e) {
      console.log('Copy link error:', e);
    }
  };

  const handleNativeShare = async () => {
    try {
      const authorText = post.author?.name ? `${post.author.name}` : 'Cộng đồng Sporta';
      const cleanContent = post.content ? `"${post.content.slice(0, 140)}${post.content.length > 140 ? '...' : ''}"\n\n` : '';
      const shareMessage = `[Sporta] Bài viết từ ${authorText}:\n${cleanContent}👉 Xem chi tiết trên Sporta:\n${postUrl}`;

      await RNShare.share({
        title: `Bài viết của ${authorText}`,
        message: shareMessage,
        url: postUrl,
      });
      sharePostApi(post.id).catch(() => {});
    } catch (error) {
      console.log('Native share error:', error);
    }
  };

  const handleSelect = (key: 'copy_link' | 'native_share') => {
    animateClose(async () => {
      if (key === 'copy_link') {
        await handleCopyLink();
      } else if (key === 'native_share') {
        await handleNativeShare();
      }
      if (onOptionSelected) {
        onOptionSelected(key);
      }
    });
  };

  return (
    <View style={styles.modalRoot}>
      {/* Animated Fade Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => animateClose()} />
      </Animated.View>

      {/* Animated Bottom Sheet */}
      <Animated.View
        style={[styles.sheetContainer, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <Text style={styles.headerTitle}>Chia sẻ bài viết</Text>

        {/* 2 Focused Sharing Options: Copy Link & Native Share */}
        <View style={styles.optionsList}>
          {/* Option 1: Sao chép liên kết */}
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
            <Ionicons name="copy-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Option 2: Chia sẻ qua ứng dụng khác */}
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
              <Text style={styles.optionSub}>Gửi qua Zalo, Messenger, SMS, Facebook...</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => animateClose()}>
          <Text style={styles.cancelBtnText}>Đóng</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 1100,
    elevation: 1100,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
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
    fontSize: 17,
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextGroup: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
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
    fontSize: 14.5,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
});
