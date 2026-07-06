import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:8387/api/v1';
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return 'http://192.168.1.2:8387/api/v1'; // Fallback to PC IP instead of localhost for mobile
};

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
