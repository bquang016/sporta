import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { mockCommunityDb } from '../../../shared/api/mockCommunityDb';
import { uploadImageApi } from '../../../shared/api/upload';

interface UseCreatePostProps {
  onSuccess?: () => void;
}

export function useCreatePost({ onSuccess }: UseCreatePostProps = {}) {
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isCompacting, setIsCompacting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Multiple Image Picker Action
  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Cần cấp quyền truy cập thư viện ảnh để đăng bài kèm hình ảnh!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => {
          const combined = [...prev, ...uris];
          if (combined.length > 5) {
            alert('Bạn chỉ có thể chọn tối đa 5 hình ảnh cho một bài viết!');
            return combined.slice(0, 5);
          }
          return combined;
        });
      }
    } catch (error) {
      console.error('Error picking images:', error);
      alert('Đã xảy ra lỗi khi chọn ảnh.');
    }
  };

  const removeImageAt = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  // 2. Perform Downscaling & Compression (Client-side)
  const compressImage = async (uri: string): Promise<string> => {
    const manipulatedResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedResult.uri;
  };

  // 3. Post Creation Mutation with Parallel Uploads & Progress Tracking
  const createPostMutation = useMutation({
    mutationFn: async ({ content, type }: { content: string; type: 'general' | 'matchmaking' | 'ticket' }) => {
      setIsCompacting(true);
      setUploadProgress(10);
      setUploadStep('Đang chuẩn bị bài đăng...');
      setIsSuccess(false);

      const totalImages = selectedImages.length;
      let finalImageUrls: string[] = [];

      try {
        if (totalImages > 0) {
          setUploadStep(`Đang tối ưu kích thước ${totalImages} hình ảnh...`);
          setUploadProgress(25);

          // Step 1: Compress all images in parallel
          const compressedUris = await Promise.all(
            selectedImages.map((uri) => compressImage(uri))
          );

          setUploadStep(`Đang đồng bộ ${totalImages} hình ảnh lên hệ thống...`);
          setUploadProgress(60);

          // Step 2: Upload all compressed images in parallel
          let completed = 0;
          finalImageUrls = await Promise.all(
            compressedUris.map(async (compressedUri) => {
              try {
                const uploadedUrl = await uploadImageApi(compressedUri, 'general');
                completed++;
                setUploadProgress(60 + Math.round((completed / totalImages) * 30));
                return uploadedUrl;
              } catch (uploadError) {
                console.warn('Upload failed, using compressed local URI fallback:', uploadError);
                completed++;
                setUploadProgress(60 + Math.round((completed / totalImages) * 30));
                return compressedUri;
              }
            })
          );
        }

        setUploadStep('Đang đăng bài viết...');
        setUploadProgress(95);
      } catch (error) {
        console.error('Error processing images:', error);
        throw new Error('Nén hoặc tải hình ảnh thất bại.');
      } finally {
        setIsCompacting(false);
      }

      const newPost = await mockCommunityDb.createPost({ content, mediaUrls: finalImageUrls, type });
      setUploadProgress(100);
      setUploadStep('Đã đăng bài viết thành công! 🎉');
      setIsSuccess(true);
      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      clearImages();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      setUploadProgress(0);
      setUploadStep('');
      alert(error.message || 'Đăng bài viết thất bại.');
    },
  });

  return {
    selectedImages,
    pickImages,
    removeImageAt,
    clearImages,
    isCompacting,
    createPost: createPostMutation.mutate,
    isPosting: createPostMutation.isPending,
    uploadProgress,
    uploadStep,
    isSuccess,
    resetProgress: () => {
      setUploadProgress(0);
      setUploadStep('');
      setIsSuccess(false);
    },
  };
}
