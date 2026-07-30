import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './config';
import * as ImageManipulator from 'expo-image-manipulator';

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
  type: 'avatar' | 'court_cover' | 'general' | 'post' = 'general'
): Promise<string> => {
  const token = await getToken();
  
  // 1. Convert to WebP (No crop/resize, just compress to save 80% size)
  let localUriToUpload = uri;
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
    );
    localUriToUpload = manipResult.uri;
  } catch (error) {
    console.log('WebP conversion failed, fallback to original:', error);
  }

  // 2. Fetch Presigned URL
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const presignResponse = await fetch(
    `${getBaseUrl()}/upload/presigned-url?type=${type}&extension=.webp&contentType=image/webp`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!presignResponse.ok) {
    throw new Error('Could not get presigned url');
  }

  const { presignedUrl, publicUrl } = await presignResponse.json();

  // 3. Upload File Directly to R2
  let blob: Blob;
  if (Platform.OS === 'web') {
    const response = await fetch(localUriToUpload);
    blob = await response.blob();
  } else {
    // For React Native, we can use fetch to convert local file uri to blob
    const response = await fetch(localUriToUpload);
    blob = await response.blob();
  }

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/webp',
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload to R2 directly');
  }

  return publicUrl;
};
