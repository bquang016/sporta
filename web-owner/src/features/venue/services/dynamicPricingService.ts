import type {
  PricingRecommendation,
  ApplyPricingRequest,
  RejectPricingRequest,
  PricingAnalyticsSummary
} from '../types/dynamicPricing';
import { API_BASE_URL } from '../../../services/apiConfig';

const BASE_URL = API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response, defaultError: string) => {
  if (res.status === 403) {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập đã hết hạn');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: null }));
    throw new Error(err.message || defaultError);
  }
  return res.json();
};

export const dynamicPricingService = {
  async getVenueRecommendations(venueId: string): Promise<PricingRecommendation[]> {
    const res = await fetch(`${BASE_URL}/owner/pricing-recommendations/venue/${venueId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể tải danh sách đề xuất giá');
  },

  async getVenuePricingAnalytics(
    venueId: string,
    courtId?: string,
    dayOfWeek?: number
  ): Promise<PricingAnalyticsSummary> {
    const params = new URLSearchParams();
    if (courtId) params.append('courtId', courtId);
    if (dayOfWeek) params.append('dayOfWeek', dayOfWeek.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/owner/pricing-recommendations/venue/${venueId}/analytics${queryString}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể tải số liệu phân tích định giá');
  },

  async applyRecommendations(data: ApplyPricingRequest): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/owner/pricing-recommendations/apply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Không thể áp dụng đề xuất giá');
  },

  async rejectRecommendations(data: RejectPricingRequest): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/owner/pricing-recommendations/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Không thể từ chối đề xuất giá');
  },

  async triggerBatch(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/owner/pricing-recommendations/trigger-batch`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể kích hoạt phân tích định giá');
  },
};
