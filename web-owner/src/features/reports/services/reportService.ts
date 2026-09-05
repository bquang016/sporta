import type { OwnerRevenueReportResponse } from '../types/report.types';
import { API_BASE_URL } from '../../../services/apiConfig';

export const reportService = {
  async getRevenueReport(venueId: string, fromDate?: string, toDate?: string): Promise<OwnerRevenueReportResponse> {
    const token = localStorage.getItem('accessToken');
    
    let url = `${API_BASE_URL}/owner/venues/${venueId}/reports/revenue`;
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải báo cáo doanh thu.');
    }
    return data;
  },
};
