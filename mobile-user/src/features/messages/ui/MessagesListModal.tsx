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
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MockChatModal } from '../../user-profile/ui/MockChatModal';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ChatThreadItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    handle: string;
  };
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  category: 'CHATS' | 'PENDING' | 'INVITES';
}

const MOCK_CHAT_THREADS: ChatThreadItem[] = [
  {
    id: 't-1',
    user: {
      id: 'quanluu08',
      name: 'Quan Luu',
      avatar: '',
      handle: '@quanluu08',
    },
    lastMessage: 'Kèo này hấp dẫn quá anh em ơi! Cho mình xin 1 suất với nhé 🏸🔥',
    time: '10 phút trước',
    unreadCount: 2,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-2',
    user: {
      id: 'user-1',
      name: 'Nguyễn Văn Nam',
      avatar: '',
      handle: '@namvugi',
    },
    lastMessage: 'Tối nay nhóm mình còn thiếu 2 tay vợt Pickleball trình DUPR 3.0',
    time: '1 giờ trước',
    unreadCount: 0,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-3',
    user: {
      id: 'club-1',
      name: 'CLB Cầu Lông Cầu Giấy Official',
      avatar: '',
      handle: '@clb_caugiay',
    },
    lastMessage: 'Admin: Yêu cầu tham gia CLB của bạn đã được duyệt 🎉',
    time: '2 giờ trước',
    unreadCount: 1,
    isOnline: false,
    category: 'CHATS',
  },
  {
    id: 't-4',
    user: {
      id: 'user-pending-1',
      name: 'Trần Hoàng Bách',
      avatar: '',
      handle: '@bach_tennis',
    },
    lastMessage: 'Chào bạn, mình thấy bạn vừa đăng bài tìm đối Tennis sân Quần Ngựa...',
    time: 'Hôm qua',
    unreadCount: 1,
    isOnline: false,
    category: 'PENDING',
  },
  {
    id: 't-5',
    user: {
      id: 'club-pending-2',
      name: 'CLB Pickleball Hà Nội Mở Rộng',
      avatar: '',
      handle: '@pb_hanoi_open',
    },
    lastMessage: 'Mời bạn tham gia giải giao lưu Pickleball mở rộng tháng này!',
    time: '3 ngày trước',
    unreadCount: 1,
    isOnline: false,
    category: 'PENDING',
  },
  {
    id: 't-6',
    user: {
      id: 'user-3',
      name: 'Phạm Ngọc Lê',
      avatar: '',
      handle: '@ngocle_badminton',
    },
    lastMessage: 'Đã gửi lời mời giao lưu Cầu lông cho bạn 🏸',
    time: '3 giờ trước',
    unreadCount: 1,
    isOnline: true,
    category: 'INVITES',
  },
];

interface MessagesListModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MessagesListModal({ visible, onClose }: MessagesListModalProps) {
  if (!visible) return null;

  return <MessagesListModalContent visible={visible} onClose={onClose} />;
}

function MessagesListModalContent({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'CHATS' | 'PENDING' | 'INVITES'>('CHATS');
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);

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

  const filteredThreads = useMemo(() => {
    let threads = MOCK_CHAT_THREADS.filter((t) => t.category === activeTab);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      threads = threads.filter(
        (t) =>
          t.user.name.toLowerCase().includes(q) ||
          t.lastMessage.toLowerCase().includes(q)
      );
    }
    return threads;
  }, [query, activeTab]);

  const pendingBadgeCount = useMemo(
    () => MOCK_CHAT_THREADS.filter((t) => t.category === 'PENDING').length,
    [],
  );

  const invitesBadgeCount = useMemo(
    () => MOCK_CHAT_THREADS.filter((t) => t.category === 'INVITES').length,
    [],
  );

  if (activeChatUser) {
    return (
      <MockChatModal
        visible={true}
        user={activeChatUser}
        onClose={() => setActiveChatUser(null)}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.modalRoot}>
        {/* Animated Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Animated Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY }], paddingTop: 10 },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header Row: Title & Close Button */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Tin nhắn 💬</Text>

            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={animateClose}>
              <Ionicons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Search Capsule Bar */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={16} color={COLORS.grayText} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bạn bè, đoạn chat..."
              placeholderTextColor={COLORS.outline}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.grayText} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs Bar */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabChip, activeTab === 'CHATS' && styles.tabChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('CHATS')}
            >
              <Text
                style={[styles.tabChipText, activeTab === 'CHATS' && styles.tabChipTextActive]}
              >
                Đoạn chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabChip, activeTab === 'PENDING' && styles.tabChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('PENDING')}
            >
              <Text
                style={[styles.tabChipText, activeTab === 'PENDING' && styles.tabChipTextActive]}
              >
                Tin nhắn chờ
              </Text>
              {pendingBadgeCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{pendingBadgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabChip, activeTab === 'INVITES' && styles.tabChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab('INVITES')}
            >
              <Text
                style={[styles.tabChipText, activeTab === 'INVITES' && styles.tabChipTextActive]}
              >
                Mời giao lưu
              </Text>
              {invitesBadgeCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{invitesBadgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Conversations List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              isAtTopRef.current = e.nativeEvent.contentOffset.y <= 2;
            }}
            scrollEventThrottle={16}
          >
            <View style={styles.listContainer}>
              {filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => (
                  <TouchableOpacity
                    key={thread.id}
                    style={styles.chatCard}
                    activeOpacity={0.8}
                    onPress={() => setActiveChatUser(thread.user)}
                  >
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: thread.user.avatar }} style={styles.avatar} />
                      {thread.isOnline && <View style={styles.onlineBadge} />}
                    </View>

                    <View style={styles.textGroup}>
                      <View style={styles.nameTimeRow}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {thread.user.name}
                        </Text>
                        <Text style={styles.timeText}>{thread.time}</Text>
                      </View>

                      <View style={styles.msgRow}>
                        <Text
                          style={[
                            styles.lastMsgText,
                            thread.unreadCount > 0 && styles.lastMsgTextUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {thread.lastMessage}
                        </Text>
                        {thread.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{thread.unreadCount}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color={COLORS.grayText} />
                  <Text style={styles.emptyText}>
                    {activeTab === 'PENDING'
                      ? 'Không có tin nhắn chờ nào'
                      : activeTab === 'INVITES'
                      ? 'Không có lời mời giao lưu nào'
                      : 'Không tìm thấy cuộc trò chuyện'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
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
    maxHeight: SCREEN_HEIGHT * 0.84,
    paddingBottom: SPACING.xl,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
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
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    padding: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: COLORS.primary,
  },
  tabChipText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12.5,
    color: COLORS.grayText,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: SPACING.marginMobile,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceDim,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  textGroup: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lastMsgText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
    flex: 1,
    marginRight: 8,
  },
  lastMsgTextUnread: {
    fontFamily: 'HankenGrotesk-Bold',
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
  },
});
