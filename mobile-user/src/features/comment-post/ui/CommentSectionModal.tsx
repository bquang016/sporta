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
import { CURRENT_USER } from '../../../shared/api/mockCommunityDb';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommentSectionModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}

export function CommentSectionModal({ visible, postId, onClose }: CommentSectionModalProps) {
  if (!visible) return null;

  return <CommentSectionModalContent visible={visible} postId={postId} onClose={onClose} />;
}

function CommentSectionModalContent({
  visible,
  postId,
  onClose,
}: {
  visible: boolean;
  postId: string;
  onClose: () => void;
}) {
  const [commentText, setCommentText] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const {
    comments,
    isCommentsLoading,
    addComment,
    isSubmittingComment,
  } = useCommentPost(postId);

  // Animated values for 60fps Native Driver Fade Backdrop + Slide Sheet
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Track if FlatList is scrolled to top (y <= 2)
  const isAtTopRef = useRef(true);

  // Touch tracking for universal drag-to-dismiss on whitespace/background
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

  // Smooth animated close: Fade-out backdrop & Slide-down sheet off screen
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

  // Spring back to original position if drag threshold not met
  const resetPosition = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  // PanResponder with CAPTURE PHASE to intercept downward drag anywhere on main content when at top
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

  // Universal Touch Listeners for empty space / whitespace / background
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

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    Keyboard.dismiss();
    addComment(commentText.trim());
    setCommentText('');
  };

  const handleUserPress = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={animateClose}
    >
      <View style={styles.overlay}>
        {/* Animated Smooth Fade-In Dark Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={animateClose} />
        </Animated.View>

        {/* Animated Floating Bottom Sheet Container with Capture Phase PanResponder */}
        <Animated.View
          {...handlePanResponder.panHandlers}
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
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

              {/* Header */}
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
                  <Ionicons name="close-circle" size={26} color={COLORS.outline} />
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
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <View style={styles.emptyIconBg}>
                        <Ionicons name="chatbubbles-outline" size={36} color={COLORS.primary} />
                      </View>
                      <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                      <Text style={styles.emptySubtext}>Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</Text>
                    </View>
                  }
                />
              )}

              {/* Modern Capsule Input Bar */}
              <View style={styles.inputBarWrapper}>
                <Image source={{ uri: CURRENT_USER.avatar }} style={styles.inputAvatar} />
                <View style={styles.inputContainer}>
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
                      !commentText.trim() && styles.sendButtonDisabled,
                    ]}
                    disabled={!commentText.trim() || isSubmittingComment}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    {isSubmittingComment ? (
                      <ActivityIndicator size="small" color={COLORS.onPrimary} />
                    ) : (
                      <Ionicons name="paper-plane" size={16} color={COLORS.onPrimary} />
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
          </KeyboardAvoidingView>
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
    height: '78%',
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
    width: 38,
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
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: COLORS.surface,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 17,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  commentCountBadge: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  commentCountText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
  },
  closeButton: {
    padding: 2,
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
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 13,
    color: COLORS.grayText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  emptySubtext: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 13,
    color: COLORS.grayText,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: COLORS.surface,
    gap: 10,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceDim,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  input: {
    flex: 1,
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 14,
    color: COLORS.onSurface,
    maxHeight: 90,
    paddingVertical: 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.6,
  },
});
