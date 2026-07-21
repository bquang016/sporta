import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreatePost } from '../model/useCreatePost';
import { CURRENT_USER } from '../../../shared/api/mockCommunityDb';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  
  const {
    selectedImages,
    pickImages,
    removeImageAt,
    isCompacting,
    createPost,
    isPosting,
  } = useCreatePost({
    onSuccess: () => {
      setContent('');
      onClose();
    },
  });

  const handlePost = () => {
    if (!content.trim() && selectedImages.length === 0) return;
    createPost({ content: content.trim(), type: 'general' });
  };

  const isSubmitDisabled = (!content.trim() && selectedImages.length === 0) || isPosting || isCompacting;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tạo bài viết</Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitDisabled && styles.submitButtonDisabled
              ]}
              disabled={isSubmitDisabled}
              onPress={handlePost}
            >
              {isPosting || isCompacting ? (
                <ActivityIndicator size="small" color={COLORS.onPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>Đăng</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Editor Area */}
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* User Profile Info */}
            <View style={styles.profileRow}>
              <Image source={{ uri: CURRENT_USER.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.userName}>{CURRENT_USER.name}</Text>
                <View style={styles.privacyBadge}>
                  <Ionicons name="earth" size={12} color={COLORS.grayText} />
                  <Text style={styles.privacyText}>Công khai</Text>
                </View>
              </View>
            </View>

            {/* Visual separation: Text Editor Container Card */}
            <View style={styles.editorCard}>
              <TextInput
                style={styles.textInput}
                placeholder="Hôm nay bạn chơi môn gì? Sân đấu thế nào?..."
                placeholderTextColor={COLORS.outline}
                multiline
                autoFocus
                value={content}
                onChangeText={setContent}
                maxLength={1000}
              />
            </View>

            {/* Separator Divider */}
            <View style={styles.divider} />

            {/* Attachment Section */}
            <View style={styles.attachmentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hình ảnh đính kèm</Text>
                <Text style={styles.sectionSubtitle}>{selectedImages.length}/5</Text>
              </View>

              {/* Horizontal Scroll of Thumbnails */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              >
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.thumbnailContainer}>
                    <Image source={{ uri }} style={styles.thumbnail} />
                    <TouchableOpacity
                      style={styles.deleteBadge}
                      activeOpacity={0.7}
                      onPress={() => removeImageAt(index)}
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add button placeholder if less than 5 images */}
                {selectedImages.length < 5 && (
                  <TouchableOpacity
                    style={styles.addButtonCard}
                    activeOpacity={0.7}
                    onPress={pickImages}
                  >
                    <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.addButtonText}>Thêm</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Image Compression Status Alert */}
          {(isCompacting || isPosting) && (
            <View style={styles.loadingBanner}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingBannerText}>
                {isCompacting ? 'Đang nén và tối ưu hóa ảnh...' : 'Đang tải bài viết lên...'}
              </Text>
            </View>
          )}

          {/* Bottom Toolbar */}
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarItem} onPress={pickImages} disabled={isPosting}>
              <Ionicons name="image" size={22} color={COLORS.primary} />
              <Text style={styles.toolbarText}>Chọn từ thư viện</Text>
            </TouchableOpacity>
            
            <View style={styles.charCountContainer}>
              <Text style={styles.charCountText}>{content.length}/1000</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  submitButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onPrimary,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceDim,
  },
  userName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  privacyText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  editorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    // Subtle shadow to raise it from page background
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  textInput: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginVertical: SPACING.xs,
  },
  attachmentSection: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.grayText,
  },
  thumbnailList: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceDim,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  deleteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  addButtonCard: {
    width: 90,
    height: 90,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    paddingVertical: 10,
    gap: SPACING.base,
  },
  loadingBannerText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surface,
  },
  toolbarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    paddingVertical: 4,
  },
  toolbarText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontSize: 13,
  },
  charCountContainer: {
    justifyContent: 'center',
  },
  charCountText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontSize: 12,
  },
});
