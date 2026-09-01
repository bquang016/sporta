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
import { Post } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface PostOptionsMenuModalProps {
  visible: boolean;
  post: Post | null;
  currentUserId: string;
  onClose: () => void;
  onEditPost?: (post: Post) => void;
  onChangeAudience?: (post: Post) => void;
  onHidePost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
  onCopyLink?: (post: Post) => void;
}

export const PostOptionsMenuModal = React.memo(({
  visible,
  post,
  currentUserId,
  onClose,
  onEditPost,
  onChangeAudience,
  onHidePost,
  onDeletePost,
  onReportPost,
  onCopyLink,
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

  const handleClose = (callback?: () => void) => {
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
      if (callback) {
        setTimeout(callback, 50);
      }
    });
  };

  if (!visible || !post) return null;

  const isOwner =
    post.author.id === currentUserId ||
    currentUserId === 'current-user' ||
    (currentUserId && String(post.author.id) === String(currentUserId));

  const isNormalPost =
    !post.type ||
    post.type === 'COMMUNITY' ||
    post.type === 'STANDARD' ||
    post.type === 'POST' ||
    post.type === 'SOCIAL';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => handleClose()}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => handleClose()} />
        </Animated.View>

        {/* Slide-Up Sheet */}
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
                  {/* 1. Edit Post (Only for normal posts, not promotion or match finding) */}
                  {isNormalPost && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleClose(() => {
                          if (onEditPost) onEditPost(post);
                        })
                      }
                    >
                      <Ionicons name="create-outline" size={22} color={COLORS.onSurface} />
                      <Text style={styles.menuItemText}>Chỉnh sửa bài viết</Text>
                    </TouchableOpacity>
                  )}

                  {/* 2. Change Audience / Privacy */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleClose(() => {
                        if (onChangeAudience) onChangeAudience(post);
                      })
                    }
                  >
                    <Ionicons name="lock-closed-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Thay đổi đối tượng xem</Text>
                  </TouchableOpacity>

                  {/* 3. Hide Post (Available for everyone) */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleClose(() => {
                        if (onHidePost) onHidePost(post);
                      })
                    }
                  >
                    <Ionicons name="eye-off-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Ẩn bài viết</Text>
                  </TouchableOpacity>

                  {/* 4. Delete Post (Soft delete) */}
                  <TouchableOpacity
                    style={[styles.menuItem, styles.deleteItem]}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleClose(() => {
                        if (onDeletePost) onDeletePost(post.id);
                      })
                    }
                  >
                    <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                    <Text style={[styles.menuItemText, { color: COLORS.error }]}>Xóa bài viết</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* 1. Hide Post */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleClose(() => {
                        if (onHidePost) onHidePost(post);
                      })
                    }
                  >
                    <Ionicons name="eye-off-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Ẩn bài viết</Text>
                  </TouchableOpacity>

                  {/* 2. Copy Link */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleClose(() => {
                        if (onCopyLink) onCopyLink(post);
                      })
                    }
                  >
                    <Ionicons name="link-outline" size={22} color={COLORS.onSurface} />
                    <Text style={styles.menuItemText}>Sao chép liên kết</Text>
                  </TouchableOpacity>

                  {/* 3. Report Post */}
                  <TouchableOpacity
                    style={[styles.menuItem, styles.deleteItem]}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleClose(() => {
                        if (onReportPost) onReportPost(post.id);
                      })
                    }
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
