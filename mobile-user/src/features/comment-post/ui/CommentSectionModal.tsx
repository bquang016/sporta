import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommentPost } from '../model/useCommentPost';
import { CommentItem } from '../../../entities/post';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface CommentSectionModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}

export function CommentSectionModal({ visible, postId, onClose }: CommentSectionModalProps) {
  const [commentText, setCommentText] = useState('');
  const {
    comments,
    isCommentsLoading,
    addComment,
    isSubmittingComment,
  } = useCommentPost(postId);

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    addComment(commentText.trim());
    setCommentText('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Click outside to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheet}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bình luận</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {isCommentsLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Đang tải bình luận...</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CommentItem comment={item} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={48} color={COLORS.outlineVariant} />
                    <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                    <Text style={styles.emptySubtext}>Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</Text>
                  </View>
                }
              />
            )}

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Viết bình luận..."
                placeholderTextColor={COLORS.outline}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !commentText.trim() && styles.sendButtonDisabled
                ]}
                disabled={!commentText.trim() || isSubmittingComment}
                onPress={handleSubmit}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <Ionicons name="send" size={16} color={COLORS.onPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.base,
  },
  loaderText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: SPACING.base,
  },
  emptyText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
});
