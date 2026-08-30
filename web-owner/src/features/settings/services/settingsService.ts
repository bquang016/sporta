export interface OwnerSettingsData {
  notifyNewBooking: boolean;
  notifyCancellation: boolean;
  notifyOnScan: boolean;
  dailyRevenueReport: boolean;
  requireOtpWithdrawal: boolean;
  sessionTimeoutMinutes: number; // 15, 30, 60, 0
  defaultBookingView: 'grid' | 'list';
}

export const DEFAULT_OWNER_SETTINGS: OwnerSettingsData = {
  notifyNewBooking: true,
  notifyCancellation: true,
  notifyOnScan: true,
  dailyRevenueReport: true,
  requireOtpWithdrawal: false,
  sessionTimeoutMinutes: 30,
  defaultBookingView: 'grid',
};

const getApiBaseUrl = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:8387/api/v1/owner/settings`;
};

export const fetchOwnerSettingsApi = async (): Promise<OwnerSettingsData> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(getApiBaseUrl(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải cấu hình cài đặt từ máy chủ');
  }

  return response.json();
};

export const updateOwnerSettingsApi = async (
  data: Partial<OwnerSettingsData>
): Promise<OwnerSettingsData> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(getApiBaseUrl(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Cập nhật cấu hình cài đặt thất bại');
  }

  return response.json();
};

export const resetOwnerSettingsApi = async (): Promise<OwnerSettingsData> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${getApiBaseUrl()}/reset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Khôi phục cài đặt gốc thất bại');
  }

  return response.json();
};
