import type { CourtResponse, CourtRequest, VenueResponse, VenueRequest, CourtPriceRuleRequest, CourtPriceRuleResponse, VenueDraftRequest, VenueStatisticsResponse } from '../types';
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

export const courtService = {
  async getCourts(): Promise<CourtResponse[]> {
    const res = await fetch(`${BASE_URL}/owner/courts`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể lấy danh sách sân bãi');
  },

  async registerCourt(data: CourtRequest): Promise<CourtResponse> {
    const res = await fetch(`${BASE_URL}/owner/courts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi đăng ký sân bãi mới');
  },

  async updateCourt(id: string, data: CourtRequest): Promise<CourtResponse> {
    const res = await fetch(`${BASE_URL}/owner/courts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi cập nhật sân bãi');
  },

  async uploadImage(file: File, type: 'avatar' | 'court_cover' | 'court_detail' | 'general'): Promise<string> {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/upload/image?type=${type}`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Tải ảnh lên thất bại');
    const data = await res.json();
    return data.imageUrl;
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'MAINTENANCE'): Promise<CourtResponse> {
    const res = await fetch(`${BASE_URL}/owner/courts/${id}/status?status=${status}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Cập nhật trạng thái thất bại');
  },

  async getVenues(): Promise<VenueResponse[]> {
    const res = await fetch(`${BASE_URL}/owner/venues`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể lấy danh sách cụm sân');
  },

  async createVenue(data: VenueRequest): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi tạo cụm sân mới');
  },

  async updateVenueStatus(id: string, status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}/status?status=${status}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể cập nhật trạng thái cụm sân');
  },

  async updateVenue(id: string, data: VenueRequest): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi cập nhật thông tin cụm sân');
  },

  async createVenueDraft(data: VenueDraftRequest): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/draft`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi tạo bản nháp cụm sân');
  },

  async updateVenueDraft(id: string, data: VenueDraftRequest): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}/draft`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi cập nhật bản nháp cụm sân');
  },

  async submitVenueForApproval(id: string): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}/submit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Lỗi khi gửi yêu cầu duyệt cụm sân');
  },

  async cancelVenueSubmission(id: string): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}/cancel-submit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Lỗi khi hủy yêu cầu duyệt cụm sân');
  },

  async approveVenueTemporary(id: string): Promise<VenueResponse> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Lỗi khi phê duyệt cụm sân');
  },


  async deleteVenueDraft(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/owner/venues/${id}/draft`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi xóa bản nháp cụm sân');
    }
  },

  async getCourtPriceRules(courtId: string): Promise<CourtPriceRuleResponse[]> {
    const res = await fetch(`${BASE_URL}/owner/courts/${courtId}/price-rules`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể lấy cấu hình giá chi tiết của sân');
  },

  async saveCourtPriceRules(courtId: string, rules: CourtPriceRuleRequest[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/owner/courts/${courtId}/price-rules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(rules),
    });
    return handleResponse(res, 'Lỗi khi lưu cấu hình giá chi tiết của sân');
  },

  async getVenueStatistics(venueId: string, from?: string, to?: string): Promise<VenueStatisticsResponse> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${BASE_URL}/owner/venues/${venueId}/statistics${queryString}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể lấy dữ liệu thống kê vận hành của cụm sân');
  }
};
