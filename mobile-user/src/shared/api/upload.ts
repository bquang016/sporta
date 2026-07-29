import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './config';

const getToken = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('accessToken') || '';
  }
  try {
    return (await SecureStore.getItemAsync('accessToken')) || '';
  } catch (error) {
    return '';
  }
};

export const uploadImageApi = async (
  uri: string,
  type: 'avatar' | 'court_cover' | 'general' = 'general'
): Promise<string> => {
  const token = await getToken();
  const formData = new FormData();

  const uriParts = uri.split('/');
  const fileName = uriParts[uriParts.length - 1] || 'image.jpg';
  const fileType = fileName.split('.').pop() || 'jpg';

  // React Native FormData format for files
  formData.append('file', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    name: fileName,
    type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
  } as any);

  formData.append('type', type);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const response = await fetch(`${getBaseUrl()}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Upload ảnh thất bại');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
};
