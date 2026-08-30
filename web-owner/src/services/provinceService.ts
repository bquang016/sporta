// ─────────────────────────────────────────────────────────────────────────────
// Vietnam Administrative Units API Service (https://provinces.open-api.vn/)
// ─────────────────────────────────────────────────────────────────────────────

export interface Province {
  code: number;
  name: string;
  codename?: string;
  division_type?: string;
  phone_code?: number;
}

export interface District {
  code: number;
  name: string;
  codename?: string;
  division_type?: string;
  province_code?: number;
}

export interface Ward {
  code: number;
  name: string;
  codename?: string;
  division_type?: string;
  district_code?: number;
}

const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api';

/**
 * Fetch list of all 63 provinces/cities in Vietnam.
 */
export async function fetchProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(`${PROVINCE_API_BASE}/?depth=1`);
    if (!response.ok) throw new Error('Không thể tải danh sách tỉnh/thành');
    return await response.json();
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
}

/**
 * Fetch list of districts for a given province code.
 */
export async function fetchDistricts(provinceCode: number): Promise<District[]> {
  if (!provinceCode) return [];
  try {
    const response = await fetch(`${PROVINCE_API_BASE}/p/${provinceCode}?depth=2`);
    if (!response.ok) throw new Error('Không thể tải danh sách quận/huyện');
    const data = await response.json();
    return data.districts || [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}

/**
 * Fetch list of wards for a given district code.
 */
export async function fetchWards(districtCode: number): Promise<Ward[]> {
  if (!districtCode) return [];
  try {
    const response = await fetch(`${PROVINCE_API_BASE}/d/${districtCode}?depth=2`);
    if (!response.ok) throw new Error('Không thể tải danh sách phường/xã');
    const data = await response.json();
    return data.wards || [];
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
}
