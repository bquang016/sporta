import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isLocalhostUrl = (url: string): boolean => {
  return url.includes('localhost') || url.includes('127.0.0.1');
};

export const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // 1. Web browser: luôn dùng .env hoặc localhost
  if (Platform.OS === 'web') {
    return envUrl || 'http://localhost:8387/api/v1';
  }

  // 2. Mobile device: ưu tiên .env chỉ khi là URL thật (không phải localhost)
  //    Nếu .env là localhost → bỏ qua, dùng auto-detect (tránh timeout trên điện thoại)
  if (envUrl && !isLocalhostUrl(envUrl)) {
    return envUrl; // Production URL hoặc IP thật được cấu hình thủ công
  }

  // 3. Auto-detect: lấy IP từ Expo Metro Bundler hostUri
  //    Đây là IP mà chính Expo đã dùng để kết nối với thiết bị → luôn chính xác
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8387/api/v1`;
    }
  }

  // 4. Fallback cuối cùng
  return envUrl || 'https://api.sportaa.tech/api/v1';
};

export const API_BASE_URL = getBaseUrl();
