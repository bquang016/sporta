import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { editPostApi } from '../../../shared/api/posts';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface EditPostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSaveSuccess: (updatedData: { content: string; mediaUrls: string[] }) => void;
}

export const EditPostModal = React.memo(({
  visible,
  post,
  onClose,
  onSaveSuccess,
}: EditPostModalProps) => {
  const [content, setContent] = useState<string>('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible && post) {
      setContent(post.content || '');
      setMediaUrls(post.mediaUrls ? [...post.mediaUrls] : []);
      setErrorMessage(null);
    }
  }, [visible, post]);

  if (!visible || !post) return null;

  const handleRemoveImage = (indexToRemove: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!content.trim() && mediaUrls.length === 0) {
      setErrorMessage('Nội dung bài viết không được để trống');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await editPostApi(post.id, content.trim(), mediaUrls);
    setIsSubmitting(false);

    if (res.success) {
      onSaveSuccess({
        content: content.trim(),
        mediaUrls,
      });
      onClose();
    } else {
      setErrorMessage(res.message || 'Không thể lưu thay đổi');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Top Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.7}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Chỉnh sửa bài viết</Text>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!content.trim() && mediaUrls.length === 0) || isSubmitting
                  ? styles.saveBtnDisabled
                  : null,
              ]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={(!content.trim() && mediaUrls.length === 0) || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Error banner if any */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Main Scrollable Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Author Profile Row */}
            <View style={styles.authorRow}>
              <Image
                source={{
                  uri:
                    post.author.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                <View style={styles.audienceBadge}>
                  <Ionicons
                    name={post.clubInfo ? 'shield-checkmark' : 'globe-outline'}
                    size={12}
                    color="#64748B"
                  />
                  <Text style={styles.audienceText} numberOfLines={1}>
                    {post.clubInfo ? post.clubInfo.name : 'Công khai'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Post Content Input */}
            <TextInput
              style={styles.textInput}
              placeholder="Bạn muốn chia sẻ điều gì?"
              placeholderTextColor="#94A3B8"
              multiline
              value={content}
              onChangeText={setContent}
              autoFocus
            />

            {/* Attached Images Section */}
            {mediaUrls.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.sectionHeading}>
                  Ảnh đính kèm ({mediaUrls.length})
                </Text>
                <View style={styles.imageGrid}>
                  {mediaUrls.map((url, index) => (
                    <View key={`${url}-${index}`} style={styles.imageWrapper}>
                      <Image source={{ uri: url }} style={styles.mediaImage} />
                      {/* Remove Image Button */}
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        activeOpacity={0.8}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginHorizontal: SPACING.md,
    marginTop: 10,
    borderRadius: BORDER_RADIUS.default,
  },
  errorText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.error,
    flex: 1,
    fontSize: 13,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: SPACING.md,
    gap: 16,
    paddingBottom: 60,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  audienceText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  textInput: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 16,
    color: '#0F172A',
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  mediaSection: {
    gap: 10,
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionHeading: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.default,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
