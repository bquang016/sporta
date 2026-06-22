import { useState, useEffect } from 'react';

export interface Club {
  id: string;
  name: string;
  sport: string;
  sportIcon: string;
  members: number;
  maxMembers: number;
  activityLevel: 'Rất sôi nổi' | 'Trung bình' | 'Mới thành lập';
  description: string;
  isPrivate: boolean;
  coverImage?: string;
  avatarImage?: string;
  area?: string;
  averageElo?: number;
}

const INITIAL_MOCK_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'FC Đống Đa Warriors',
    sport: 'Bóng đá',
    sportIcon: 'sports-soccer',
    members: 42,
    maxMembers: 50,
    activityLevel: 'Rất sôi nổi',
    description: 'Nơi tập hợp anh em đam mê bóng đá phủi khu vực Đống Đa, giao lưu hàng tuần.',
    isPrivate: false,
    area: 'Quận Đống Đa, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    averageElo: 1450,
  },
  {
    id: 'club-2',
    name: 'Hanoi Badminton Friends',
    sport: 'Cầu lông',
    sportIcon: 'sports-cricket',
    members: 128,
    maxMembers: 150,
    activityLevel: 'Rất sôi nổi',
    description: 'CLB giao lưu cầu lông mọi trình độ tại Hà Nội. Sinh hoạt tối thứ 3, 5, 7.',
    isPrivate: false,
    area: 'Quận Cầu Giấy, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    averageElo: 1600,
  },
  {
    id: 'club-3',
    name: 'Saigon Pickleball Club',
    sport: 'Pickleball',
    sportIcon: 'sports-tennis',
    members: 18,
    maxMembers: 30,
    activityLevel: 'Trung bình',
    description: 'Hội những người chơi Pickleball mới nổi tại Sài Gòn, giao lưu học hỏi vui vẻ.',
    isPrivate: false,
    area: 'Quận 1, TP. Hồ Chí Minh',
    coverImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=150&auto=format&fit=crop&q=80',
    averageElo: 1250,
  },
  {
    id: 'club-4',
    name: 'BK Dunkers',
    sport: 'Bóng rổ',
    sportIcon: 'sports-basketball',
    members: 15,
    maxMembers: 40,
    activityLevel: 'Mới thành lập',
    description: 'Cộng đồng bóng rổ cựu sinh viên Bách Khoa, tập luyện cuối tuần.',
    isPrivate: true,
    area: 'Quận Hai Bà Trưng, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    averageElo: 1500,
  },
  {
    id: 'club-5',
    name: 'Cầu Giấy United FC',
    sport: 'Bóng đá',
    sportIcon: 'sports-soccer',
    members: 24,
    maxMembers: 35,
    activityLevel: 'Trung bình',
    description: 'Đội bóng giao hữu hàng tuần sân cỏ nhân tạo khu vực Cầu Giấy, tìm đối tác giao lưu.',
    isPrivate: false,
    area: 'Quận Cầu Giấy, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    averageElo: 1350,
  },
  {
    id: 'club-6',
    name: 'Pickleball Hanoi Elite',
    sport: 'Pickleball',
    sportIcon: 'sports-tennis',
    members: 35,
    maxMembers: 60,
    activityLevel: 'Rất sôi nổi',
    description: 'Cộng đồng Pickleball hàng đầu tại Hà Nội. Sân chơi chuyên nghiệp, bài bản.',
    isPrivate: true,
    area: 'Quận Tây Hồ, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=150&auto=format&fit=crop&q=80',
    averageElo: 1750,
  },
  {
    id: 'club-7',
    name: 'Hanoi Heat Juniors',
    sport: 'Bóng rổ',
    sportIcon: 'sports-basketball',
    members: 28,
    maxMembers: 50,
    activityLevel: 'Rất sôi nổi',
    description: 'Nơi ươm mầm tài năng bóng rổ trẻ Hà Nội, sinh hoạt sáng chủ nhật.',
    isPrivate: false,
    area: 'Quận Nam Từ Liêm, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    averageElo: 1300,
  },
  {
    id: 'club-8',
    name: 'Vinh Tuy Badminton Club',
    sport: 'Cầu lông',
    sportIcon: 'sports-cricket',
    members: 14,
    maxMembers: 25,
    activityLevel: 'Trung bình',
    description: 'CLB cầu lông phong trào khu vực Minh Khai, Vĩnh Tuy. Chào đón người mới.',
    isPrivate: false,
    area: 'Quận Hai Bà Trưng, Hà Nội',
    coverImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60',
    avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    averageElo: 1400,
  }
];

class ClubStore {
  private clubs: Club[] = INITIAL_MOCK_CLUBS;
  private joinedClubIds: Set<string> = new Set(['club-1']); // Default joined club
  private listeners: (() => void)[] = [];

  getClubs() {
    return this.clubs;
  }

  getJoinedClubIds() {
    return Array.from(this.joinedClubIds);
  }

  joinClub(id: string) {
    if (this.joinedClubIds.has(id)) return;
    this.joinedClubIds.add(id);
    const club = this.clubs.find(c => c.id === id);
    if (club && club.members < club.maxMembers) {
      club.members += 1;
    }
    this.notify();
  }

  leaveClub(id: string) {
    if (!this.joinedClubIds.has(id)) return;
    this.joinedClubIds.delete(id);
    const club = this.clubs.find(c => c.id === id);
    if (club && club.members > 0) {
      club.members -= 1;
    }
    this.notify();
  }

  createClub(clubData: Omit<Club, 'id' | 'members'>) {
    const newClub: Club = {
      ...clubData,
      id: `club-${Date.now()}`,
      members: 1, // The creator is automatically the first member
      averageElo: 1200, // Default average Elo for new clubs
    };
    this.clubs.unshift(newClub); // Add to the top of the explore list
    this.joinedClubIds.add(newClub.id); // Add to joined list
    this.notify();
    return newClub;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const clubStore = new ClubStore();

export function useClubs() {
  const [clubs, setClubs] = useState(clubStore.getClubs());
  const [joinedIds, setJoinedIds] = useState(clubStore.getJoinedClubIds());

  useEffect(() => {
    return clubStore.subscribe(() => {
      setClubs([...clubStore.getClubs()]);
      setJoinedIds(clubStore.getJoinedClubIds());
    });
  }, []);

  return {
    clubs,
    joinedIds,
    joinClub: (id: string) => clubStore.joinClub(id),
    leaveClub: (id: string) => clubStore.leaveClub(id),
    createClub: (clubData: Omit<Club, 'id' | 'members'>) => clubStore.createClub(clubData),
  };
}
