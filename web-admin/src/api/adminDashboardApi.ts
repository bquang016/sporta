export interface AdminKpi {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  tooltip?: string;
}

export interface AdminChartData {
  labels: string[];
  values: number[];
}

export interface AdminActivity {
  id: string;
  time: string;
  message: string;
}

export interface PartnerData {
  id: string;
  courtName: string;
  ownerName: string;
  successfulBookings: number;
  totalGmv: number;
  commission: number;
}

export interface AdminDashboardResponseData {
  metrics: AdminKpi[];
  revenueData: AdminChartData;
  userData: AdminChartData;
  activities: AdminActivity[];
  leaderboardData: Record<string, PartnerData[]>;
}

import { API_BASE_URL } from './config';

export const getAdminDashboardOverview = async (timeFilter = 'this_month'): Promise<AdminDashboardResponseData> => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview?timeFilter=${timeFilter}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu bảng điều khiển Admin');
  }

  return response.json();
};
