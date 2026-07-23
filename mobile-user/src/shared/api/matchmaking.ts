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

// ─── NOTE on URL paths ────────────────────────────────────────────────────────
// BASE_URL = http://localhost:8387/api/v1
// Backend matchmaking controller is mapped at /api/matchmaking (NOT /api/v1/matchmaking)
// So we must call absolute URLs via fetch directly, NOT via apiClient (which prepends BASE_URL).
//
// We use apiFetch with absolute URL override trick: since apiFetch does BASE_URL + path,
// we strip /api/v1 by calling with path that starts with the correct segment.
//
// Actually the cleanest fix: keep paths as /matchmaking/rooms — these will resolve to
//   http://localhost:8387/api/v1/matchmaking/rooms
// but the real controller is at /api/matchmaking/rooms (port 8387, no /api/v1 prefix).
//
// Therefore we use a direct fetch wrapper here instead of apiClient to hit the right URL.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const MATCHMAKING_BASE = Platform.OS === 'web'
  ? 'http://localhost:8387'
  : (process.env.EXPO_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://192.168.1.11:8387');

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') return localStorage.getItem('accessToken');
    return await SecureStore.getItemAsync('accessToken');
  } catch {
    return null;
  }
};

const mmFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${MATCHMAKING_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const matchmakingApi = {
  createMatchRoom: async (data: CreateMatchRoomPayload, userId: number): Promise<MatchRoom> => {
    return mmFetch<MatchRoom>(`/api/matchmaking/rooms?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOpenMatchRooms: async (): Promise<MatchRoom[]> => {
    return mmFetch<MatchRoom[]>('/api/matchmaking/rooms');
  },

  getMatchRoomById: async (id: number): Promise<MatchRoom> => {
    return mmFetch<MatchRoom>(`/api/matchmaking/rooms/${id}`);
  },

  applyToMatchRoom: async (roomId: number, clubId: number, userId: number): Promise<MatchApplication> => {
    return mmFetch<MatchApplication>(
      `/api/matchmaking/rooms/${roomId}/apply?clubId=${clubId}&userId=${userId}`,
      { method: 'POST' },
    );
  },

  getApplicationsForRoom: async (roomId: number): Promise<MatchApplication[]> => {
    return mmFetch<MatchApplication[]>(`/api/matchmaking/rooms/${roomId}/applications`);
  },

  acceptApplication: async (roomId: number, applicationId: number, userId: number): Promise<MatchRoom> => {
    return mmFetch<MatchRoom>(
      `/api/matchmaking/rooms/${roomId}/accept?applicationId=${applicationId}&userId=${userId}`,
      { method: 'POST' },
    );
  },

  voteInternalPoll: async (roomId: number, clubId: number, userId: number, isAttending: boolean): Promise<MatchPoll> => {
    return mmFetch<MatchPoll>(
      `/api/matchmaking/rooms/${roomId}/poll?clubId=${clubId}&userId=${userId}&isAttending=${isAttending}`,
      { method: 'POST' },
    );
  },

  reportMatchResult: async (roomId: number, payload: ReportResultPayload, userId: number): Promise<MatchRoom> => {
    return mmFetch<MatchRoom>(
      `/api/matchmaking/rooms/${roomId}/report?userId=${userId}`,
      { method: 'POST', body: JSON.stringify(payload) },
    );
  },
};
