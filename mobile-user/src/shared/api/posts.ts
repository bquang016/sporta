import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Post, PostComment } from '../../entities/post';
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

export const fetchPostsApi = async (
  page = 0,
  size = 10,
  tab = 'FOR_YOU',
  sportTag?: string,
  latitude?: number,
  longitude?: number
): Promise<{ posts: Post[], hasNextPage: boolean }> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); 

  try {
    let url = `${getBaseUrl()}/posts/feed?page=${page}&size=${size}&tab=${encodeURIComponent(tab)}`;
    if (sportTag && sportTag !== 'ALL') {
      url += `&sportTag=${encodeURIComponent(sportTag)}`;
    }
    if (latitude != null && longitude != null) {
      url += `&latitude=${latitude}&longitude=${longitude}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'no body');
      console.log(`fetchPostsApi HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      throw new Error(`Không thể tải bài viết từ Server (HTTP ${response.status})`);
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
              avatar: item.author.avatarUrl || '',
              handle: `@user_${item.author.id || '1'}`,
              isVerified: true,
            }
          : {
              id: 'u-1',
              name: 'Thành viên Sporta',
              avatar: '',
              handle: '@user_1',
            },
        content: item.content,
        mediaUrls: item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls : undefined,
        backgroundGradient: item.backgroundGradient
          ? (Array.isArray(item.backgroundGradient)
              ? item.backgroundGradient
              : String(item.backgroundGradient).split(','))
          : undefined,
        backgroundId: item.backgroundId,
        createdAt: formatTimeAgo(item.createdAt),
        type: item.type || 'COMMUNITY',
        audience: item.audience || 'PUBLIC',
        clubInfo: item.clubInfo,
        matchRoomId: item.matchRoomId,
        sportName: item.sportName,
        venueId: item.venueId || (item.venue ? item.venue.id : undefined),
        venueName: item.venueName,
        venue: item.venue,
        timeSlot: item.timeSlot,
        playDate: item.playDate,
        startTime: item.startTime,
        endTime: item.endTime,
        targetLevel: item.targetLevel,
        slotsNeeded: item.slotsNeeded || 0,
        currentSlots: item.currentSlots || 0,
        matchStatus: item.matchStatus || 'OPEN',
        isJoined: item.isJoined === true,
        memberFee: item.memberFee,
        memberFeeAmount: item.memberFeeAmount,
        totalPrice: item.totalPrice,
        note: item.note,
        currency: item.currency || 'VND',
        promoTitle: item.promoTitle,
        promoCode: item.promoCode,
        discountText: item.discountText,
        voucher: item.voucher,
        validUntil: item.validUntil,
        likesCount: item.likeCount || 0,
        likeCount: item.likeCount || 0,
        reactionsCount: item.reactionsCount || {
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

export const joinMatchApi = async (postId: string): Promise<{ success: boolean; message: string; currentSlots?: number; matchStatus?: string }> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) {
    return { success: false, message: 'ID bài viết không hợp lệ' };
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/join`, {
      method: 'POST',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Không thể tham gia kèo' };
    }
    return {
      success: true,
      message: data.message || 'Ghép kèo thành công',
      currentSlots: data.currentSlots,
      matchStatus: data.matchStatus,
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'Lỗi kết nối máy chủ' };
  }
};

export const leaveMatchApi = async (postId: string): Promise<{ success: boolean; message: string; currentSlots?: number; matchStatus?: string }> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) {
    return { success: false, message: 'ID bài viết không hợp lệ' };
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/leave`, {
      method: 'DELETE',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Không thể rời kèo' };
    }
    return {
      success: true,
      message: data.message || 'Đã rời kèo thành công',
      currentSlots: data.currentSlots,
      matchStatus: data.matchStatus,
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'Lỗi kết nối máy chủ' };
  }
};

export const fetchMatchParticipantsApi = async (postId: string): Promise<any[]> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const numericId = postId.replace('backend-post-', '').replace('local-post-', '');
  if (!numericId || isNaN(Number(numericId))) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/participants`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const deletePostApi = async (postId: string): Promise<boolean> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) return true;

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}`, {
      method: 'DELETE',
      headers,
    });
    return response.ok || response.status === 404;
  } catch (error) {
    return true;
  }
};

