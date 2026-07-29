import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Post } from '../../entities/post';
import { MOCK_POSTS } from './mockCommunityDb';
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

export const fetchPostsApi = async (): Promise<Post[]> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast fallback

  try {
    const response = await fetch(`${getBaseUrl()}/posts`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Không thể tải bài viết từ Server');
    }

    const rawData = await response.json();

    if (Array.isArray(rawData) && rawData.length > 0) {
      // Map Backend Entity to Frontend Post format
      return rawData.map((item: any) => ({
        id: `backend-post-${item.id}`,
        author: item.author
          ? {
              id: String(item.author.id || 'u-1'),
              name: item.author.fullName || 'Thành viên Sporta',
              avatar: item.author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              handle: `@user_${item.author.id || '1'}`,
              isVerified: true,
            }
          : MOCK_POSTS[0].author,
        content: item.content,
        mediaUrls: item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls : undefined,
        createdAt: item.createdAt ? 'Vừa xong' : '1 giờ trước',
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
        commentsCount: item.commentCount || 0,
        sharesCount: item.shareCount || 0,
      }));
    }

    return MOCK_POSTS;
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('Using local mock posts fallback:', error);
    return MOCK_POSTS;
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
      author: newPostData.author || MOCK_POSTS[0].author,
      content: item.content,
      mediaUrls: item.mediaUrls,
      createdAt: 'Vừa xong',
      type: item.type || 'COMMUNITY',
      audience: item.audience || 'PUBLIC',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('Created post locally fallback:', error);
    return {
      id: `local-post-${Date.now()}`,
      author: newPostData.author || MOCK_POSTS[0].author,
      content: newPostData.content || '',
      mediaUrls: newPostData.mediaUrls,
      createdAt: 'Vừa xong',
      type: newPostData.type || 'COMMUNITY',
      audience: newPostData.audience || 'PUBLIC',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    };
  }
};

export const likePostApi = async (postId: string): Promise<boolean> => {
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
    });
    return true;
  } catch (error) {
    return true;
  }
};
