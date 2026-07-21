import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mockCommunityDb } from '../../../shared/api/mockCommunityDb';
import { Post } from '../../../entities/post';

interface InfiniteFeedData {
  pages: {
    data: Post[];
    nextCursor: string | null;
  }[];
  pageParams: any[];
}

export function useLikePost() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      postId,
      reaction,
    }: {
      postId: string;
      reaction: 'like' | 'love' | 'fire' | 'muscle' | 'trophy' | null;
    }) => {
      return mockCommunityDb.reactPost(postId, reaction);
    },
    // Optimistic Update
    onMutate: async ({ postId, reaction }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['community-feed'] });

      // Snapshot the previous value
      const previousFeed = queryClient.getQueryData<InfiniteFeedData>(['community-feed']);

      // Optimistically update the cache
      if (previousFeed) {
        queryClient.setQueryData<InfiniteFeedData>(
          ['community-feed'],
          {
            ...previousFeed,
            pages: previousFeed.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post.id === postId) {
                  let isLiked = post.isLiked;
                  let likeCount = post.likeCount;

                  if (reaction === null) {
                    if (isLiked) {
                      isLiked = false;
                      likeCount = Math.max(0, likeCount - 1);
                    }
                  } else {
                    if (!isLiked) {
                      isLiked = true;
                      likeCount += 1;
                    }
                  }

                  return {
                    ...post,
                    isLiked,
                    likeCount,
                    userReaction: reaction,
                  };
                }
                return post;
              }),
            })),
          }
        );
      }

      // Return context with snapshot
      return { previousFeed };
    },
    // If mutation fails, rollback
    onError: (err, variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['community-feed'], context.previousFeed);
      }
    },
    // Always refetch or invalidate after success or error to stay in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });

  return {
    reactPost: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
