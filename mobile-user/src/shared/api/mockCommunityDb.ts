import { Post, Comment } from '../../entities/post/model/post.types';

// In-Memory Database State
let posts: Post[] = [
  {
    id: 'post-1',
    type: 'general',
    author: {
      id: 'user-1',
      name: 'Nguyễn Văn Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'user',
    },
    content: 'Hôm nay làm trận bóng phủi căng quá anh em ơi! Sân Green Field chất lượng cỏ rất tốt, hệ thống đèn chiếu sáng ban đêm cực kỳ sáng luôn.',
    imageUrls: [
      'https://images.kingled.vn/data/Product/E4BD7C58-D823-40CB-9071-40E76DC25C3A/gia-den-chieu-sang-san-bong-da-mini.jpg',
    ],
    likeCount: 24,
    commentCount: 3,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 'post-2',
    type: 'ticket',
    author: {
      id: 'owner-1',
      name: 'Chủ Sân Gold Star',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
    },
    content: '🔥 GIỜ VÀNG GIÁ SỐC - XÉ VÉ ĐÁ NGAY 🔥\nHiện tại sân số 3 còn trống khung giờ 17:30 - 19:00 chiều nay. Giảm ngay 30% cho anh em nào chốt nhanh đặt lịch trực tiếp trên app!',
    imageUrls: [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&auto=format&fit=crop&q=60',
    ],
    likeCount: 15,
    commentCount: 2,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    ticketData: {
      venueName: 'Sân bóng đá Gold Star Cầu Giấy',
      price: '350.000đ',
      originalPrice: '500.000đ',
      timeSlot: '17:30 - 19:00',
      date: 'Hôm nay',
      courtType: 'Sân 7 người',
      discount: '30%',
    },
  },
  {
    id: 'post-3',
    type: 'matchmaking',
    author: {
      id: 'user-2',
      name: 'Trần Thanh Sơn',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      role: 'user',
    },
    content: 'Cần tìm đối tác giao lưu bóng rổ 3x3 chiều mai tại Hoop Heaven Park. Trình độ trung bình, giao lưu vui vẻ, chia tiền sân nhẹ nhàng.',
    imageUrls: [],
    likeCount: 8,
    commentCount: 1,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    matchmakingData: {
      sport: 'Bóng rổ',
      time: '18:00 • Chiều mai',
      location: 'Hoop Heaven Park, Thanh Xuân, HN',
      level: 'Trung bình',
      joinedCount: 3,
      maxCount: 6,
      status: 'active',
    },
  },
  {
    id: 'post-4',
    type: 'general',
    author: {
      id: 'user-3',
      name: 'Lê Hoàng Yến',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'user',
    },
    content: 'Trải nghiệm lần đầu chơi Pickleball! Bộ môn này dễ tiếp cận mà vận động cũng toát mồ hôi phết. Ai có hội chơi ở Mỹ Đình cho mình tham gia với nhé 🏸',
    imageUrls: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=700&auto=format&fit=crop&q=60',
    ],
    likeCount: 42,
    commentCount: 5,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
  },
  {
    id: 'post-5',
    type: 'matchmaking',
    author: {
      id: 'user-4',
      name: 'Phạm Minh Đức',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'user',
    },
    content: 'Cáp kèo cầu lông đơn nam tối nay. Mình trình độ khá (Cứng), tìm bạn giao lưu học hỏi cọ xát. Sân đã đặt sẵn lúc 20h.',
    imageUrls: [],
    likeCount: 3,
    commentCount: 0,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    matchmakingData: {
      sport: 'Cầu lông',
      time: '20:00 • Tối nay',
      location: 'Sân Cầu lông Kỳ Đồng, Cầu Giấy',
      level: 'Khá / Cứng',
      joinedCount: 1,
      maxCount: 2,
      status: 'active',
    },
  },
  {
    id: 'post-6',
    type: 'ticket',
    author: {
      id: 'owner-2',
      name: 'Sân Tennis Mỹ Đình',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
    },
    content: 'Chào buổi sáng anh em tennis. Sân số 1 còn trống giờ đẹp sáng mai 8:00 - 10:00. Đặt sớm giảm 20% phí sân, miễn phí nước suối!',
    imageUrls: [
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=700&auto=format&fit=crop&q=60',
    ],
    likeCount: 9,
    commentCount: 1,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hours ago
    ticketData: {
      venueName: 'Khu liên hợp thể thao Mỹ Đình',
      price: '240.000đ',
      originalPrice: '300.000đ',
      timeSlot: '08:00 - 10:00',
      date: 'Ngày mai',
      courtType: 'Sân Tennis Đất nện',
      discount: '20%',
    },
  },
  {
    id: 'post-7',
    type: 'general',
    author: {
      id: 'user-5',
      name: 'Vũ Quốc Trung',
      avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80',
      role: 'user',
    },
    content: 'Trận bóng rổ giao hữu cuối tuần cực kỳ sôi động của CLB. Cảm ơn anh em đã cháy hết mình!',
    imageUrls: [
      'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=700&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=700&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=700&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&auto=format&fit=crop&q=60',
    ],
    likeCount: 55,
    commentCount: 6,
    isLiked: true,
    userReaction: 'love',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
  },
];

