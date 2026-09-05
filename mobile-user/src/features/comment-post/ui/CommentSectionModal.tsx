import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Keyboard,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommentPost } from '../model/useCommentPost';
import { UserProfileModal } from '../../user-profile';
import { CommentItem } from '../../../entities/post';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { CommentSkeleton } from './CommentSkeleton';
import { Avatar } from '../../../shared/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CommentSectionModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  currentUser?: any;
  onCommentAdded?: () => void;
}

export function CommentSectionSheet({
  visible,
  postId,
  onClose,
  currentUser,
  onCommentAdded,
}: CommentSectionModalProps) {
  if (!visible) return null;

  return (
    <CommentSectionModalContent
      visible={visible}
      postId={postId}
      onClose={onClose}
      currentUser={currentUser}
      onCommentAdded={onCommentAdded}
    />
  );
}

export function CommentSectionModal(props: CommentSectionModalProps) {
  if (!props.visible) return null;

  return (
    <Modal
      visible={props.visible}
      animationType="none"
      transparent={true}
      onRequestClose={props.onClose}
    >
      <CommentSectionSheet {...props} />
    </Modal>
  );
}

function CommentSectionModalContent({
  visible,
  postId,
  onClose,
  currentUser,
  onCommentAdded,
}: {
  visible: boolean;
  postId: string;
  onClose: () => void;
  currentUser?: any;
  onCommentAdded?: () => void;
}) {
  const [commentText, setCommentText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const {
    comments,
    isCommentsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    addComment,
    isSubmittingComment,
  } = useCommentPost(postId, currentUser);

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    addComment(commentText.trim());
    setCommentText('');
    Keyboard.dismiss();
    if (onCommentAdded) onCommentAdded();
  };

  // Animated values for 60fps Native Driver Fade Backdrop + Slide Sheet
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Track if FlatList is scrolled to top (y <= 2)
  const isAtTopRef = useRef(true);

  // Touch tracking for drag-to-dismiss
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

  const animateClose = () => {
    Keyboard.dismiss();
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

  const handleUserPress = (userId: string) => {
    setSelectedUserId(userId);
  };

  const userAvatar = currentUser?.avatar || currentUser?.avatarUrl || null;

  return (
    <View style={styles.overlay}>
      {/* Animated Smooth Fade-In Dark Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
      </Animated.View>

        {/* Floating Rounded Bottom Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
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
              {/* ── 1. Top Drag Handle ── */}
              <View
                style={styles.handleContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <View style={styles.dragHandle} />
              </View>

              {/* ── 2. Clean Minimal Header ── */}
              <View
                style={styles.header}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerTitle}>Bình luận</Text>
                  {comments.length > 0 && (
                    <View style={styles.commentCountBadge}>
                      <Text style={styles.commentCountText}>{comments.length}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity onPress={animateClose} style={styles.closeButton} activeOpacity={0.7}>
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* ── 3. Comments List ── */}
              {isCommentsLoading ? (
                <View style={{ paddingTop: SPACING.md }}>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <CommentItem comment={item} onUserPress={handleUserPress} />}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  overScrollMode="never"
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  keyboardShouldPersistTaps="handled"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                      fetchNextPage();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() => {
                    if (isFetchingNextPage) {
                      return (
                        <View style={{ paddingTop: SPACING.md }}>
                          <CommentSkeleton />
                          <CommentSkeleton />
                        </View>
                      );
                    }
                    return null;
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <View style={styles.emptyIconBg}>
                        <Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.primary} />
                      </View>
                      <Text style={styles.emptyTitle}>Chưa có bình luận nào</Text>
                      <Text style={styles.emptySubtitle}>Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</Text>
                    </View>
                  }
                />
              )}

              {/* ── 4. Floating Capsule Input Bar ── */}
              <View style={styles.inputBarWrapper}>
                <Avatar size={34} source={userAvatar} fallbackType="user" />
                <View style={styles.inputCapsule}>
                  <TextInput
                    style={styles.input}
                    placeholder="Viết bình luận công khai..."
                    placeholderTextColor="#94A3B8"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={300}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      commentText.trim().length > 0 && styles.sendButtonActive,
                    ]}
                    disabled={!commentText.trim() || isSubmittingComment}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    {isSubmittingComment ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name="arrow-up"
                        size={18}
                        color={commentText.trim().length > 0 ? '#FFFFFF' : '#94A3B8'}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Floating User Profile Modal */}
              {selectedUserId && (
                <UserProfileModal
                  visible={!!selectedUserId}
                  userId={selectedUserId}
                  onClose={() => setSelectedUserId(null)}
                />
              )}
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  keyboardAvoidingView: {
    width: '100%',
    height: '80%',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '800',
  },
  commentCountBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  commentCountText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 6,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleSm,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  inputCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    minHeight: 44,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodySm,
    color: '#0F172A',
    fontSize: 14,
    padding: 0,
    maxHeight: 90,
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendButtonActive: {
    backgroundColor: '#1877F2',
  },
});
