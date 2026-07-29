import React, { useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LikeButton, useReactionOverlay } from '../../like-post';
import { CommentSectionModal } from '../../comment-post';
import { UserProfileModal } from '../../user-profile';
import {
  PostCard,
  Post,
  ClubInfoData,
  PostOptionsMenuModal,
  ReportPostModal,
  ClubInfoModal,
  SharePostModal,
} from '../../../entities/post';
import { CustomConfirmModal } from '../../../shared/ui/CustomConfirmModal';
import { AuthRequiredModal } from '../../../shared/ui/AuthRequiredModal';
import { useIsLoggedIn } from '../../../shared/hooks/useIsLoggedIn';
import { MOCK_POSTS, mockCommunityDb } from '../../../shared/api/mockCommunityDb';
import { fetchPostsApi, likePostApi } from '../../../shared/api/posts';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';

const SafeFlashList = FlashList as any;

interface CommunityFeedProps {
  newCreatedPost?: Post | null;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentContainerStyle?: any;
}

export function CommunityFeed({ newCreatedPost, onScroll, contentContainerStyle }: CommunityFeedProps) {
  const overlay = useReactionOverlay();
  const { isLoggedIn } = useIsLoggedIn();
  const [feedPosts, setFeedPosts] = useState<Post[]>(MOCK_POSTS);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedClubInfo, setSelectedClubInfo] = useState<ClubInfoData | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [menuPost, setMenuPost] = useState<Post | null>(null);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'danger' | 'success' | 'warning';
    confirmText: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Xác nhận',
    onConfirm: () => {},
  });

  // Load posts from Spring Boot Backend API on mount
  React.useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      try {
        const serverPosts = await fetchPostsApi();
        if (isMounted && serverPosts && serverPosts.length > 0) {
          setFeedPosts(serverPosts);
        }
      } catch (err) {
        console.log('Error fetching backend posts:', err);
      }
    };
    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Prepend newly created post from parent modal
  React.useEffect(() => {
    if (newCreatedPost) {
      setFeedPosts((prev) => [newCreatedPost, ...prev]);
    }
  }, [newCreatedPost]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const serverPosts = await fetchPostsApi();
      if (serverPosts && serverPosts.length > 0) {
        setFeedPosts(serverPosts);
      }
    } catch (err) {
      console.log('Error refreshing posts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReactPost = (postId: string, reaction: any) => {
    // Auth Guard — yêu cầu đăng nhập để thả cảm xúc
    if (!isLoggedIn) {
      setAuthModal({
        visible: true,
        actionTitle: 'Đăng nhập để thả cảm xúc',
        actionDescription: 'Bạn cần đăng nhập để có thể thích và bày tỏ cảm xúc với bài viết.',
        actionIcon: 'thumbs-up-outline',
      });
      return;
    }

    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const oldReaction = p.userReaction;
          const nextReaction = reaction;
          const isLiked = !!nextReaction;

          const newReactionsCount = { ...p.reactionsCount };

          // Decrement previous reaction count if existed
          if (oldReaction && newReactionsCount[oldReaction as keyof typeof newReactionsCount] !== undefined) {
            newReactionsCount[oldReaction as keyof typeof newReactionsCount] = Math.max(
              0,
              newReactionsCount[oldReaction as keyof typeof newReactionsCount] - 1
            );
          }

          // Increment new reaction count
          if (nextReaction && newReactionsCount[nextReaction as keyof typeof newReactionsCount] !== undefined) {
            newReactionsCount[nextReaction as keyof typeof newReactionsCount] += 1;
          }

          return {
            ...p,
            isLiked,
            userReaction: nextReaction,
            reactionsCount: newReactionsCount,
          };
        }
        return p;
      })
    );
    mockCommunityDb.reactPost(postId, reaction);
  };

  const handleDeletePostConfirm = (postId: string) => {
    setConfirmModalData({
      visible: true,
      title: 'Xóa bài viết?',
      message: 'Bạn có chắc chắn muốn xóa bài viết này? Thao tác này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa ngay',
      onConfirm: () => {
        setFeedPosts((prev) => prev.filter((p) => p.id !== postId));
        setConfirmModalData((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const handlePinPost = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
    );
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      renderLikeButton={(postItem) => (
        <LikeButton post={postItem} onReactPost={handleReactPost} />
      )}
      onCommentPress={() => {
        // Auth Guard — yêu cầu đăng nhập để bình luận
        if (!isLoggedIn) {
          setAuthModal({
            visible: true,
            actionTitle: 'Đăng nhập để bình luận',
            actionDescription: 'Bạn cần đăng nhập để có thể bình luận và tham gia thảo luận.',
            actionIcon: 'chatbubble-outline',
          });
          return;
        }
        setCommentPostId(item.id);
      }}
      onSharePress={() => setSharePost(item)}
      onUserPress={(userId) => setSelectedUserId(userId)}
      onClubPress={(clubInfo) => setSelectedClubInfo(clubInfo)}
      onOptionPress={(postToOption) => setMenuPost(postToOption)}
    />
  );

  const renderFooter = () => (
    <View style={styles.endOfFeed}>
      <Text style={styles.endOfFeedText}>Bạn đã xem hết 20+ tin tức rồi 🏅</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeFlashList
        data={feedPosts}
        renderItem={renderItem}
        estimatedItemSize={350}
        keyExtractor={(item: any) => item.id}
        scrollEnabled={!overlay.visible}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào.</Text>
            <Text style={styles.emptySubtext}>Hãy là người đầu tiên chia sẻ bài viết của bạn!</Text>
          </View>
        }
      />

      {/* Shared Comment Modal overlay */}
      {commentPostId && (
        <CommentSectionModal
          visible={!!commentPostId}
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
        />
      )}

      {/* Floating User Profile Bottom Sheet Modal */}
      {selectedUserId && (
        <UserProfileModal
          visible={!!selectedUserId}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Club Information Overview Modal */}
      {selectedClubInfo && (
        <ClubInfoModal
          visible={!!selectedClubInfo}
          clubInfo={selectedClubInfo}
          onClose={() => setSelectedClubInfo(null)}
          onJoinClub={(clubId) => {
            setConfirmModalData({
              visible: true,
              title: 'Tham gia CLB',
              message: 'Yêu cầu tham gia CLB của bạn đã được gửi tới Quản trị viên.',
              type: 'success',
              confirmText: 'Đã hiểu',
              onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
            });
          }}
        />
      )}

      {/* Share Post Options Modal */}
      {sharePost && (
        <SharePostModal
          visible={!!sharePost}
          post={sharePost}
          onClose={() => setSharePost(null)}
          onOptionSelected={(option) => {
            if (option === 'copy_link') {
              setConfirmModalData({
                visible: true,
                title: 'Đã sao chép liên kết',
                message: 'Liên kết bài viết đã được lưu vào bộ nhớ tạm của bạn.',
                type: 'success',
                confirmText: 'Đóng',
                onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
              });
            } else if (option === 'share_profile') {
              setConfirmModalData({
                visible: true,
                title: 'Chia sẻ thành công',
                message: 'Bài viết đã được đăng lại trên trang cá nhân của bạn.',
                type: 'success',
                confirmText: 'Đã hiểu',
                onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
              });
            }
          }}
        />
      )}

      {/* Post 3-Dots Options Menu Modal */}
      <PostOptionsMenuModal
        visible={!!menuPost}
        post={menuPost}
        currentUserId="current-user"
        onClose={() => setMenuPost(null)}
        onDeletePost={handleDeletePostConfirm}
        onPinPost={handlePinPost}
        onReportPost={(postId) => setReportPostId(postId)}
      />

      {/* Report Post Modal */}
      <ReportPostModal
        visible={!!reportPostId}
        onClose={() => setReportPostId(null)}
      />

      {/* Custom Confirmation Modal (Replaces OS Alert.alert) */}
      <CustomConfirmModal
        visible={confirmModalData.visible}
        title={confirmModalData.title}
        message={confirmModalData.message}
        type={confirmModalData.type}
        confirmText={confirmModalData.confirmText}
        cancelText="Bỏ qua"
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setConfirmModalData((prev) => ({ ...prev, visible: false }))}
      />

      {/* Auth Required Modal — yêu cầu đăng nhập khi chưa đăng nhập */}
      <AuthRequiredModal
        visible={authModal.visible}
        onClose={() => setAuthModal((prev) => ({ ...prev, visible: false }))}
        actionTitle={authModal.actionTitle}
        actionDescription={authModal.actionDescription}
        actionIcon={authModal.actionIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120,
  },
  endOfFeed: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfFeedText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.grayText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
  },
  emptySubtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    marginTop: 4,
  },
});
