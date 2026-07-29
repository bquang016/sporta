import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../src/shared/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  pendingReason?: string;
}

const MOCK_CHAT_THREADS: ChatThreadItem[] = [
  {
    id: 't-1',
    user: {
      id: 'bui-dang-quang',
      name: 'Bùi Đăng Quang',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      handle: '@bdquang_sporta',
    },
    lastMessage: 'Tối nay 19:30 cáp kèo Pickleball sân Quần Ngựa nhé anh em! 🏓',
    time: 'Vừa xong',
    unreadCount: 3,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-2',
    user: {
      id: 'dinh-tran-nguyen',
      name: 'Đinh Trần Nguyên',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      handle: '@dinh_nguyen',
    },
    lastMessage: 'Đã cọc tiền sân Cầu Lông 2 tiếng tối mai rồi nhé!',
    time: '5 phút trước',
    unreadCount: 1,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-3',
    user: {
      id: 'bui-trong-nghia',
      name: 'Bùi Trọng Nghĩa',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      handle: '@nghia_bui',
    },
    lastMessage: 'Bạn: Ok chốt kèo bóng đá 7v7 thứ Bảy tuần này 👍',
    time: '15 phút trước',
    unreadCount: 0,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-4',
    user: {
      id: 'nguyen-khoa-minh',
      name: 'Nguyễn Khoa Minh',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      handle: '@khoaminh_badminton',
    },
    lastMessage: 'Có bạn tập Cầu lông trình DUPR 3.5 rảnh chiều nay không?',
    time: '30 phút trước',
    unreadCount: 2,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-5',
    user: {
      id: 'ngo-hoang-phuc',
      name: 'Ngô Hoàng Phúc',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
      handle: '@phuc_ngo',
    },
    lastMessage: 'Bạn: Đã gửi mã giảm giá voucher 20% đặt sân 🏟️',
    time: '1 giờ trước',
    unreadCount: 0,
    isOnline: false,
    category: 'CHATS',
  },
  {
    id: 't-6',
    user: {
      id: 'bui-dang-dat',
      name: 'Bùi Đăng Đạt',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
      handle: '@dat_bui_tennis',
    },
    lastMessage: 'Cuối tuần làm trận Tennis giao lưu đôi nam nữ không anh?',
    time: '2 giờ trước',
    unreadCount: 1,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-7',
    user: {
      id: 'le-thanh-dat',
      name: 'Lê Thành Đạt',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
      handle: '@thanhdat_football',
    },
    lastMessage: 'Đội bên em đang thiếu 1 thủ môn đá sân FPT tối nay ⚽',
    time: '3 giờ trước',
    unreadCount: 0,
    isOnline: false,
    category: 'CHATS',
  },
  {
    id: 't-8',
    user: {
      id: 'le-manh-hong',
      name: 'Lê Mạnh Hồng',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      handle: '@hong_le_pb',
    },
    lastMessage: 'Đã đồng ý lời mời thi đấu giao lưu Pickleball 🎉',
    time: '4 giờ trước',
    unreadCount: 0,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-9',
    user: {
      id: 'quanluu08',
      name: 'Quan Luu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      handle: '@quanluu08',
    },
    lastMessage: 'Kèo này hấp dẫn quá anh em ơi! Cho mình xin 1 suất với nhé 🏸🔥',
    time: '5 giờ trước',
    unreadCount: 2,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-10',
    user: {
      id: 'user-1',
      name: 'Nguyễn Văn Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      handle: '@namvugi',
    },
    lastMessage: 'Tối nay nhóm mình còn thiếu 2 tay vợt Pickleball trình DUPR 3.0',
    time: '6 giờ trước',
    unreadCount: 0,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-11',
    user: {
      id: 'club-1',
      name: 'CLB Cầu Lông Cầu Giấy Official',
      avatar: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
      handle: '@clb_caugiay',
    },
    lastMessage: 'Admin: Yêu cầu tham gia CLB của bạn đã được duyệt 🎉',
    time: 'Hôm qua',
    unreadCount: 1,
    isOnline: false,
    category: 'CHATS',
  },
  {
    id: 't-12',
    user: {
      id: 'user-3',
      name: 'Phạm Ngọc Lê',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
      handle: '@ngocle_badminton',
    },
    lastMessage: 'Đã gửi lời mời giao lưu Cầu lông cho bạn 🏸',
    time: 'Hôm qua',
    unreadCount: 1,
    isOnline: true,
    category: 'INVITES',
  },
  {
    id: 't-13',
    user: {
      id: 'user-pending-1',
      name: 'Trần Hoàng Bách',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      handle: '@bach_tennis',
    },
    lastMessage: 'Chào bạn, mình thấy bạn vừa đăng bài tìm đối Tennis sân Quần Ngựa...',
    time: 'Hôm qua',
    unreadCount: 1,
    isOnline: false,
    category: 'PENDING',
    pendingReason: 'Muốn cáp kèo giao lưu Tennis 🎾',
  },
  {
    id: 't-14',
    user: {
      id: 'hoang-thi-mai',
      name: 'Hoàng Thị Mai',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      handle: '@mai_badminton',
    },
    lastMessage: 'Xin chào! Mình muốn xin tham gia nhóm đánh cầu sáng Chủ Nhật...',
    time: '2 ngày trước',
    unreadCount: 1,
    isOnline: false,
    category: 'PENDING',
    pendingReason: 'Xin tham gia nhóm Cầu lông 🏸',
  },
  {
    id: 't-15',
    user: {
      id: 'vu-duc-anh',
      name: 'Vũ Đức Anh',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
      handle: '@ducanh_basketball',
    },
    lastMessage: 'Có ai cáp kèo bóng rổ 3v3 sân Thượng Đình chiều nay không?',
    time: '2 ngày trước',
    unreadCount: 1,
    isOnline: true,
    category: 'INVITES',
  },
  {
    id: 't-16',
    user: {
      id: 'club-pending-2',
      name: 'CLB Pickleball Hà Nội Mở Rộng',
      avatar: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=300&auto=format&fit=crop&q=80',
      handle: '@pb_hanoi_open',
    },
    lastMessage: 'Mời bạn tham gia giải giao lưu Pickleball mở rộng tháng này!',
    time: '3 ngày trước',
    unreadCount: 1,
    isOnline: false,
    category: 'PENDING',
    pendingReason: 'Lời mời từ Quản trị viên CLB 🏓',
  },
  {
    id: 't-17',
    user: {
      id: 'trinh-quoc-tuan',
      name: 'Trịnh Quốc Tuấn',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&auto=format&fit=crop&q=80',
      handle: '@tuan_trinh_football',
    },
    lastMessage: 'Đội bên mình nhận cáp kèo 7v7 tối thứ Ba sân Hoàng Mai.',
    time: '3 ngày trước',
    unreadCount: 0,
    isOnline: false,
    category: 'CHATS',
  },
  {
    id: 't-18',
    user: {
      id: 'dao-thu-trang',
      name: 'Đào Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      handle: '@trang_dao_yoga',
    },
    lastMessage: 'Chào anh, cho em hỏi lịch tập giao lưu nhóm cuối tuần với ạ!',
    time: '4 ngày trước',
    unreadCount: 1,
    isOnline: false,
    category: 'PENDING',
    pendingReason: 'Hỏi lịch giao lưu 🧘‍♀️',
  },
  {
    id: 't-19',
    user: {
      id: 'cau-dem-hn',
      name: 'Hội Đánh Cầu Đêm Hà Nội 🏸',
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&auto=format&fit=crop&q=80',
      handle: '@cau_dem_hn',
    },
    lastMessage: 'Nam: Đã chốt sân số 3 từ 20h - 22h tối nay nhé mọi người!',
    time: '5 ngày trước',
    unreadCount: 4,
    isOnline: true,
    category: 'CHATS',
  },
  {
    id: 't-20',
    user: {
      id: 'phan-van-hung',
      name: 'Phan Văn Hùng',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      handle: '@hung_phan_billiards',
    },
    lastMessage: 'Bắn bida giao lưu giải trí tối nay không ông anh?',
    time: '6 ngày trước',
    unreadCount: 0,
    isOnline: false,
    category: 'CHATS',
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 24);

  const [threads, setThreads] = useState<ChatThreadItem[]>(MOCK_CHAT_THREADS);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'CHATS' | 'PENDING' | 'INVITES'>('CHATS');

  // Edge Swipe-to-Back PanResponder
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          return evt.nativeEvent.pageX <= 35;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return evt.nativeEvent.pageX <= 35 && gestureState.dx > 15;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx > 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 100 || gestureState.vx > 0.5) {
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              router.back();
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              tension: 140,
              friction: 14,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [],
  );

  const filteredThreads = useMemo(() => {
    let list = threads.filter((t) => t.category === activeTab);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.user.name.toLowerCase().includes(q) ||
          t.lastMessage.toLowerCase().includes(q)
      );
    }
    return list;
  }, [threads, query, activeTab]);

  const pendingCount = useMemo(
    () => threads.filter((t) => t.category === 'PENDING').length,
    [threads],
  );

  const invitesCount = useMemo(
    () => threads.filter((t) => t.category === 'INVITES').length,
    [threads],
  );

  const handleAcceptPending = (threadId: string) => {
    const target = threads.find((t) => t.id === threadId);
    if (!target) return;

    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, category: 'CHATS' } : t))
    );

    router.push({
      pathname: '/messages/chat',
      params: {
        userId: target.user.id,
        userName: target.user.name,
        userAvatar: target.user.avatar,
        userHandle: target.user.handle,
      },
    });
  };

  const handleDeclinePending = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  };

  const openChatRoom = (item: ChatThreadItem) => {
    router.push({
      pathname: '/messages/chat',
      params: {
        userId: item.user.id,
        userName: item.user.name,
        userAvatar: item.user.avatar,
        userHandle: item.user.handle,
      },
    });
  };

  return (
    <View style={styles.rootBackground}>
      <Animated.View
        style={[styles.container, { paddingTop: topPadding, transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

        {/* ── Screen Header: Logo Sporta + Custom Styled Chat Badge ── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.onSurface} />
          </TouchableOpacity>

          {/* Sporta Chat Header Brand Group */}
          <View style={styles.headerBrandGroup}>
            <Image
              source={require('../../assets/logo/logo-horizontal_1600x400.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View style={styles.chatBadgePill}>
              <Ionicons name="chatbubble-ellipses" size={11} color={COLORS.primary} />
              <Text style={styles.chatBadgeText}>Chat</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={20} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Search Capsule ── */}
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

        {/* ── Category Filter Tabs ── */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'CHATS' && styles.tabChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('CHATS')}
          >
            <Text style={[styles.tabChipText, activeTab === 'CHATS' && styles.tabChipTextActive]}>
              Đoạn chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'PENDING' && styles.tabChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('PENDING')}
          >
            <Text style={[styles.tabChipText, activeTab === 'PENDING' && styles.tabChipTextActive]}>
              Tin nhắn chờ
            </Text>
            {pendingCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'INVITES' && styles.tabChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('INVITES')}
          >
            <Text style={[styles.tabChipText, activeTab === 'INVITES' && styles.tabChipTextActive]}>
              Mời giao lưu
            </Text>
            {invitesCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{invitesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Continuous Messenger List (Seamless Rows) ── */}
        <ScrollView style={styles.listScrollView} contentContainerStyle={styles.listContent}>
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => {
              const isPendingTab = activeTab === 'PENDING';

              return (
                <TouchableOpacity
                  key={thread.id}
                  style={styles.chatRowItem}
                  activeOpacity={0.7}
                  onPress={() => openChatRoom(thread)}
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

                    {thread.pendingReason && (
                      <Text style={styles.pendingReasonText}>{thread.pendingReason}</Text>
                    )}

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

                      {thread.unreadCount > 0 && !isPendingTab && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{thread.unreadCount}</Text>
                        </View>
                      )}
                    </View>

                    {/* Pending Request Quick Actions */}
                    {isPendingTab && (
                      <View style={styles.pendingActionRow}>
                        <TouchableOpacity
                          style={styles.acceptPendingBtn}
                          activeOpacity={0.8}
                          onPress={() => handleAcceptPending(thread.id)}
                        >
                          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                          <Text style={styles.acceptPendingBtnText}>Chấp nhận</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.declinePendingBtn}
                          activeOpacity={0.8}
                          onPress={() => handleDeclinePending(thread.id)}
                        >
                          <Text style={styles.declinePendingBtnText}>Từ chối</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={44} color={COLORS.grayText} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'PENDING'
                  ? 'Không có tin nhắn chờ nào'
                  : activeTab === 'INVITES'
                  ? 'Không có lời mời giao lưu nào'
                  : 'Không tìm thấy cuộc trò chuyện'}
              </Text>
              <Text style={styles.emptySubText}>
                Các tin nhắn từ người chưa kết bạn hoặc lời mời thách đấu sẽ xuất hiện tại đây.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootBackground: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  /* Header Brand Group */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  backBtn: {
    padding: 4,
    marginRight: 4,
  },
  headerBrandGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 104,
    height: 26,
  },
  chatBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    gap: 3,
  },
  chatBadgeText: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 11.5,
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search */
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 6,
    marginHorizontal: SPACING.marginMobile,
    marginVertical: SPACING.xs,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.onSurface,
    padding: 0,
  },

  /* Tabs */
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    marginVertical: SPACING.xs,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: COLORS.primary,
  },
  tabChipText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
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

  /* Continuous List */
  listScrollView: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  chatRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    fontSize: 15.5,
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
  pendingReasonText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11.5,
    color: COLORS.primary,
    marginTop: 2,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
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

  /* Pending Actions */
  pendingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  acceptPendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  acceptPendingBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  declinePendingBtn: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  declinePendingBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.grayText,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
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
  },
});
