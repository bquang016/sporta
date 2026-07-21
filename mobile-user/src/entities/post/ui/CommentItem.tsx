import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Comment } from '../model/post.types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = React.memo(({ comment }: CommentItemProps) => {
  const isOwner = comment.author.role === 'owner';
  
  // Format Date (e.g., '10:30')
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: comment.author.avatar }} style={styles.avatar} />
      
      <View style={styles.contentBubble}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{comment.author.name}</Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Chủ Sân</Text>
              </View>
            )}
          </View>
          <Text style={styles.time}>{formatTime(comment.createdAt)}</Text>
        </View>
        
        <Text style={styles.body}>{comment.content}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceDim,
  },
  contentBubble: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  ownerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontFamily: 'HankenGrotesk-SemiBold',
    color: COLORS.onPrimary,
  },
  time: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.grayText,
  },
  body: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    lineHeight: 18,
  },
});
