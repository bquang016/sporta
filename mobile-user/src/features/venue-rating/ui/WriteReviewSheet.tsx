import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { StarRatingInput } from './StarRatingInput';
import { useSubmitReview } from '../hooks';
import { fetchVenueReviews } from '../api';
import type { CreateReviewPayload, VenueReviewItem } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const STAR_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Không hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
};

interface WriteReviewSheetProps {
  visible: boolean;
  venueId: string | null;
  venueName?: string;
  existingReview?: VenueReviewItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Bottom Sheet để người dùng viết hoặc sửa review.
 * - Chọn 1–5 sao (bắt buộc)
 * - Nhập comment tùy chọn (max 1000 ký tự)
 * - Pre-fill nếu đã có bài đánh giá trước đó để chỉnh sửa
 * - Submit gọi API thực
 */
export function WriteReviewSheet({
  visible,
  venueId,
  venueName,
  existingReview,
  onClose,
  onSuccess,
}: WriteReviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { submit, loading, error, success, reset } = useSubmitReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [fetchedReview, setFetchedReview] = useState<VenueReviewItem | null>(null);
  const [fetchingExisting, setFetchingExisting] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const activeReview = existingReview || fetchedReview;
  const isEditing = Boolean(activeReview);

  // Reset state and fetch existing review when opening
  useEffect(() => {
    if (visible) {
      reset();
      setRating(existingReview?.rating || 0);
      setComment(existingReview?.comment || '');
      setFetchedReview(null);

      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      // If existingReview not provided, fetch from API to check if user has reviewed
      if (!existingReview && venueId) {
        setFetchingExisting(true);
        fetchVenueReviews(venueId, 0, 10)
          .then((res) => {
            if (res?.myReview) {
              setFetchedReview(res.myReview);
              setRating(res.myReview.rating || 0);
              setComment(res.myReview.comment || '');
            }
          })
          .catch(() => {})
          .finally(() => setFetchingExisting(false));
      }
    }
  }, [visible, venueId, existingReview]);

  // Auto-close on success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 800);
    }
  }, [success]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
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

  const handleSubmit = async () => {
    if (!venueId || rating === 0) return;
    const payload: CreateReviewPayload = {
      venueId,
      rating,
      comment: comment.trim() || undefined,
    };
    await submit(payload);
  };

  const canSubmit = rating > 0 && !loading && !success;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }], paddingBottom: insets.bottom + SPACING.md },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Handle + Header */}
              <View style={styles.handleRow}>
                <View style={styles.handle} />
              </View>

              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.sheetTitle}>{isEditing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</Text>
                  {venueName ? (
                    <Text style={styles.sheetSubtitle} numberOfLines={1}>
                      {venueName}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  activeOpacity={0.75}
                >
                  <MaterialIcons name="close" size={20} color={COLORS.onSurface} />
                </TouchableOpacity>
              </View>

              {/* Success state */}
              {success ? (
                <View style={styles.successBox}>
                  <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
                  <Text style={styles.successTitle}>
                    {isEditing ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!'}
                  </Text>
                  <Text style={styles.successSub}>
                    Cảm ơn bạn đã chia sẻ trải nghiệm.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Star Rating */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Điểm đánh giá của bạn</Text>
                    <View style={styles.starContainer}>
                      <StarRatingInput
                        value={rating}
                        onChange={setRating}
                        size={40}
                      />
                    </View>
                    {rating > 0 && (
                      <Text style={styles.ratingLabel}>
                        {STAR_LABELS[rating]}
                      </Text>
                    )}
                  </View>

                  {/* Comment */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>
                      Nhận xét{' '}
                      <Text style={styles.optional}>(tùy chọn)</Text>
                    </Text>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Chia sẻ trải nghiệm của bạn về cụm sân này..."
                      placeholderTextColor={COLORS.grayText}
                      value={comment}
                      onChangeText={setComment}
                      maxLength={1000}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{comment.length}/1000</Text>
                  </View>

                  {/* Error */}
                  {error ? (
                    <View style={styles.errorBox}>
                      <MaterialIcons name="error-outline" size={16} color={COLORS.error} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Submit button */}
                  <Button
                    title={loading ? 'Đang lưu...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                    variant="secondary"
                    size="lg"
                    style={styles.submitBtn}
                    disabled={!canSubmit}
                    loading={loading}
                    onPress={handleSubmit}
                    icon="send"
                    iconPosition="right"
                  />
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.blackOpacity50,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.outlineVariant,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  sheetSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    marginTop: 2,
    maxWidth: 250,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  optional: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    fontWeight: '400',
  },
  starContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  ratingLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  commentInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 100,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  charCount: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.grayText,
    textAlign: 'right',
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorOpacity08,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.error,
    flex: 1,
  },
  submitBtn: {
    marginBottom: SPACING.md,
  },
  successBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  successTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  successSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.grayText,
    textAlign: 'center',
  },
});
