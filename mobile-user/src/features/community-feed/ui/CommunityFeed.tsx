import React, { useState, useCallback } from 'react';
import { Platform, View, Text, StyleSheet, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { LikeButton, useReactionOverlay } from '../../like-post';
import { CommentSectionModal } from '../../comment-post';
import { UserProfileModal } from '../../user-profile';
import {
  PostCard,
  Post,
  ClubInfoData,
  PostOptionsMenuModal,
  EditPostModal,
  ChangeAudienceModal,
  ReportPostModal,
  ClubInfoModal,
  SharePostModal,
} from '../../../entities/post';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { VenueDetailModal } from '../../../features/venue-detail';
import { fetchActiveFacilities } from '../../../entities/facility/api/facilityApi';
import { CustomConfirmModal } from '../../../shared/ui/CustomConfirmModal';
import { AuthRequiredModal } from '../../../shared/ui/AuthRequiredModal';
import { useIsLoggedIn } from '../../../shared/hooks/useIsLoggedIn';
import {
  fetchPostsApi,
  likePostApi,
  sharePostApi,
  deletePostApi,
  joinMatchApi,
  leaveMatchApi,
  hidePostApi,
  unhidePostApi,
} from '../../../shared/api/posts';
import { getJoinedClubsApi } from '../../../shared/api/clubs';
import { usersApi } from '../../../shared/api/users';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { PostCardSkeleton } from './PostCardSkeleton';

const SafeFlashList = FlashList as any;

interface CommunityFeedProps {
  tab?: string;
  sportTag?: string;
  latitude?: number;
  longitude?: number;
  newCreatedPost?: Post | null;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentContainerStyle?: any;
}

export function CommunityFeed({
  tab = 'FOR_YOU',
  sportTag = 'ALL',
  latitude,
  longitude,
  newCreatedPost,
  onScroll,
  contentContainerStyle,
}: CommunityFeedProps) {
  const overlay = useReactionOverlay();
  const router = useRouter();
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
            avatar: profile.avatarUrl || '',
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
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [menuPost, setMenuPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [changingAudiencePost, setChangingAudiencePost] = useState<Post | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
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

  // Load initial posts when tab, sportTag or GPS change
  React.useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      try {
        const { posts, hasNextPage: hasNext } = await fetchPostsApi(0, 10, tab, sportTag, latitude, longitude);
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
  }, [tab, sportTag, latitude, longitude]);

  const listRef = React.useRef<any>(null);

  // Prepend newly created post from parent modal (Optimistic Update)
  React.useEffect(() => {
    if (newCreatedPost) {
      setFeedPosts((prev) => {
        // 1. Check if exact ID exists
        const index = prev.findIndex((p) => p.id === newCreatedPost.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = newCreatedPost;
          return updated;
        }
        // 2. Check if an optimistic post is already in progress
        const optIndex = prev.findIndex((p) => p.id.startsWith('optimistic-') && p.isUploading);
        if (optIndex >= 0 && !newCreatedPost.id.startsWith('optimistic-')) {
          const updated = [...prev];
          updated[optIndex] = newCreatedPost;
          return updated;
        }
        // 3. Otherwise prepend new post
        return [newCreatedPost, ...prev];
      });

      // Only auto-scroll to top ONCE on initial post creation
      if (newCreatedPost.isUploading && (newCreatedPost.uploadProgress || 0) <= 30) {
        setTimeout(() => {
          try {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
          } catch {}
        }, 80);
      }
    }
  }, [newCreatedPost]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { posts, hasNextPage: hasNext } = await fetchPostsApi(0, 10, tab, sportTag, latitude, longitude);
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
      const { posts, hasNextPage: hasNext } = await fetchPostsApi(nextPage, 10, tab, sportTag, latitude, longitude);
      setFeedPosts((prev) => [...prev, ...posts]);
      setHasNextPage(hasNext);
      setPage(nextPage);
    } catch (error) {
      console.log('Error loading more posts', error);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  const handleJoinMatch = async (post: Post) => {
    if (!isLoggedIn) {
      setAuthModal({
        visible: true,
        actionTitle: 'Đăng nhập để ghép kèo',
        actionDescription: 'Bạn cần đăng nhập tài khoản để gửi đơn ghép kèo.',
        actionIcon: 'flash-outline',
      });
      return;
    }

    // If this is a Club Match Finding Post (MATCH_FINDING)
    if (post.type === 'MATCH_FINDING' || post.matchRoomId) {
      try {
        const clubs = await getJoinedClubsApi();
        const postSport = (post.sportName || '').toLowerCase().trim();

        // 1. Check same sport
        const sameSportClubs = (clubs || []).filter((c: any) => {
          const cSport = (c.sport || c.sportName || '').toLowerCase().trim();
          return cSport.includes(postSport) || postSport.includes(cSport);
        });

        if (sameSportClubs.length === 0) {
          setConfirmModalData({
            visible: true,
            title: 'Khác môn thể thao',
            message: `Bài đăng ghép kèo thuộc môn "${post.sportName || 'thể thao'}".\n\nBạn chưa tham gia Câu lạc bộ nào thuộc môn này để đại diện gửi đơn ghép kèo.`,
            type: 'warning',
            confirmText: 'Đã hiểu',
            onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
          });
          return;
        }

        // 2. Check if user is Trưởng nhóm or Phó nhóm (ADMIN or SUB_LEADER)
        const leaderClubs = sameSportClubs.filter((c: any) =>
          c.userStatus === 'ADMIN' ||
          c.userStatus === 'SUB_LEADER' ||
          c.role === 'ADMIN' ||
          c.role === 'SUB_LEADER' ||
          c.role === 'Trưởng nhóm' ||
          c.role === 'Phó nhóm'
        );

        if (leaderClubs.length === 0) {
          setConfirmModalData({
            visible: true,
            title: 'Chưa có quyền Trưởng/Phó nhóm',
            message: `Chỉ **Trưởng nhóm** hoặc **Phó nhóm** mới có quyền đại diện CLB gửi đơn ghép kèo thi đấu.\n\nBạn hiện là thành viên thường trong các CLB môn ${post.sportName || ''}.`,
            type: 'warning',
            confirmText: 'Đã hiểu',
            onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
          });
          return;
        }

        // 3. Check if user is host club
        const hostClubId = post.clubInfo?.id || (post as any).clubId;
        const nonHostLeaderClubs = leaderClubs.filter((c: any) =>
          hostClubId ? String(c.id) !== String(hostClubId) : true
        );

        if (nonHostLeaderClubs.length === 0) {
          setConfirmModalData({
            visible: true,
            title: 'Chủ phòng ghép kèo',
            message: 'Bạn là Ban quản trị của CLB tạo bài đăng này. Bạn có muốn vào thẳng phòng ghép trận để quản lý các lời thách đấu không?',
            type: 'warning',
            confirmText: 'Vào phòng đấu',
            onConfirm: () => {
              setConfirmModalData((prev) => ({ ...prev, visible: false }));
              if (post.matchRoomId) {
                router.push(`/matchmaking/${post.matchRoomId}` as any);
              }
            },
          });
          return;
        }

        // 4. Eligible -> Navigate directly to Match Detail room to select club & send join request!
        if (post.matchRoomId) {
          router.push(`/matchmaking/${post.matchRoomId}` as any);
        } else {
          setConfirmModalData({
            visible: true,
            title: 'Phòng đấu chưa sẵn sàng',
            message: 'Không tìm thấy mã phòng ghép trận của bài viết này.',
            type: 'warning',
            confirmText: 'Đã hiểu',
            onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
          });
        }
      } catch (err: any) {
        setConfirmModalData({
          visible: true,
          title: 'Lỗi nạp thông tin CLB',
          message: err.message || 'Không thể kiểm tra thông tin câu lạc bộ của bạn.',
          type: 'danger',
          confirmText: 'Đã hiểu',
          onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
        });
      }
      return;
    }

    // Optimistic Update for individual pickup matches
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              isJoined: true,
              currentSlots: (p.currentSlots || 0) + 1,
            }
          : p
      )
    );

    const result = await joinMatchApi(post.id);
    if (!result.success) {
      // Rollback on failure
      setFeedPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isJoined: false,
                currentSlots: Math.max(0, (p.currentSlots || 1) - 1),
              }
            : p
        )
      );

      setConfirmModalData({
        visible: true,
        title: 'Không thể ghép kèo',
        message: result.message || 'Kèo đấu đã đủ người hoặc không còn nhận thêm thành viên.',
        type: 'warning',
        confirmText: 'Đã hiểu',
        onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
      });
    } else {
      setConfirmModalData({
        visible: true,
        title: 'Ghép kèo thành công!',
        message: 'Bạn đã đăng ký tham gia kèo đấu thành công. Hãy đến sân đúng giờ nhé!',
        type: 'success',
        confirmText: 'Tuyệt vời',
        onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const handleLeaveMatch = async (post: Post) => {
    setConfirmModalData({
      visible: true,
      title: 'Rời khỏi kèo đấu?',
      message: 'Bạn có chắc chắn muốn hủy đăng ký tham gia kèo đấu này không?',
      type: 'warning',
      confirmText: 'Rời kèo',
      onConfirm: async () => {
        setConfirmModalData((prev) => ({ ...prev, visible: false }));

        // Optimistic Update
        setFeedPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  isJoined: false,
                  currentSlots: Math.max(0, (p.currentSlots || 1) - 1),
                }
              : p
          )
        );

        const result = await leaveMatchApi(post.id);
        if (!result.success) {
          // Rollback on failure
          setFeedPosts((prev) =>
            prev.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    isJoined: true,
                    currentSlots: (p.currentSlots || 0) + 1,
                  }
                : p
            )
          );
        }
      },
    });
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
    likePostApi(postId, reaction).catch(() => {});
  };

  const handleEditPostSuccess = (updatedData: { content: string; mediaUrls: string[] }) => {
    if (!editingPost) return;
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              content: updatedData.content,
              mediaUrls:
                updatedData.mediaUrls && updatedData.mediaUrls.length > 0
                  ? updatedData.mediaUrls
                  : undefined,
            }
          : p
      )
    );
    setConfirmModalData({
      visible: true,
      title: 'Chỉnh sửa bài viết',
      message: 'Bài viết của bạn đã được cập nhật thành công.',
      type: 'success',
      confirmText: 'Tuyệt vời',
      onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleChangeAudienceSuccess = (
    newAudience: 'PUBLIC' | 'CLUB',
    newClubInfo?: { id: string; name: string; avatar?: string }
  ) => {
    if (!changingAudiencePost) return;
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === changingAudiencePost.id
          ? {
              ...p,
              audience: newAudience,
              clubInfo: newAudience === 'CLUB' ? (newClubInfo as any) : undefined,
            }
          : p
      )
    );
    setConfirmModalData({
      visible: true,
      title: 'Đối tượng xem',
      message:
        newAudience === 'CLUB'
          ? `Bài viết hiện chỉ hiển thị với các thành viên CLB ${newClubInfo?.name || ''}.`
          : 'Bài viết hiện đã được chuyển sang chế độ Công khai.',
      type: 'success',
      confirmText: 'Đã hiểu',
      onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleHidePost = (post: Post) => {
    setHiddenPostIds((prev) => (prev.includes(post.id) ? prev : [...prev, post.id]));
    hidePostApi(post.id).catch((err) => console.warn('hidePostApi error:', err));
  };

  const handleUndoHide = (postId: string) => {
    setHiddenPostIds((prev) => prev.filter((id) => id !== postId));
    unhidePostApi(postId).catch((err) => console.warn('unhidePostApi error:', err));
  };

  const handleCopyLink = (post: Post) => {
    setConfirmModalData({
      visible: true,
      title: 'Đã sao chép liên kết',
      message: 'Liên kết bài viết đã được lưu vào bộ nhớ tạm của bạn.',
      type: 'success',
      confirmText: 'Đóng',
      onConfirm: () => setConfirmModalData((prev) => ({ ...prev, visible: false })),
    });
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

  const renderItem = ({ item }: { item: Post }) => {
    const isHidden = hiddenPostIds.includes(item.id);

    if (isHidden) {
      return (
        <View style={styles.hiddenPostCard}>
          <View style={styles.hiddenPostLeft}>
            <View style={styles.hiddenPostIconCircle}>
              <Ionicons name="eye-off-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.hiddenPostTextGroup}>
              <Text style={styles.hiddenPostTitle}>Đã ẩn bài viết khỏi bảng tin</Text>
              <Text style={styles.hiddenPostSubtitle}>
                Bài viết này sẽ không xuất hiện trên Bảng tin của bạn nữa.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.inlineUndoBtn}
            activeOpacity={0.7}
            onPress={() => handleUndoHide(item.id)}
          >
            <Text style={styles.inlineUndoBtnText}>Hoàn tác</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <PostCard
        post={item}
        onReactPost={handleReactPost}
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
      onVenuePress={(venueId, venueName) => {
        if (venueId) {
          setSelectedVenueId(String(venueId));
        } else {
          fetchActiveFacilities()
            .then((facilities) => {
              if (facilities && facilities.length > 0) {
                if (venueName) {
                  const normalizedVenueName = venueName.toLowerCase();
                  const matched = facilities.find((f: any) =>
                    normalizedVenueName.includes(f.name.toLowerCase()) ||
                    f.name.toLowerCase().includes(normalizedVenueName.split(' - ')[0].toLowerCase())
                  );
                  setSelectedVenueId(String(matched?.id || facilities[0].id));
                } else {
                  setSelectedVenueId(String(facilities[0].id));
                }
              }
            })
            .catch(() => {});
        }
      }}
      onOptionPress={(postToOption) => setMenuPost(postToOption)}
      onJoinMatch={handleJoinMatch}
      onLeaveMatch={handleLeaveMatch}
    />
  );
};

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
          <Text style={styles.endOfFeedText}>Bạn đã xem hết bài viết rồi</Text>
        </View>
      );
    }
    return <View style={{ height: 100 }} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeFlashList
        ref={listRef}
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

      {/* Floating Venue Detail Modal */}
      {selectedVenueId && (
        <VenueDetailModal
          visible={!!selectedVenueId}
          venueId={selectedVenueId}
          onClose={() => setSelectedVenueId(null)}
          onBookNow={(venueId) => router.push(('/booking/' + venueId) as any)}
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
            }
          }}
        />
      )}

      {/* Post 3-Dots Options Menu Modal */}
      <PostOptionsMenuModal
        visible={!!menuPost}
        post={menuPost}
        currentUserId={currentUser?.id || 'current-user'}
        onClose={() => setMenuPost(null)}
        onEditPost={(post) => setEditingPost(post)}
        onChangeAudience={(post) => setChangingAudiencePost(post)}
        onHidePost={handleHidePost}
        onDeletePost={handleDeletePostConfirm}
        onReportPost={(postId) => setReportPostId(postId)}
        onCopyLink={handleCopyLink}
      />

      {/* Edit Post Modal (Only for normal posts, no new images allowed) */}
      <EditPostModal
        visible={!!editingPost}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSaveSuccess={handleEditPostSuccess}
      />

      {/* Change Audience Modal (Public / Club) */}
      <ChangeAudienceModal
        visible={!!changingAudiencePost}
        post={changingAudiencePost}
        onClose={() => setChangingAudiencePost(null)}
        onSaveSuccess={handleChangeAudienceSuccess}
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
  hiddenPostCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginVertical: 6,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hiddenPostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  hiddenPostIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenPostTextGroup: {
    flex: 1,
    gap: 2,
  },
  hiddenPostTitle: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  hiddenPostSubtitle: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  inlineUndoBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
  },
  inlineUndoBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
