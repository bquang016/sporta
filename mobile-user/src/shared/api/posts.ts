import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Post } from '../../entities/post';
import { getBaseUrl } from './config';

const getToken = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('accessToken') || '';
  }
  try {
    return (await SecureStore.getItemAsync('accessToken')) || '';
  } catch (error) {
    return '';
  }
};

export const formatTimeAgo = (dateString: string) => {
  if (!dateString) return 'Vừa xong';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
};

export const fetchPostsApi = async (page = 0, size = 10): Promise<{ posts: Post[], hasNextPage: boolean }> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); 

  try {
    const response = await fetch(`${getBaseUrl()}/posts?page=${page}&size=${size}`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Không thể tải bài viết từ Server');
    }

    const rawData = await response.json();
    const content = rawData.content || rawData; // Support both Page and Array structure
    const hasNextPage = rawData.last === false;

    if (Array.isArray(content)) {
      const posts = content.map((item: any) => ({
        id: `backend-post-${item.id}`,
        author: item.author
          ? {
              id: String(item.author.id || 'u-1'),
              name: item.author.fullName || 'Thành viên Sporta',
              avatar: item.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              handle: `@user_${item.author.id || '1'}`,
              isVerified: true,
            }
          : {
              id: 'u-1',
              name: 'Thành viên Sporta',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              handle: '@user_1',
            },
        content: item.content,
        mediaUrls: item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls : undefined,
        createdAt: formatTimeAgo(item.createdAt),
        type: item.type || 'COMMUNITY',
        audience: item.audience || 'PUBLIC',
        sportName: item.sportName,
        venueName: item.venueName,
        timeSlot: item.timeSlot,
        memberFee: item.memberFee,
        promoTitle: item.promoTitle,
        promoCode: item.promoCode,
        discountText: item.discountText,
        likesCount: item.likeCount || 0,
        likeCount: item.likeCount || 0,
        reactionsCount: {
          like: item.likeCount || 0,
          love: 0,
          fire: 0,
          clap: 0,
        },
        userReaction: item.userReaction,
        isLiked: !!item.userReaction,
        commentsCount: item.commentCount || 0,
        sharesCount: item.shareCount || 0,
      }));
      return { posts, hasNextPage };
    }

    return { posts: [], hasNextPage: false };
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('Error fetching backend posts API:', error);
    return { posts: [], hasNextPage: false };
  }
};

export const deletePostApi = async (postId: string): Promise<boolean> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) return false;

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};


export const createPostApi = async (newPostData: Partial<Post>): Promise<Post> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${getBaseUrl()}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: newPostData.content,
        mediaUrls: newPostData.mediaUrls || [],
        type: newPostData.type || 'COMMUNITY',
        audience: newPostData.audience || 'PUBLIC',
        authorId: newPostData.author ? Number(newPostData.author.id) : null,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Tạo bài viết thất bại');
    }

    const item = await response.json();
    return {
      id: `backend-post-${item.id}`,
      author: newPostData.author || {
        id: 'u-1',
        name: 'Thành viên Sporta',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        handle: '@user_1',
      },
      content: item.content,
      mediaUrls: item.mediaUrls,
      createdAt: 'Vừa xong',
      type: item.type || 'COMMUNITY',
      audience: item.audience || 'PUBLIC',
      likesCount: 0,
      likeCount: 0,
      reactionsCount: { like: 0, love: 0, fire: 0, clap: 0 },
      commentsCount: 0,
      sharesCount: 0,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('createPostApi error:', error);
    // Re-throw so caller can handle error (e.g. update progress bar)
    throw error;
  }
};

export const likePostApi = async (postId: string, reactionType?: string): Promise<boolean> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) return true;

  try {
    await fetch(`${getBaseUrl()}/posts/${numericId}/like`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reactionType: reactionType || 'like' }),
    });
    return true;
  } catch (error) {
    return true;
  }
};

export const sharePostApi = async (postId: string): Promise<boolean> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) return true;

  try {
    await fetch(`${getBaseUrl()}/posts/${numericId}/share`, {
      method: 'POST',
      headers,
    });
    return true;
  } catch (error) {
    return true;
  }
};

export const commentPostApi = async (postId: string, content: string): Promise<boolean> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) return true;

  try {
    await fetch(`${getBaseUrl()}/posts/${numericId}/comment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });
    return true;
    return true;
  } catch (error) {
    return true;
  }
};

export const fetchCommentsApi = async (postId: string, page = 0, size = 10): Promise<{ comments: Comment[], hasNextPage: boolean }> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) return { comments: [], hasNextPage: false };

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/comments?page=${page}&size=${size}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return { comments: [], hasNextPage: false };
    }

    const rawData = await response.json();
    const content = rawData.content || rawData;
    const hasNextPage = rawData.last === false;

    if (Array.isArray(content)) {
      const comments = content.map((item: any) => ({
        id: `backend-comment-${item.id}`,
        postId,
        author: item.author
          ? {
              id: String(item.author.id || 'u-1'),
              name: item.author.fullName || 'Thành viên Sporta',
              avatar: item.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              handle: `@user_${item.author.id || '1'}`,
              isVerified: true,
            }
          : {
              id: 'u-1',
              name: 'Thành viên Sporta',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              handle: '@user_1',
            },
        content: item.content,
        createdAt: formatTimeAgo(item.createdAt),
      }));
      return { comments, hasNextPage };
    }
    return { comments: [], hasNextPage: false };
  } catch (error) {
    return { comments: [], hasNextPage: false };
  }
};
