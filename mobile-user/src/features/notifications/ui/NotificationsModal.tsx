import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface NotificationItem {
  id: string;
  type: 'MATCH_INVITE' | 'COMMENT' | 'LIKE' | 'CLUB';
  title: string;
  body: string;
  time: string;
  avatar: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'MATCH_INVITE',
    title: 'Lời mời giao lưu Cầu lông 🏸',
    body: 'Phạm Ngọc Lê vừa mời bạn tham gia trận Cầu Lông giao lưu sáng mai tại Nhà Thi Đấu Cầu Giấy.',
    time: '5 phút trước',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
    isRead: false,
  },
  {
    id: 'n-2',
    type: 'LIKE',
    title: 'Nguyễn Văn Nam và 4 người khác',
    body: 'Đã bày tỏ cảm xúc về bài viết Pickleball của bạn.',
    time: '20 phút trước',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'COMMENT',
    title: 'Quan Luu đã bình luận',
    body: '"Kèo này hấp dẫn quá anh em ơi! Cho mình xin 1 suất với nhé 🏸🔥"',
    time: '1 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    isRead: false,
  },
  {
    id: 'n-4',
    type: 'CLUB',
    title: 'CLB Pickleball Cầu Giấy Official',
    body: 'Yêu cầu tham gia CLB của bạn đã được Quản trị viên chấp nhận. Chào mừng bạn!',
    time: '2 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
    isRead: true,
  },
];

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

type NotifFilter = 'ALL' | 'MATCHES' | 'INTERACTIONS';

export function NotificationsModal({
  visible,
  onClose,
  onSelectNotification,
}: NotificationsModalProps) {
  if (!visible) return null;

  return (
    <NotificationsModalContent
      visible={visible}
      onClose={onClose}
      onSelectNotification={onSelectNotification}
    />
  );
}

function NotificationsModalContent({
  visible,
  onClose,
  onSelectNotification,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<NotifFilter>('ALL');

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const isAtTopRef = useRef(true);

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

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            isAtTopRef.current &&
            gestureState.dy > 6 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          );
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return (
            isAtTopRef.current &&
            gestureState.dy > 6 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          );
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120 || gestureState.vy > 0.6) {
            animateClose();
          } else {
            resetPosition();
          }
        },
      }),
    [],
  );

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handlePressItem = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (onSelectNotification) onSelectNotification(item);
  };

  const filteredNotifs = useMemo(() => {
    if (activeFilter === 'MATCHES') return notifications.filter((n) => n.type === 'MATCH_INVITE');
    if (activeFilter === 'INTERACTIONS') return notifications.filter((n) => n.type === 'LIKE' || n.type === 'COMMENT');
    return notifications;
  }, [notifications, activeFilter]);

  const unreadTotal = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const allCount = notifications.length;
  const matchesCount = useMemo(() => notifications.filter((n) => n.type === 'MATCH_INVITE').length, [notifications]);
  const interactionsCount = useMemo(() => notifications.filter((n) => n.type === 'LIKE' || n.type === 'COMMENT').length, [notifications]);

  const renderTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'MATCH_INVITE':
        return (
          <View style={[styles.badgeOverlay, { backgroundColor: COLORS.primary }]}>
            <MaterialCommunityIcons name="badminton" size={10} color="#FFFFFF" />
          </View>
        );
      case 'LIKE':
        return (
          <View style={[styles.badgeOverlay, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="heart" size={10} color="#FFFFFF" />
          </View>
        );
      case 'COMMENT':
        return (
          <View style={[styles.badgeOverlay, { backgroundColor: '#10B981' }]}>
            <Ionicons name="chatbubble" size={10} color="#FFFFFF" />
          </View>
        );
      case 'CLUB':
        return (
          <View style={[styles.badgeOverlay, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.modalRoot}>
        {/* Animated Fade Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Fixed Height Floating Sheet (Chống co cụt khi chuyển tab) */}
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.headerTitle}>Thông báo 🔔</Text>
              {unreadTotal > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadTotal}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActionsGroup}>
              {unreadTotal > 0 && (
                <TouchableOpacity style={styles.markReadBtn} activeOpacity={0.7} onPress={handleMarkAllRead}>
                  <Text style={styles.markReadText}>Đọc tất cả</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={animateClose}>
                <Ionicons name="close" size={20} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips With Badges */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter('ALL')}
            >
              <Text style={[styles.filterText, activeFilter === 'ALL' && styles.filterTextActive]}>
                Tất cả ({allCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'MATCHES' && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter('MATCHES')}
            >
              <Text style={[styles.filterText, activeFilter === 'MATCHES' && styles.filterTextActive]}>
                Mời đấu ({matchesCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'INTERACTIONS' && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter('INTERACTIONS')}
            >
              <Text style={[styles.filterText, activeFilter === 'INTERACTIONS' && styles.filterTextActive]}>
                Tương tác ({interactionsCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Notifications Area with Flex 1 */}
          <View style={styles.scrollArea}>
            {filteredNotifs.length > 0 ? (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onScroll={(e) => {
                  isAtTopRef.current = e.nativeEvent.contentOffset.y <= 2;
                }}
                scrollEventThrottle={16}
              >
                {filteredNotifs.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.notifCard, !item.isRead && styles.unreadCard]}
                    activeOpacity={0.8}
                    onPress={() => handlePressItem(item)}
                  >
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                      {renderTypeIcon(item.type)}
                    </View>

                    <View style={styles.contentGroup}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.cardTime}>{item.time}</Text>
                      </View>

                      <Text style={styles.cardBody} numberOfLines={2}>
                        {item.body}
                      </Text>
                    </View>

                    {!item.isRead && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="notifications-off-outline" size={32} color={COLORS.grayText} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có thông báo mới</Text>
                <Text style={styles.emptySubText}>
                  {activeFilter === 'MATCHES'
                    ? 'Các lời mời thi đấu thể thao từ bạn bè sẽ xuất hiện tại đây.'
                    : activeFilter === 'INTERACTIONS'
                    ? 'Các lượt tương tác cảm xúc và bình luận mới sẽ xuất hiện tại đây.'
                    : 'Tất cả các thông báo mới của bạn sẽ hiển thị tại đây.'}
                </Text>
              </View>
            )}
          </View>
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
  /* Fixed Height Sheet Container (76% SCREEN_HEIGHT) */
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.76,
    paddingBottom: SPACING.lg,
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

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.sm,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  unreadBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markReadBtn: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  markReadText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11.5,
    color: COLORS.primary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Filters */
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12.5,
    color: COLORS.grayText,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: 8,
    paddingBottom: SPACING.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  unreadCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceDim,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  contentGroup: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    flex: 1,
    marginRight: 6,
  },
  cardTime: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  cardBody: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  emptySubText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12.5,
    color: COLORS.grayText,
    textAlign: 'center',
    lineHeight: 18,
  },
});