export const extractNumericPostId = (postId: string | number): number | null => {
  if (typeof postId === 'number') return postId;
  if (!postId) return null;
  const str = String(postId);

  if (/^\d+$/.test(str)) return Number(str);

  const cleanStr = str
    .replace(/^backend-post-/, '')
    .replace(/^local-post-/, '')
    .replace(/^post-/, '')
    .replace(/^match-/, '');

  if (/^\d+$/.test(cleanStr)) {
    return Number(cleanStr);
  }

  const match = cleanStr.match(/\d+/);
  if (match) {
    return Number(match[0]);
  }

  return null;
};

export const editPostApi = async (
  postId: string,
  content: string,
  mediaUrls?: string[]
): Promise<{ success: boolean; message: string }> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) {
    // Local / mock post fallback
    return { success: true, message: 'Chỉnh sửa bài viết thành công' };
  }

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        content,
        mediaUrls: mediaUrls || [],
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        // Post only exists locally
        return { success: true, message: 'Chỉnh sửa bài viết thành công' };
      }
      return { success: false, message: data.message || 'Không thể chỉnh sửa bài viết' };
    }
    return { success: true, message: data.message || 'Chỉnh sửa bài viết thành công' };
  } catch (error: any) {
    return { success: true, message: 'Chỉnh sửa bài viết thành công' };
  }
};

export const updatePostAudienceApi = async (
  postId: string,
  audience: 'PUBLIC' | 'CLUB',
  clubId?: number | string
): Promise<{ success: boolean; message: string }> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) {
    // Local / mock post fallback
    return { success: true, message: 'Cập nhật đối tượng xem thành công' };
  }

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/audience`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        audience,
        clubId: clubId ? Number(clubId) : null,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, message: 'Cập nhật đối tượng xem thành công' };
      }
      return { success: false, message: data.message || 'Không thể cập nhật đối tượng xem' };
    }
    return { success: true, message: data.message || 'Cập nhật đối tượng xem thành công' };
  } catch (error: any) {
    return { success: true, message: 'Cập nhật đối tượng xem thành công' };
  }
};

export const hidePostApi = async (postId: string): Promise<{ success: boolean; message: string }> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) {
    return { success: true, message: 'Đã ẩn bài viết thành công' };
  }

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/hide`, {
      method: 'POST',
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, message: 'Đã ẩn bài viết thành công' };
      }
      return { success: false, message: data.message || 'Không thể ẩn bài viết' };
    }
    return { success: true, message: data.message || 'Đã ẩn bài viết thành công' };
  } catch (error: any) {
    return { success: true, message: 'Đã ẩn bài viết thành công' };
  }
};

