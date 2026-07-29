import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageApi } from '../../../shared/api/upload';
import { Post, PostAudience } from '../../../entities/post';
import { CURRENT_USER } from '../../../shared/api/mockCommunityDb';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post>) => void;
}

export const CreatePostModal = React.memo(({
  visible,
  onClose,
  onSubmitPost,
}: CreatePostModalProps) => {
  if (!visible) return null;

  return <CreatePostModalContent visible={visible} onClose={onClose} onSubmitPost={onSubmitPost} />;
});

function CreatePostModalContent({
  visible,
  onClose,
  onSubmitPost,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Partial<Post>) => void;
}) {
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<PostAudience>('PUBLIC');
  const [selectedClub, setSelectedClub] = useState<{ id: string; name: string; avatarUrl: string } | null>(null);

  // Restore Image Attachments Picker / Preview List
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);

  const MOCK_IMAGE_PRESETS = [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  ];

  const MY_CLUBS = [
    {
      id: 'club-1',
      name: 'Pickleball Cầu Giấy Official',
      avatarUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'club-2',
      name: 'CLB Bóng Đá Phủi Hà Nội',
      avatarUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
    },
  ];

  // Animated values for 60fps Native Driver Fade Backdrop + Slide Sheet
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Track if ScrollView is scrolled to top (y <= 2)
  const isAtTopRef = useRef(true);
  const startYRef = useRef(0);
  const isDraggingModalRef = useRef(false);

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      backdropAnim.setValue(0);
      isAtTopRef.current = true;

      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, backdropAnim]);

  // Smooth Animated Close
  const animateClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  // Capture-Phase Drag-to-Dismiss PanResponder
  const handlePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            isAtTopRef.current &&
            gestureState.dy > 6 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          );
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return (
            isAtTopRef.current &&
            gestureState.dy > 6 &&
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
          );
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 70 || gestureState.vy > 0.35) {
            animateClose();
          } else {
            resetPosition();
          }
        },
        onPanResponderTerminate: () => {
          resetPosition();
        },
      }),
    [translateY]
  );

  const handleTouchStart = (e: any) => {
    const pageY = e.nativeEvent?.pageY || 0;
    startYRef.current = pageY;
    isDraggingModalRef.current = false;
  };

  const handleTouchMove = (e: any) => {
    const currentY = e.nativeEvent?.pageY || 0;
    const diffY = currentY - startYRef.current;

    if (isAtTopRef.current && diffY > 6) {
      isDraggingModalRef.current = true;
      translateY.setValue(diffY);
    }
  };

  const handleTouchEnd = (e: any) => {
    if (isDraggingModalRef.current) {
      const currentY = e.nativeEvent?.pageY || 0;
      const diffY = currentY - startYRef.current;

      if (diffY > 70) {
        animateClose();
      } else {
        resetPosition();
      }
      isDraggingModalRef.current = false;
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    isAtTopRef.current = y <= 2;
  };

  const handlePickDeviceImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to mock preset if permission denied
        const nextImg = MOCK_IMAGE_PRESETS[selectedImages.length % MOCK_IMAGE_PRESETS.length];
        setSelectedImages((prev) => [...prev, nextImg]);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...newUris]);
      }
    } catch (error) {
      console.log('Error picking image from device:', error);
      const nextImg = MOCK_IMAGE_PRESETS[selectedImages.length % MOCK_IMAGE_PRESETS.length];
      setSelectedImages((prev) => [...prev, nextImg]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!content.trim() && selectedImages.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Upload local images to backend Spring Boot server asynchronously
      let finalMediaUrls: string[] = [];

      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (uri) => {
          if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return uri; // Already a remote web URL
          }
          try {
            const uploadedUrl = await uploadImageApi(uri, 'general');
            return uploadedUrl || uri;
          } catch (err) {
            console.log('Upload fallback to local URI:', err);
            return uri;
          }
        });

        finalMediaUrls = await Promise.all(uploadPromises);
      }

      const newPostData: Partial<Post> = {
        author: CURRENT_USER,
        content: content.trim() || 'Hình ảnh mới chia sẻ từ Sporta',
        mediaUrls: finalMediaUrls.length > 0 ? finalMediaUrls : undefined,
        createdAt: 'Vừa xong',
        type: 'COMMUNITY',
        audience,
        clubInfo: audience === 'CLUB_MEMBERS' && selectedClub ? selectedClub : undefined,
      };

      onSubmitPost(newPostData);
      animateClose();
    } catch (error) {
      console.log('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.overlay}>
        {/* Animated Fade Backdrop Overlay */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Floating Bottom Sheet Container with Capture-Phase PanResponder */}
        <Animated.View
          {...handlePanResponder.panHandlers}
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Top Handle Bar */}
            <View
              style={styles.handleContainer}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <View style={styles.dragHandle} />
            </View>

            {/* Header Navigation */}
            <View style={styles.header}>
              <TouchableOpacity onPress={animateClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Tạo bài viết mới</Text>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  ((!content.trim() && selectedImages.length === 0) || isSubmitting) && styles.submitBtnDisabled,
                ]}
                disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
                activeOpacity={0.8}
                onPress={handleCreatePost}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Đang tải...' : 'Đăng bài'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {/* User Info & Audience Selector */}
              <View style={styles.userHeaderRow}>
                <Image source={{ uri: CURRENT_USER.avatar }} style={styles.userAvatar} />

                <View style={styles.userTextCol}>
                  <Text style={styles.userName}>{CURRENT_USER.name}</Text>

                  {/* Audience Selector Button */}
                  <TouchableOpacity
                    style={styles.audienceChip}
                    activeOpacity={0.7}
                    onPress={() => setShowAudiencePicker(!showAudiencePicker)}
                  >
                    <Ionicons
                      name={audience === 'PUBLIC' ? 'earth' : 'shield-checkmark'}
                      size={13}
                      color={COLORS.primary}
                    />
                    <Text style={styles.audienceChipText}>
                      {audience === 'PUBLIC'
                        ? 'Công khai'
                        : `Nội bộ: ${selectedClub ? selectedClub.name : 'CLB'}`}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={COLORS.grayText} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Audience Dropdown Options */}
              {showAudiencePicker && (
                <View style={styles.audiencePickerBox}>
                  <TouchableOpacity
                    style={[styles.audienceOption, audience === 'PUBLIC' && styles.audienceOptionSelected]}
                    onPress={() => {
                      setAudience('PUBLIC');
                      setSelectedClub(null);
                      setShowAudiencePicker(false);
                    }}
                  >
                    <Ionicons name="earth" size={18} color={COLORS.primary} />
                    <View style={styles.audienceTextGroup}>
                      <Text style={styles.audienceTitle}>Công khai</Text>
                      <Text style={styles.audienceSub}>Bất kỳ ai trên Sporta đều có thể thấy bài viết này</Text>
                    </View>
                  </TouchableOpacity>

                  {MY_CLUBS.map((club) => {
                    const isSelected = audience === 'CLUB_MEMBERS' && selectedClub?.id === club.id;
                    return (
                      <TouchableOpacity
                        key={club.id}
                        style={[styles.audienceOption, isSelected && styles.audienceOptionSelected]}
                        onPress={() => {
                          setAudience('CLUB_MEMBERS');
                          setSelectedClub(club);
                          setShowAudiencePicker(false);
                        }}
                      >
                        <Image source={{ uri: club.avatarUrl }} style={styles.miniClubAvatar} />
                        <View style={styles.audienceTextGroup}>
                          <Text style={styles.audienceTitle}>{club.name}</Text>
                          <Text style={styles.audienceSub}>Chỉ thành viên thuộc CLB này mới thấy</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Caption TextInput */}
              <TextInput
                style={styles.contentInput}
                placeholder="Bạn đang nghĩ gì? Chia sẻ câu chuyện thể thao hoặc mẹo tập luyện của bạn..."
                placeholderTextColor={COLORS.outline}
                multiline
                value={content}
                onChangeText={setContent}
              />

              {/* Selected Images Grid Preview */}
              {selectedImages.length > 0 && (
                <View style={styles.imageGridPreview}>
                  {selectedImages.map((imgUrl, index) => (
                    <View key={index} style={styles.imagePreviewWrapper}>
                      <Image source={{ uri: imgUrl }} style={styles.imagePreviewItem} />
                      <TouchableOpacity
                        style={styles.removeImgBtn}
                        activeOpacity={0.8}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Image Picker Button Bar */}
              <View style={styles.mediaActionsRow}>
                <Text style={styles.mediaActionsTitle}>Thêm hình ảnh vào bài viết:</Text>
                <TouchableOpacity
                  style={styles.addImageBtn}
                  activeOpacity={0.8}
                  onPress={handlePickDeviceImage}
                >
                  <Ionicons name="image-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.addImageBtnText}>Chọn hình ảnh</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: COLORS.surface,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surface,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  body: {
    padding: SPACING.md,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceDim,
  },
  userTextCol: {
    gap: 4,
  },
  userName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  audienceChipText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
  },
  audiencePickerBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 4,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    gap: 10,
  },
  audienceOptionSelected: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  miniClubAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  audienceTextGroup: {
    flex: 1,
  },
  audienceTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  audienceSub: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  contentInput: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 16,
    color: COLORS.onSurface,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  imageGridPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
  },
  imagePreviewItem: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.default,
  },
  removeImgBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaActionsRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    gap: SPACING.xs,
  },
  mediaActionsTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
    fontWeight: '700',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    gap: 8,
    justifyContent: 'center',
  },
  addImageBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
