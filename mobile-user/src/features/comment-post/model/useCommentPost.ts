import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockCommunityDb, CURRENT_USER } from '../../../shared/api/mockCommunityDb';
import { Comment, Post } from '../../../entities/post';

interface InfiniteFeedData {
  pages: {
    data: Post[];
    nextCursor: string | null;
  }[];
  pageParams: any[];
}

export function useCommentPost(postId: string) {
  const queryClient = useQueryClient();

  // 1. Fetch Comments Query
  const commentsQuery = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: () => mockCommunityDb.getComments(postId),
    enabled: !!postId,
  });

  // 2. Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => mockCommunityDb.addComment(postId, content),
    // Optimistic Update
    onMutate: async (content: string) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: ['post-comments', postId] });
      await queryClient.cancelQueries({ queryKey: ['community-feed'] });

      // Snapshots
      const previousComments = queryClient.getQueryData<Comment[]>(['post-comments', postId]) || [];
      const previousFeed = queryClient.getQueryData<InfiniteFeedData>(['community-feed']);

      // 2a. Optimistically update comments list
      const tempCommentId = `temp-comment-${Date.now()}`;
      const optimisticComment: Comment = {
        id: tempCommentId,
        postId,
        author: CURRENT_USER,
        content,
        createdAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData<Comment[]>(
        ['post-comments', postId],
        [...previousComments, optimisticComment]
      );

      // 2b. Optimistically update feed post comment count
      if (previousFeed) {
        queryClient.setQueryData<InfiniteFeedData>(
          ['community-feed'],
          {
            ...previousFeed,
            pages: previousFeed.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post.id === postId) {
                  return {
                    ...post,
                    commentCount: post.commentCount + 1,
                  };
                }
                return post;
              }),
            })),
          }
        );
      }

      return { previousComments, previousFeed };
    },
    // Rollback on error
    onError: (err, content, context) => {
      if (context) {
        queryClient.setQueryData(['post-comments', postId], context.previousComments);
        queryClient.setQueryData(['community-feed'], context.previousFeed);
      }
    },
    // Refetch to sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
  });

  return {
    comments: commentsQuery.data || [],
    isCommentsLoading: commentsQuery.isLoading,
    isCommentsError: commentsQuery.isError,
    addComment: addCommentMutation.mutate,
    isSubmittingComment: addCommentMutation.isPending,
  };
}
