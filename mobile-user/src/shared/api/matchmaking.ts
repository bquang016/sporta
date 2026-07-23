import { apiClient } from './apiClient';

export type MatchRoomStatus = 'OPEN' | 'MATCHED' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'EXPIRED';
export type MatchFlowType = 'PAID_100' | 'DEPOSIT_HOLD';

export interface MatchRoom {
  id: number;
  creatorClubId: number;
  creatorClubName: string;
  creatorClubAvatar?: string;
  creatorClubCrp?: number;
  creatorUserId: number;
  creatorUserName: string;

  matchedClubId?: number;
  matchedClubName?: string;
  matchedClubAvatar?: string;
  matchedClubCrp?: number;

  sportId: number;
  sportName: string;
  format: string;
  minElo?: number;
  area?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  expectedStartTime: string;
  expectedEndTime?: string;

  bookingId?: string;
  courtId?: number;
  courtName?: string;
  venueName?: string;
  priceSharePerTeam?: number;

  flowType: MatchFlowType;
  depositAmount?: number;
  ttlExpiresAt?: string;
  status: MatchRoomStatus;
  allowDifferentLevel?: boolean;
  message?: string;
  createdAt: string;
}

export interface MatchApplication {
  id: number;
  matchRoomId: number;
  applicantClubId: number;
  applicantClubName: string;
  applicantClubAvatar?: string;
  applicantClubCrp?: number;
  applicantUserId: number;
  applicantUserName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface MatchPoll {
  id: number;
  matchRoomId: number;
  clubId: number;
  requiredVotes: number;
  currentYesVotes: number;
  isUnlocked: boolean;
  userVotedYes?: boolean;
  createdAt: string;
}

export interface CreateMatchRoomPayload {
  clubId: number;
  sportId: number;
  format: string;
  minElo?: number;
  maxElo?: number;
  area?: string;
  latitude?: number;
  longitude?: number;
  expectedStartTime: string;
  expectedEndTime?: string;
  bookingId?: string;
  courtId?: number;
  priceSharePerTeam?: number;
  flowType: MatchFlowType;
  depositAmount?: number;
  allowDifferentLevel?: boolean;
  message?: string;
}

export interface ReportResultPayload {
  matchRoomId: number;
  clubId: number;
  ourGoals: number;
  opponentGoals: number;
  evidenceImageUrl?: string;
  playerUserIds?: number[];
}

export const matchmakingApi = {
  createMatchRoom: async (data: CreateMatchRoomPayload, userId: number): Promise<MatchRoom> => {
    const res = await apiClient.post<MatchRoom>(`/api/matchmaking/rooms?userId=${userId}`, data);
    return res.data;
  },

  getOpenMatchRooms: async (): Promise<MatchRoom[]> => {
    const res = await apiClient.get<MatchRoom[]>('/api/matchmaking/rooms');
    return res.data;
  },

  getMatchRoomById: async (id: number): Promise<MatchRoom> => {
    const res = await apiClient.get<MatchRoom>(`/api/matchmaking/rooms/${id}`);
    return res.data;
  },

  applyToMatchRoom: async (roomId: number, clubId: number, userId: number): Promise<MatchApplication> => {
    const res = await apiClient.post<MatchApplication>(`/api/matchmaking/rooms/${roomId}/apply?clubId=${clubId}&userId=${userId}`);
    return res.data;
  },

  getApplicationsForRoom: async (roomId: number): Promise<MatchApplication[]> => {
    const res = await apiClient.get<MatchApplication[]>(`/api/matchmaking/rooms/${roomId}/applications`);
    return res.data;
  },

  acceptApplication: async (roomId: number, applicationId: number, userId: number): Promise<MatchRoom> => {
    const res = await apiClient.post<MatchRoom>(`/api/matchmaking/rooms/${roomId}/accept?applicationId=${applicationId}&userId=${userId}`);
    return res.data;
  },

  voteInternalPoll: async (roomId: number, clubId: number, userId: number, isAttending: boolean): Promise<MatchPoll> => {
    const res = await apiClient.post<MatchPoll>(`/api/matchmaking/rooms/${roomId}/poll?clubId=${clubId}&userId=${userId}&isAttending=${isAttending}`);
    return res.data;
  },

  reportMatchResult: async (roomId: number, payload: ReportResultPayload, userId: number): Promise<MatchRoom> => {
    const res = await apiClient.post<MatchRoom>(`/api/matchmaking/rooms/${roomId}/report?userId=${userId}`, payload);
    return res.data;
  },
};