export const unhidePostApi = async (postId: string): Promise<{ success: boolean; message: string }> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) {
    return { success: true, message: 'Đã hoàn tác ẩn bài viết' };
  }

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/posts/${numericId}/unhide`, {
      method: 'POST',
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, message: 'Đã hoàn tác ẩn bài viết' };
      }
      return { success: false, message: data.message || 'Không thể hoàn tác ẩn bài viết' };
    }
    return { success: true, message: data.message || 'Đã hoàn tác ẩn bài viết' };
  } catch (error: any) {
    return { success: true, message: 'Đã hoàn tác ẩn bài viết' };
  }
};


export const createPostApi = async (newPostData: Partial<Post> & Record<string, any>): Promise<Post> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${getBaseUrl()}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: newPostData.content,
        mediaUrls: newPostData.mediaUrls || [],
        backgroundGradient: newPostData.backgroundGradient,
        backgroundId: newPostData.backgroundId,
        type: newPostData.type || 'COMMUNITY',
        audience: newPostData.audience || 'PUBLIC',
        authorId: newPostData.author ? Number(newPostData.author.id) : null,
        clubInfo: newPostData.clubInfo,
        clubId: newPostData.clubInfo ? Number(newPostData.clubInfo.id) : (newPostData.clubId ? Number(newPostData.clubId) : null),
        matchRoomId: newPostData.matchRoomId,
        sportName: newPostData.sportName,
        venueName: newPostData.venueName,
        venueId: newPostData.venueId || (newPostData.venue ? newPostData.venue.id : null),
        timeSlot: newPostData.timeSlot,
        playDate: newPostData.playDate,
        startTime: newPostData.startTime,
        endTime: newPostData.endTime,
        targetLevel: newPostData.targetLevel,
        slotsNeeded: newPostData.slotsNeeded,
        totalPrice: newPostData.totalPrice,
        note: newPostData.note,
        memberFee: newPostData.memberFee,
        memberFeeAmount: newPostData.memberFeeAmount,
        currency: newPostData.currency || 'VND',
        promoTitle: newPostData.promoTitle,
        promoCode: newPostData.promoCode,
        discountText: newPostData.discountText,
        voucherId: newPostData.voucherId || (newPostData.voucher ? newPostData.voucher.id : null),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Tạo bài viết thất bại');
    }

    const item = await response.json();
    return {
      id: `backend-post-${item.id}`,
      author: newPostData.author || {
        id: 'u-1',
        name: 'Thành viên Sporta',
        avatar: '',
        handle: '@user_1',
      },
      content: item.content || newPostData.content,
      mediaUrls: item.mediaUrls || newPostData.mediaUrls,
      backgroundGradient: item.backgroundGradient || newPostData.backgroundGradient,
      backgroundId: item.backgroundId || newPostData.backgroundId,
      createdAt: 'Vừa xong',
      type: item.type || newPostData.type || 'COMMUNITY',
      audience: item.audience || newPostData.audience || 'PUBLIC',
      clubInfo: item.clubInfo || newPostData.clubInfo,
      sportName: item.sportName || newPostData.sportName,
      venueName: item.venueName || newPostData.venueName,
      venue: item.venue || newPostData.venue,
      timeSlot: item.timeSlot || newPostData.timeSlot,
      playDate: item.playDate || newPostData.playDate,
      startTime: item.startTime || newPostData.startTime,
      endTime: item.endTime || newPostData.endTime,
      targetLevel: item.targetLevel || newPostData.targetLevel,
      slotsNeeded: item.slotsNeeded || newPostData.slotsNeeded || 0,
      currentSlots: item.currentSlots || 0,
      totalPrice: item.totalPrice || newPostData.totalPrice,
      note: item.note || newPostData.note,
      matchStatus: item.matchStatus || 'OPEN',
      isJoined: false,
      memberFee: item.memberFee || newPostData.memberFee,
      memberFeeAmount: item.memberFeeAmount || newPostData.memberFeeAmount,
      promoTitle: item.promoTitle,
      promoCode: item.promoCode,
      discountText: item.discountText,
      voucher: item.voucher,
      likesCount: 0,
      likeCount: 0,
      reactionsCount: { like: 0, love: 0, fire: 0, clap: 0 },
      commentsCount: 0,
      sharesCount: 0,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('createPostApi error:', error);
    throw error;
  }
};

export const likePostApi = async (postId: string, reactionType?: string | null): Promise<boolean> => {
  const numericId = extractNumericPostId(postId);
  console.log('[LIKE-DEBUG] likePostApi called: postId=', postId, 'numericId=', numericId, 'reactionType=', reactionType);
  if (numericId === null) {
    console.log('[LIKE-DEBUG] numericId is null, skipping API call');
    return true;
  }

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isUnlike = reactionType === null || reactionType === 'unlike';
  const payload = isUnlike
    ? { action: 'unlike', reactionType: null }
    : { action: 'react', reactionType: reactionType || 'like' };

  const url = `${getBaseUrl()}/posts/${numericId}/like`;
  console.log('[LIKE-DEBUG] Sending POST to:', url, 'payload:', JSON.stringify(payload));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    console.log('[LIKE-DEBUG] Response status:', response.status);
    return true;
  } catch (error) {
    console.error('[LIKE-DEBUG] ERROR:', error);
    return true;
  }
};

export const sharePostApi = async (postId: string): Promise<boolean> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) return true;

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
  const numericId = extractNumericPostId(postId);
  if (numericId === null) return true;

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch(`${getBaseUrl()}/posts/${numericId}/comment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });
    return true;
  } catch (error) {
    return true;
  }
};

export const fetchCommentsApi = async (postId: string, page = 0, size = 10): Promise<{ comments: PostComment[], hasNextPage: boolean }> => {
  const numericId = extractNumericPostId(postId);
  if (numericId === null) return { comments: [], hasNextPage: false };

  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
              avatar: item.author.avatarUrl || '',
              handle: `@user_${item.author.id || '1'}`,
              isVerified: true,
            }
          : {
              id: 'u-1',
              name: 'Thành viên Sporta',
              avatar: '',
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
