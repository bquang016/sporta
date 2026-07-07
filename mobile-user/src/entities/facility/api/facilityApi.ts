import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:8387/api/v1';
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return 'http://192.168.1.2:8387/api/v1'; // Fallback to PC IP instead of localhost for mobile
};

const BASE_URL = `${getBaseUrl()}/public/venues`;

export const fetchActiveFacilities = async () => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch facilities');
  }

  return response.json();
};