let comments: Record<string, Comment[]> = {
  'post-1': [
    {
      id: 'c-1',
      postId: 'post-1',
      author: {
        id: 'user-2',
        name: 'Trần Thanh Sơn',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      content: 'Trận này đá mấy mấy thế ông ơi? Nhìn sân đẹp quá!',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'c-2',
      postId: 'post-1',
      author: {
        id: 'user-1',
        name: 'Nguyễn Văn Nam',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      content: 'Đá sân 7 chia 3 đội ông ơi, chạy mệt phờ râu.',
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: 'c-3',
      postId: 'post-1',
      author: {
        id: 'user-3',
        name: 'Lê Hoàng Yến',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      content: 'Hôm nào cho ké một chân với nhé anh em 👍',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  'post-2': [
    {
      id: 'c-4',
      postId: 'post-2',
      author: {
        id: 'user-4',
        name: 'Phạm Minh Đức',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      content: 'Sân này còn trống ngày mai không chủ thớt ơi?',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'c-5',
      postId: 'post-2',
      author: {
        id: 'owner-1',
        name: 'Chủ Sân Gold Star',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        role: 'owner',
      },
      content: 'Mai bên em trống từ 19:00 nha anh Đức, đặt nhanh kẻo hết ạ.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
  ],
  'post-3': [
    {
      id: 'c-6',
      postId: 'post-3',
      author: {
        id: 'user-5',
        name: 'Vũ Quốc Trung',
        avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80',
        role: 'user',
      },
      content: 'Cho tôi xin 1 slot nhé, đã ib qua trang cá nhân.',
      createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
    },
  ],
};

// Current Logged-in User Mock (matches what's used on HomeScreen/Profile)
export const CURRENT_USER = {
  id: 'current-user-id',
  name: 'Đặng Quang Huy',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  role: 'user' as const,
};

// Simulate Network Latency Helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Database APIs
export const mockCommunityDb = {
  // 1. Fetch Newsfeed with Cursor-based Pagination
  getFeed: async (cursor: string | null, limit: number = 3): Promise<{ data: Post[]; nextCursor: string | null }> => {
    await delay(800); // Simulate network latency

    // Sort posts by date descending
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (!cursor) {
      // First page
      const pageData = sortedPosts.slice(0, limit);
      const nextCursor = sortedPosts.length > limit ? pageData[pageData.length - 1].id : null;
      return { data: pageData, nextCursor };
    }

    // Subsequent pages
    const cursorIndex = sortedPosts.findIndex((p) => p.id === cursor);
    if (cursorIndex === -1) {
      return { data: [], nextCursor: null };
    }

    const startIndex = cursorIndex + 1;
    const pageData = sortedPosts.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < sortedPosts.length ? pageData[pageData.length - 1].id : null;

    return { data: pageData, nextCursor };
  },

  // 2. Create Post
  createPost: async (
    content: string,
    imageUrls: string[],
    type: 'general' | 'matchmaking' | 'ticket' = 'general'
  ): Promise<Post> => {
    await delay(1000); // Simulate upload and processing

    const newPost: Post = {
      id: `post-${Date.now()}`,
      type,
      author: CURRENT_USER,
      content,
      imageUrls,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    comments[newPost.id] = [];
    return newPost;
  },

  // 3. Toggle Like Post (Optimistic friendly)
  toggleLike: async (postId: string): Promise<Post> => {
    await delay(500);

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) throw new Error('Không tìm thấy bài viết');

    const post = posts[postIndex];
    const isLiked = !post.isLiked;
    const likeCount = post.likeCount + (isLiked ? 1 : -1);
    const userReaction: 'like' | 'love' | 'fire' | 'muscle' | 'trophy' | null = isLiked ? 'like' : null;

    const updatedPost = { ...post, isLiked, likeCount, userReaction };
    posts[postIndex] = updatedPost;

    return updatedPost;
  },

  // 3b. React Post (Optimistic friendly)
  reactPost: async (
    postId: string,
    reaction: 'like' | 'love' | 'fire' | 'muscle' | 'trophy' | null
  ): Promise<Post> => {
    await delay(400);

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) throw new Error('Không tìm thấy bài viết');

    const post = posts[postIndex];
    
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

    const updatedPost = {
      ...post,
      isLiked,
      likeCount,
      userReaction: reaction,
    };
    posts[postIndex] = updatedPost;

    return updatedPost;
  },

  // 4. Fetch Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    await delay(400);
    return comments[postId] || [];
  },

  // 5. Add Comment
  addComment: async (postId: string, content: string): Promise<Comment> => {
    await delay(600);

    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) throw new Error('Không tìm thấy bài viết');

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId,
      author: CURRENT_USER,
      content,
      createdAt: new Date().toISOString(),
    };

    if (!comments[postId]) {
      comments[postId] = [];
    }

    comments[postId].push(newComment);
    posts[postIndex].commentCount += 1;

    return newComment;
  },
};
