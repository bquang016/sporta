import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, ApiError, apiFetch, clearCachedToken } from './apiClient';
import { uploadImageApi } from './upload';

export interface UserSportItem {
  id: number;
  sportId: number;
  sportName: string;
  sportIcon?: string;
  level: string;
  eloRating?: number;
  eloStatus?: 'UNVERIFIED' | 'CALIBRATING' | 'VERIFIED';
  levelLabel?: string;
  placementMatchesPlayed?: number;
  totalRankedMatches?: number;
  totalWins?: number;
  winRate?: number;
}

export interface UserProfileDto {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  role: string;
  status: string;
  isDevTester?: boolean;
  sports?: UserSportItem[];
  location?: string;
  notifBooking?: boolean;
  notifPromo?: boolean;
  notifMatchmake?: boolean;
  enableBiometrics?: boolean;
  privateMode?: boolean;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  location?: string;
  notifBooking?: boolean;
  notifPromo?: boolean;
  notifMatchmake?: boolean;
  enableBiometrics?: boolean;
  privateMode?: boolean;
  [key: string]: any;
}

export interface PublicUserProfileResponse {
  id: number;
  fullName: string;
  avatarUrl?: string;
  gender?: string;
  height?: number;
  weight?: number;
  joinedYear?: number;
  role?: string;
  totalBookings?: number;
  reputationScore?: number;
  sports?: {
    sportId: number;
    sportName: string;
    sportIcon?: string;
    level?: string;
    eloRating?: number;
    eloStatus?: 'UNVERIFIED' | 'CALIBRATING' | 'VERIFIED';
    levelLabel?: string;
    placementMatchesPlayed?: number;
    totalRankedMatches?: number;
    totalWins?: number;
    winRate?: number;
    bookingCount: number;
    percentage: number;
  }[];
  joinedClubs?: {
    clubId: number;
    clubName: string;
    avatarImage?: string;
    coverImage?: string;
    sportName?: string;
    role?: string;
    membersCount?: number;
    elo?: number;
    crp?: number;
  }[];
  privateMode?: boolean;
}

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('accessToken');
    }
    return await SecureStore.getItemAsync('accessToken');
  } catch {
    return null;
  }
};

export interface UserSportOverviewDto {
  sportId: number;
  sportName: string;
  sportIcon?: string;
  isRegistered: boolean;
  level?: string;
  levelLabel?: string;
  eloRating?: number;
  eloStatus?: 'UNVERIFIED' | 'CALIBRATING' | 'VERIFIED';
  placementMatchesPlayed: number;
  totalRankedMatches: number;
  totalWins: number;
  winRate: number;
  lastMatchAt?: string;
}

export interface UpdateUserSportLevelRequest {
  sportId: number;
  level: string; // 'WEAK' | 'WEAK_AVERAGE' | 'AVERAGE' | 'AVERAGE_GOOD' | 'GOOD'
}

export interface RankedMatchHistoryItemDto {
  id: string;
  matchType: 'XE_VE' | 'CLUB_RANKED';
  sportName: string;
  playedAt?: string;
  venueName: string;
  courtName?: string;
  hostName: string;
  hostAvatarUrl?: string;
  guestName: string;
  guestAvatarUrl?: string;
  scoreText: string;
  userSide: 'HOST' | 'GUEST';
  userOutcome: 'WIN' | 'LOSS' | 'DRAW';
  personalEloDelta?: number;
  eloBefore?: number;
  eloAfter?: number;
  clubCrpDelta?: number;
  crpBefore?: number;
  crpAfter?: number;
  bonusNotes?: string[];
  explanation?: string[];
  isCaptain?: boolean;
  isDisputed?: boolean;
}

export const usersApi = {
  getProfile: async (): Promise<UserProfileDto> => {
    return apiFetch<UserProfileDto>('/users/profile', { method: 'GET' }, true);
  },

  getPublicProfile: async (userId: string | number): Promise<PublicUserProfileResponse> => {
    return apiFetch<PublicUserProfileResponse>(`/users/${userId}/public`, { method: 'GET' }, true);
  },

  getSportsEloOverview: async (): Promise<UserSportOverviewDto[]> => {
    return apiFetch<UserSportOverviewDto[]>('/users/sports-elo', { method: 'GET' }, true);
  },

  updateSportLevel: async (data: UpdateUserSportLevelRequest): Promise<UserSportOverviewDto[]> => {
    return apiFetch<UserSportOverviewDto[]>('/users/sports-elo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }, true);
  },

  getRankedMatchHistory: async (): Promise<RankedMatchHistoryItemDto[]> => {
    return apiFetch<RankedMatchHistoryItemDto[]>('/users/ranked-match-history', { method: 'GET' }, true);
  },

  updateProfile: async (data: UpdateUserProfileRequest = {}, avatarUri?: string): Promise<UserProfileDto> => {
    let payload = { ...data };

    if (avatarUri && avatarUri.trim().length > 0) {
      if (avatarUri.startsWith('http://') || avatarUri.startsWith('https://')) {
        payload.avatarUrl = avatarUri;
      } else {
        try {
          const uploadedUrl = await uploadImageApi(avatarUri, 'avatar');
          if (uploadedUrl) {
            payload.avatarUrl = uploadedUrl;
          }
        } catch (err) {
          console.error('Error uploading avatar image via uploadImageApi:', err);
          throw err;
        }
      }
    }

    return apiFetch<UserProfileDto>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true);
  },

  deleteAccount: async (): Promise<void> => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Lỗi khi xóa tài khoản', response.status);
    }
  }
};
