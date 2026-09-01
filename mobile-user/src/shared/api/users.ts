import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, ApiError, apiFetch, clearCachedToken } from './apiClient';

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
  linkGoogle?: boolean;
  linkFacebook?: boolean;
  linkApple?: boolean;
  enableBiometrics?: boolean;
  privateMode?: boolean;
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  location?: string;
  notifBooking?: boolean;
  notifPromo?: boolean;
  notifMatchmake?: boolean;
  linkGoogle?: boolean;
  linkFacebook?: boolean;
  linkApple?: boolean;
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
    return apiFetch<PublicUserProfileResponse>(`/users/${userId}/public`, { method: 'GET' }, false);
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

  updateProfile: async (data: UpdateUserProfileRequest, avatarUri?: string): Promise<UserProfileDto> => {
    const token = await getToken();
    const formData = new FormData();

    if (data) {
      formData.append('data', JSON.stringify(data));
    }

    if (avatarUri) {
      let filename = 'avatar.jpg';
      let type = 'image/jpeg';
      
      if (avatarUri.startsWith('data:')) {
        const mimeStr = avatarUri.split(',')[0].split(':')[1].split(';')[0];
        if (mimeStr) type = mimeStr;
        const ext = mimeStr.split('/')[1] || 'jpg';
        filename = `avatar.${ext}`;
      } else {
        filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        if (match) type = `image/${match[1]}`;
      }

      if (Platform.OS === 'web') {
        try {
          const res = await fetch(avatarUri);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: type });
          formData.append('avatar', file);
        } catch (e) {
          console.error("Error creating blob from uri", e);
        }
      } else {
        // @ts-ignore - React Native FormData expects this format for files
        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        });
      }
    }

    const response = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        clearCachedToken();
        const { globalEvent } = require('../lib/eventEmitter');
        globalEvent.emit('auth:expired');
      }
      throw new ApiError(errorData.message || 'Lỗi khi cập nhật thông tin cá nhân', response.status);
    }
    return response.json();
  }
};
