export interface SportAnalyticsItem {
  sportId: number;
  sportName: string;
  totalGmv: number;
  percentage: number;
  bookingCount: number;
}

export interface RegionAnalyticsItem {
  provinceName: string;
  totalGmv: number;
  percentage: number;
  venueCount: number;
}

export interface AdminSportsAnalyticsResponse {
  fromDate: string;
  toDate: string;
  totalPlatformGmv: number;
  totalPlatformCommission: number;
  sportsBreakdown: SportAnalyticsItem[];
  regionBreakdown: RegionAnalyticsItem[];
}

import { API_BASE_URL } from './config';

export const getAdminSportsAnalytics = async (fromDate?: string, toDate?: string): Promise<AdminSportsAnalyticsResponse> => {
  const token = localStorage.getItem('accessToken');

  let url = `${API_BASE_URL}/admin/reports/analytics`;
  const params = new URLSearchParams();
  if (fromDate) params.append('from', fromDate);
  if (toDate) params.append('to', toDate);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Không thể tải báo cáo phân tích Admin');
  }
  return res.json();
};
