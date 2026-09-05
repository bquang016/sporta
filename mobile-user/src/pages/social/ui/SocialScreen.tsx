import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { CommunityFeed } from '../../../features/community-feed/ui/CommunityFeed';
import { CreatePostModal } from '../../../features/create-post/ui/CreatePostModal';
import { SocialNotificationsModal } from '../../../features/social-notifications';
import { ReactionOverlayProvider } from '../../../features/like-post';
import { createPostApi } from '../../../shared/api/posts';
import { usersApi, UserProfileDto } from '../../../shared/api/users';
import { SocialNotificationApi } from '../../../shared/api/socialNotifications';
import { Post } from '../../../entities/post';
import { Avatar } from '../../../shared/ui';
import { getCachedUserSession, saveUserSession } from '../../../shared/lib/userSession';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 3 Core Tabs
type SocialTabKey = 'FOR_YOU' | 'MATCH_FINDING' | 'CLUBS';

interface TabItem {
  key: SocialTabKey;
  label: string;
  iconName: any;
  iconLib: 'ionicons' | 'material';
}

const TABS: TabItem[] = [
  { key: 'FOR_YOU', label: 'Khám phá', iconName: 'sparkles-outline', iconLib: 'ionicons' },
  { key: 'MATCH_FINDING', label: 'Săn kèo', iconName: 'flame-outline', iconLib: 'ionicons' },
  { key: 'CLUBS', label: 'Câu lạc bộ', iconName: 'shield-checkmark-outline', iconLib: 'ionicons' },
];

interface SportBubble {
  id: string;
  name: string;
  tag: string;
  iconName: any;
  iconLib: 'ionicons' | 'material';
}

// Exactly 4 sports as requested + Tất cả
const SPORTS_BUBBLES: SportBubble[] = [
  { id: 'all', name: 'Tất cả', tag: 'ALL', iconName: 'apps-outline', iconLib: 'ionicons' },
  { id: 'football', name: 'Đá bóng', tag: 'Bóng đá', iconName: 'football-outline', iconLib: 'ionicons' },
  { id: 'pickleball', name: 'Pickleball', tag: 'Pickleball', iconName: 'tennisball-outline', iconLib: 'ionicons' },
  { id: 'basketball', name: 'Bóng rổ', tag: 'Bóng rổ', iconName: 'basketball-outline', iconLib: 'ionicons' },
  { id: 'badminton', name: 'Cầu lông', tag: 'Cầu lông', iconName: 'badminton', iconLib: 'material' },
];

