import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CommunityFeed } from '../../../features/community-feed';
import { CreatePostModal } from '../../../features/create-post';
import { ReactionOverlayProvider } from '../../../features/like-post';
import { SocialSearchModal } from '../../../features/community-search';
import { NotificationsModal } from '../../../features/notifications';
import { MessagesListModal } from '../../../features/messages';
import { UserProfileModal } from '../../../features/user-profile';
import { AuthRequiredModal } from '../../../shared/ui/AuthRequiredModal';
import { useIsLoggedIn } from '../../../shared/hooks/useIsLoggedIn';
import { Post } from '../../../entities/post';
import { CURRENT_USER } from '../../../shared/api/mockCommunityDb';
import { createPostApi } from '../../../shared/api/posts';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const HEADER_HEIGHT = 56;

export function SocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useIsLoggedIn();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCreatedPost, setNewCreatedPost] = useState<Post | null>(null);

  // Auth Guard state
  const [authModal, setAuthModal] = useState<{
    visible: boolean;
    actionTitle: string;
    actionDescription: string;
    actionIcon: string;
  }>({
    visible: false,
    actionTitle: '',
    actionDescription: '',
    actionIcon: 'lock-closed-outline',
  });

  // Modals State
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [messagesModalVisible, setMessagesModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ─── Collapsible Top Bar (Header + Compose) ───────────────────────────────
  //
  // Tương thích 100% mọi màn hình (iPhone 13/14/15/16 Pro Dynamic Island & Android):
  // - insets.top: Tự động vừa vặn với notch/status bar từng mẫu điện thoại.
  // - Khi cuộn xuống: Logo header (56px) trượt ẩn phía sau status bar.
  // - Khung Đăng bài ("Bạn muốn chia sẻ...") tự động được đẩy lên nằm sát ngay DƯỚI NOTCH và GIỮ STICKY.
  // - Feed cuộn trơn tru phía dưới không bị đè hay hở khoảng trắng.
  //
  const COLLAPSE_HEIGHT = HEADER_HEIGHT; // 56px (chỉ thu gọn phần logo/icon header)
  const TOTAL_TOP_BAR_HEIGHT = insets.top + HEADER_HEIGHT + 64; // insets.top + 56 + 64 (chiều cao toàn bộ khi mở đủ)

  const scrollAnim = useRef(new Animated.Value(0)).current;

  // diffClamp tích lũy delta scroll trong khoảng [0, 56]
  const clampedScrollAnim = useRef(
    Animated.diffClamp(scrollAnim, 0, COLLAPSE_HEIGHT)
  ).current;

  // Top bar trượt lên tối đa 56px (logo ẩn, compose card đẩy lên đỉnh)
  const topBarTranslateY = clampedScrollAnim.interpolate({
    inputRange: [0, COLLAPSE_HEIGHT],
    outputRange: [0, -COLLAPSE_HEIGHT],
    extrapolate: 'clamp',
  });

  // FlashList handler: đảm bảo khi y <= 0 (ở đầu trang) header luôn hiện đầy đủ 100%
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      if (y <= 0) {
        scrollAnim.setValue(0);
      } else {
        scrollAnim.setValue(y);
      }
    },
    [scrollAnim]
  );

  const handlePostCreated = async (postData: Partial<Post>) => {
    const fullPost: Post = {
      id: `post-${Date.now()}`,
      author: CURRENT_USER,
      content: postData.content || '',
      mediaUrls: postData.mediaUrls,
      createdAt: 'Vừa xong',
      type: postData.type || 'COMMUNITY',
      audience: postData.audience || 'PUBLIC',
      clubInfo: postData.clubInfo,
      matchAttachment: postData.matchAttachment,
      venuePromoAttachment: postData.venuePromoAttachment,
      reactionsCount: { like: 0, love: 0, fire: 0, clap: 0 },
      commentsCount: 0,
      sharesCount: 0,
    };

    setNewCreatedPost(fullPost);

    try {
      await createPostApi(postData);
    } catch (err) {
      console.log('Error creating post on backend:', err);
    }
  };


  return (
    <ReactionOverlayProvider>
      <View style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

        {/* ── Fixed Status Bar Background (z-index 101, che kín notch) ── */}
        <View style={[styles.statusBarBackground, { height: insets.top }]} />

        {/* ── Top Bar: Header + Compose (Absolute Position tại top: insets.top) ── */}
        <Animated.View
          style={[
            styles.topBar,
            {
              top: insets.top,
              transform: [{ translateY: topBarTranslateY }],
            },
          ]}
        >
          {/* ── Top Header Row (Logo + Actions) ── */}
          <View style={styles.collapsibleHeader}>
            <View style={styles.headerContent}>
              {/* Horizontal Official Logo (1600x400 aspect ratio 4:1) */}
              <View style={styles.headerBrandContainer}>
                <Image
                  source={require('../../../../assets/logo/logo-horizontal_1600x400.png')}
                  style={styles.headerLogoImage}
                  resizeMode="contain"
                />
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Cộng đồng</Text>
                </View>
              </View>

              {/* Header Action Buttons Group (Search, Messages, Notifications) */}
              <View style={styles.headerRightActions}>
                {/* Search Button */}
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.75}
                  onPress={() => setSearchModalVisible(true)}
                >
                  <Ionicons name="search-outline" size={20} color={COLORS.onSurface} />
                </TouchableOpacity>

                {/* Messages Chat Button with Unread Badge */}
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.75}
                  onPress={() => router.push('/messages')}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.onSurface} />
                  <View style={styles.notificationDot}>
                    <Text style={styles.dotText}>2</Text>
                  </View>
                </TouchableOpacity>

                {/* Notifications Button with Unread Badge */}
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.75}
                  onPress={() => setNotifModalVisible(true)}
                >
                  <Ionicons name="notifications-outline" size={20} color={COLORS.onSurface} />
                  <View style={styles.notificationDot}>
                    <Text style={styles.dotText}>3</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ── Quick Compose Box ── */}
          <View style={styles.stickyQuickComposeContainer}>
            <TouchableOpacity
              style={styles.quickComposeCard}
              activeOpacity={0.8}
              onPress={() => {
                if (!isLoggedIn) {
                  setAuthModal({
                    visible: true,
                    actionTitle: 'Đăng nhập để đăng bài',
                    actionDescription: 'Bạn cần đăng nhập để chia sẻ bài viết, hình ảnh và kết nối với cộng đồng Sporta.',
                    actionIcon: 'create-outline',
                  });
                  return;
                }
                setCreateModalVisible(true);
              }}
            >
              <Image source={{ uri: CURRENT_USER.avatar }} style={styles.userAvatar} />
              <View style={styles.quickInputPlaceholder}>
                <Text style={styles.placeholderText}>
                  Bạn muốn chia sẻ điều gì hôm nay?
                </Text>
              </View>
              <TouchableOpacity style={styles.imageActionBtn} onPress={() => {
                if (!isLoggedIn) {
                  setAuthModal({
                    visible: true,
                    actionTitle: 'Đăng nhập để đăng ảnh',
                    actionDescription: 'Bạn cần đăng nhập để chia sẻ hình ảnh lên Sporta.',
                    actionIcon: 'images-outline',
                  });
                  return;
                }
                setCreateModalVisible(true);
              }}>
                <Ionicons name="images-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Single Infinite Scroll Feed ── */}
        <View style={styles.feedWrapper}>
          <CommunityFeed
            newCreatedPost={newCreatedPost}
            onScroll={handleScroll}
            contentContainerStyle={{ paddingTop: TOTAL_TOP_BAR_HEIGHT }}
          />
        </View>

        {/* ── Modals Stack ── */}
        <CreatePostModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onSubmitPost={handlePostCreated}
        />

        <SocialSearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
        />

        <NotificationsModal
          visible={notifModalVisible}
          onClose={() => setNotifModalVisible(false)}
        />

        <MessagesListModal
          visible={messagesModalVisible}
          onClose={() => setMessagesModalVisible(false)}
        />

        {selectedUserId && (
          <UserProfileModal
            visible={!!selectedUserId}
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}

        {/* Auth Required Modal — yêu cầu đăng nhập khi chưa đăng nhập */}
        <AuthRequiredModal
          visible={authModal.visible}
          onClose={() => setAuthModal((prev) => ({ ...prev, visible: false }))}
          actionTitle={authModal.actionTitle}
          actionDescription={authModal.actionDescription}
          actionIcon={authModal.actionIcon}
        />
      </View>
    </ReactionOverlayProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    zIndex: 101,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.surface,
  },
  collapsibleHeader: {
    backgroundColor: COLORS.surface,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  headerContent: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
  },
  headerBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerLogoImage: {
    width: 120,
    height: 30,
  },
  badgeContainer: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  badgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    color: COLORS.primary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  dotText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  stickyQuickComposeContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    zIndex: 10,
  },
  quickComposeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: SPACING.xs,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceDim,
  },
  quickInputPlaceholder: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.grayText,
  },
  imageActionBtn: {
    padding: 6,
  },
  feedWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default SocialScreen;
