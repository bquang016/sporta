import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostComment } from '../../../entities/post/model/post.types';
import { commentPostApi, fetchCommentsApi } from '../../../shared/api/posts';

export function useCommentPost(postId: string, currentUser?: any) {
  const queryClient = useQueryClient();

  // 1. Fetch Comments with Infinite Query
  const commentsQuery = useInfiniteQuery({
    queryKey: ['post-comments', postId],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchCommentsApi(postId, pageParam, 10);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasNextPage) {
        return allPages.length;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!postId,
  });

  const comments = commentsQuery.data?.pages.flatMap((page) => page.comments) || [];

  // 2. Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      // Real API call to save comment
      await commentPostApi(postId, content);
      
      const newComment: PostComment = {
        id: `temp-comment-${Date.now()}`,
        postId,
        author: currentUser || {
          id: 'current-user',
          name: 'Thành viên Sporta',
          avatar: '',
          handle: '@user',
        },
        content,
        createdAt: 'Vừa xong',
      };
      return newComment;
    },
    // Optimistic Update
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ['post-comments', postId] });

      const optimisticComment: PostComment = {
        id: `temp-${Date.now()}`,
        postId,
        author: currentUser || {
          id: 'current-user',
          name: 'Thành viên Sporta',
          avatar: '',
          handle: '@user',
        },
        content,
        createdAt: 'Vừa xong',
      };

      queryClient.setQueryData(['post-comments', postId], (oldData: any) => {
        if (!oldData) {
          return {
            pages: [{ comments: [optimisticComment], hasNextPage: false }],
            pageParams: [0],
          };
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => 
            index === 0 
              ? { ...page, comments: [optimisticComment, ...page.comments] }
              : page
          )
        };
      });

      return { optimisticComment };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
  });

  return {
    comments,
    isCommentsLoading: commentsQuery.isLoading,
    isFetchingNextPage: commentsQuery.isFetchingNextPage,
    hasNextPage: commentsQuery.hasNextPage,
    fetchNextPage: commentsQuery.fetchNextPage,
    isCommentsError: commentsQuery.isError,
    addComment: addCommentMutation.mutate,
    isSubmittingComment: addCommentMutation.isPending,
  };
}
