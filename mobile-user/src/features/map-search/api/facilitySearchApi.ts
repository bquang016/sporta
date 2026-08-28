import { Platform } from 'react-native';
import { getBaseUrl } from '../../../shared/api/config';

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY || '';

/**
 * Geocode một địa chỉ thành tọa độ lat/lng bằng Goong Geocoding API.
 * Dùng làm fallback khi sân chưa có tọa độ trong database.
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export const geocodeAddress = async (
  address: string
): Promise<GeocodeResult | null> => {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://rsapi.goong.io/geocode?address=${encoded}&api_key=${GOONG_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch {
    return null;
  }
};

export interface GoongPlace {
  place_id: string;
  description: string;
}

export const searchGoongPlaces = async (query: string): Promise<GoongPlace[]> => {
  if (!query) return [];
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encoded}&limit=5`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.predictions || [];
  } catch {
    return [];
  }
};

export const getGoongPlaceDetail = async (placeId: string): Promise<GeocodeResult | null> => {
  try {
    const url = `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.result && data.result.geometry && data.result.geometry.location) {
      const { lat, lng } = data.result.geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch {
    return null;
  }
};
