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
import { CreatePostModal, PostUploadProgressBar } from '../../../features/create-post';
import { ReactionOverlayProvider } from '../../../features/like-post';
import { SocialSearchModal } from '../../../features/community-search';
import { NotificationsModal } from '../../../features/notifications';
import { MessagesListModal } from '../../../features/messages';
import { UserProfileModal } from '../../../features/user-profile';
import { AuthRequiredModal } from '../../../shared/ui/AuthRequiredModal';
import { useIsLoggedIn } from '../../../shared/hooks/useIsLoggedIn';
import { usersApi } from '../../../shared/api/users';
import { Post, ClubInfoModal, ClubInfoData } from '../../../entities/post';
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

  // Sync real user profile
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);

  React.useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        if (isLoggedIn) {
          const profile = await usersApi.getProfile();
          if (isMounted && profile) {
            setCurrentUser({
              id: String(profile.id),
              name: profile.fullName || 'Thành viên Sporta',
              avatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              handle: `@user_${profile.id}`,
            });
          }
        }
      } catch (e) {
        console.log('Error loading user profile in SocialScreen:', e);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // Upload Overlay Progress Bar State
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    progress: number;
    step: string;
    isSuccess: boolean;
    isError: boolean;
  }>({
    isUploading: false,
    progress: 0,
    step: '',
    isSuccess: false,
    isError: false,
  });

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
  const [selectedClubInfo, setSelectedClubInfo] = useState<ClubInfoData | null>(null);

  // ─── Collapsible Top Bar (Header + Compose) ───────────────────────────────
  const COLLAPSE_HEIGHT = HEADER_HEIGHT;
  const TOTAL_TOP_BAR_HEIGHT = insets.top + HEADER_HEIGHT + 64;

  const scrollAnim = useRef(new Animated.Value(0)).current;

  const clampedScrollAnim = useRef(
    Animated.diffClamp(scrollAnim, 0, COLLAPSE_HEIGHT)
  ).current;

  const topBarTranslateY = clampedScrollAnim.interpolate({
    inputRange: [0, COLLAPSE_HEIGHT],
    outputRange: [0, -COLLAPSE_HEIGHT],
    extrapolate: 'clamp',
  });

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
      author: currentUser,
      content: postData.content || '',
      mediaUrls: postData.mediaUrls,
      createdAt: 'Vừa xong',
      type: postData.type || 'COMMUNITY',
      audience: postData.audience || 'PUBLIC',
      clubInfo: postData.clubInfo,
      matchAttachment: postData.matchAttachment,
      venuePromoAttachment: postData.venuePromoAttachment,
      likeCount: 0,
      likesCount: 0,
      reactionsCount: { like: 0, love: 0, fire: 0, clap: 0 },
      commentsCount: 0,
      sharesCount: 0,
    };

    setUploadState({
      isUploading: true,
      progress: 25,
      step: 'Đang xử lý nội dung...',
      isSuccess: false,
      isError: false,
    });

    // Smooth incremental progress interval so progress never gets stuck at 75%
    const progressInterval = setInterval(() => {
      setUploadState((prev) => {
        if (!prev.isUploading) return prev;
        if (prev.progress < 85) {
          const nextProgress = prev.progress + 15;
          return {
            ...prev,
            progress: nextProgress,
            step: nextProgress > 50 ? 'Đang lưu bài vào hệ thống...' : 'Đang xử lý nội dung & hình ảnh...',
          };
        }
        return prev;
      });
    }, 450);

    try {
      const serverPost = await createPostApi({ ...postData, author: currentUser });

      clearInterval(progressInterval);

      const mergedPost: Post = {
        ...fullPost,
        ...(serverPost || {}),
        audience: postData.audience || serverPost?.audience || 'PUBLIC',
        clubInfo: postData.clubInfo || serverPost?.clubInfo,
      };

      setNewCreatedPost(mergedPost);

      setUploadState({
        isUploading: false,
        progress: 100,
        step: 'Đã đăng bài viết thành công!',
        isSuccess: true,
        isError: false,
      });
    } catch (err: any) {
      clearInterval(progressInterval);
      console.log('Error creating post on backend:', err);
      const errorMsg = err?.message?.includes('upload size')
        ? 'Ảnh quá lớn, chọn ảnh nhỏ hơn.'
        : 'Đăng bài thất bại. Vui lòng thử lại.';
      setUploadState({
        isUploading: false,
        progress: 100,
        step: errorMsg,
        isSuccess: false,
        isError: true,
      });
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
              <Image source={{ uri: currentUser?.avatar || CURRENT_USER.avatar }} style={styles.userAvatar} />
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

        {/* Global Floating Custom Sports Ball Upload Widget (Bottom-Right FAB) */}
        {(uploadState.isUploading || uploadState.isSuccess || uploadState.isError) && (
          <View style={styles.uploadOverlayContainer} pointerEvents="box-none">
            <PostUploadProgressBar
              progress={uploadState.progress}
              step={uploadState.step}
              isUploading={uploadState.isUploading}
              isSuccess={uploadState.isSuccess}
              isError={uploadState.isError}
              onDismiss={() => setUploadState((prev) => ({ ...prev, isUploading: false, isSuccess: false, isError: false }))}
            />
          </View>
        )}

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
          currentUser={currentUser}
        />

        <SocialSearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          onSelectClub={(clubInfo) => {
            setSelectedClubInfo(clubInfo);
          }}
          newPost={newCreatedPost}
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

        {selectedClubInfo && (
          <ClubInfoModal
            visible={!!selectedClubInfo}
            clubInfo={selectedClubInfo}
            onClose={() => setSelectedClubInfo(null)}
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
  uploadOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default SocialScreen;
