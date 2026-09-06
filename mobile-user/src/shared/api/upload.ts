import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
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

  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 1. Optimize image (WebP on Android, JPEG on iOS/Web)
  let localUriToUpload = uri;
  let mimeType = 'image/jpeg';
  try {
    const isAndroid = Platform.OS === 'android';
    const targetFormat = isAndroid
      ? ImageManipulator.SaveFormat.WEBP
      : ImageManipulator.SaveFormat.JPEG;

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 0.8, format: targetFormat }
    );
    localUriToUpload = manipResult.uri;
    mimeType = isAndroid ? 'image/webp' : 'image/jpeg';
  } catch (error) {
    console.log('Image compression failed, using original uri:', error);
  }

  const uploadEndpoint = `${getBaseUrl()}/upload/image?type=${type}`;

  // 2. PRIMARY STRATEGY: Native FileSystem Multipart Upload for Mobile (Android & iOS)
  if (Platform.OS !== 'web') {
    try {
      const uploadResult = await FileSystem.uploadAsync(
        uploadEndpoint,
        localUriToUpload,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          mimeType,
          headers: {
            ...authHeaders,
          },
        }
      );

      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        const data = JSON.parse(uploadResult.body);
        if (data?.imageUrl) {
          return data.imageUrl;
        }
      } else {
        console.warn('FileSystem uploadAsync returned status:', uploadResult.status, uploadResult.body);
      }
    } catch (fsErr) {
      console.warn('Native FileSystem uploadAsync failed, trying fallback:', fsErr);
    }
  }

  // 3. WEB STRATEGY: Fetch with FormData
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(localUriToUpload);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, `upload_${Date.now()}.jpg`);

      const uploadRes = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: formData,
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        if (data?.imageUrl) {
          return data.imageUrl;
        }
      }
    } catch (webErr) {
      console.warn('Web FormData upload failed, trying Presigned URL:', webErr);
    }
  }

  // 4. FALLBACK STRATEGY: Presigned URL Direct S3 PUT
  try {
    const presignExt = mimeType === 'image/webp' ? '.webp' : '.jpg';
    const presignResponse = await fetch(
      `${getBaseUrl()}/upload/presigned-url?type=${type}&extension=${presignExt}&contentType=${mimeType}`,
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

    if (Platform.OS !== 'web') {
      const putResult = await FileSystem.uploadAsync(
        presignedUrl,
        localUriToUpload,
        {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': mimeType,
          },
        }
      );

      if (putResult.status >= 200 && putResult.status < 300) {
        return publicUrl;
      }
    } else {
      const fileResp = await fetch(localUriToUpload);
      const fileBlob = await fileResp.blob();

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
        },
        body: fileBlob,
      });

      if (uploadResponse.ok) {
        return publicUrl;
      }
    }

    throw new Error('Tất cả phương thức tải ảnh đều thất bại');
  } catch (presignError: any) {
    console.error('All upload strategies failed:', presignError);
    throw new Error(presignError.message || 'Không thể tải ảnh lên hệ thống');
  }
};
