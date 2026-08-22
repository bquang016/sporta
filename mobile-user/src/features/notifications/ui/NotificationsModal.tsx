import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { NotificationVM } from '../../../shared/api/notifications';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../model/useNotifications';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectNotification?: (item: NotificationVM) => void;
}

type NotifFilter = 'ALL' | 'MATCHES' | 'BOOKINGS';

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + ' phút trước';
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return diffHours + ' giờ trước';
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return diffDays + ' ngày trước';
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  } catch {
    return '';
  }
}

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
  onSelectNotification?: (item: NotificationVM) => void;
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<NotifFilter>('ALL');

  const { data: notifData, isLoading, refetch, isRefetching } = useNotifications(0, 50, visible);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const notifications = useMemo(() => notifData?.content || [], [notifData]);

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
    markAllAsReadMutation.mutate();
  };

  const handlePressItem = (item: NotificationVM) => {
    if (!(item.isRead ?? item.read)) {
      markAsReadMutation.mutate(item.id);
    }
    if (onSelectNotification) {
      onSelectNotification(item);
    }

    animateClose();

    setTimeout(() => {
      if (item.type.startsWith('BOOKING_')) {
        if (item.referenceId) {
          router.push({
            pathname: '/booking/success' as any,
            params: {
              bookingId: item.referenceId,
              fromHistory: 'true',
            },
          });
        } else {
          router.push('/profile/booking-history' as any);
        }
      } else if (item.type.startsWith('MATCH_')) {
        if (item.referenceId) {
          router.push(`/matchmaking/${item.referenceId}` as any);
        } else {
          router.push('/matchmaking' as any);
        }
      } else if (item.type.startsWith('TICKET_')) {
        router.push('/my-tickets' as any);
      } else if (item.type.startsWith('CLUB_')) {
        if (item.referenceId) {
          router.push(`/club-detail-joined/${item.referenceId}` as any);
        } else {
          router.push('/my-clubs' as any);
        }
      } else if (item.type.startsWith('POST_')) {
        router.push('/social' as any);
      } else if (item.type === 'WALLET_DEPOSIT_SUCCESS') {
        router.push('/wallet' as any);
      } else if (item.type === 'VOUCHER_RECEIVED') {
        router.push('/vouchers' as any);
      }
    }, 250);
  };

  const filteredNotifs = useMemo(() => {
    if (activeFilter === 'MATCHES') {
      return notifications.filter((n) => n.type.startsWith('MATCH_'));
    }
    if (activeFilter === 'BOOKINGS') {
      return notifications.filter((n) => n.type.startsWith('BOOKING_') || n.type.startsWith('TICKET_'));
    }
    return notifications;
  }, [notifications, activeFilter]);

  const unreadTotal = useMemo(() => notifications.filter((n) => !(n.isRead ?? n.read)).length, [notifications]);
  const allCount = notifications.length;
  const matchesCount = useMemo(() => notifications.filter((n) => n.type.startsWith('MATCH_')).length, [notifications]);
  const bookingsCount = useMemo(
    () => notifications.filter((n) => n.type.startsWith('BOOKING_') || n.type.startsWith('TICKET_')).length,
    [notifications]
  );

  const renderTypeIcon = (type: string, isRead: boolean) => {
    let bgColor = '#3B82F6';
    let iconName: any = 'notifications-outline';

    if (type.startsWith('MATCH_')) {
      bgColor = '#10B981';
      iconName = 'football-outline';
    } else if (type.startsWith('BOOKING_')) {
      bgColor = '#3B82F6';
      iconName = 'calendar-outline';
    } else if (type.startsWith('TICKET_')) {
      bgColor = '#8B5CF6';
      iconName = 'ticket-outline';
    } else if (type.startsWith('CLUB_')) {
      bgColor = '#F59E0B';
      iconName = 'people-outline';
    } else if (type.startsWith('POST_')) {
      bgColor = '#EC4899';
      iconName = 'heart-outline';
    } else if (type === 'WALLET_DEPOSIT_SUCCESS') {
      bgColor = '#059669';
      iconName = 'wallet-outline';
    } else if (type === 'VOUCHER_RECEIVED') {
      bgColor = '#F97316';
      iconName = 'gift-outline';
    }

    return (
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: bgColor },
          isRead && styles.iconBadgeRead,
        ]}
      >
        <Ionicons name={iconName} size={18} color="#FFFFFF" />
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.headerTitle}>Thông báo</Text>
              {unreadTotal > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadTotal} mới</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActionsGroup}>
              {unreadTotal > 0 && (
                <TouchableOpacity
                  style={styles.markReadBtn}
                  activeOpacity={0.75}
                  onPress={handleMarkAllRead}
                >
                  <Text style={styles.markReadText}>Đã đọc tất cả</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={animateClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips */}
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
                Ghép kèo ({matchesCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'BOOKINGS' && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter('BOOKINGS')}
            >
              <Text style={[styles.filterText, activeFilter === 'BOOKINGS' && styles.filterTextActive]}>
                Đặt sân ({bookingsCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={styles.scrollArea}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải thông báo...</Text>
              </View>
            ) : filteredNotifs.length > 0 ? (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    colors={[COLORS.primary]}
                  />
                }
                onScroll={(e) => {
                  isAtTopRef.current = e.nativeEvent.contentOffset.y <= 2;
                }}
                scrollEventThrottle={16}
              >
                {filteredNotifs.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notifCard,
                      (item.isRead ?? item.read) ? styles.readCard : styles.unreadCard,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handlePressItem(item)}
                  >
                    <View style={styles.iconWrapper}>
                      {renderTypeIcon(item.type, (item.isRead ?? item.read))}
                    </View>

                    <View style={styles.contentGroup}>
                      <View style={styles.cardHeaderRow}>
                        <Text
                          style={[
                            styles.cardTitle,
                            (item.isRead ?? item.read) ? styles.cardTitleRead : styles.cardTitleUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={[styles.cardTime, (item.isRead ?? item.read) && styles.cardTimeRead]}>
                          {formatTimeAgo(item.createdAt)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.cardBody,
                          (item.isRead ?? item.read) ? styles.cardBodyRead : styles.cardBodyUnread,
                        ]}
                        numberOfLines={2}
                      >
                        {item.content}
                      </Text>
                    </View>

                    {/* Green dot for unread notifications */}
                    {!(item.isRead ?? item.read) ? (
                      <View style={styles.unreadDot} />
                    ) : (
                      <View style={styles.readPlaceholder} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="notifications-off-outline" size={32} color={COLORS.grayText} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
                <Text style={styles.emptySubText}>
                  {activeFilter === 'MATCHES'
                    ? 'Các lời mời, cập nhật ghép kèo sẽ xuất hiện tại đây.'
                    : activeFilter === 'BOOKINGS'
                    ? 'Thông tin đặt sân & vé lượt của bạn sẽ hiển thị tại đây.'
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
  scrollArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.grayText,
  },
  listContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: 10,
    paddingBottom: SPACING.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BORDER_RADIUS.md,
    padding: 13,
    gap: 12,
    borderWidth: 1,
  },
  // THẺ CHƯA ĐỌC: Nền xanh nhạt nổi bật, viền xanh dương, bóng nhẹ
  unreadCard: {
    backgroundColor: '#F0F7FF',
    borderColor: '#BAE6FD',
  },
  // THẺ ĐÃ ĐỌC: Nền xám tối/dịu hơn rõ rệt, viền xám mờ, không bóng
  readCard: {
    backgroundColor: '#F1F5F9', // slate-100 dịu tối hơn
    borderColor: '#E2E8F0',
    opacity: 0.72,
  },
  iconWrapper: {
    marginTop: 2,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeRead: {
    opacity: 0.65,
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
    fontSize: 13.5,
    flex: 1,
    marginRight: 6,
  },
  cardTitleUnread: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardTitleRead: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  cardTime: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  cardTimeRead: {
    color: '#94A3B8',
  },
  cardBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  cardBodyUnread: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  cardBodyRead: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  readPlaceholder: {
    width: 8,
  },
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
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  emptySubText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.grayText,
    textAlign: 'center',
  },
});
