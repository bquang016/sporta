import { useState, useEffect } from 'react';
import { 
  getAvailableClubsApi, 
  getJoinedClubsApi, 
  joinClubApi, 
  leaveClubApi, 
  createClubApi,
  updateClubApi,
  deleteClubApi,
  transferLeadershipApi,
  getClubMembersApi,
  assignSubLeaderApi,
  demoteSubLeaderApi,
  removeMemberApi
} from '../../../shared/api/clubs';

export interface Club {
  id: number | string;
  name: string;
  sport: string;
  sportIcon: string;
  members: number;
  maxMembers: number;
  activityLevel: string;
  description: string;
  isPrivate: boolean;
  coverImage?: string;
  avatarImage?: string;
  area?: string;
  elo?: number;
  minEloRequired?: number;
  averageElo?: number;
  crp?: number;
  rankedWins?: number;
  finalMatches?: number;
  levelLabel?: string;
  userStatus?: string;
  creatorId?: number;
  creatorName?: string;
  createdAt?: string;
}

class ClubStore {
  private clubs: Club[] = [];
  private joinedClubs: Club[] = [];
  private joinedClubIds: Set<number | string> = new Set();
  private listeners: (() => void)[] = [];

  getClubs() {
    return this.clubs;
  }

  getJoinedClubs() {
    return this.joinedClubs;
  }

  getJoinedClubIds() {
    return Array.from(this.joinedClubIds);
  }

  reset() {
    this.clubs = [];
    this.joinedClubs = [];
    this.joinedClubIds = new Set();
    this.notify();
  }

  async fetchClubs(sportId?: number, query?: string) {
    try {
      const data = await getAvailableClubsApi(sportId, query);
      this.clubs = data || [];
      this.notify();
    } catch (error) {
      this.clubs = [];
      this.notify();
    }
  }

  async fetchJoinedClubs(sportId?: number, query?: string) {
    try {
      const data = await getJoinedClubsApi(sportId, query);
      this.joinedClubs = data || [];
      this.joinedClubIds = new Set(this.joinedClubs.map(c => c.id));
      this.notify();
    } catch (error) {
      this.joinedClubs = [];
      this.joinedClubIds = new Set();
      this.notify();
    }
  }

  async joinClub(id: number | string) {
    const numericId = typeof id === 'string' ? parseInt(id.replace('club-', ''), 10) : id;
    if (isNaN(numericId)) return;

    try {
      await joinClubApi(numericId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      throw error;
    }
  }

  async leaveClub(id: number | string) {
    const numericId = typeof id === 'string' ? parseInt(id.replace('club-', ''), 10) : id;
    if (isNaN(numericId)) return;

    try {
      await leaveClubApi(numericId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      console.warn('Lỗi rời CLB:', error);
      throw error;
    }
  }

  async deleteClub(id: number | string) {
    const numericId = typeof id === 'string' ? parseInt(id.replace('club-', ''), 10) : id;
    if (isNaN(numericId)) return;
    try {
      await deleteClubApi(numericId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      console.error('Lỗi xóa CLB:', error);
      throw error;
    }
  }

  async transferLeadership(clubId: number | string, userId: number) {
    const numericClubId = typeof clubId === 'string' ? parseInt(clubId.replace('club-', ''), 10) : clubId;
    if (isNaN(numericClubId)) return;
    try {
      await transferLeadershipApi(numericClubId, userId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      console.error('Lỗi chuyển nhượng Trưởng nhóm:', error);
      throw error;
    }
  }

  async assignSubLeader(clubId: number | string, userId: number) {
    const numericClubId = typeof clubId === 'string' ? parseInt(clubId.replace('club-', ''), 10) : clubId;
    if (isNaN(numericClubId)) return;
    try {
      await assignSubLeaderApi(numericClubId, userId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      console.error('Lỗi bổ nhiệm Phó nhóm:', error);
      throw error;
    }
  }

  async demoteSubLeader(clubId: number | string, userId: number) {
    const numericClubId = typeof clubId === 'string' ? parseInt(clubId.replace('club-', ''), 10) : clubId;
    if (isNaN(numericClubId)) return;
    try {
      await demoteSubLeaderApi(numericClubId, userId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      console.error('Lỗi hạ chức Phó nhóm:', error);
      throw error;
    }
  }

  async removeMember(clubId: number | string, userId: number) {
    const numericClubId = typeof clubId === 'string' ? parseInt(clubId.replace('club-', ''), 10) : clubId;
    if (isNaN(numericClubId)) return;
    try {
      await removeMemberApi(numericClubId, userId);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
    } catch (error) {
      console.error('Lỗi trục xuất thành viên:', error);
      throw error;
    }
  }

  async createClub(clubData: any) {
    try {
      const newClub = await createClubApi(clubData);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
      return newClub;
    } catch (error) {
      console.error('Lỗi tạo CLB:', error);
      throw error;
    }
  }

  async updateClub(clubId: number | string, clubData: any) {
    const numericClubId = typeof clubId === 'string' ? parseInt(clubId.replace('club-', ''), 10) : clubId;
    if (isNaN(numericClubId)) return;
    try {
      const updated = await updateClubApi(numericClubId, clubData);
      await Promise.all([this.fetchClubs(), this.fetchJoinedClubs()]);
      return updated;
    } catch (error) {
      console.error('Lỗi cập nhật CLB:', error);
      throw error;
    }
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
  const [clubs, setClubs] = useState<Club[]>(clubStore.getClubs());
  const [joinedClubs, setJoinedClubs] = useState<Club[]>(clubStore.getJoinedClubs());
  const [joinedIds, setJoinedIds] = useState<(number | string)[]>(clubStore.getJoinedClubIds());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return clubStore.subscribe(() => {
      setClubs([...clubStore.getClubs()]);
      setJoinedClubs([...clubStore.getJoinedClubs()]);
      setJoinedIds(clubStore.getJoinedClubIds());
    });
  }, []);

  const refreshClubs = async (sportId?: number, query?: string) => {
    setLoading(true);
    await Promise.all([
      clubStore.fetchClubs(sportId, query),
      clubStore.fetchJoinedClubs(sportId, query)
    ]);
    setLoading(false);
  };

  return {
    clubs,
    joinedClubs,
    joinedIds,
    loading,
    refreshClubs,
    joinClub: (id: number | string) => clubStore.joinClub(id),
    leaveClub: (id: number | string) => clubStore.leaveClub(id),
    deleteClub: (id: number | string) => clubStore.deleteClub(id),
    transferLeadership: (clubId: number | string, userId: number) => clubStore.transferLeadership(clubId, userId),
    assignSubLeader: (clubId: number | string, userId: number) => clubStore.assignSubLeader(clubId, userId),
    demoteSubLeader: (clubId: number | string, userId: number) => clubStore.demoteSubLeader(clubId, userId),
    removeMember: (clubId: number | string, userId: number) => clubStore.removeMember(clubId, userId),
    createClub: (clubData: any) => clubStore.createClub(clubData),
    updateClub: (clubId: number | string, clubData: any) => clubStore.updateClub(clubId, clubData),
  };
}
