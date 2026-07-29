import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface PostOptionsMenuModalProps {
  visible: boolean;
  post: Post | null;
  currentUserId: string;
  onClose: () => void;
  onDeletePost?: (postId: string) => void;
  onPinPost?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
}

export const PostOptionsMenuModal = React.memo(({
  visible,
  post,
  currentUserId,
  onClose,
  onDeletePost,
  onPinPost,
  onReportPost,
}: PostOptionsMenuModalProps) => {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(350)).current;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      sheetAnim.setValue(350);

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
        toValue: 350,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible || !post) return null;

  const isOwner = post.author.id === currentUserId || currentUserId === 'current-user';

  const handleDelete = () => {
    handleClose();
    setTimeout(() => {
      if (onDeletePost) onDeletePost(post.id);
    }, 200);
  };

  const handleAction = (actionName: string) => {
    handleClose();
    setTimeout(() => {
      if (actionName === 'report' && onReportPost) {
        onReportPost(post.id);
      } else if (actionName === 'pin' && onPinPost) {
        onPinPost(post.id);
      }
    }, 200);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Animated Smooth Fade-In Dark Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
        </Animated.View>

        {/* Animated Slide-Up Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY: sheetAnim }],
            },
          ]}
        >
          <SafeAreaView>
            <View style={styles.handleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.menuList}>
              {isOwner ? (
                <>
                  {/* 1. Pin Post */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction('pin')}
                  >
                    <Ionicons name="pin-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>
                      {post.isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết lên đầu'}
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Edit Post */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction('Chỉnh sửa bài viết')}
                  >
                    <Ionicons name="create-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Chỉnh sửa bài viết</Text>
                  </TouchableOpacity>

                  {/* 3. Change Audience */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction('Thay đổi quyền riêng tư')}
                  >
                    <Ionicons name="lock-closed-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Thay đổi đối tượng xem</Text>
                  </TouchableOpacity>

                  {/* 4. Delete Post */}
                  <TouchableOpacity
                    style={[styles.menuItem, styles.deleteItem]}
                    activeOpacity={0.7}
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                    <Text style={[styles.menuItemText, { color: COLORS.error }]}>Xóa bài viết</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* 1. Save Post */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction('Lưu bài viết')}
                  >
                    <Ionicons name="bookmark-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Lưu bài viết</Text>
                  </TouchableOpacity>

                  {/* 2. Hide Post */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction('Ẩn bài viết khỏi Bảng tin')}
                  >
                    <Ionicons name="eye-off-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Ẩn bài viết này</Text>
                  </TouchableOpacity>

                  {/* 3. Copy Link */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => handleAction('Sao chép liên kết')}
                  >
                    <Ionicons name="link-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Sao chép liên kết</Text>
                  </TouchableOpacity>

                  {/* 4. Report Post */}
                  <TouchableOpacity
                    style={[styles.menuItem, styles.deleteItem]}
                    activeOpacity={0.7}
                    onPress={() => handleAction('report')}
                  >
                    <Ionicons name="warning-outline" size={22} color={COLORS.error} />
                    <Text style={[styles.menuItemText, { color: COLORS.error }]}>
                      Báo cáo bài viết vi phạm
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuList: {
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.sm,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
});
