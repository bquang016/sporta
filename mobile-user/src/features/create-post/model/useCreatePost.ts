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

  // 1. Multiple Image Picker Action
  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Cần cấp quyền truy cập thư viện ảnh để đăng bài kèm hình ảnh!');
        return;
      }

      // Launch image library with multiple selection enabled and editing disabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        allowsEditing: false, // Turn off editing/cropping as per request
        quality: 1, // Get original quality for post-processing
      });

      if (!result.canceled && result.assets) {
        const uris = result.assets.map((asset) => asset.uri);
        // Limit to maximum of 5 images
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

  // Remove a specific image from list
  const removeImageAt = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all images
  const clearImages = () => {
    setSelectedImages([]);
  };

  // 2. Perform Downscaling & Compression (Client-side)
  const compressImage = async (uri: string): Promise<string> => {
    console.log('Downscaling and compressing:', uri);
    // Resize image max-width to 1024px and compress quality to 75%
    const manipulatedResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedResult.uri;
  };

  // 3. Post Creation Mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, type }: { content: string; type: 'general' | 'matchmaking' | 'ticket' }) => {
      setIsCompacting(true);
      const finalImageUrls: string[] = [];

      try {
        // Compress and upload all images sequentially/parallelly
        for (const uri of selectedImages) {
          const compressedUri = await compressImage(uri);
          
          try {
            const uploadedUrl = await uploadImageApi(compressedUri, 'general');
            finalImageUrls.push(uploadedUrl);
          } catch (uploadError) {
            console.warn('Upload failed, falling back to local compressed URI:', uploadError);
            finalImageUrls.push(compressedUri);
          }
        }
      } catch (error) {
        console.error('Error processing images:', error);
        throw new Error('Nén hình ảnh thất bại.');
      } finally {
        setIsCompacting(false);
      }

      return mockCommunityDb.createPost(content, finalImageUrls, type);
    },
    onSuccess: () => {
      // Invalidate feed so the new post appears immediately
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
      clearImages();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
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
  };
}
