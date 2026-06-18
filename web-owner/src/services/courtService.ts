const BASE_URL = 'http://localhost:8387/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface CourtImageDto {
  id: number;
  imageUrl: string;
}

export interface CourtResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  price: number;
  description: string;
  coverImage: string;
  openingTime: string;
  closingTime: string;
  location: string;
  sportId: number;
  sportName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  detailImages: CourtImageDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CourtRequest {
  name: string;
  price: number;
  description: string;
  coverImage: string;
  openingTime: string;
  closingTime: string;
  location: string;
  sportId: number;
  detailImages: string[];
}

export const courtService = {
  async getCourts(): Promise<CourtResponse[]> {
    const res = await fetch(`${BASE_URL}/owner/courts`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Không thể lấy danh sách sân bãi');
    return res.json();
  },

  async registerCourt(data: CourtRequest): Promise<CourtResponse> {
    const res = await fetch(`${BASE_URL}/owner/courts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: null }));
      throw new Error(err.message || 'Lỗi khi đăng ký sân bãi mới');
    }
    return res.json();
  },

  async updateCourt(id: string, data: CourtRequest): Promise<CourtResponse> {
    const res = await fetch(`${BASE_URL}/owner/courts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: null }));
      throw new Error(err.message || 'Lỗi khi cập nhật sân bãi');
    }
    return res.json();
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

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<CourtResponse> {
    const res = await fetch(`${BASE_URL}/owner/courts/${id}/status?status=${status}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Cập nhật trạng thái giả lập thất bại');
    return res.json();
  }
};
