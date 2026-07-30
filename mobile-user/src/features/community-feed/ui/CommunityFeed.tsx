import React, { useState, useCallback } from 'react';
import { Platform, View, Text, StyleSheet, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
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
import { fetchPostsApi, likePostApi, sharePostApi, deletePostApi } from '../../../shared/api/posts';
import { usersApi } from '../../../shared/api/users';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';
import { PostCardSkeleton } from './PostCardSkeleton';

const SafeFlashList = FlashList as any;

interface CommunityFeedProps {
  newCreatedPost?: Post | null;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentContainerStyle?: any;
}

export function CommunityFeed({ newCreatedPost, onScroll, contentContainerStyle }: CommunityFeedProps) {
  const overlay = useReactionOverlay();
  const { isLoggedIn } = useIsLoggedIn();
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  // Sync real user for comment modal
  const [currentUser, setCurrentUser] = useState<any>(null);
  React.useEffect(() => {
    if (isLoggedIn) {
      usersApi.getProfile().then((profile: any) => {
        if (profile) {
          setCurrentUser({
            id: String(profile.id),
            name: profile.fullName || 'Người dùng',
            avatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            handle: `@user_${profile.id}`,
          });
        }
      }).catch(() => {});
    }
  }, [isLoggedIn]);

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

  // Load initial posts (Page 0)
  React.useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      try {
        const { posts, hasNextPage: hasNext } = await fetchPostsApi(0, 10);
        if (isMounted) {
          setFeedPosts(posts);
          setHasNextPage(hasNext);
          setPage(0);
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
      const { posts, hasNextPage: hasNext } = await fetchPostsApi(0, 10);
      setFeedPosts(posts);
      setHasNextPage(hasNext);
      setPage(0);
    } catch (err) {
      console.log('Error refreshing posts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (isFetchingNextPage || !hasNextPage) return;
    setIsFetchingNextPage(true);
    try {
      const nextPage = page + 1;
      const { posts, hasNextPage: hasNext } = await fetchPostsApi(nextPage, 10);
      setFeedPosts((prev) => [...prev, ...posts]);
      setHasNextPage(hasNext);
      setPage(nextPage);
    } catch (error) {
      console.log('Error loading more posts', error);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  const handleReactPost = (postId: string, reaction: any) => {
    // Auth Guard
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

          const newReactionsCount: Record<string, number> = {
            like: 0, love: 0, fire: 0, clap: 0, muscle: 0, trophy: 0,
            ...(p.reactionsCount || {}),
          };

          // Decrement previous reaction count if existed
          if (oldReaction && newReactionsCount[oldReaction] !== undefined) {
            newReactionsCount[oldReaction] = Math.max(0, (newReactionsCount[oldReaction] || 0) - 1);
          }

          // Increment new reaction count
          if (nextReaction) {
            newReactionsCount[nextReaction] = (newReactionsCount[nextReaction] || 0) + 1;
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
    // Fire like API to backend
    likePostApi(postId, reaction || 'like').catch(() => {});
  };

  const handleDeletePostConfirm = (postId: string) => {
    setConfirmModalData({
      visible: true,
      title: 'Xóa bài viết?',
      message: 'Bạn có chắc chắn muốn xóa bài viết này? Thao tác này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa ngay',
      onConfirm: async () => {
        setConfirmModalData((prev) => ({ ...prev, visible: false }));
        // Call API to soft delete
        const success = await deletePostApi(postId);
        if (success) {
          setFeedPosts((prev) => prev.filter((p) => p.id !== postId));
        }
      },
    });
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      renderLikeButton={(postItem) => (
        <LikeButton post={postItem} onReactPost={handleReactPost} />
      )}
      onCommentPress={() => {
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

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingTop: SPACING.md, paddingBottom: SPACING.xl }}>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </View>
      );
    }
    if (!hasNextPage && feedPosts.length > 0) {
      return (
        <View style={styles.endOfFeed}>
          <Text style={styles.endOfFeedText}>Bạn đã xem hết bài viết rồi 🏅</Text>
        </View>
      );
    }
    return <View style={{ height: 100 }} />;
  };

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
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
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
          !isRefreshing && feedPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có bài viết nào.</Text>
              <Text style={styles.emptySubtext}>Hãy là người đầu tiên chia sẻ bài viết của bạn!</Text>
            </View>
          ) : null
        }
      />

      {/* Shared Comment Modal overlay */}
      {commentPostId && (
        <CommentSectionModal
          visible={!!commentPostId}
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
          currentUser={currentUser}
          onCommentAdded={() => {
            setFeedPosts((prev) =>
              prev.map((p) =>
                p.id === commentPostId
                  ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
                  : p
              )
            );
          }}
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
