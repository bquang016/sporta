import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './config';
import { ApiError } from './apiClient';

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
  sports?: {
    id: number;
    sportId: number;
    sportName: string;
    sportIcon: string;
    level: string;
  }[];
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
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

export const usersApi = {
  getProfile: async (): Promise<UserProfileDto> => {
    const token = await getToken();
    const response = await fetch(`${getBaseUrl()}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Lỗi khi lấy thông tin cá nhân', response.status);
    }
    return response.json();
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

    const response = await fetch(`${getBaseUrl()}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Lỗi khi cập nhật thông tin cá nhân', response.status);
    }
    return response.json();
  }
};
