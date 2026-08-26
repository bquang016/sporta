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

export const getAdminDashboardOverview = async (timeFilter = 'this_month'): Promise<AdminDashboardResponseData> => {
  const token = localStorage.getItem('accessToken');
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const response = await fetch(`http://${host}:8387/api/v1/admin/dashboard/overview?timeFilter=${timeFilter}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu bảng điều khiển Admin');
  }

  return response.json();
};
