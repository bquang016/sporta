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
  type: 'avatar' | 'court_cover' | 'court_detail' | 'general' | 'post' = 'general'
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

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 2. PRIMARY STRATEGY: Direct Multipart Upload via Backend Server
  // This bypasses client-side Cloudflare R2 CORS restrictions and React Native PUT Blob issues
  try {
    const formData = new FormData();
    const filename = `upload_${Date.now()}.webp`;

    if (Platform.OS === 'web') {
      const response = await fetch(localUriToUpload);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    } else {
      // React Native Native Form Attachment
      formData.append('file', {
        uri: localUriToUpload,
        name: filename,
        type: 'image/webp',
      } as any);
    }

    const uploadRes = await fetch(`${getBaseUrl()}/upload/image?type=${type}`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        // Do NOT set Content-Type header manually for FormData so boundary is auto-generated
      },
      body: formData,
    });

    if (uploadRes.ok) {
      const data = await uploadRes.json();
      if (data?.imageUrl) {
        return data.imageUrl;
      }
    } else {
      console.warn('Backend multipart upload failed with status:', uploadRes.status);
    }
  } catch (multipartError) {
    console.warn('Backend multipart upload exception, trying Presigned URL fallback:', multipartError);
  }

  // 3. FALLBACK STRATEGY: Presigned URL Direct S3 PUT
  try {
    const presignResponse = await fetch(
      `${getBaseUrl()}/upload/presigned-url?type=${type}&extension=.webp&contentType=image/webp`,
      {
        method: 'GET',
        headers: authHeaders,
      }
    );

    if (!presignResponse.ok) {
      const errText = await presignResponse.text().catch(() => '');
      throw new Error(`Không thể tạo presigned URL (${presignResponse.status}): ${errText}`);
    }

    const { presignedUrl, publicUrl } = await presignResponse.json();

    const fileResp = await fetch(localUriToUpload);
    const fileBlob = await fileResp.blob();

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/webp',
      },
      body: fileBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload trực tiếp R2 thất bại (HTTP ${uploadResponse.status})`);
    }

    return publicUrl;
  } catch (presignError: any) {
    console.error('All upload strategies failed:', presignError);
    throw new Error(presignError.message || 'Không thể tải ảnh lên hệ thống');
  }
};
