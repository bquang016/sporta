import { mockCommunityDb } from '../../../shared/api/mockCommunityDb';
import { Post } from '../../../entities/post';

export const fetchCommunityFeed = async (
  cursor: string | null = null,
  limit: number = 3
): Promise<{ data: Post[]; nextCursor: string | null }> => {
  return mockCommunityDb.getFeed(cursor, limit);
};
