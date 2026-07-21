import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useCommunityFeed } from '../model/useCommunityFeed';
import { LikeButton } from '../../like-post';
import { CommentSectionModal } from '../../comment-post';
import { PostCard, PostSkeleton } from '../../../entities/post';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';

const SafeFlashList = FlashList as any;

export function CommunityFeed() {
  const {
    posts,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useCommunityFeed();

  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  // 1. Refresh feed
  const handleRefresh = async () => {
    await refetch();
  };

  // 2. Load more posts when reaching bottom
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render individual item
  const renderItem = ({ item }: { item: typeof posts[0] }) => (
    <PostCard
      post={item}
      renderLikeButton={(postItem) => <LikeButton post={postItem} />}
      onCommentPress={() => setCommentPostId(item.id)}
      onTicketPress={() => alert(`Đặt mua vé thành công cho sân:\n${item.ticketData?.venueName}`)}
      onJoinMatchPress={() => alert(`Đăng ký tham gia ghép trận thành công!`)}
    />
  );

  // Footer loader / end info
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <PostSkeleton />
        </View>
      );
    }
    if (!hasNextPage && posts.length > 0) {
      return (
        <View style={styles.endOfFeed}>
          <Text style={styles.endOfFeedText}>Bạn đã xem hết tin tức rồi 🏅</Text>
        </View>
      );
    }
    return null;
  };

  // Initial Loading state
  if (isLoading && !isRefetching) {
    return (
      <View style={styles.loadingContainer}>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Đã có lỗi xảy ra khi tải bảng tin.</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          Thử lại
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeFlashList
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={350}
        keyExtractor={(item: any) => item.id}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào.</Text>
            <Text style={styles.emptySubtext}>Hãy là người đầu tiên đăng bài viết của bạn!</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120, // space to avoid clipping with tab bar
  },
  loadingContainer: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.errorText,
    textAlign: 'center',
  },
  retryText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    textDecorationLine: 'underline',
  },
  footerLoader: {
    paddingVertical: SPACING.sm,
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
