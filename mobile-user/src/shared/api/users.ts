import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, ApiError } from './apiClient';

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
    const response = await fetch(`${BASE_URL}/users/profile`, {
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
      const filename = avatarUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore - React Native FormData expects this format for files
      formData.append('avatar', {
        uri: avatarUri,
        name: filename,
        type,
      });
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
      throw new ApiError(errorData.message || 'Lỗi khi cập nhật thông tin cá nhân', response.status);
    }
    return response.json();
  }
};
