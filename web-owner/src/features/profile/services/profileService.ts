export interface OwnerProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  venueId?: string;
  facilityName?: string;
  address?: string;
  openHours?: string;
  description?: string;
  avatarUrl?: string;
  idNumber?: string;
  dateOfBirth?: string;
  hometown?: string;
}

import { API_BASE_URL } from '../../../services/apiConfig';

export const fetchOwnerProfileApi = async (): Promise<OwnerProfileData> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}/owner/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin hồ sơ tài khoản');
  }

  return response.json();
};

export const updateOwnerProfileApi = async (data: OwnerProfileData): Promise<OwnerProfileData> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}/owner/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Cập nhật thông tin thất bại');
  }

  return response.json();
};
