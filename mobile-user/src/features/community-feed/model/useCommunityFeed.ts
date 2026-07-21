import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchCommunityFeed } from '../api/feedApi';

export function useCommunityFeed() {
  const query = useInfiniteQuery({
    queryKey: ['community-feed'],
    queryFn: ({ pageParam = null }) => fetchCommunityFeed(pageParam as string | null, 4),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
  });

  // Flatten posts across pages
  const posts = query.data ? query.data.pages.flatMap((page) => page.data) : [];

  return {
    posts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
