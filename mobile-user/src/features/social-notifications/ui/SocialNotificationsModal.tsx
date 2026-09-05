import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SocialNotificationApi, SocialNotificationVM } from '../../../shared/api/socialNotifications';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SocialNotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  onSelectPost?: (postId: string) => void;
}

export function SocialNotificationsModal({
  visible,
  onClose,
  onUnreadCountChange,
  onSelectPost,
}: SocialNotificationsModalProps) {
  if (!visible) return null;

  return (
    <SocialNotificationsContent
      visible={visible}
      onClose={onClose}
      onUnreadCountChange={onUnreadCountChange}
      onSelectPost={onSelectPost}
    />
  );
}

function SocialNotificationsContent({
  visible,
  onClose,
  onUnreadCountChange,
  onSelectPost,
}: SocialNotificationsModalProps) {
  const [notifications, setNotifications] = useState<SocialNotificationVM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Load notifications
  const loadNotifications = useCallback(async (pageNum = 0, isRefresh = false) => {
    try {
      if (pageNum === 0) {
        if (!isRefresh) setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const res = await SocialNotificationApi.getSocialNotifications(pageNum, 15);
      const items = res?.content || [];

      if (pageNum === 0) {
        setNotifications(items);
      } else {
        setNotifications((prev) => [...prev, ...items]);
      }

      setHasMore(pageNum + 1 < (res?.totalPages || 1));
      setPage(pageNum);

      // Update unread count
      const unread = await SocialNotificationApi.getUnreadSocialCount();
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (e) {
      console.log('Error loading social notifications:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      backdropAnim.setValue(0);
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();

      loadNotifications(0);
    }
  }, [visible, translateY, backdropAnim, loadNotifications]);

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
    ]).start(() => {
      onClose();
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
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
    })
  ).current;

  const handleMarkAllRead = async () => {
    try {
      await SocialNotificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (e) {
      console.log('Error marking all as read:', e);
    }
  };

  const handleNotificationPress = async (item: SocialNotificationVM) => {
    // Mark as read locally and remotely
    if (!item.isRead && !item.read) {
      try {
        await SocialNotificationApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true, read: true } : n))
        );
        const unread = await SocialNotificationApi.getUnreadSocialCount();
        if (onUnreadCountChange) onUnreadCountChange(unread);
      } catch (e) {
        console.log('Error mark read:', e);
      }
    }

    // Extract post ID from referenceId
    if (item.referenceId) {
      const match = item.referenceId.match(/post:(\d+)/);
      const postId = match ? match[1] : item.referenceId;
      if (onSelectPost && postId) {
        animateClose();
        setTimeout(() => {
          onSelectPost(postId);
        }, 250);
      }
    }
  };

  const renderBadgeIcon = (type: string, content?: string) => {
    if (type === 'POST_COMMENTED') {
      return (
        <View style={[styles.badgeCircle, { backgroundColor: '#10B981' }]}>
          <Ionicons name="chatbubble" size={10} color="#FFFFFF" />
        </View>
      );
    }

    // Check reaction type from content text
    const lowerContent = (content || '').toLowerCase();
    if (lowerContent.includes('yêu thích') || lowerContent.includes('tim') || lowerContent.includes('love')) {
      return (
        <View style={[styles.badgeCircle, { backgroundColor: '#FF4D6D' }]}>
          <Ionicons name="heart" size={10} color="#FFFFFF" />
        </View>
      );
    }
    if (lowerContent.includes('bùng nổ') || lowerContent.includes('nhiệt huyết') || lowerContent.includes('fire')) {
      return (
        <View style={[styles.badgeCircle, { backgroundColor: '#FF9E00' }]}>
          <Ionicons name="flame" size={10} color="#FFFFFF" />
        </View>
      );
    }
    if (lowerContent.includes('thể lực') || lowerContent.includes('mạnh mẽ') || lowerContent.includes('năng lượng') || lowerContent.includes('muscle')) {
      return (
        <View style={[styles.badgeCircle, { backgroundColor: '#8B5CF6' }]}>
          <Ionicons name="barbell" size={10} color="#FFFFFF" />
        </View>
      );
    }
    if (lowerContent.includes('vô địch') || lowerContent.includes('đỉnh cao') || lowerContent.includes('xuất sắc') || lowerContent.includes('trophy')) {
      return (
        <View style={[styles.badgeCircle, { backgroundColor: '#FBBF24' }]}>
          <Ionicons name="trophy" size={10} color="#FFFFFF" />
        </View>
      );
    }
    if (lowerContent.includes('vỗ tay') || lowerContent.includes('cổ vũ') || lowerContent.includes('clap')) {
      return (
        <View style={[styles.badgeCircle, { backgroundColor: '#10B981' }]}>
          <MaterialCommunityIcons name="hand-clap" size={10} color="#FFFFFF" />
        </View>
      );
    }

    // Default Like
    return (
      <View style={[styles.badgeCircle, { backgroundColor: '#1877F2' }]}>
        <MaterialCommunityIcons name="thumb-up" size={10} color="#FFFFFF" />
      </View>
    );
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Vừa xong';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Vừa xong';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return 'Vừa xong';
    }
  };

  const renderItem = ({ item }: { item: SocialNotificationVM }) => {
    const isUnread = !item.isRead && !item.read;

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Left: Avatar with Reaction/Comment Badge */}
        <View style={styles.avatarWrap}>
          <Avatar
            source={item.actorAvatar}
            size={44}
            fallbackType="user"
          />
          {renderBadgeIcon(item.type, item.content)}
        </View>

        {/* Center: Notification text info */}
        <View style={styles.contentWrap}>
          <Text style={styles.contentText} numberOfLines={3}>
            <Text style={styles.authorName}>{item.title} </Text>
            <Text style={styles.actionText}>{item.content}</Text>
          </Text>
          <Text style={[styles.timeText, isUnread && styles.unreadTimeText]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>

        {/* Right: Unread Blue Indicator Dot */}
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={animateClose}
    >
      <View style={styles.modalRoot}>
        {/* Dark Animated Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={animateClose}
          />
        </Animated.View>

        {/* Sliding Bottom Sheet */}
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.headerIconCircle}>
                  <Ionicons name="notifications" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.headerTitle}>Thông báo Bảng tin</Text>
              </View>

              {notifications.some((n) => !n.isRead && !n.read) && (
                <TouchableOpacity
                  style={styles.markAllBtn}
                  activeOpacity={0.7}
                  onPress={handleMarkAllRead}
                >
                  <Ionicons name="checkmark-done" size={16} color={COLORS.primary} />
                  <Text style={styles.markAllText}>Đã đọc tất cả</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải thông báo...</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => {
                      setIsRefreshing(true);
                      loadNotifications(0, true);
                    }}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
                  />
                }
                onEndReached={() => {
                  if (hasMore && !isLoadingMore) {
                    loadNotifications(page + 1);
                  }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() =>
                  isLoadingMore ? (
                    <View style={styles.footerLoader}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                      <Ionicons name="chatbubbles-outline" size={36} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
                    <Text style={styles.emptySubtitle}>
                      Khi có người khác thích, thả cảm xúc hoặc bình luận vào bài viết của bạn, thông báo sẽ hiển thị tại đây.
                    </Text>
                  </View>
                }
              />
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryOpacity08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity08,
  },
  markAllText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: '#64748B',
  },
  listContent: {
    paddingBottom: 40,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  unreadItem: {
    backgroundColor: '#F0FDF4',
  },
  avatarWrap: {
    position: 'relative',
    width: 46,
    height: 46,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
  },
  badgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentWrap: {
    flex: 1,
    gap: 3,
  },
  contentText: {
    fontSize: 13.5,
    color: '#1E293B',
    lineHeight: 18,
  },
  authorName: {
    fontWeight: '700',
    color: '#0F172A',
  },
  actionText: {
    color: '#334155',
  },
  timeText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  unreadTimeText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
});
