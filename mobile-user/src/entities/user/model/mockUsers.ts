import { PublicUserProfile } from './user.types';

/**
 * Mock Database of Public User Profiles
 * Strictly aligns with backend User.java schema (no email/phone exposed publicly).
 * Richly updated to match the reference screenshots.
 */
export const MOCK_USER_PROFILES: Record<string, PublicUserProfile> = {
  // 1. Featured Reference Profile ("Quan Luu" - Matches Screenshots 1 & 2 100%)
  'quanluu08': {
    id: 'quanluu08',
    fullName: 'Quan Luu',
    username: '@quanluu08',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    gender: 'MALE',
    dateOfBirth: '1998-04-12', // 28 years old ("Người lớn")
    height: 178,
    weight: 72,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-01-15T08:00:00Z',
    isVerified: true,
    sportaPoints: '5p',
    bio: 'Content Lead @reclubapp',
    friendStatus: 'none',
    sportsProfiles: [
      {
        id: 'sp-1',
        sportName: 'Pickleball',
        icon: 'tennisball-outline',
        matchesCount: 35,
        activitiesCount: 90,
        awardsCount: 0,
        duprSingles: 3.925,
        duprSinglesReliable: '1% Reliable',
        duprDoubles: 3.41,
        duprDoublesReliable: '6% Reliable',
        ratingType: 'SELF RATING',
        ratingValue: '2.75',
        skillTags: [
          { id: 'st-1', label: 'Driving', credits: 29 },
          { id: 'st-2', label: 'Leadership', credits: 28 },
          { id: 'st-3', label: 'Defense', credits: 7 },
          { id: 'st-4', label: 'Dinking', credits: 4 },
          { id: 'st-5', label: 'Returning', credits: 4 },
          { id: 'st-6', label: 'Volleying', credits: 4 },
          { id: 'st-7', label: 'Drop Resets', credits: 1 },
        ],
        sportsmanshipCredits: [
          { id: 'sc-1', label: 'Hosting', credits: 134 },
          { id: 'sc-2', label: 'Sportsmanship', credits: 19 },
          { id: 'sc-3', label: 'Mentoring', credits: 14 },
          { id: 'sc-4', label: 'Heart', credits: 4 },
        ],
        battles: [
          {
            id: 'b-1',
            title: 'Battle 🏆 MLP| Dink Cao vs 👹 Máu Quỷ MQSC',
            date: 'Apr 16',
            rounds: [
              {
                id: 'r-1',
                roundName: 'Round 3',
                team1Avatars: [
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
                  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
                ],
                team1Names: 'Zack, Kay Bee 🐝',
                team2Avatars: [
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                ],
                team2Names: 'Hoang Anh, Quan Luu',
                score: '6-15',
                isWinner: true,
              },
              {
                id: 'r-2',
                roundName: 'Round 3',
                team1Avatars: [
                  'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
                ],
                team1Names: 'Hà, Zack',
                team2Avatars: [
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
                ],
                team2Names: 'Quan Luu, Ngoc Le',
                score: '10-15',
                isWinner: true,
              },
              {
                id: 'r-3',
                roundName: 'Round 4',
                team1Avatars: [
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
                  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
                ],
                team1Names: 'Hoang Anh, Quan Luu',
                team2Avatars: [
                  'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
                ],
                team2Names: 'Roger Vu, Woke Nguyn',
                score: '13-15',
                isWinner: false,
              },
              {
                id: 'r-4',
                roundName: 'Round 4',
                team1Avatars: [
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
                ],
                team1Names: 'Woke Nguyn, Mi One',
                team2Avatars: [
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
                ],
                team2Names: 'Quan Luu, Ngoc Le',
                score: '14-15',
                isWinner: true,
              },
            ],
          },
          {
            id: 'b-2',
            title: '[DUPR] ROUND ROBIN - INTERMEDIATE PLUS/3.5+',
            date: 'Dec 25',
            isDuprSubmitted: true,
            rounds: [
              {
                id: 'r-5',
                roundName: 'Round 1',
                team1Avatars: [
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
                  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
                ],
                team1Names: 'Anh Tran, Dink Few',
                team2Avatars: [
                  'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&q=80',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                ],
                team2Names: 'Bin, Quan Luu',
                score: '10-11',
                isWinner: true,
              },
              {
                id: 'r-6',
                roundName: 'Round 2',
                team1Avatars: [
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
                ],
                team1Names: 'Quan Luu, Justin Dang',
                team2Avatars: [
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
                ],
                team2Names: 'Bill Vo, Dink Few',
                score: '11-6',
                isWinner: true,
              },
            ],
          },
        ],
      },
      {
        id: 'sp-2',
        sportName: 'Bóng đá',
        icon: 'football-outline',
        matchesCount: 48,
        activitiesCount: 120,
        awardsCount: 2,
        ratingType: 'TRÌNH (TỰ ĐÁNH GIÁ)',
        ratingValue: 'Khá / Bán Chuyên',
        position: 'Trung vệ, Tiền đạo',
      },
    ],
    joinedClubs: [
      {
        id: 'club-1',
        name: 'Pickleball Cầu Giấy Official',
        logoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
        sportName: 'Pickleball',
        roleInClub: 'Ban quản trị',
        memberCount: 142,
        joinedDate: 'Tháng 1/2024',
      },
      {
        id: 'club-2',
        name: 'CLB Bóng Đá Phủi Hà Nội',
        logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
        sportName: 'Bóng đá',
        roleInClub: 'Thành viên',
        memberCount: 86,
        joinedDate: 'Tháng 3/2024',
      },
    ],
  },

  // 2. User 1 ("Nguyễn Văn Nam")
  'user-1': {
    id: 'user-1',
    fullName: 'Nguyễn Văn Nam',
    username: '@namvugi',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    gender: 'MALE',
    dateOfBirth: '1995-08-20',
    height: 175,
    weight: 68,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2023-11-10T10:00:00Z',
    isVerified: true,
    sportaPoints: '12p',
    bio: 'Đam mê bóng đá phủi • Đội trưởng FC Cầu Giấy ⚽',
    friendStatus: 'friend',
    sportsProfiles: [
      {
        id: 'sp-1',
        sportName: 'Bóng đá',
        icon: 'football-outline',
        matchesCount: 64,
        activitiesCount: 180,
        awardsCount: 3,
        ratingType: 'TRÌNH (TỰ ĐÁNH GIÁ)',
        ratingValue: 'Cứng / Bán chuyên',
        position: 'Tiền vệ trung tâm (CMF)',
        skillTags: [
          { id: 'st-1', label: 'Kiến tạo', credits: 45 },
          { id: 'st-2', label: 'Thể lực', credits: 38 },
        ],
      },
    ],
    joinedClubs: [
      {
        id: 'club-2',
        name: 'FC Cầu Giấy Phủi',
        logoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
        sportName: 'Bóng đá',
        roleInClub: 'Đội trưởng',
        memberCount: 28,
        joinedDate: 'Tháng 11/2023',
      },
    ],
  },

  // 3. User 2 ("Trần Thanh Sơn")
  'user-2': {
    id: 'user-2',
    fullName: 'Trần Thanh Sơn',
    username: '@sontran_hoop',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
    gender: 'MALE',
    dateOfBirth: '2001-02-14',
    height: 184,
    weight: 78,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2024-03-01T14:00:00Z',
    isVerified: false,
    sportaPoints: '8p',
    bio: 'Bóng rổ 3x3 & 5v5 | Hoop Lover 🏀',
    friendStatus: 'pending',
    sportsProfiles: [
      {
        id: 'sp-1',
        sportName: 'Bóng rổ',
        icon: 'basketball-outline',
        matchesCount: 22,
        activitiesCount: 55,
        awardsCount: 1,
        ratingType: 'TRÌNH (TỰ ĐÁNH GIÁ)',
        ratingValue: 'Khá',
        position: 'Hậu vệ ghi điểm (SG)',
        skillTags: [
          { id: 'st-1', label: 'Ném 3 điểm', credits: 24 },
          { id: 'st-2', label: 'Tốc độ', credits: 19 },
        ],
      },
    ],
  },
};

/**
 * Fallback Generator for any unknown user ID
 */
export function getPublicUserProfileById(userId: string): PublicUserProfile {
  if (MOCK_USER_PROFILES[userId]) {
    return MOCK_USER_PROFILES[userId];
  }

  return {
    ...MOCK_USER_PROFILES['quanluu08'],
    id: userId,
    fullName: userId.startsWith('user-') ? `Vận động viên ${userId.replace('user-', '#')}` : 'Quan Luu',
    username: `@${userId.replace(/[^a-zA-Z0-9]/g, '')}`,
  };
}