export function SocialScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Active Tab & Sport Tag
  const [activeTab, setActiveTab] = useState<SocialTabKey>('FOR_YOU');
  const [activeSportTag, setActiveSportTag] = useState<string>('ALL');

  // User Profile & Cached Avatar for Zero Flicker
  const initialSession = getCachedUserSession();
  const [cachedAvatar, setCachedAvatar] = useState<string | null>(initialSession.userAvatar || null);
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);

  // Create Post Modal State & Feed Refetch Key
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialMode, setCreateModalInitialMode] = useState<'COMMUNITY' | 'MATCH_FINDING'>('COMMUNITY');

  // Social Notifications State
  const [unreadSocialCount, setUnreadSocialCount] = useState<number>(0);
  const [isSocialNotificationsVisible, setIsSocialNotificationsVisible] = useState(false);

  // Optimistic Post & Upload Progress State
  const [newCreatedPost, setNewCreatedPost] = useState<Post | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postProgress, setPostProgress] = useState(0); // 0 -> 100

  // Collapsible Top Controls Animation
  const topControlsAnim = useRef(new Animated.Value(1)).current; // 1 = fully visible, 0 = collapsed
  const isTopVisibleRef = useRef(true);
  const lastScrollY = useRef(0);

  // Fetch User Profile
  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await usersApi.getProfile();
      if (profile) {
        setUserProfile(profile);
        if (profile.avatarUrl) {
          setCachedAvatar(profile.avatarUrl);
          await saveUserSession({
            userAvatar: profile.avatarUrl,
            userName: profile.fullName,
            userEmail: profile.email,
          });
        }
      }
    } catch {}
  }, []);

  // Fetch Unread Social Notifications Count
  const loadUnreadSocialCount = useCallback(async () => {
    try {
      const count = await SocialNotificationApi.getUnreadSocialCount();
      setUnreadSocialCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    loadUserProfile();
    loadUnreadSocialCount();
    const interval = setInterval(loadUnreadSocialCount, 25000);
    return () => clearInterval(interval);
  }, [loadUserProfile, loadUnreadSocialCount]);

  const handlePostSubmit = async (postData: any) => {
    // 1. Construct optimistic Post object with uploading status
    const tempId = `optimistic-${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId,
      author: {
        id: String(userProfile?.id || 'u-me'),
        name: userProfile?.fullName || 'Bạn',
        avatar: userProfile?.avatarUrl || '',
        handle: `@${userProfile?.email?.split('@')[0] || 'me'}`,
        role: userProfile?.role || 'PLAYER',
      },
      content: postData.content,
      mediaUrls: postData.mediaUrls,
      backgroundGradient: postData.backgroundGradient,
      backgroundId: postData.backgroundId,
      type: postData.type || 'COMMUNITY',
      audience: postData.audience || 'PUBLIC',
      clubInfo: postData.clubInfo,
      matchRoomId: postData.matchRoomId,
      sportName: postData.sportName,
      venueName: postData.venueName,
      timeSlot: postData.timeSlot,
      playDate: postData.playDate,
      startTime: postData.startTime,
      endTime: postData.endTime,
      targetLevel: postData.targetLevel,
      slotsNeeded: postData.slotsNeeded,
      totalPrice: postData.totalPrice,
      memberFee: postData.memberFee,
      memberFeeAmount: postData.memberFeeAmount,
      currentSlots: 0,
      matchStatus: 'OPEN',
      createdAt: 'Vừa xong',
      reactionsCount: { like: 0 },
      commentsCount: 0,
      sharesCount: 0,
      isUploading: true,
      uploadProgress: 25,
    };

    // Auto-switch to matching tab and expand top header controls
    if (postData.type === 'MATCH_FINDING') {
      setActiveTab('MATCH_FINDING');
      pagerRef.current?.scrollTo({ x: 1 * SCREEN_WIDTH, animated: true });
    } else {
      setActiveTab('FOR_YOU');
      pagerRef.current?.scrollTo({ x: 0, animated: true });
    }

    if (!isTopVisibleRef.current) {
      isTopVisibleRef.current = true;
      Animated.timing(topControlsAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    // 2. Prepend immediately to Feed with uploading state
    setNewCreatedPost(optimisticPost);

    try {
      setTimeout(() => {
        setNewCreatedPost((prev) => (prev ? { ...prev, uploadProgress: 65 } : null));
      }, 300);

      await createPostApi(postData);

      // Finish upload: 100%
      setNewCreatedPost((prev) =>
        prev
          ? {
              ...prev,
              uploadProgress: 100,
            }
          : null
      );

      // Settle smoothly to standard post card
      setTimeout(() => {
        setNewCreatedPost((prev) =>
          prev
            ? {
                ...prev,
                isUploading: false,
                uploadProgress: undefined,
              }
            : null
        );
      }, 800);
    } catch (e: any) {
      console.log('Error creating post:', e);
      setNewCreatedPost((prev) =>
        prev
          ? {
              ...prev,
              isUploading: false,
              uploadProgress: undefined,
            }
          : null
      );
    }
  };

  // Horizontal Pager ScrollView ref
  const pagerRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Tab button width for underline indicator
  const tabWidth = SCREEN_WIDTH / TABS.length;

  // Real-time Underline Indicator interpolation (60FPS)
  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: [0, tabWidth, tabWidth * 2],
    extrapolate: 'clamp',
  });

  // Scroll Pager when user taps a Tab
  const handleTabPress = (tabKey: SocialTabKey, index: number) => {
    setActiveTab(tabKey);
    pagerRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  // Sync activeTab state when horizontal swipe finishes
  const handlePagerMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex >= 0 && pageIndex < TABS.length) {
      setActiveTab(TABS[pageIndex].key);
    }
  };

  // Handle Feed Scroll to collapse/expand top controls
  const handleFeedScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = e.nativeEvent.contentOffset.y;
    const dy = currentY - lastScrollY.current;

    if (currentY <= 15) {
      // Near top -> always expand
      if (!isTopVisibleRef.current) {
        isTopVisibleRef.current = true;
        Animated.timing(topControlsAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } else if (dy > 10 && currentY > 40) {
      // Scrolling down -> collapse
      if (isTopVisibleRef.current) {
        isTopVisibleRef.current = false;
        Animated.timing(topControlsAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } else if (dy < -10) {
      // Scrolling up -> expand
      if (!isTopVisibleRef.current) {
        isTopVisibleRef.current = true;
        Animated.timing(topControlsAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
    lastScrollY.current = currentY;
  }, [topControlsAnim]);

  const openCreateModal = (mode: 'COMMUNITY' | 'MATCH_FINDING' = 'COMMUNITY') => {
    setCreateModalInitialMode(mode);
    setIsCreateModalOpen(true);
  };

  const userAvatar = userProfile?.avatarUrl || cachedAvatar || null;

  // Interpolated values for smooth collapsible top controls
  const collapsibleMaxHeight = topControlsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });
  const collapsibleOpacity = topControlsAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.2, 1],
  });

  return (
    <ReactionOverlayProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── 1. Clean Top Header Bar (Always Fixed) ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../../assets/logo/social/social_logo.png')}
            style={styles.headerSocialLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => setIsSocialNotificationsVisible(true)}
          >
            <Ionicons name="notifications-outline" size={21} color={COLORS.onSurface} />
            {unreadSocialCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadSocialCount > 99 ? '99+' : unreadSocialCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Publishing Progress Bar Banner ── */}
      {isPosting && (
        <View style={styles.uploadProgressBanner}>
          <View style={styles.uploadProgressHeader}>
            <View style={styles.uploadProgressLeft}>
              <Ionicons
                name={postProgress === 100 ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={16}
                color={postProgress === 100 ? '#10B981' : COLORS.primary}
              />
              <Text style={styles.uploadProgressText}>
                {postProgress === 100 ? 'Đã đăng bài viết thành công!' : 'Đang đăng bài viết lên bảng tin...'}
              </Text>
            </View>
            <Text style={styles.uploadProgressPercent}>{postProgress}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${postProgress}%`,
                  backgroundColor: postProgress === 100 ? '#10B981' : COLORS.primary,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* ── 3. Collapsible Container: Prompt Card + Tab Bar + Sport Filter (Hides on Scroll Down) ── */}
      <Animated.View
        style={[
          styles.collapsibleWrapper,
          {
            maxHeight: collapsibleMaxHeight,
            opacity: collapsibleOpacity,
          },
        ]}
      >
        {/* Clean "What's on your mind?" Input Box */}
        <View style={styles.cleanPromptCard}>
          <TouchableOpacity
            style={styles.promptInputRow}
            activeOpacity={0.8}
            onPress={() => openCreateModal('COMMUNITY')}
          >
            <Avatar size={36} source={userAvatar} fallbackType="user" />
            <View style={styles.promptInputBox}>
              <Text style={styles.promptPlaceholderText} numberOfLines={1}>
                Bạn đang nghĩ gì? Đăng bài hoặc lên kèo...
              </Text>
            </View>
            <View style={styles.promptMediaQuickBtn}>
              <Ionicons name="images-outline" size={20} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Underline Segmented Tab Bar (60FPS) */}
        <View style={styles.tabBarContainer}>
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                activeOpacity={0.7}
                onPress={() => handleTabPress(tab.key, idx)}
              >
                {tab.iconLib === 'material' ? (
                  <MaterialCommunityIcons
                    name={tab.iconName}
                    size={16}
                    color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                  />
                ) : (
                  <Ionicons
                    name={tab.iconName}
                    size={16}
                    color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
                  />
                )}
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* 60FPS Underline Indicator */}
          <Animated.View
            style={[
              styles.underlineIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
        </View>

        {/* 4 Sport Filter Chips (Đá bóng, Pickleball, Bóng rổ, Cầu lông) - Chỉ hiện ở tab Săn kèo */}
        {activeTab === 'MATCH_FINDING' && (
          <View style={styles.sportFilterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportFilterScroll}
            >
              {SPORTS_BUBBLES.map((sport) => {
                const isSelected = activeSportTag === sport.tag;
                return (
                  <TouchableOpacity
                    key={`sport-${sport.id}`}
                    style={[
                      styles.sportFilterChip,
                      isSelected && styles.sportFilterChipActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setActiveSportTag(sport.tag)}
                  >
                    {sport.iconLib === 'material' ? (
                      <MaterialCommunityIcons
                        name={sport.iconName}
                        size={15}
                        color={isSelected ? '#FFFFFF' : COLORS.onSurfaceVariant}
                      />
                    ) : (
                      <Ionicons
                        name={sport.iconName}
                        size={15}
                        color={isSelected ? '#FFFFFF' : COLORS.onSurfaceVariant}
                      />
                    )}
                    <Text
                      style={[
                        styles.sportFilterText,
                        isSelected && styles.sportFilterTextActive,
                      ]}
                    >
                      {sport.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* ── 4. Horizontal 60FPS Pager Content ── */}
      <Animated.ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handlePagerMomentumScrollEnd}
        style={styles.pagerContainer}
      >
        {/* Page 1: Khám phá (FOR_YOU) */}
        <View style={styles.pageWrapper}>
          <CommunityFeed
            tab="FOR_YOU"
            sportTag="ALL"
            newCreatedPost={newCreatedPost}
            onScroll={handleFeedScroll}
          />
        </View>

        {/* Page 2: Săn kèo (MATCH_FINDING) */}
        <View style={styles.pageWrapper}>
          <CommunityFeed
            tab="MATCH_FINDING"
            sportTag={activeSportTag}
            newCreatedPost={newCreatedPost}
            onScroll={handleFeedScroll}
          />
        </View>

        {/* Page 3: Câu lạc bộ (CLUBS) */}
        <View style={styles.pageWrapper}>
          <CommunityFeed
            tab="CLUBS"
            sportTag="ALL"
            newCreatedPost={newCreatedPost}
            onScroll={handleFeedScroll}
          />
        </View>
      </Animated.ScrollView>

      {/* ── 5. Create Post Modal ── */}
      <CreatePostModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitPost={handlePostSubmit}
        initialMode={createModalInitialMode}
        currentUser={userProfile}
      />

      {/* ── 6. Dedicated Social Notifications Modal ── */}
      <SocialNotificationsModal
        visible={isSocialNotificationsVisible}
        onClose={() => setIsSocialNotificationsVisible(false)}
        onUnreadCountChange={setUnreadSocialCount}
      />
      </SafeAreaView>
    </ReactionOverlayProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSocialLogo: {
    width: 200,
    height: 50,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  uploadProgressBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  uploadProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  uploadProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadProgressText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurface,
    fontWeight: '600',
    fontSize: 12,
  },
  uploadProgressPercent: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  collapsibleWrapper: {
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  cleanPromptCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  promptInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promptAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  promptInputBox: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  promptPlaceholderText: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    fontSize: 13,
  },
  promptMediaQuickBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  tabLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  underlineIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  sportFilterSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sportFilterScroll: {
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  sportFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  sportFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportFilterText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '500',
    fontSize: 11,
  },
  sportFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pagerContainer: {
    flex: 1,
  },
  pageWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});
