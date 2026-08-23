import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import type { VenueReviewItem } from '../types';

interface ReviewCardProps {
  review: VenueReviewItem;
}

/**
 * Card hiển thị một review của người dùng, bao gồm:
 * - Avatar + tên + ngày
 * - Số sao (readonly)
 * - Nội dung nhận xét
 * - Phản hồi của Owner (nếu có)
 */
export function ReviewCard({ review }: ReviewCardProps) {
  const [avatarError, setAvatarError] = useState(false);

  const formattedDate = React.useMemo(() => {
    if (!review.createdAt) return '';
    try {
      const d = new Date(review.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Hôm nay';
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
      return `${Math.floor(diffDays / 365)} năm trước`;
    } catch {
      return '';
    }
  }, [review.createdAt]);

  const initials = (review.reviewerName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.card}>
      {/* Header: Avatar + Name + Date + Stars */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Image
            source={
              review.reviewerAvatar && !avatarError
                ? { uri: review.reviewerAvatar }
                : require('../../../../assets/player/player_699x699.png')
            }
            style={styles.avatar}
            onError={() => setAvatarError(true)}
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.reviewerName} numberOfLines={1}>
            {review.reviewerName}
          </Text>
          <Text style={styles.reviewDate}>{formattedDate}</Text>
        </View>

        {/* Stars (compact, readonly) */}
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }, (_, i) => (
            <MaterialIcons
              key={i}
              name={i < review.rating ? 'star' : 'star-border'}
              size={14}
              color={i < review.rating ? COLORS.secondary : COLORS.outlineVariant}
            />
          ))}
        </View>
      </View>

      {/* Comment */}
      {review.comment ? (
        <Text style={styles.commentText}>{review.comment}</Text>
      ) : null}

      {/* Owner Reply */}
      {review.ownerReply ? (
        <View style={styles.ownerReplyBox}>
          <View style={styles.ownerReplyHeader}>
            <MaterialIcons name="storefront" size={14} color={COLORS.primary} />
            <Text style={styles.ownerReplyLabel}>Phản hồi từ chủ sân</Text>
          </View>
          <Text style={styles.ownerReplyText}>{review.ownerReply}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarWrapper: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  reviewerName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  reviewDate: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.grayText,
    marginTop: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  },
  commentText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    lineHeight: 22,
  },
  ownerReplyBox: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primaryOpacity05,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  ownerReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  ownerReplyLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
  },
  ownerReplyText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurface,
    lineHeight: 18,
  },
});
