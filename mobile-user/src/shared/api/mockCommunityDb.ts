import { Post, AuthorUser as User, Comment } from '../../entities/post';

export const CURRENT_USER: User = {
  id: 'current-user',
  name: 'Bùi Quang',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  handle: '@bquang_sporta',
};

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    author: {
      id: 'quanluu08',
      name: 'Quan Luu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      handle: '@quanluu08',
    },
    content: 'Kèo này hấp dẫn quá anh em ơi! Cho mình xin 1 suất với nhé 🏸🔥',
    createdAt: '15 phút trước',
    likesCount: 5,
    isLiked: true,
  },
  {
    id: 'c-2',
    author: {
      id: 'user-1',
      name: 'Nguyễn Văn Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      handle: '@namvugi',
    },
    content: 'Sân Cầu Giấy đánh buổi tối cực thoáng mát, anh em vào nhanh kẻo hết chỗ!',
    createdAt: '10 phút trước',
    likesCount: 2,
    isLiked: false,
  },
];

export const MOCK_POSTS: Post[] = [
  // 1. Match Finding - Pickleball (Yellow tint + Paddle Watermark)
  {
    id: 'post-match-pickleball-1',
    author: {
      id: 'user-1',
      name: 'Nguyễn Văn Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      handle: '@namvugi',
    },
    audience: 'PUBLIC',
    content: 'Tối nay nhóm mình còn thiếu 2 tay vợt Pickleball trình DUPR 3.0 - 3.5 đánh đôi giao lưu. Sân đẹp, đèn sáng, có nước mát miễn phí. Anh em rảnh tay vào cáp kèo chiến luôn nhé! 🏓⚡',
    type: 'MATCH_FINDING',
    matchAttachment: {
      matchId: 'm-101',
      sportName: 'Pickleball',
      timeSlot: '19:30 - 21:00 • Tối nay',
      level: 'DUPR 3.0 - 3.5 (Trình Khá)',
      pricePerSlot: '45.000đ / người',
      slotsLeft: 2,
      venueName: 'Sân Pickleball Cầu Giấy',
    },
    createdAt: '1 giờ trước',
    reactionsCount: { like: 15, love: 4, fire: 19, clap: 2 },
    userReaction: 'like',
    commentsCount: 8,
    sharesCount: 1,
    comments: MOCK_COMMENTS,
  },

  // 2. Match Finding - Football (White/Gray tint + Soccer Ball Watermark)
  {
    id: 'post-match-football-1',
    author: {
      id: 'quanluu08',
      name: 'Quan Luu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      handle: '@quanluu08',
    },
    audience: 'PUBLIC',
    content: 'Đội FC Phủi Hà Nội thiếu 3 người cho trận giao lưu 7v7 tối nay tại sân Thần Đồng. Đá nhẹ nhàng fairplay không va chạm mạnh. Anh em lên sân luôn nào! ⚽🔥',
    type: 'MATCH_FINDING',
    matchAttachment: {
      matchId: 'm-102',
      sportName: 'Bóng đá',
      timeSlot: '20:00 - 21:30 • Tối nay',
      level: 'Bán Chuyên / Phủi Cứng',
      pricePerSlot: '60.000đ / người',
      slotsLeft: 3,
      venueName: 'Sân Bóng Thần Đồng',
    },
    createdAt: '2 giờ trước',
    reactionsCount: { like: 28, love: 12, fire: 34, clap: 7 },
    userReaction: 'fire',
    commentsCount: 14,
    sharesCount: 4,
    comments: MOCK_COMMENTS,
  },

  // 3. Match Finding - Badminton (Sky Blue tint + Shuttlecock Watermark)
  {
    id: 'post-match-badminton-1',
    author: {
      id: 'user-3',
      name: 'Phạm Ngọc Lê',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
      handle: '@ngocle_badminton',
    },
    audience: 'PUBLIC',
    content: 'Tìm 1 bạn nữ đánh đôi nam nữ Cầu Lông giao lưu sáng mai! Nhóm mình trình trung bình khá, giao lưu vui vẻ nâng cao sức khỏe là chính. 🏸✨',
    type: 'MATCH_FINDING',
    matchAttachment: {
      matchId: 'm-103',
      sportName: 'Đánh cầu',
      timeSlot: '08:00 - 10:00 • Sáng mai',
      level: 'Trung Bình Khá',
      pricePerSlot: '35.000đ / người',
      slotsLeft: 1,
      venueName: 'Nhà Thi Đấu Cầu Giấy',
    },
    createdAt: '3 giờ trước',
    reactionsCount: { like: 19, love: 11, fire: 8, clap: 6 },
    userReaction: 'love',
    commentsCount: 9,
    sharesCount: 2,
    comments: MOCK_COMMENTS,
  },

  // 4. Match Finding - Basketball (Orange tint + Basketball Watermark)
  {
    id: 'post-match-basketball-1',
    author: {
      id: 'user-2',
      name: 'Trần Thanh Sơn',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
      handle: '@sontran_hoop',
    },
    audience: 'PUBLIC',
    content: 'Kèo Bóng Rổ 3x3 chiều nay tại sân outdoor Yersin còn thiếu 2 ballers! Thể thức đánh 21 điểm thắng. Anh em nào thích bắn 3 điểm vào ghép đội nhé! 🏀🔥',
    type: 'MATCH_FINDING',
    matchAttachment: {
      matchId: 'm-104',
      sportName: 'Bóng rổ',
      timeSlot: '17:00 - 19:00 • Chiều nay',
      level: 'Khá / Bán Chuyên',
      pricePerSlot: '30.000đ / người',
      slotsLeft: 2,
      venueName: 'Sân Bóng Rổ Yersin',
    },
    createdAt: '4 giờ trước',
    reactionsCount: { like: 31, love: 14, fire: 29, clap: 8 },
    userReaction: null,
    commentsCount: 11,
    sharesCount: 3,
    comments: MOCK_COMMENTS,
  },

  // 5. Club Post (Double Avatar Facebook Group Style)
  {
    id: 'post-club-1',
    author: {
      id: 'quanluu08',
      name: 'Quan Luu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      handle: '@quanluu08',
    },
    clubInfo: {
      id: 'club-1',
      name: 'Pickleball Cầu Giấy Official',
      avatarUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
    },
    audience: 'CLUB_MEMBERS',
    content: 'Thông báo giải đấu nội bộ tháng này của CLB Pickleball Cầu Giấy! Anh em đăng ký cặp thi đấu trước thứ 6 tuần này nhé. Giải thưởng hấp dẫn cho top 3 cặp đấu xuất sắc nhất! 🏆🔥',
    mediaUrls: [
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
    ],
    createdAt: '5 giờ trước',
    type: 'COMMUNITY',
    reactionsCount: { like: 24, love: 18, fire: 32, clap: 5 },
    userReaction: 'fire',
    commentsCount: 12,
    sharesCount: 3,
    comments: MOCK_COMMENTS,
  },

  // 6. Venue Promotion Post
  {
    id: 'post-promo-1',
    author: {
      id: 'owner-1',
      name: 'Sân Pickleball Thăng Long',
      avatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80',
      handle: '@thanglong_pickleball',
    },
    audience: 'PUBLIC',
    content: '🎉 KHUYẾN MÃI GIỜ VÀNG SÂN PICKLEBALL THĂNG LONG! Giảm ngay 20% cho tất cả các khung giờ từ 13:00 - 17:00 các ngày trong tuần. Sân mái che đạt chuẩn quốc tế, trang thiết bị hiện đại sẵn sàng đón anh em! 🏟️✨',
    mediaUrls: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    ],
    type: 'VENUE_PROMO',
    venuePromoAttachment: {
      venueId: 'v-202',
      venueName: 'Cụm Sân Pickleball Thăng Long',
      address: 'Phường Dịch Vọng, Cầu Giấy, Hà Nội',
      discountCode: 'SPORTA20',
      discountPercent: 'Giảm 20% Giờ Vàng',
    },
    createdAt: '6 giờ trước',
    reactionsCount: { like: 58, love: 35, fire: 48, clap: 19 },
    userReaction: 'love',
    commentsCount: 15,
    sharesCount: 9,
    comments: MOCK_COMMENTS,
  },

  // 7-20. Additional Rich Mock Posts for Scrolling
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `post-generated-${i + 1}`,
    author: {
      id: `user-${(i % 4) + 1}`,
      name: i % 2 === 0 ? `Vận động viên Nguyễn Hùng #${i + 1}` : `Hoàng Thị Mai #${i + 1}`,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + i}?w=300&auto=format&fit=crop&q=80`,
      handle: `@athlete_${i + 1}`,
    },
    audience: (i % 3 === 0 ? 'CLUB_MEMBERS' : 'PUBLIC') as any,
    clubInfo: i % 3 === 0 ? {
      id: 'club-1',
      name: 'Pickleball Cầu Giấy Official',
      avatarUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
    } : undefined,
    content: i % 2 === 0
      ? `Buổi tập luyện hăng hái cùng các đồng đội! Thể thao giúp giải tỏa căng thẳng sau những giờ làm việc mệt mỏi. Cố gắng luyện tập đều đặn mỗi ngày 💪🔥 #${i + 1}`
      : `Hôm nay thời tiết đẹp quá anh em ơi! Ai rảnh lên sân giao lưu vài séc đấu nhẹ nhàng nào! 🏓⚽🏸`,
    mediaUrls: i % 3 === 0 ? ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80'] : undefined,
    type: 'COMMUNITY' as any,
    createdAt: `${i + 7} giờ trước`,
    reactionsCount: { like: 12 + i * 2, love: 5 + i, fire: 8 + i * 3, clap: 4 },
    userReaction: null,
    commentsCount: 3 + i,
    sharesCount: i,
    comments: MOCK_COMMENTS,
  })),
];

export const mockCommunityDb = {
  getComments: async (postId: string): Promise<Comment[]> => {
    return MOCK_COMMENTS;
  },
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: CURRENT_USER,
      content,
      createdAt: 'Vừa xong',
      likesCount: 0,
      isLiked: false,
    };
    return newComment;
  },
  toggleLikePost: async (postId: string, reaction?: any) => {
    return { success: true };
  },
  reactPost: async (postId: string, reaction?: any) => {
    return { success: true };
  },
  getFeed: async (cursor?: string | null, limit: number = 4) => {
    return { data: MOCK_POSTS, nextCursor: null };
  },
  createPost: async (postData: any) => {
    return { id: `post-${Date.now()}`, ...postData };
  },
};
